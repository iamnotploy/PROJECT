create extension if not exists pgcrypto;

create type public.user_role as enum ('customer', 'receptionist', 'manager', 'admin');
create type public.room_status as enum ('available', 'occupied', 'reserved', 'maintenance');
create type public.booking_status as enum ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  role public.user_role not null default 'customer',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.room_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  base_price numeric(10,2) not null check (base_price >= 0),
  max_guests integer not null default 2 check (max_guests > 0),
  size_sqm numeric(8,2),
  bed_description text not null default '1 เตียงคิงไซส์',
  bathrooms integer not null default 1 check (bathrooms > 0),
  amenities text[] not null default '{}',
  image_url text,
  created_at timestamptz not null default now()
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  room_type_id uuid not null references public.room_types(id) on delete restrict,
  room_number text not null unique,
  floor integer,
  status public.room_status not null default 'available',
  notes text,
  created_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code text not null unique default ('LM-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  user_id uuid references public.profiles(id) on delete set null,
  room_id uuid not null references public.rooms(id) on delete restrict,
  guest_name text not null,
  guest_email text not null,
  guest_phone text,
  check_in date not null,
  check_out date not null,
  guest_count integer not null default 1 check (guest_count > 0),
  status public.booking_status not null default 'pending',
  nightly_price numeric(10,2) not null check (nightly_price >= 0),
  total_price numeric(10,2) not null check (total_price >= 0),
  special_request text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_stay_dates check (check_out > check_in)
);

create index bookings_room_dates_idx on public.bookings (room_id, check_in, check_out);
create index bookings_user_id_idx on public.bookings (user_id);

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$ select role from public.profiles where id = auth.uid() $$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.raw_user_meta_data ->> 'phone');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.prevent_profile_role_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if old.role is distinct from new.role and public.current_user_role() <> 'admin' then
    raise exception 'Only an admin can change a user role';
  end if;
  return new;
end;
$$;

create trigger protect_profile_role
  before update on public.profiles
  for each row execute procedure public.prevent_profile_role_change();

alter table public.profiles enable row level security;
alter table public.room_types enable row level security;
alter table public.rooms enable row level security;
alter table public.bookings enable row level security;

create policy "public can view room types" on public.room_types for select using (true);
create policy "public can view available rooms" on public.rooms for select using (status <> 'maintenance' or auth.uid() is not null);
create policy "users can view own profile" on public.profiles for select using (id = auth.uid() or public.current_user_role() in ('manager', 'admin'));
create policy "users can update own profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "customers view own bookings" on public.bookings for select using (user_id = auth.uid() or public.current_user_role() in ('receptionist', 'manager', 'admin'));
create policy "customers create bookings" on public.bookings for insert with check (user_id = auth.uid() or auth.uid() is null);
create policy "staff update bookings" on public.bookings for update using (public.current_user_role() in ('receptionist', 'manager', 'admin')) with check (public.current_user_role() in ('receptionist', 'manager', 'admin'));
create policy "managers manage rooms" on public.rooms for all using (public.current_user_role() in ('manager', 'admin')) with check (public.current_user_role() in ('manager', 'admin'));
create policy "managers manage room types" on public.room_types for all using (public.current_user_role() in ('manager', 'admin')) with check (public.current_user_role() in ('manager', 'admin'));

insert into public.room_types (name, description, base_price, max_guests, size_sqm, amenities, image_url) values
  ('River View Deluxe', 'ห้องพักวิวแม่น้ำโขง บรรยากาศอบอุ่นและเป็นส่วนตัว', 2200, 2, 32, array['Wi-Fi ฟรี', 'อาหารเช้า', 'ที่จอดรถ', 'สระว่ายน้ำ'], 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=85'),
  ('Mekong Corner Suite', 'ห้องสวีทขนาดใหญ่ เหมาะสำหรับครอบครัวหรือการพักระยะยาว', 3150, 3, 48, array['Wi-Fi ฟรี', 'อ่างอาบน้ำ', 'มินิบาร์', 'ฟิตเนส'], 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=85'),
  ('Garden Calm Room', 'ห้องพักที่เงียบสงบ ล้อมรอบด้วยสวนสีเขียว', 1450, 2, 28, array['Wi-Fi ฟรี', 'ที่จอดรถ', 'สวนส่วนกลาง'], 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85');

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

insert into public.rooms (room_type_id, room_number, floor, status)
select rt.id, seed.room_number, seed.floor, 'available'::public.room_status
from public.room_types rt
join (values
  ('River View Deluxe', '101', 1), ('River View Deluxe', '102', 1), ('River View Deluxe', '201', 2), ('River View Deluxe', '202', 2),
  ('Mekong Corner Suite', '301', 3), ('Mekong Corner Suite', '302', 3), ('Mekong Corner Suite', '401', 4), ('Mekong Corner Suite', '402', 4),
  ('Garden Calm Room', '501', 5), ('Garden Calm Room', '502', 5), ('Garden Calm Room', '601', 6), ('Garden Calm Room', '602', 6)
) as seed(room_type_name, room_number, floor) on seed.room_type_name = rt.name
where not exists (select 1 from public.rooms existing where existing.room_number = seed.room_number);
