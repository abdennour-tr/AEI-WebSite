-- AEI Portal — notification en temps réel des administrateurs lors d'un signalement
-- À exécuter après 12_administration_trust.sql.

create or replace function public.report_content(target_type text, target_id text, report_reason text, report_details text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare new_id uuid;
begin
  if (select auth.uid()) is null then raise exception 'Authentification requise'; end if;
  if target_type not in ('club','project','housing','product','advertisement','forum','comment') then raise exception 'Type de contenu invalide'; end if;
  if char_length(trim(report_reason)) < 3 then raise exception 'Motif incomplet'; end if;

  insert into public.content_reports(reporter_id,content_type,content_id,reason,details)
  values ((select auth.uid()),target_type,target_id,trim(report_reason),nullif(trim(coalesce(report_details,'')),''))
  returning id into new_id;

  insert into public.notifications(user_id,title,body,link)
  select id,
    'Nouveau signalement à examiner',
    target_type || ' · ' || trim(report_reason),
    '/admin'
  from public.profiles
  where role in ('admin','moderator');

  return new_id;
end $$;

revoke execute on function public.report_content(text,text,text,text) from public;
grant execute on function public.report_content(text,text,text,text) to authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'content_reports'
    ) then
    execute 'alter publication supabase_realtime add table public.content_reports';
  end if;
end $$;

notify pgrst, 'reload schema';
