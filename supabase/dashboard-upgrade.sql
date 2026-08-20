-- LUMA Mukdahan: dashboard and operations upgrade
-- Run this once in Supabase SQL Editor after schema.sql.

-- 1) Room operations and richer room details
alter table public.room_types
  add column if not exists bed_description text not null default '1 เตียงคิงไซส์',
  add column if not exists bathrooms integer not null default 1;

alter table public.rooms
  add column if not exists housekeeping_status text not null default 'clean',
  add column if not exists last_cleaned_at timestamptz;

alter table public.rooms
  drop constraint if exists rooms_housekeeping_status_check;

alter table public.rooms
  add constraint rooms_housekeeping_status_check
  check (housekeeping_status in ('clean', 'dirty', 'inspected', 'out_of_order'));

alter table public.room_types
  drop constraint if exists room_types_bathrooms_check;

alter table public.room_types
  add constraint room_types_bathrooms_check check (bathrooms > 0);

create index if not exists rooms_room_type_id_idx on public.rooms (room_type_id);
create index if not exists rooms_status_idx on public.rooms (status);
create index if not exists rooms_housekeeping_status_idx on public.rooms (housekeeping_status);

update public.room_types
set bed_description = case name
  when 'River View Deluxe' then '1 เตียงคิงไซส์'
  when 'Mekong Corner Suite' then '1 เตียงคิงไซส์ + โซฟาเบด'
  when 'Garden Calm Room' then '2 เตียงเดี่ยว'
  else bed_description
end,
bathrooms = case name
  when 'Mekong Corner Suite' then 2
  else 1
end;

-- 2) Booking lifecycle, payment state, and reporting fields
alter table public.bookings
  add column if not exists adults integer not null default 1,
  add column if not exists children integer not null default 0,
  add column if not exists payment_status text not null default 'unpaid',
  add column if not exists payment_method text,
  add column if not exists source text not null default 'web',
  add column if not exists confirmed_at timestamptz,
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancellation_reason text,
  add column if not exists checked_in_at timestamptz,
  add column if not exists checked_out_at timestamptz;

alter table public.bookings
  drop constraint if exists bookings_adults_check,
  drop constraint if exists bookings_children_check,
  drop constraint if exists bookings_payment_status_check,
  drop constraint if exists bookings_source_check;

alter table public.bookings
  add constraint bookings_adults_check check (adults > 0),
  add constraint bookings_children_check check (children >= 0),
  add constraint bookings_payment_status_check check (payment_status in ('unpaid', 'pending', 'paid', 'refunded', 'failed')),
  add constraint bookings_source_check check (source in ('web', 'walk_in', 'phone', 'admin'));

create index if not exists bookings_status_idx on public.bookings (status);
create index if not exists bookings_payment_status_idx on public.bookings (payment_status);
create index if not exists bookings_created_at_idx on public.bookings (created_at desc);
create index if not exists bookings_stay_dates_idx on public.bookings (check_in, check_out);

-- 3) Booking history for staff dashboard and auditability
create table if not exists public.booking_status_history (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  from_status public.booking_status,
  to_status public.booking_status not null,
  changed_by uuid references auth.users(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists booking_status_history_booking_idx
  on public.booking_status_history (booking_id, created_at desc);

create or replace function public.record_booking_status_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.booking_status_history (booking_id, to_status, changed_by, note)
    values (new.id, new.status, auth.uid(), 'สร้างรายการจอง');
  elsif old.status is distinct from new.status then
    insert into public.booking_status_history (booking_id, from_status, to_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
  end if;
  return new;
end;
$$;

drop trigger if exists booking_status_history_trigger on public.bookings;
create trigger booking_status_history_trigger
after insert or update of status on public.bookings
for each row execute procedure public.record_booking_status_change();

-- 4) Payments are separated from bookings so a booking can have multiple attempts/refunds
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  amount numeric(10,2) not null check (amount >= 0),
  currency text not null default 'THB',
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  method text,
  provider text,
  provider_payment_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_booking_id_idx on public.payments (booking_id);
create index if not exists payments_status_idx on public.payments (status);

-- 5) Customer reviews and favorites
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid unique not null references public.bookings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete restrict,
  rating integer not null check (rating between 1 and 5),
  title text,
  comment text,
  status text not null default 'published' check (status in ('pending', 'published', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reviews_room_id_idx on public.reviews (room_id, created_at desc);
create index if not exists reviews_status_idx on public.reviews (status);

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  room_type_id uuid not null references public.room_types(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, room_type_id)
);

-- 6) In-app notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete cascade,
  type text not null default 'system',
  title text not null,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx
  on public.notifications (user_id, read_at, created_at desc);

-- 7) One-row hotel settings used by the dashboard and booking rules
create table if not exists public.hotel_settings (
  id integer primary key default 1 check (id = 1),
  hotel_name text not null default 'LUMA Mukdahan',
  address text,
  phone text,
  contact_email text,
  check_in_time time not null default '14:00',
  check_out_time time not null default '12:00',
  cancellation_policy text,
  amenities text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.hotel_settings (id, hotel_name, cancellation_policy, amenities)
values (1, 'LUMA Mukdahan', 'ยกเลิกฟรีก่อนวันเข้าพักตามเงื่อนไขของแต่ละห้อง', array['Wi-Fi ฟรี', 'ที่จอดรถ', 'แผนกต้อนรับ 24 ชม.'])
on conflict (id) do nothing;

-- 8) Common updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at before update on public.bookings
for each row execute procedure public.set_updated_at();

drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at before update on public.payments
for each row execute procedure public.set_updated_at();

drop trigger if exists reviews_set_updated_at on public.reviews;
create trigger reviews_set_updated_at before update on public.reviews
for each row execute procedure public.set_updated_at();

drop trigger if exists hotel_settings_set_updated_at on public.hotel_settings;
create trigger hotel_settings_set_updated_at before update on public.hotel_settings
for each row execute procedure public.set_updated_at();

-- 9) RLS for new tables
alter table public.booking_status_history enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;
alter table public.favorites enable row level security;
alter table public.notifications enable row level security;
alter table public.hotel_settings enable row level security;

drop policy if exists "staff view booking status history" on public.booking_status_history;
create policy "staff view booking status history" on public.booking_status_history
for select using (
  public.current_user_role() in ('receptionist', 'manager', 'admin')
  or exists (select 1 from public.bookings b where b.id = booking_id and b.user_id = auth.uid())
);

drop policy if exists "staff view payments" on public.payments;
create policy "staff view payments" on public.payments
for select using (
  public.current_user_role() in ('receptionist', 'manager', 'admin')
  or exists (select 1 from public.bookings b where b.id = booking_id and b.user_id = auth.uid())
);

drop policy if exists "users view published reviews" on public.reviews;
create policy "users view published reviews" on public.reviews
for select using (status = 'published' or user_id = auth.uid() or public.current_user_role() in ('manager', 'admin'));

drop policy if exists "users create own reviews" on public.reviews;
create policy "users create own reviews" on public.reviews
for insert with check (user_id = auth.uid());

drop policy if exists "users update own reviews" on public.reviews;
create policy "users update own reviews" on public.reviews
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "users manage own favorites" on public.favorites;
create policy "users manage own favorites" on public.favorites
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "users view own notifications" on public.notifications;
create policy "users view own notifications" on public.notifications
for select using (user_id = auth.uid());

drop policy if exists "users update own notifications" on public.notifications;
create policy "users update own notifications" on public.notifications
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "public view hotel settings" on public.hotel_settings;
create policy "public view hotel settings" on public.hotel_settings
for select using (true);

drop policy if exists "managers update hotel settings" on public.hotel_settings;
drop policy if exists "admins update hotel settings" on public.hotel_settings;
create policy "managers update hotel settings" on public.hotel_settings
for update using (public.current_user_role() = 'manager')
with check (public.current_user_role() = 'manager');
