-- Bibliothèque de cours administrable et résumés pédagogiques générés par IA.
-- À exécuter après 16_club_accounts_board_and_events.sql.

alter table public.courses
  add column if not exists file_path text,
  add column if not exists ai_summary text,
  add column if not exists summary_status text not null default 'none',
  add column if not exists summary_generated_at timestamptz;

do $$ begin
  alter table public.courses
    add constraint courses_summary_status_check
    check (summary_status in ('none', 'ready', 'failed'));
exception when duplicate_object then null;
end $$;

create index if not exists courses_level_category_idx
  on public.courses (level, category, title);

-- La lecture des PDF reste réservée aux membres authentifiés. L’écriture et la
-- suppression restent limitées aux modérateurs/administrateurs par 03_storage.sql.
drop policy if exists storage_course_files_select_authenticated on storage.objects;
create policy storage_course_files_select_authenticated
on storage.objects for select to authenticated
using (bucket_id = 'course-files');

notify pgrst, 'reload schema';
