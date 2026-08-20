-- LUMA Mukdahan: staff operations policies and front-desk RPC
-- Run this once after dashboard-upgrade.sql.

alter table public.profiles
  add column if not exists email text;

update public.profiles as profiles
set email = users.email
from auth.users as users
where profiles.id = users.id
  and profiles.email is distinct from users.email;

create index if not exists profiles_email_idx on public.profiles (email);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.raw_user_meta_data ->> 'phone');
  return new;
end;
$$;

drop policy if exists "staff view profiles" on public.profiles;
create policy "staff view profiles" on public.profiles
for select using (id = auth.uid() or public.current_user_role() in ('receptionist', 'manager', 'admin'));

drop policy if exists "admins manage profiles" on public.profiles;
create policy "admins manage profiles" on public.profiles
for update using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create or replace function public.front_desk_update_room(
  p_room_id uuid,
  p_status public.room_status,
  p_housekeeping_status text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_user_role() not in ('receptionist', 'manager', 'admin') then
    raise exception 'Only staff can update room operations';
  end if;

  if p_housekeeping_status is not null and p_housekeeping_status not in ('clean', 'dirty', 'inspected', 'out_of_order') then
    raise exception 'Invalid housekeeping status';
  end if;

  update public.rooms
  set status = p_status,
      housekeeping_status = coalesce(p_housekeeping_status, housekeeping_status),
      last_cleaned_at = case
        when p_housekeeping_status in ('clean', 'inspected') then now()
        else last_cleaned_at
      end
  where id = p_room_id;

  if not found then
    raise exception 'Room not found';
  end if;
end;
$$;

revoke all on function public.front_desk_update_room(uuid, public.room_status, text) from public;
grant execute on function public.front_desk_update_room(uuid, public.room_status, text) to authenticated;

create or replace function public.customer_cancel_booking(
  p_booking_id uuid,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.bookings
  set status = 'cancelled',
      cancelled_at = now(),
      cancellation_reason = coalesce(p_reason, 'ยกเลิกโดยผู้ใช้งาน')
  where id = p_booking_id
    and user_id = auth.uid()
    and status in ('pending', 'confirmed');

  if not found then
    raise exception 'Booking cannot be cancelled';
  end if;
end;
$$;

revoke all on function public.customer_cancel_booking(uuid, text) from public;
grant execute on function public.customer_cancel_booking(uuid, text) to authenticated;
