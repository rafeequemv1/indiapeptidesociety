-- Symposium registration abstracts + Storage bucket
-- Local app stores file as data URL until Supabase migration;
-- schema/path fields match what the Edge/client upload will use.

alter table public.symposium_registrations
  add column if not exists abstract_title text,
  add column if not exists abstract_file_name text,
  add column if not exists abstract_mime_type text,
  add column if not exists abstract_storage_path text,
  add column if not exists abstract_file_size int,
  add column if not exists has_abstract boolean not null default false,
  add column if not exists receipt_no text,
  add column if not exists amount_label text;

create index if not exists symposium_registrations_has_abstract_idx
  on public.symposium_registrations (has_abstract)
  where has_abstract = true;

comment on column public.symposium_registrations.abstract_storage_path is
  'Path in Storage bucket symposium-abstracts, e.g. {registration_id}/{filename}';

-- ---------------------------------------------------------------------------
-- Storage: private bucket; public can upload; staff can read/list
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'symposium-abstracts',
  'symposium-abstracts',
  false,
  5242880, -- 5 MB
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Anyone can upload an abstract (registration flow)
create policy "Public upload symposium abstracts"
  on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'symposium-abstracts');

-- Staff can read / update / delete
create policy "Staff read symposium abstracts"
  on storage.objects for select to authenticated
  using (bucket_id = 'symposium-abstracts' and public.is_staff());

create policy "Staff update symposium abstracts"
  on storage.objects for update to authenticated
  using (bucket_id = 'symposium-abstracts' and public.is_staff())
  with check (bucket_id = 'symposium-abstracts' and public.is_staff());

create policy "Staff delete symposium abstracts"
  on storage.objects for delete to authenticated
  using (bucket_id = 'symposium-abstracts' and public.is_staff());
