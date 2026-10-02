-- Logo personnalisable des clubs.
-- À exécuter après 16_club_accounts_board_and_events.sql.

alter table public.club_profiles
  add column if not exists logo_url text;

-- La migration 12 limite volontairement les colonnes modifiables par les
-- comptes authentifiés. Le droit ci-dessous ouvre uniquement le logo ; la
-- politique RLS existante continue de vérifier private.manages_club(id), donc
-- un responsable ne peut modifier que la fiche de son propre club.
grant update (logo_url) on table public.club_profiles to authenticated;

-- Le fil d'actualités public affiche uniquement le nom et le logo des clubs
-- déjà validés par la politique anonyme définie dans la migration 19.
grant select (logo_url) on table public.club_profiles to anon;

comment on column public.club_profiles.logo_url is
  'URL publique du logo importé par un responsable autorisé du club.';

notify pgrst, 'reload schema';
