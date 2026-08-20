-- Run once in Supabase SQL Editor for an existing project.
-- The application has a fallback query, so the UI remains compatible before this migration runs.
alter table public.room_types
  add column if not exists bed_description text not null default '1 เตียงคิงไซส์',
  add column if not exists bathrooms integer not null default 1;

alter table public.room_types
  drop constraint if exists room_types_bathrooms_check;

alter table public.room_types
  add constraint room_types_bathrooms_check check (bathrooms > 0);

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
