-- AEI Portal — Buckets Supabase Storage et politiques d'accès
-- À exécuter après 02_rls_policies.sql.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('housing-images', 'housing-images', true, 8388608, array['image/jpeg', 'image/png', 'image/webp']),
  ('product-images', 'product-images', true, 8388608, array['image/jpeg', 'image/png', 'image/webp']),
  ('event-images', 'event-images', true, 8388608, array['image/jpeg', 'image/png', 'image/webp']),
  ('project-images', 'project-images', true, 8388608, array['image/jpeg', 'image/png', 'image/webp']),
  ('advertisement-images', 'advertisement-images', true, 8388608, array['image/jpeg', 'image/png', 'image/webp']),
  ('course-files', 'course-files', false, 26214400, array['application/pdf']),
  ('resumes', 'resumes', false, 10485760, array['application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists storage_public_media_insert_own_folder on storage.objects;
create policy storage_public_media_insert_own_folder
on storage.objects for insert to authenticated
with check (
  bucket_id in ('avatars', 'housing-images', 'product-images', 'project-images')
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists storage_staff_media_insert on storage.objects;
create policy storage_staff_media_insert
on storage.objects for insert to authenticated
with check (
  bucket_id in ('event-images', 'advertisement-images', 'course-files')
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and private.is_staff()
);

drop policy if exists storage_resumes_insert_own_folder on storage.objects;
create policy storage_resumes_insert_own_folder
on storage.objects for insert to authenticated
with check (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists storage_private_files_select on storage.objects;
create policy storage_private_files_select
on storage.objects for select to authenticated
using (
  (bucket_id = 'course-files')
  or (
    bucket_id = 'resumes'
    and (owner_id = (select auth.uid()::text) or private.is_staff())
  )
  or (
    bucket_id in (
      'avatars', 'housing-images', 'product-images', 'event-images',
      'project-images', 'advertisement-images'
    )
    and owner_id = (select auth.uid()::text)
  )
);

drop policy if exists storage_objects_update_owner_or_staff on storage.objects;
create policy storage_objects_update_owner_or_staff
on storage.objects for update to authenticated
using (owner_id = (select auth.uid()::text) or private.is_staff())
with check (owner_id = (select auth.uid()::text) or private.is_staff());

drop policy if exists storage_objects_delete_owner_or_staff on storage.objects;
create policy storage_objects_delete_owner_or_staff
on storage.objects for delete to authenticated
using (owner_id = (select auth.uid()::text) or private.is_staff());

