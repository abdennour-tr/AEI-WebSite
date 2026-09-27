-- Liens sociaux distincts pour les fiches des clubs.
-- À exécuter après 16_club_accounts_board_and_events.sql.

alter table public.club_profiles
  add column if not exists social_links jsonb not null default '{}'::jsonb;

alter table public.club_profiles
  drop constraint if exists club_profiles_social_links_object;

alter table public.club_profiles
  add constraint club_profiles_social_links_object
  check (jsonb_typeof(social_links) = 'object');

-- Conserve les anciens liens déjà enregistrés en les classant automatiquement.
update public.club_profiles
set social_links = case
  when lower(contact_url) like '%instagram.com%' then jsonb_build_object('instagram', contact_url)
  when lower(contact_url) like '%facebook.com%' or lower(contact_url) like '%fb.com%' then jsonb_build_object('facebook', contact_url)
  when lower(contact_url) like '%linkedin.com%' then jsonb_build_object('linkedin', contact_url)
  when lower(contact_url) like '%youtube.com%' or lower(contact_url) like '%youtu.be%' then jsonb_build_object('youtube', contact_url)
  when lower(contact_url) like '%tiktok.com%' then jsonb_build_object('tiktok', contact_url)
  else jsonb_build_object('website', contact_url)
end,
updated_at = now()
where contact_url is not null
  and trim(contact_url) <> ''
  and social_links = '{}'::jsonb;

notify pgrst, 'reload schema';
