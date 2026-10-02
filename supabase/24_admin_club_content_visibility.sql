-- Visibilité complète des contenus de clubs pour l'équipe de modération.
-- Les responsables continuent à publier directement leurs annonces,
-- événements et souvenirs, sans file de validation préalable.
-- À exécuter après 23_keep_club_profiles_visible.sql.

drop policy if exists club_events_select_relevant on public.club_events;
create policy club_events_select_relevant
on public.club_events for select to authenticated
using (
  status = 'published'
  or private.manages_club(club_id)
  or private.is_staff()
);

drop policy if exists club_announcements_select_relevant on public.club_announcements;
create policy club_announcements_select_relevant
on public.club_announcements for select to authenticated
using (
  status = 'published'
  or private.manages_club(club_id)
  or private.is_staff()
);

notify pgrst, 'reload schema';
