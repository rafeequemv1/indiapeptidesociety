-- Scalable registration number counters (IPS-MEM- / IPS-SYM-YYYY-).
create table if not exists public.registration_counters (
  key text primary key,
  value bigint not null default 0,
  updated_at timestamptz not null default now()
);

insert into public.registration_counters (key, value)
values ('member', 0)
on conflict (key) do nothing;

alter table public.registration_counters enable row level security;

drop policy if exists "Public read registration_counters" on public.registration_counters;
create policy "Public read registration_counters"
  on public.registration_counters for select to anon, authenticated
  using (true);

drop policy if exists "Staff all registration_counters" on public.registration_counters;
create policy "Staff all registration_counters"
  on public.registration_counters for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
