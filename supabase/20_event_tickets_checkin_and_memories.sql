-- Billets PDF, contrôle QR par événement et rétrospectives illustrées des clubs.
-- À exécuter après 19_public_discovery.sql.
-- Le bloc ci-dessous répare aussi une installation où club_announcements
-- n'a pas été créée par la migration 06_club_admin.sql.

do $$
begin
  if to_regclass('public.club_profiles') is null then
    raise exception
      'La table public.club_profiles est absente. Exécutez d''abord 05_clubs.sql puis 06_club_admin.sql.';
  end if;
end $$;

create table if not exists public.club_announcements (
  id uuid primary key default gen_random_uuid(),
  club_id text not null references public.club_profiles(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete restrict default auth.uid(),
  title text not null check (char_length(title) between 3 and 180),
  body text not null check (char_length(body) between 10 and 1200),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists club_announcements_club_status_idx
  on public.club_announcements (club_id, status, created_at desc);

alter table public.club_announcements enable row level security;

revoke all on table public.club_announcements from anon;
grant select, insert, update, delete on table public.club_announcements to authenticated;

drop policy if exists club_announcements_select_relevant on public.club_announcements;
create policy club_announcements_select_relevant
on public.club_announcements for select to authenticated
using (status = 'published' or private.manages_club(club_id));

drop policy if exists club_announcements_manage on public.club_announcements;
create policy club_announcements_manage
on public.club_announcements for all to authenticated
using (private.manages_club(club_id))
with check (private.manages_club(club_id) and created_by = (select auth.uid()));

do $$
begin
  if to_regprocedure('public.set_updated_at()') is not null then
    drop trigger if exists set_club_announcements_updated_at on public.club_announcements;
    create trigger set_club_announcements_updated_at
      before update on public.club_announcements
      for each row execute procedure public.set_updated_at();
  end if;
end $$;

alter table public.club_announcements
  add column if not exists content_type text not null default 'announcement',
  add column if not exists event_date date,
  add column if not exists event_location text,
  add column if not exists image_urls text[] not null default '{}',
  add column if not exists collaborator_club_ids text[] not null default '{}';

do $$ begin
  alter table public.club_announcements
    add constraint club_announcements_content_type_check
    check (content_type in ('announcement', 'event_recap'));
exception when duplicate_object then null;
end $$;

create index if not exists club_announcements_type_date_idx
  on public.club_announcements (club_id, content_type, event_date desc, created_at desc);

create or replace function public.club_check_in_event(
  expected_source text,
  expected_event_id uuid,
  ticket_token uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  target_club_id text;
  target_title text;
  registration record;
  was_attended boolean;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if expected_source = 'portal' then
    select event.club_id, event.title
      into target_club_id, target_title
    from public.events event
    where event.id = expected_event_id;
  elsif expected_source = 'club' then
    select event.club_id, event.title
      into target_club_id, target_title
    from public.club_events event
    where event.id = expected_event_id;
  else
    raise exception 'Unknown event source' using errcode = '22023';
  end if;

  if target_club_id is null or not private.manages_club(target_club_id) then
    raise exception 'Club manager access required' using errcode = '42501';
  end if;

  if expected_source = 'portal' then
    select
      item.user_id,
      item.status::text as status,
      item.attended,
      item.checked_in_at,
      item.created_at,
      coalesce(nullif(profile.full_name, ''), profile.email, 'Étudiant AEI') as full_name,
      profile.email,
      coalesce(account.raw_user_meta_data #>> '{onboarding,level}', account.raw_user_meta_data ->> 'level', '') as level,
      coalesce(account.raw_user_meta_data #>> '{onboarding,specialty}', account.raw_user_meta_data ->> 'specialty', '') as specialty
    into registration
    from public.event_registrations item
    left join public.profiles profile on profile.id = item.user_id
    left join auth.users account on account.id = item.user_id
    where item.event_id = expected_event_id
      and item.qr_token = ticket_token;

    if not found then
      return jsonb_build_object('valid', false, 'status', 'not_registered_for_event', 'event_title', target_title);
    end if;

    if registration.status <> 'registered' then
      return jsonb_build_object('valid', false, 'status', registration.status, 'event_title', target_title);
    end if;

    was_attended := registration.attended;
    update public.event_registrations
      set attended = true,
          checked_in_at = coalesce(checked_in_at, now()),
          updated_at = now()
    where event_id = expected_event_id and qr_token = ticket_token;
  else
    select
      item.user_id,
      item.status,
      item.attended,
      item.checked_in_at,
      item.created_at,
      coalesce(nullif(profile.full_name, ''), profile.email, 'Étudiant AEI') as full_name,
      profile.email,
      coalesce(account.raw_user_meta_data #>> '{onboarding,level}', account.raw_user_meta_data ->> 'level', '') as level,
      coalesce(account.raw_user_meta_data #>> '{onboarding,specialty}', account.raw_user_meta_data ->> 'specialty', '') as specialty
    into registration
    from public.club_event_registrations item
    left join public.profiles profile on profile.id = item.user_id
    left join auth.users account on account.id = item.user_id
    where item.event_id = expected_event_id
      and item.qr_token = ticket_token;

    if not found then
      return jsonb_build_object('valid', false, 'status', 'not_registered_for_event', 'event_title', target_title);
    end if;

    if registration.status <> 'registered' then
      return jsonb_build_object('valid', false, 'status', registration.status, 'event_title', target_title);
    end if;

    was_attended := registration.attended;
    update public.club_event_registrations
      set attended = true,
          checked_in_at = coalesce(checked_in_at, now()),
          updated_at = now()
    where event_id = expected_event_id and qr_token = ticket_token;
  end if;

  return jsonb_build_object(
    'valid', true,
    'status', case when was_attended then 'already_checked_in' else 'checked_in' end,
    'event_id', expected_event_id,
    'event_source', expected_source,
    'event_title', target_title,
    'student_id', registration.user_id,
    'full_name', registration.full_name,
    'email', registration.email,
    'level', registration.level,
    'specialty', registration.specialty,
    'registered_at', registration.created_at,
    'checked_in_at', coalesce(registration.checked_in_at, now())
  );
end;
$$;

create or replace function public.list_club_event_attendance(
  expected_source text,
  expected_event_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, auth, pg_temp
as $$
declare
  target_club_id text;
  result jsonb;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if expected_source = 'portal' then
    select club_id into target_club_id from public.events where id = expected_event_id;
  elsif expected_source = 'club' then
    select club_id into target_club_id from public.club_events where id = expected_event_id;
  else
    raise exception 'Unknown event source' using errcode = '22023';
  end if;

  if target_club_id is null or not private.manages_club(target_club_id) then
    raise exception 'Club manager access required' using errcode = '42501';
  end if;

  if expected_source = 'portal' then
    select coalesce(jsonb_agg(jsonb_build_object(
      'user_id', item.user_id,
      'full_name', coalesce(nullif(profile.full_name, ''), profile.email, 'Étudiant AEI'),
      'email', profile.email,
      'level', coalesce(account.raw_user_meta_data #>> '{onboarding,level}', account.raw_user_meta_data ->> 'level', ''),
      'specialty', coalesce(account.raw_user_meta_data #>> '{onboarding,specialty}', account.raw_user_meta_data ->> 'specialty', ''),
      'status', item.status::text,
      'attended', item.attended,
      'registered_at', item.created_at,
      'checked_in_at', item.checked_in_at
    ) order by item.created_at desc), '[]'::jsonb)
    into result
    from public.event_registrations item
    left join public.profiles profile on profile.id = item.user_id
    left join auth.users account on account.id = item.user_id
    where item.event_id = expected_event_id;
  else
    select coalesce(jsonb_agg(jsonb_build_object(
      'user_id', item.user_id,
      'full_name', coalesce(nullif(profile.full_name, ''), profile.email, 'Étudiant AEI'),
      'email', profile.email,
      'level', coalesce(account.raw_user_meta_data #>> '{onboarding,level}', account.raw_user_meta_data ->> 'level', ''),
      'specialty', coalesce(account.raw_user_meta_data #>> '{onboarding,specialty}', account.raw_user_meta_data ->> 'specialty', ''),
      'status', item.status,
      'attended', item.attended,
      'registered_at', item.created_at,
      'checked_in_at', item.checked_in_at
    ) order by item.created_at desc), '[]'::jsonb)
    into result
    from public.club_event_registrations item
    left join public.profiles profile on profile.id = item.user_id
    left join auth.users account on account.id = item.user_id
    where item.event_id = expected_event_id;
  end if;

  return result;
end;
$$;

revoke all on function public.club_check_in_event(text, uuid, uuid) from public, anon;
revoke all on function public.list_club_event_attendance(text, uuid) from public, anon;
grant execute on function public.club_check_in_event(text, uuid, uuid) to authenticated;
grant execute on function public.list_club_event_attendance(text, uuid) to authenticated;

notify pgrst, 'reload schema';
