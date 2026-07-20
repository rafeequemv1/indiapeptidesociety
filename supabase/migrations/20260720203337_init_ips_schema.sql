-- Indian Peptide Society — initial schema
-- Clean public schema for site content, members, blog, and form inbox.
-- Apply when ready: supabase link && supabase db push

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.team_section as enum ('executive', 'advisors');
create type public.symposium_kind as enum ('upcoming', 'past', 'student');
create type public.registration_category as enum ('Student', 'Academia', 'Industry', 'Other');

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Staff check via JWT app_metadata.role = 'admin' (set in Auth later)
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

revoke all on function public.is_staff() from public;
grant execute on function public.is_staff() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Site meta (singleton-style key/value for scalars)
-- ---------------------------------------------------------------------------
create table public.site_meta (
  key text primary key,
  value jsonb not null default 'null'::jsonb,
  updated_at timestamptz not null default now()
);

comment on table public.site_meta is 'Scalar site settings (e.g. total_members).';

-- ---------------------------------------------------------------------------
-- Home / content
-- ---------------------------------------------------------------------------
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  lead text not null default '',
  dates text not null default '',
  venue text not null default '',
  coordinator text not null default '',
  cta text not null default '',
  cta_url text not null default '',
  show_cta_button boolean not null default false,
  ticker text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index announcements_active_idx on public.announcements (is_active) where is_active;

create table public.news_items (
  id uuid primary key default gen_random_uuid(),
  tag text not null default '',
  display_date text not null default '',
  title text not null,
  excerpt text not null default '',
  image_url text not null default '',
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index news_items_sort_idx on public.news_items (published, sort_order);

create table public.site_stats (
  id uuid primary key default gen_random_uuid(),
  value text not null,
  label text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lifetime_awards (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null default '',
  affiliation text not null default '',
  image_url text not null default '',
  section public.team_section not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index team_members_section_idx on public.team_members (section, sort_order);

create table public.symposia (
  id uuid primary key default gen_random_uuid(),
  kind public.symposium_kind not null,
  title text not null,
  dates text not null default '',
  venue text not null default '',
  coordinator text,
  status text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index symposia_kind_idx on public.symposia (kind, sort_order);

create table public.faq_items (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Members
-- ---------------------------------------------------------------------------
create table public.permanent_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  membership_no int not null,
  is_founder boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (membership_no)
);

create index permanent_members_name_idx on public.permanent_members (name);
create index permanent_members_founder_idx on public.permanent_members (is_founder);

create table public.symposium_attendees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  affiliation text,
  symposium_year int not null,
  symposium_title text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index symposium_attendees_year_idx on public.symposium_attendees (symposium_year, sort_order);

create table public.recognized_people (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  honor text not null,
  year text,
  affiliation text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Blog
-- ---------------------------------------------------------------------------
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  display_date text not null default '',
  tag text not null default '',
  excerpt text not null default '',
  cover_image_url text,
  body text not null default '',
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index blog_posts_published_idx on public.blog_posts (published, sort_order);

-- ---------------------------------------------------------------------------
-- Symposium registration (settings + submissions)
-- ---------------------------------------------------------------------------
create table public.registration_settings (
  id uuid primary key default gen_random_uuid(),
  enabled boolean not null default true,
  title text not null default 'Symposium Registration',
  subtitle text not null default '',
  dates text not null default '',
  venue text not null default '',
  fee_note text not null default '',
  razorpay_url text not null default '',
  cta_label text not null default 'Register & Pay',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.registration_settings is 'Singleton-style: keep one row; app reads the latest.';

create table public.symposium_registrations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null default '',
  affiliation text not null default '',
  category public.registration_category not null,
  payment_status text not null default 'pending',
  razorpay_payment_id text,
  notes text,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index symposium_registrations_submitted_idx
  on public.symposium_registrations (submitted_at desc);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null default '',
  message text not null,
  is_read boolean not null default false,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index contact_messages_submitted_idx
  on public.contact_messages (submitted_at desc);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'announcements',
    'news_items',
    'site_stats',
    'lifetime_awards',
    'services',
    'team_members',
    'symposia',
    'faq_items',
    'permanent_members',
    'symposium_attendees',
    'recognized_people',
    'blog_posts',
    'registration_settings',
    'site_meta'
  ]
  loop
    execute format(
      'create trigger %I_set_updated_at before update on public.%I
       for each row execute function public.set_updated_at()',
      t, t
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.site_meta enable row level security;
alter table public.announcements enable row level security;
alter table public.news_items enable row level security;
alter table public.site_stats enable row level security;
alter table public.lifetime_awards enable row level security;
alter table public.services enable row level security;
alter table public.team_members enable row level security;
alter table public.symposia enable row level security;
alter table public.faq_items enable row level security;
alter table public.permanent_members enable row level security;
alter table public.symposium_attendees enable row level security;
alter table public.recognized_people enable row level security;
alter table public.blog_posts enable row level security;
alter table public.registration_settings enable row level security;
alter table public.symposium_registrations enable row level security;
alter table public.contact_messages enable row level security;

-- Public read: published / active content
create policy "Public read site_meta"
  on public.site_meta for select to anon, authenticated
  using (true);

create policy "Public read active announcements"
  on public.announcements for select to anon, authenticated
  using (is_active = true or public.is_staff());

create policy "Public read published news"
  on public.news_items for select to anon, authenticated
  using (published = true or public.is_staff());

create policy "Public read site_stats"
  on public.site_stats for select to anon, authenticated
  using (true);

create policy "Public read lifetime_awards"
  on public.lifetime_awards for select to anon, authenticated
  using (true);

create policy "Public read services"
  on public.services for select to anon, authenticated
  using (true);

create policy "Public read team_members"
  on public.team_members for select to anon, authenticated
  using (true);

create policy "Public read symposia"
  on public.symposia for select to anon, authenticated
  using (true);

create policy "Public read published faq"
  on public.faq_items for select to anon, authenticated
  using (published = true or public.is_staff());

create policy "Public read permanent_members"
  on public.permanent_members for select to anon, authenticated
  using (true);

create policy "Public read symposium_attendees"
  on public.symposium_attendees for select to anon, authenticated
  using (true);

create policy "Public read recognized_people"
  on public.recognized_people for select to anon, authenticated
  using (true);

create policy "Public read published blog"
  on public.blog_posts for select to anon, authenticated
  using (published = true or public.is_staff());

create policy "Public read registration_settings"
  on public.registration_settings for select to anon, authenticated
  using (true);

-- Public insert: form inbox only
create policy "Public insert contact_messages"
  on public.contact_messages for insert to anon, authenticated
  with check (true);

create policy "Public insert symposium_registrations"
  on public.symposium_registrations for insert to anon, authenticated
  with check (true);

-- Staff full access (dashboard after Auth is wired)
create policy "Staff all site_meta"
  on public.site_meta for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "Staff all announcements"
  on public.announcements for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "Staff all news_items"
  on public.news_items for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "Staff all site_stats"
  on public.site_stats for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "Staff all lifetime_awards"
  on public.lifetime_awards for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "Staff all services"
  on public.services for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "Staff all team_members"
  on public.team_members for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "Staff all symposia"
  on public.symposia for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "Staff all faq_items"
  on public.faq_items for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "Staff all permanent_members"
  on public.permanent_members for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "Staff all symposium_attendees"
  on public.symposium_attendees for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "Staff all recognized_people"
  on public.recognized_people for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "Staff all blog_posts"
  on public.blog_posts for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "Staff all registration_settings"
  on public.registration_settings for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "Staff read contact_messages"
  on public.contact_messages for select to authenticated
  using (public.is_staff());

create policy "Staff update contact_messages"
  on public.contact_messages for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "Staff delete contact_messages"
  on public.contact_messages for delete to authenticated
  using (public.is_staff());

create policy "Staff read symposium_registrations"
  on public.symposium_registrations for select to authenticated
  using (public.is_staff());

create policy "Staff update symposium_registrations"
  on public.symposium_registrations for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "Staff delete symposium_registrations"
  on public.symposium_registrations for delete to authenticated
  using (public.is_staff());

-- ---------------------------------------------------------------------------
-- Seed placeholder meta
-- ---------------------------------------------------------------------------
insert into public.site_meta (key, value) values
  ('total_members', '352'::jsonb);
