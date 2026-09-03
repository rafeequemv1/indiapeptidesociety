-- Full member directory managed from the dashboard (All Members).
create table if not exists public.society_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  membership_no text not null default '',
  affiliation text not null default '',
  city text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists society_members_name_idx on public.society_members (name);
create index if not exists society_members_sort_idx on public.society_members (sort_order);

drop trigger if exists society_members_set_updated_at on public.society_members;
create trigger society_members_set_updated_at
  before update on public.society_members
  for each row execute function public.set_updated_at();

alter table public.society_members enable row level security;

drop policy if exists "Public read society_members" on public.society_members;
create policy "Public read society_members"
  on public.society_members for select to anon, authenticated
  using (true);

drop policy if exists "Staff all society_members" on public.society_members;
create policy "Staff all society_members"
  on public.society_members for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
