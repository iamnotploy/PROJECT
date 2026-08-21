-- LUMA role boundaries
-- Admin owns the platform and roles; Manager owns hotel operations and details.

drop policy if exists "managers update hotel settings" on public.hotel_settings;
drop policy if exists "admins update hotel settings" on public.hotel_settings;

create policy "managers update hotel settings" on public.hotel_settings
for update using (public.current_user_role() = 'manager')
with check (public.current_user_role() = 'manager');

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile" on public.profiles
for update using (id = auth.uid())
with check (id = auth.uid() and role = public.current_user_role());

drop policy if exists "admins manage profiles" on public.profiles;
create policy "admins manage profiles" on public.profiles
for update using (public.current_user_role() = 'admin')
with check (
  public.current_user_role() = 'admin'
  and (id <> auth.uid() or role = 'admin')
);

drop policy if exists "customers create bookings" on public.bookings;
create policy "customers create bookings" on public.bookings
for insert
to authenticated
with check (user_id = (select auth.uid()) and public.current_user_role() = 'customer');

create or replace function public.prevent_admin_self_role_change()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is not null
    and old.id = auth.uid()
    and old.role = 'admin'
    and old.role is distinct from new.role then
    raise exception 'Admins cannot change their own role';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_admin_self_role_change_trigger on public.profiles;
create trigger prevent_admin_self_role_change_trigger
before update of role on public.profiles
for each row execute procedure public.prevent_admin_self_role_change();
