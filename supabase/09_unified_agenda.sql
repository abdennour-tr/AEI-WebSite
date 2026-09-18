-- AEI Portal — Agenda universitaire unifié
-- À exécuter après 01, 02 et 06_club_admin.sql.

alter table public.events
  add column if not exists organizer_name text,
  add column if not exists club_id text references public.club_profiles(id) on delete set null;

alter table public.event_registrations
  add column if not exists attended boolean not null default false,
  add column if not exists checked_in_at timestamptz,
  add column if not exists qr_token uuid not null default gen_random_uuid(),
  add column if not exists reminder_enabled boolean not null default true,
  add column if not exists reminder_minutes integer not null default 1440,
  add column if not exists reminder_sent_at timestamptz;

alter table public.club_event_registrations
  add column if not exists checked_in_at timestamptz,
  add column if not exists qr_token uuid not null default gen_random_uuid(),
  add column if not exists reminder_enabled boolean not null default true,
  add column if not exists reminder_minutes integer not null default 1440,
  add column if not exists reminder_sent_at timestamptz;

create unique index if not exists event_registrations_qr_token_idx
  on public.event_registrations(qr_token);
create unique index if not exists club_event_registrations_qr_token_idx
  on public.club_event_registrations(qr_token);

do $$ begin
  alter table public.event_registrations
    add constraint event_registrations_reminder_minutes_check
    check (reminder_minutes between 15 and 10080);
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.club_event_registrations
    add constraint club_event_registrations_reminder_minutes_check
    check (reminder_minutes between 15 and 10080);
exception when duplicate_object then null;
end $$;

grant select, insert, update, delete on table public.event_registrations to authenticated;
grant select, insert, update, delete on table public.club_event_registrations to authenticated;

create or replace function public.get_unified_agenda()
returns table (
  event_key text,
  source text,
  event_id uuid,
  title text,
  description text,
  category text,
  club_id text,
  organizer text,
  location text,
  starts_at timestamptz,
  ends_at timestamptz,
  cover_url text,
  capacity integer,
  registered_count bigint,
  remaining_slots integer,
  is_registered boolean,
  registration_status text,
  reminder_enabled boolean,
  reminder_minutes integer,
  qr_token uuid
)
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select
    'portal:' || event.id::text,
    'portal'::text,
    event.id,
    event.title,
    event.description,
    coalesce(event.tag, 'Campus'),
    event.club_id,
    coalesce(event.organizer_name, club.name, 'AEI ENIAD'),
    event.location,
    event.starts_at,
    event.ends_at,
    event.cover_url,
    event.capacity,
    (select count(*) from public.event_registrations registration where registration.event_id = event.id and registration.status = 'registered'),
    case when event.capacity is null then null else greatest(event.capacity - (select count(*)::integer from public.event_registrations registration where registration.event_id = event.id and registration.status = 'registered'), 0) end,
    coalesce(own_registration.status = 'registered', false),
    own_registration.status::text,
    coalesce(own_registration.reminder_enabled, true),
    coalesce(own_registration.reminder_minutes, 1440),
    own_registration.qr_token
  from public.events event
  left join public.club_profiles club on club.id = event.club_id
  left join public.event_registrations own_registration
    on own_registration.event_id = event.id and own_registration.user_id = auth.uid()
  where event.status = 'published'

  union all

  select
    'club:' || event.id::text,
    'club'::text,
    event.id,
    event.title,
    event.description,
    coalesce(event.event_type, 'Club'),
    event.club_id,
    coalesce(club.name, 'Club ENIAD'),
    event.location,
    event.starts_at,
    event.ends_at,
    null::text,
    event.capacity,
    (select count(*) from public.club_event_registrations registration where registration.event_id = event.id and registration.status = 'registered'),
    case when event.capacity is null then null else greatest(event.capacity - (select count(*)::integer from public.club_event_registrations registration where registration.event_id = event.id and registration.status = 'registered'), 0) end,
    coalesce(own_registration.status = 'registered', false),
    own_registration.status,
    coalesce(own_registration.reminder_enabled, true),
    coalesce(own_registration.reminder_minutes, 1440),
    own_registration.qr_token
  from public.club_events event
  join public.club_profiles club on club.id = event.club_id
  left join public.club_event_registrations own_registration
    on own_registration.event_id = event.id and own_registration.user_id = auth.uid()
  where event.status = 'published'
  order by starts_at;
$$;

create or replace function public.register_unified_event(
  target_source text,
  target_event_id uuid,
  enable_reminder boolean default true,
  reminder_before_minutes integer default 1440
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  current_user_id uuid := auth.uid();
  event_capacity integer;
  current_count integer;
  ticket_token uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if reminder_before_minutes not between 15 and 10080 then
    raise exception 'Invalid reminder interval' using errcode = '22023';
  end if;

  if target_source = 'portal' then
    select capacity into event_capacity
    from public.events
    where id = target_event_id and status = 'published' and starts_at > now()
    for update;

    if not found then raise exception 'Event not available' using errcode = 'P0002'; end if;

    select count(*) into current_count
    from public.event_registrations
    where event_id = target_event_id and status = 'registered' and user_id <> current_user_id;

    if event_capacity is not null and current_count >= event_capacity then
      raise exception 'Event is full' using errcode = 'P0001';
    end if;

    insert into public.event_registrations (
      event_id, user_id, status, reminder_enabled, reminder_minutes, reminder_sent_at
    ) values (
      target_event_id, current_user_id, 'registered', enable_reminder, reminder_before_minutes, null
    )
    on conflict (event_id, user_id) do update set
      status = 'registered',
      reminder_enabled = excluded.reminder_enabled,
      reminder_minutes = excluded.reminder_minutes,
      reminder_sent_at = null,
      updated_at = now()
    returning qr_token into ticket_token;

  elsif target_source = 'club' then
    select capacity into event_capacity
    from public.club_events
    where id = target_event_id and status = 'published' and starts_at > now()
    for update;

    if not found then raise exception 'Event not available' using errcode = 'P0002'; end if;

    select count(*) into current_count
    from public.club_event_registrations
    where event_id = target_event_id and status = 'registered' and user_id <> current_user_id;

    if event_capacity is not null and current_count >= event_capacity then
      raise exception 'Event is full' using errcode = 'P0001';
    end if;

    insert into public.club_event_registrations (
      event_id, user_id, status, reminder_enabled, reminder_minutes, reminder_sent_at
    ) values (
      target_event_id, current_user_id, 'registered', enable_reminder, reminder_before_minutes, null
    )
    on conflict (event_id, user_id) do update set
      status = 'registered',
      reminder_enabled = excluded.reminder_enabled,
      reminder_minutes = excluded.reminder_minutes,
      reminder_sent_at = null,
      updated_at = now()
    returning qr_token into ticket_token;
  else
    raise exception 'Unknown event source' using errcode = '22023';
  end if;

  return jsonb_build_object('registered', true, 'qr_token', ticket_token);
end;
$$;

create or replace function public.cancel_unified_event_registration(
  target_source text,
  target_event_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;

  if target_source = 'portal' then
    update public.event_registrations
    set status = 'cancelled', reminder_enabled = false, updated_at = now()
    where event_id = target_event_id and user_id = auth.uid();
  elsif target_source = 'club' then
    update public.club_event_registrations
    set status = 'cancelled', reminder_enabled = false, updated_at = now()
    where event_id = target_event_id and user_id = auth.uid();
  else
    raise exception 'Unknown event source' using errcode = '22023';
  end if;
end;
$$;

create or replace function public.set_unified_event_reminder(
  target_source text,
  target_event_id uuid,
  enable_reminder boolean,
  reminder_before_minutes integer default 1440
)
returns void
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if reminder_before_minutes not between 15 and 10080 then raise exception 'Invalid reminder interval' using errcode = '22023'; end if;

  if target_source = 'portal' then
    update public.event_registrations
    set reminder_enabled = enable_reminder, reminder_minutes = reminder_before_minutes,
        reminder_sent_at = null, updated_at = now()
    where event_id = target_event_id and user_id = auth.uid() and status = 'registered';
  elsif target_source = 'club' then
    update public.club_event_registrations
    set reminder_enabled = enable_reminder, reminder_minutes = reminder_before_minutes,
        reminder_sent_at = null, updated_at = now()
    where event_id = target_event_id and user_id = auth.uid() and status = 'registered';
  end if;
end;
$$;

create or replace function public.confirm_event_attendance(ticket_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  portal_event_id uuid;
  club_event_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;

  select registration.event_id into portal_event_id
  from public.event_registrations registration
  where registration.qr_token = ticket_token and registration.status = 'registered';

  if portal_event_id is not null then
    if not exists (
      select 1 from public.events event
      where event.id = portal_event_id
        and (event.created_by = auth.uid() or private.is_staff())
    ) then raise exception 'Organizer access required' using errcode = '42501'; end if;

    update public.event_registrations
    set attended = true, checked_in_at = now(), updated_at = now()
    where qr_token = ticket_token;
    return jsonb_build_object('confirmed', true, 'source', 'portal', 'event_id', portal_event_id);
  end if;

  select registration.event_id into club_event_id
  from public.club_event_registrations registration
  where registration.qr_token = ticket_token and registration.status = 'registered';

  if club_event_id is not null then
    if not exists (
      select 1 from public.club_events event
      where event.id = club_event_id and private.manages_club(event.club_id)
    ) then raise exception 'Club manager access required' using errcode = '42501'; end if;

    update public.club_event_registrations
    set attended = true, checked_in_at = now(), updated_at = now()
    where qr_token = ticket_token;
    return jsonb_build_object('confirmed', true, 'source', 'club', 'event_id', club_event_id);
  end if;

  raise exception 'Ticket not found' using errcode = 'P0002';
end;
$$;

create or replace function private.dispatch_event_reminders()
returns integer
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  sent_count integer := 0;
  affected integer;
begin
  insert into public.notifications (user_id, title, body, link)
  select registration.user_id, 'Événement à venir', event.title || ' commence bientôt.', '/evenements'
  from public.event_registrations registration
  join public.events event on event.id = registration.event_id
  where registration.status = 'registered'
    and registration.reminder_enabled
    and registration.reminder_sent_at is null
    and event.starts_at > now()
    and event.starts_at <= now() + make_interval(mins => registration.reminder_minutes);
  get diagnostics affected = row_count;
  sent_count := sent_count + affected;

  update public.event_registrations registration
  set reminder_sent_at = now(), updated_at = now()
  from public.events event
  where event.id = registration.event_id
    and registration.status = 'registered'
    and registration.reminder_enabled
    and registration.reminder_sent_at is null
    and event.starts_at > now()
    and event.starts_at <= now() + make_interval(mins => registration.reminder_minutes);

  insert into public.notifications (user_id, title, body, link)
  select registration.user_id, 'Événement de club à venir', event.title || ' commence bientôt.', '/evenements'
  from public.club_event_registrations registration
  join public.club_events event on event.id = registration.event_id
  where registration.status = 'registered'
    and registration.reminder_enabled
    and registration.reminder_sent_at is null
    and event.starts_at > now()
    and event.starts_at <= now() + make_interval(mins => registration.reminder_minutes);
  get diagnostics affected = row_count;
  sent_count := sent_count + affected;

  update public.club_event_registrations registration
  set reminder_sent_at = now(), updated_at = now()
  from public.club_events event
  where event.id = registration.event_id
    and registration.status = 'registered'
    and registration.reminder_enabled
    and registration.reminder_sent_at is null
    and event.starts_at > now()
    and event.starts_at <= now() + make_interval(mins => registration.reminder_minutes);

  return sent_count;
end;
$$;

revoke all on function public.get_unified_agenda() from public, anon;
revoke all on function public.register_unified_event(text, uuid, boolean, integer) from public, anon;
revoke all on function public.cancel_unified_event_registration(text, uuid) from public, anon;
revoke all on function public.set_unified_event_reminder(text, uuid, boolean, integer) from public, anon;
revoke all on function public.confirm_event_attendance(uuid) from public, anon;

grant execute on function public.get_unified_agenda() to authenticated;
grant execute on function public.register_unified_event(text, uuid, boolean, integer) to authenticated;
grant execute on function public.cancel_unified_event_registration(text, uuid) to authenticated;
grant execute on function public.set_unified_event_reminder(text, uuid, boolean, integer) to authenticated;
grant execute on function public.confirm_event_attendance(uuid) to authenticated;

-- Planification automatique si l’extension pg_cron est déjà activée dans Supabase.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    if not exists (select 1 from cron.job where jobname = 'aei-unified-event-reminders') then
      perform cron.schedule(
        'aei-unified-event-reminders',
        '*/15 * * * *',
        'select private.dispatch_event_reminders();'
      );
    end if;
  else
    raise notice 'Activez pg_cron dans Database > Extensions puis réexécutez ce script pour les rappels automatiques.';
  end if;
end $$;

-- Données initiales de démonstration pour l’agenda universitaire.
insert into public.events (
  created_by, title, description, tag, organizer_name, location,
  starts_at, ends_at, capacity, status
)
select owner.id, seed.title, seed.description, seed.tag, seed.organizer_name,
       seed.location, seed.starts_at, seed.ends_at, seed.capacity, 'published'
from auth.users owner
cross join (
  values
    ('Conférence — IA responsable', 'Chercheurs et ingénieurs échangent sur les usages fiables de l’intelligence artificielle.', 'Conférence', 'NurlAI', 'Amphi principal', '2026-09-24 14:00:00+01'::timestamptz, '2026-09-24 17:00:00+01'::timestamptz, 180),
    ('Atelier APIs & microservices', 'Une session pratique pour concevoir, documenter et déployer une API moderne.', 'Atelier', 'InnoVerse', 'Salle informatique 2', '2026-09-29 10:00:00+01'::timestamptz, '2026-09-29 13:00:00+01'::timestamptz, 36),
    ('ENIAD Robotics Challenge', 'Compétition interéquipes autour de la navigation autonome et des systèmes embarqués.', 'Compétition', 'Robotics Club', 'Hall technologique', '2026-10-03 09:00:00+01'::timestamptz, '2026-10-03 18:00:00+01'::timestamptz, 120),
    ('Design Sprint — Campus utile', 'Deux jours pour imaginer et prototyper des solutions destinées à la vie étudiante.', 'Hackathon', 'AEI ENIAD', 'Espace innovation', '2026-10-09 09:00:00+01'::timestamptz, '2026-10-10 18:00:00+01'::timestamptz, 80)
) as seed(title, description, tag, organizer_name, location, starts_at, ends_at, capacity)
where lower(owner.email) = lower('atrariabdennour642@gmail.com')
  and not exists (
    select 1 from public.events existing
    where existing.title = seed.title and existing.starts_at = seed.starts_at
  );

notify pgrst, 'reload schema';
