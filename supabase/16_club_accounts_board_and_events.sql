-- Comptes clubs, membres du bureau et rattachement de l'agenda existant.
-- À exécuter après 15_admin_content_control.sql.
-- Les utilisateurs Auth sont créés depuis Authentication > Users ou via
-- scripts/provision-club-accounts.mjs. Aucun mot de passe n'est stocké ici.

insert into public.club_profiles (
  id, name, category, tagline, description, founded_label,
  recruitment_label, contact_label, contact_url, objectives
)
values
  ('innoverse', 'InnoVerse', 'Développement & innovation', 'Imaginer, coder et transformer des idées en projets numériques.', 'Le club d’innovation informatique de l’ENIAD rassemble les étudiants autour du développement et de la création de produits numériques.', 'Club technologique', 'Candidatures ouvertes toute l’année', 'Contacter InnoVerse', 'https://www.linkedin.com/company/innoverseeniad', array['Créer des produits numériques concrets.', 'Développer le mentorat entre promotions.']),
  ('nurlai', 'NurlAI', 'IA & Data', 'Apprendre l’intelligence artificielle par la pratique.', 'NurlAI accompagne les étudiants dans le machine learning, la data science et l’IA responsable.', 'Club IA & Data', 'Ouvert aux débutants et profils avancés', 'Contacter NurlAI', null, array['Rendre l’IA accessible.', 'Accompagner les projets data étudiants.']),
  ('riot', 'RIoT ENIADB', 'Robotique & IoT', 'Construire et programmer des systèmes intelligents.', 'Le club Robotics & IoT réunit les passionnés de robotique, électronique et systèmes embarqués.', 'Club robotique & systèmes embarqués', 'Aucun prérequis technique obligatoire', 'Contacter RIoT', null, array['Construire des prototypes fonctionnels.', 'Préparer les challenges techniques.']),
  ('secora', 'SECORA Club', 'Cybersécurité', 'Comprendre la sécurité informatique par des défis concrets.', 'SECORA développe les compétences en cybersécurité, OSINT, cryptographie et sécurité réseau.', 'Club cybersécurité', 'Parcours du débutant au compétiteur', 'Contacter SECORA', 'https://ma.linkedin.com/company/secoraclub', array['Développer les réflexes de sécurité.', 'Former des équipes aux challenges CTF.']),
  ('techrise', 'TechRise', 'Innovation & carrière', 'Relier compétences, innovation et monde professionnel.', 'TechRise organise des conférences, ateliers et rencontres autour de l’innovation et de la carrière.', 'Club innovation & carrière', 'Pôles événementiel, partenariat et contenu', 'Contacter TechRise', 'https://www.linkedin.com/company/techriseeniadb', array['Rapprocher étudiants et entreprises.', 'Développer les compétences professionnelles.']),
  ('enactus', 'Enactus ENIAD Berkane', 'Entrepreneuriat social', 'Entreprendre pour créer un impact social durable.', 'Enactus développe le leadership et des projets entrepreneuriaux à impact social.', 'Équipe d’entrepreneuriat social', 'Rejoignez un projet ou un pôle support', 'Contacter Enactus', 'https://www.linkedin.com/company/enactus-eniad-berkane', array['Créer des projets à impact.', 'Former au modèle économique et au pitch.']),
  ('al-ataa', 'Club Al Ataa', 'Solidarité & citoyenneté', 'Mobiliser la communauté autour d’actions solidaires.', 'Al Ataa porte les initiatives citoyennes et humanitaires de la communauté ENIAD.', 'Club solidarité & citoyenneté', 'Bénévoles et organisateurs bienvenus', 'Contacter Al Ataa', null, array['Organiser des actions solidaires.', 'Développer l’engagement citoyen.']),
  ('aei-eniadb', 'AEI ENIADB', 'Association des étudiants', 'Coordonner, représenter et accompagner la vie étudiante.', 'L’AEI ENIADB coordonne la vie associative, représente les étudiants et anime les initiatives communes du campus.', 'Association étudiante', 'Équipe mandatée de l’AEI', 'Contacter l’AEI', null, array['Coordonner la vie associative.', 'Représenter les étudiants.', 'Accompagner les clubs.'])
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  tagline = excluded.tagline,
  description = excluded.description,
  founded_label = coalesce(club_profiles.founded_label, excluded.founded_label),
  recruitment_label = coalesce(club_profiles.recruitment_label, excluded.recruitment_label),
  contact_label = coalesce(club_profiles.contact_label, excluded.contact_label),
  contact_url = coalesce(club_profiles.contact_url, excluded.contact_url),
  objectives = case when cardinality(club_profiles.objectives) = 0 then excluded.objectives else club_profiles.objectives end;

create table if not exists public.club_board_members (
  id uuid primary key default gen_random_uuid(),
  club_id text not null references public.club_profiles(id) on delete cascade,
  full_name text not null check (char_length(trim(full_name)) between 2 and 120),
  role_title text not null check (char_length(trim(role_title)) between 2 and 120),
  photo_url text,
  display_order integer not null default 0 check (display_order >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists club_board_members_club_order_idx
  on public.club_board_members (club_id, active, display_order, created_at);

drop trigger if exists set_club_board_members_updated_at on public.club_board_members;
create trigger set_club_board_members_updated_at
  before update on public.club_board_members
  for each row execute procedure public.set_updated_at();

alter table public.club_board_members enable row level security;
revoke all on table public.club_board_members from anon;
grant select, insert, update, delete on table public.club_board_members to authenticated;

drop policy if exists club_board_members_select on public.club_board_members;
create policy club_board_members_select
on public.club_board_members for select to authenticated
using (active = true or private.manages_club(club_id));

drop policy if exists club_board_members_manage on public.club_board_members;
create policy club_board_members_manage
on public.club_board_members for all to authenticated
using (private.manages_club(club_id))
with check (private.manages_club(club_id));

-- Un bucket public dédié aux portraits du bureau. Les responsables écrivent
-- uniquement dans leur propre dossier utilisateur.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('club-media', 'club-media', true, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists club_media_insert_manager on storage.objects;
create policy club_media_insert_manager
on storage.objects for insert to authenticated
with check (
  bucket_id = 'club-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1 from public.club_managers
    where user_id = (select auth.uid()) and active = true
  )
);

drop policy if exists club_media_update_manager on storage.objects;
create policy club_media_update_manager
on storage.objects for update to authenticated
using (bucket_id = 'club-media' and owner_id = (select auth.uid()::text))
with check (bucket_id = 'club-media' and owner_id = (select auth.uid()::text));

drop policy if exists club_media_delete_manager on storage.objects;
create policy club_media_delete_manager
on storage.objects for delete to authenticated
using (bucket_id = 'club-media' and owner_id = (select auth.uid()::text));

-- Rattache les événements déjà présents dans l'agenda à leur club.
update public.events
set club_id = case
  when lower(coalesce(organizer_name, '')) in ('innoverse', 'inno verse') then 'innoverse'
  when lower(coalesce(organizer_name, '')) in ('nurlai', 'nurl ai') then 'nurlai'
  when lower(coalesce(organizer_name, '')) in ('robotics club', 'riot', 'riot eniadb') then 'riot'
  when lower(coalesce(organizer_name, '')) like '%secora%' then 'secora'
  when lower(coalesce(organizer_name, '')) like '%techrise%' then 'techrise'
  when lower(coalesce(organizer_name, '')) like '%enactus%' then 'enactus'
  when lower(coalesce(organizer_name, '')) like '%al ataa%' then 'al-ataa'
  when lower(coalesce(organizer_name, '')) in ('aei eniad', 'aei eniadb', 'aei') then 'aei-eniadb'
  else club_id
end
where club_id is null;

drop policy if exists events_select_authenticated on public.events;
create policy events_select_authenticated
on public.events for select to authenticated
using (
  status = 'published'
  or created_by = (select auth.uid())
  or private.is_staff()
  or (club_id is not null and private.manages_club(club_id))
);

drop policy if exists events_insert_club_manager on public.events;
create policy events_insert_club_manager
on public.events for insert to authenticated
with check (
  club_id is not null
  and private.manages_club(club_id)
  and created_by = (select auth.uid())
);

drop policy if exists events_update_staff on public.events;
create policy events_update_staff
on public.events for update to authenticated
using (private.is_staff() or (club_id is not null and private.manages_club(club_id)))
with check (private.is_staff() or (club_id is not null and private.manages_club(club_id)));

drop policy if exists events_delete_staff on public.events;
create policy events_delete_staff
on public.events for delete to authenticated
using (private.is_staff() or (club_id is not null and private.manages_club(club_id)));

-- Association automatique des adresses institutionnelles aux clubs.
create or replace function private.assign_club_manager_from_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_club_id text;
begin
  target_club_id := case lower(new.email)
    when 'innoverse_aei@enaid.ump.ma' then 'innoverse'
    when 'nurlai_aei@enaid.ump.ma' then 'nurlai'
    when 'riot_aei@enaid.ump.ma' then 'riot'
    when 'secora_aei@enaid.ump.ma' then 'secora'
    when 'techrise_aei@enaid.ump.ma' then 'techrise'
    when 'enactus_aei@enaid.ump.ma' then 'enactus'
    when 'alataa_aei@enaid.ump.ma' then 'al-ataa'
    when 'aei_eniadb@enaid.ump.ma' then 'aei-eniadb'
    else null
  end;

  if target_club_id is not null then
    insert into public.club_managers (user_id, club_id, manager_role, active)
    values (new.id, target_club_id, 'president', true)
    on conflict (user_id, club_id) do update
      set active = true, manager_role = excluded.manager_role;
  end if;
  return new;
end;
$$;

revoke execute on function private.assign_club_manager_from_email() from public, anon, authenticated;

drop trigger if exists on_auth_user_assign_club_manager on auth.users;
create trigger on_auth_user_assign_club_manager
  after insert or update of email on auth.users
  for each row execute procedure private.assign_club_manager_from_email();

insert into public.club_managers (user_id, club_id, manager_role, active)
select user_id, club_id, 'president', true
from (
  select id as user_id,
    case lower(email)
      when 'innoverse_aei@enaid.ump.ma' then 'innoverse'
      when 'nurlai_aei@enaid.ump.ma' then 'nurlai'
      when 'riot_aei@enaid.ump.ma' then 'riot'
      when 'secora_aei@enaid.ump.ma' then 'secora'
      when 'techrise_aei@enaid.ump.ma' then 'techrise'
      when 'enactus_aei@enaid.ump.ma' then 'enactus'
      when 'alataa_aei@enaid.ump.ma' then 'al-ataa'
      when 'aei_eniadb@enaid.ump.ma' then 'aei-eniadb'
    end as club_id
  from auth.users
) accounts
where club_id is not null
on conflict (user_id, club_id) do update set active = true, manager_role = 'president';

notify pgrst, 'reload schema';
