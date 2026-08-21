-- LUMA: multi-hotel ownership, manager applications, and date-safe room booking
-- Run after schema.sql, dashboard-upgrade.sql, dashboard-operations.sql, and admin-owner.sql.

create extension if not exists btree_gist;

create table if not exists public.hotels (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  name text not null,
  slug text not null unique,
  address text,
  phone text,
  contact_email text,
  check_in_time time not null default '14:00',
  check_out_time time not null default '12:00',
  cancellation_policy text,
  amenities text[] not null default '{}',
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.hotels (name, slug, address, phone, contact_email, check_in_time, check_out_time, cancellation_policy, amenities)
select hotel_name, 'luma-mukdahan', address, phone, contact_email, check_in_time, check_out_time, cancellation_policy, amenities
from public.hotel_settings
where id = 1
  and not exists (select 1 from public.hotels where slug = 'luma-mukdahan');

-- Keep the existing single-manager demo account connected to the migrated hotel.
update public.hotels
set owner_id = (select id from public.profiles where role = 'manager' order by created_at limit 1)
where slug = 'luma-mukdahan'
  and owner_id is null
  and (select count(*) from public.profiles where role = 'manager') = 1;

alter table public.room_types
  add column if not exists hotel_id uuid references public.hotels(id) on delete cascade;

update public.room_types
set hotel_id = (select id from public.hotels where slug = 'luma-mukdahan' limit 1)
where hotel_id is null;

alter table public.room_types
  alter column hotel_id set not null;

create index if not exists hotels_owner_id_idx on public.hotels (owner_id);
create index if not exists room_types_hotel_id_idx on public.room_types (hotel_id);

create table if not exists public.manager_requests (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null references public.profiles(id) on delete cascade,
  hotel_name text not null,
  address text not null,
  phone text,
  contact_email text,
  note text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists manager_requests_status_idx on public.manager_requests (status, created_at desc);
create index if not exists manager_requests_applicant_idx on public.manager_requests (applicant_id, created_at desc);
create unique index if not exists manager_requests_one_pending_per_customer_idx on public.manager_requests (applicant_id) where status = 'pending';

create or replace function public.get_available_room_ids(
  p_room_ids uuid[],
  p_check_in date,
  p_check_out date
)
returns table (room_id uuid)
language sql
stable
security definer
set search_path = public
as $$
  select candidate.id
  from public.rooms candidate
  where candidate.id = any(p_room_ids)
    and candidate.status = 'available'
    and not exists (
      select 1
      from public.bookings booking
      where booking.room_id = candidate.id
        and booking.status in ('pending', 'confirmed', 'checked_in')
        and booking.check_in < p_check_out
        and booking.check_out > p_check_in
    );
$$;

revoke all on function public.get_available_room_ids(uuid[], date, date) from public;
grant execute on function public.get_available_room_ids(uuid[], date, date) to anon, authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists hotels_set_updated_at on public.hotels;
create trigger hotels_set_updated_at before update on public.hotels
for each row execute procedure public.set_updated_at();

drop trigger if exists manager_requests_set_updated_at on public.manager_requests;
create trigger manager_requests_set_updated_at before update on public.manager_requests
for each row execute procedure public.set_updated_at();

create or replace function public.admin_review_manager_request(
  p_request_id uuid,
  p_decision text,
  p_review_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  request_row public.manager_requests;
  hotel_slug text;
begin
  if public.current_user_role() <> 'admin' then
    raise exception 'Only admins can review manager requests';
  end if;

  if p_decision not in ('approved', 'rejected') then
    raise exception 'Invalid manager request decision';
  end if;

  select * into request_row
  from public.manager_requests
  where id = p_request_id
  for update;

  if request_row.id is null then
    raise exception 'Manager request not found';
  end if;

  if request_row.status <> 'pending' then
    raise exception 'This manager request has already been reviewed';
  end if;

  update public.manager_requests
  set status = p_decision,
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      review_note = nullif(trim(coalesce(p_review_note, '')), '')
  where id = request_row.id;

  if p_decision = 'approved' then
    update public.profiles
    set role = 'manager'
    where id = request_row.applicant_id;

    hotel_slug := 'hotel-' || substr(request_row.id::text, 1, 8);
    insert into public.hotels (owner_id, name, slug, address, phone, contact_email)
    values (request_row.applicant_id, request_row.hotel_name, hotel_slug, request_row.address, request_row.phone, request_row.contact_email);
  end if;
end;
$$;

revoke all on function public.admin_review_manager_request(uuid, text, text) from public;
grant execute on function public.admin_review_manager_request(uuid, text, text) to authenticated;

alter table public.hotels enable row level security;
alter table public.manager_requests enable row level security;

drop policy if exists "public view active hotels" on public.hotels;
create policy "public view active hotels" on public.hotels
for select using (
  status = 'active'
  or owner_id = auth.uid()
  or public.current_user_role() = 'admin'
);

drop policy if exists "managers update own hotels" on public.hotels;
create policy "managers update own hotels" on public.hotels
for update using (owner_id = auth.uid() and public.current_user_role() = 'manager')
with check (owner_id = auth.uid() and public.current_user_role() = 'manager');

drop policy if exists "customers submit manager requests" on public.manager_requests;
create policy "customers submit manager requests" on public.manager_requests
for insert to authenticated
with check (applicant_id = (select auth.uid()) and public.current_user_role() = 'customer');

drop policy if exists "users view own manager requests" on public.manager_requests;
create policy "users view own manager requests" on public.manager_requests
for select using (applicant_id = auth.uid() or public.current_user_role() = 'admin');

drop policy if exists "admins review manager requests" on public.manager_requests;
create policy "admins review manager requests" on public.manager_requests
for update using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

drop policy if exists "managers manage room types" on public.room_types;
create policy "managers manage room types" on public.room_types
for all using (
  public.current_user_role() = 'manager'
  and exists (select 1 from public.hotels h where h.id = hotel_id and h.owner_id = auth.uid())
)
with check (
  public.current_user_role() = 'manager'
  and exists (select 1 from public.hotels h where h.id = hotel_id and h.owner_id = auth.uid())
);

drop policy if exists "managers manage rooms" on public.rooms;
create policy "managers manage rooms" on public.rooms
for all using (
  public.current_user_role() = 'manager'
  and exists (
    select 1
    from public.room_types rt
    join public.hotels h on h.id = rt.hotel_id
    where rt.id = room_type_id and h.owner_id = auth.uid()
  )
)
with check (
  public.current_user_role() = 'manager'
  and exists (
    select 1
    from public.room_types rt
    join public.hotels h on h.id = rt.hotel_id
    where rt.id = room_type_id and h.owner_id = auth.uid()
  )
);

drop policy if exists "customers view own bookings" on public.bookings;
create policy "customers view own bookings" on public.bookings
for select using (
  user_id = auth.uid()
  or public.current_user_role() = 'receptionist'
  or (
    public.current_user_role() = 'manager'
    and exists (
      select 1
      from public.rooms r
      join public.room_types rt on rt.id = r.room_type_id
      join public.hotels h on h.id = rt.hotel_id
      where r.id = room_id and h.owner_id = auth.uid()
    )
  )
);

drop policy if exists "staff update bookings" on public.bookings;
create policy "staff update bookings" on public.bookings
for update using (
  public.current_user_role() = 'receptionist'
  or (
    public.current_user_role() = 'manager'
    and exists (
      select 1
      from public.rooms r
      join public.room_types rt on rt.id = r.room_type_id
      join public.hotels h on h.id = rt.hotel_id
      where r.id = room_id and h.owner_id = auth.uid()
    )
  )
)
with check (
  public.current_user_role() = 'receptionist'
  or (
    public.current_user_role() = 'manager'
    and exists (
      select 1
      from public.rooms r
      join public.room_types rt on rt.id = r.room_type_id
      join public.hotels h on h.id = rt.hotel_id
      where r.id = room_id and h.owner_id = auth.uid()
    )
  )
);

alter table public.bookings
  drop constraint if exists bookings_no_overlapping_active_stays;

alter table public.bookings
  add constraint bookings_no_overlapping_active_stays
  exclude using gist (
    room_id with =,
    daterange(check_in, check_out, '[)') with &&
  ) where (status in ('pending', 'confirmed', 'checked_in'));
