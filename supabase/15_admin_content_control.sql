-- AEI Portal — contrôle complet des contenus par l'administrateur.
-- À exécuter après 12_administration_trust.sql.

create or replace function public.get_admin_content()
returns table (
  content_type text,
  content_id text,
  content_title text,
  content_status text,
  moderation_state text,
  created_on timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'Accès administrateur requis';
  end if;

  return query
  select items.content_type, items.content_id, items.content_title,
    items.content_status, items.moderation_state, items.created_on
  from (
    select 'project'::text as content_type, p.id::text as content_id, p.title as content_title, p.status::text as content_status, p.moderation_status as moderation_state, p.created_at as created_on from public.student_projects p
    union all
    select 'housing', h.id::text, h.title, h.status::text, h.moderation_status, h.created_at from public.housing_listings h
    union all
    select 'product', m.id::text, m.title, m.status::text, m.moderation_status, m.created_at from public.marketplace_products m
    union all
    select 'event', e.id::text, e.title, e.status::text, null::text, e.created_at from public.events e
    union all
    select 'club_event', ce.id::text, ce.title, ce.status, null::text, ce.created_at from public.club_events ce
    union all
    select 'advertisement', a.id::text, a.title, a.status::text, a.moderation_status, a.created_at from public.advertisements a
    union all
    select 'forum', f.id::text, f.title, f.status::text, null::text, f.created_at from public.forum_topics f
    union all
    select 'course', c.id::text, c.title, c.status::text, null::text, c.created_at from public.courses c
    union all
    select 'opportunity', o.id::text, o.title, o.status::text, null::text, o.created_at from public.opportunities o
    union all
    select 'club_announcement', ca.id::text, ca.title, ca.status, null::text, ca.created_at from public.club_announcements ca
  ) as items
  order by items.created_on desc;
end;
$$;

create or replace function public.admin_delete_content(
  target_type text,
  target_id text,
  deletion_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_title text;
begin
  if not private.is_admin() then
    raise exception 'Accès administrateur requis';
  end if;
  if char_length(trim(coalesce(deletion_reason, ''))) < 3 then
    raise exception 'Le motif de suppression est obligatoire';
  end if;

  case target_type
    when 'project' then delete from public.student_projects where id = target_id::uuid returning title into deleted_title;
    when 'housing' then delete from public.housing_listings where id = target_id::uuid returning title into deleted_title;
    when 'product' then delete from public.marketplace_products where id = target_id::uuid returning title into deleted_title;
    when 'event' then delete from public.events where id = target_id::uuid returning title into deleted_title;
    when 'club_event' then delete from public.club_events where id = target_id::uuid returning title into deleted_title;
    when 'advertisement' then delete from public.advertisements where id = target_id::uuid returning title into deleted_title;
    when 'forum' then delete from public.forum_topics where id = target_id::uuid returning title into deleted_title;
    when 'course' then delete from public.courses where id = target_id::uuid returning title into deleted_title;
    when 'opportunity' then delete from public.opportunities where id = target_id::uuid returning title into deleted_title;
    when 'club_announcement' then delete from public.club_announcements where id = target_id::uuid returning title into deleted_title;
    else raise exception 'Type de contenu invalide';
  end case;

  if deleted_title is null then
    raise exception 'Contenu introuvable';
  end if;

  insert into public.admin_audit_log(actor_id, action, target_type, target_id, details)
  values (
    (select auth.uid()),
    'content.deleted',
    target_type,
    target_id,
    jsonb_build_object('title', deleted_title, 'reason', trim(deletion_reason))
  );
end;
$$;

revoke execute on function public.get_admin_content() from public, anon;
revoke execute on function public.admin_delete_content(text, text, text) from public, anon;
grant execute on function public.get_admin_content() to authenticated;
grant execute on function public.admin_delete_content(text, text, text) to authenticated;

notify pgrst, 'reload schema';
