-- Fiches de clubs : candidatures et suivi par l'étudiant.
-- À exécuter une seule fois dans l'éditeur SQL Supabase après les scripts 01 et 02.

create table if not exists public.club_applications (
  id uuid primary key default gen_random_uuid(),
  club_id text not null check (
    club_id in ('innoverse', 'nurlai', 'riot', 'secora', 'techrise', 'enactus', 'al-ataa')
  ),
  applicant_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  preferred_pole text not null check (
    preferred_pole in ('technique', 'events', 'communication', 'partnerships', 'undecided')
  ),
  availability text not null check (
    availability in ('weekdays', 'evenings', 'weekends', 'flexible')
  ),
  motivation text not null check (char_length(motivation) between 20 and 500),
  status text not null default 'submitted' check (
    status in ('submitted', 'accepted', 'refused')
  ),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (applicant_id, club_id)
);

create index if not exists club_applications_applicant_idx
  on public.club_applications (applicant_id, created_at desc);
create index if not exists club_applications_club_status_idx
  on public.club_applications (club_id, status, created_at desc);

drop trigger if exists set_club_applications_updated_at on public.club_applications;
create trigger set_club_applications_updated_at
  before update on public.club_applications
  for each row execute procedure public.set_updated_at();

alter table public.club_applications enable row level security;

revoke all on table public.club_applications from anon;
revoke all on table public.club_applications from authenticated;
grant select, insert on table public.club_applications to authenticated;
grant update (status, reviewed_by, reviewed_at, updated_at)
  on table public.club_applications to authenticated;

drop policy if exists club_applications_select_relevant on public.club_applications;
create policy club_applications_select_relevant
on public.club_applications for select to authenticated
using (applicant_id = (select auth.uid()) or private.is_staff());

drop policy if exists club_applications_insert_own on public.club_applications;
create policy club_applications_insert_own
on public.club_applications for insert to authenticated
with check (
  applicant_id = (select auth.uid())
  and status = 'submitted'
  and reviewed_by is null
  and reviewed_at is null
);

drop policy if exists club_applications_update_staff on public.club_applications;
create policy club_applications_update_staff
on public.club_applications for update to authenticated
using (private.is_staff())
with check (private.is_staff());
