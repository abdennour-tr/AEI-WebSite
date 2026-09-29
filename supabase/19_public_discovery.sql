-- Accès anonyme strictement limité au fil d'actualités de la page d'accueil.
-- Toutes les autres rubriques du portail restent réservées aux comptes authentifiés.
-- À exécuter après 18_club_social_links.sql. Le script peut être rejoué sans risque.

-- Nettoyage de l'ancienne version éventuelle, qui autorisait la consultation
-- anonyme de rubriques désormais protégées par authentification.
revoke all on table public.public_profiles from anon;
revoke all on table public.opportunities from anon;
revoke all on table public.student_projects from anon;
revoke all on table public.project_comments from anon;
revoke all on table public.forum_topics from anon;
revoke all on table public.forum_replies from anon;
revoke all on table public.forum_likes from anon;

drop policy if exists public_profiles_select_anon on public.public_profiles;
drop policy if exists opportunities_select_anon on public.opportunities;
drop policy if exists projects_select_anon on public.student_projects;
drop policy if exists project_comments_select_anon on public.project_comments;
drop policy if exists topics_select_anon on public.forum_topics;
drop policy if exists replies_select_anon on public.forum_replies;
drop policy if exists forum_likes_select_anon on public.forum_likes;

revoke execute on function public.get_unified_agenda() from anon;
drop function if exists public.get_public_project_engagement();

-- Les visiteurs ne reçoivent que les colonnes affichées dans le fil public.
-- Les identifiants des auteurs, données de modération et autres champs internes
-- ne sont jamais exposés au rôle anon.
revoke all on table public.club_profiles from anon;
revoke all on table public.club_events from anon;
revoke all on table public.club_announcements from anon;
revoke all on table public.events from anon;
revoke all on table public.advertisements from anon;

grant select (id, name) on table public.club_profiles to anon;
grant select (id, club_id, title, description, starts_at, location, status)
  on table public.club_events to anon;
grant select (id, club_id, title, body, published_at, created_at, status)
  on table public.club_announcements to anon;
grant select (id, title, description, starts_at, location, cover_url, organizer_name, club_id, status)
  on table public.events to anon;
grant select (id, title, description, image_url, target_url, starts_at, created_at, status, moderation_status)
  on table public.advertisements to anon;

drop policy if exists club_profiles_select_anon on public.club_profiles;
create policy club_profiles_select_anon on public.club_profiles
for select to anon using (status = 'active' and moderation_status = 'approved');

drop policy if exists club_events_select_anon on public.club_events;
create policy club_events_select_anon on public.club_events
for select to anon using (
  status = 'published'
  and exists (
    select 1
    from public.club_profiles club
    where club.id = club_id
      and club.status = 'active'
      and club.moderation_status = 'approved'
  )
);

drop policy if exists club_announcements_select_anon on public.club_announcements;
create policy club_announcements_select_anon on public.club_announcements
for select to anon using (
  status = 'published'
  and exists (
    select 1
    from public.club_profiles club
    where club.id = club_id
      and club.status = 'active'
      and club.moderation_status = 'approved'
  )
);

drop policy if exists events_select_anon on public.events;
create policy events_select_anon on public.events
for select to anon using (status = 'published');

drop policy if exists advertisements_select_anon on public.advertisements;
create policy advertisements_select_anon on public.advertisements
for select to anon using (status = 'published' and moderation_status = 'approved');

notify pgrst, 'reload schema';
