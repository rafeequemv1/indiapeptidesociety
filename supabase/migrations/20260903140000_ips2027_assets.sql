-- IPS 2027 public assets (programme graphic metadata + storage bucket)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'ips2027',
  'ips2027',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
on conflict (id) do update set public = excluded.public;

create table if not exists public.ips2027_assets (
  id text primary key,
  title text not null default '',
  image_url text not null,
  storage_path text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ips2027_assets enable row level security;

drop policy if exists "Public read ips2027_assets" on public.ips2027_assets;
create policy "Public read ips2027_assets"
  on public.ips2027_assets for select to anon, authenticated
  using (true);

drop policy if exists "Staff all ips2027_assets" on public.ips2027_assets;
create policy "Staff all ips2027_assets"
  on public.ips2027_assets for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "Public read ips2027 storage" on storage.objects;
create policy "Public read ips2027 storage"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'ips2027');

drop policy if exists "Staff write ips2027 storage" on storage.objects;
create policy "Staff write ips2027 storage"
  on storage.objects for all to authenticated
  using (bucket_id = 'ips2027' and public.is_staff())
  with check (bucket_id = 'ips2027' and public.is_staff());

insert into public.ips2027_assets (id, title, image_url, storage_path, sort_order)
values (
  'scientific-programme',
  'IPS 2027 Scientific Programme at a Glance',
  'https://ggapbctlajwmbjvbfrsq.supabase.co/storage/v1/object/public/ips2027/scientific-programme.png',
  'scientific-programme.png',
  0
)
on conflict (id) do update set
  title = excluded.title,
  image_url = excluded.image_url,
  storage_path = excluded.storage_path,
  updated_at = now();
