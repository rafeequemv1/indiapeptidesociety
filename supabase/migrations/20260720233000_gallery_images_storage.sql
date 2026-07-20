-- Public image gallery: titles + Storage bucket for uploads

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  image_url text not null default '',
  storage_path text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.gallery_images is 'Public gallery photos managed from the dashboard.';

create index if not exists gallery_images_sort_idx on public.gallery_images (sort_order, created_at desc);

create trigger gallery_images_set_updated_at
  before update on public.gallery_images
  for each row execute function public.set_updated_at();

alter table public.gallery_images enable row level security;

create policy "Public read gallery_images"
  on public.gallery_images for select
  to anon, authenticated
  using (true);

create policy "Staff all gallery_images"
  on public.gallery_images for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gallery',
  'gallery',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public read gallery images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'gallery');

create policy "Staff upload gallery images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'gallery' and public.is_staff());

create policy "Staff update gallery images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'gallery' and public.is_staff())
  with check (bucket_id = 'gallery' and public.is_staff());

create policy "Staff delete gallery images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'gallery' and public.is_staff());
