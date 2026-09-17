-- AEI Portal — Projets étudiants publics enrichis
-- À exécuter après 01_schema.sql et 02_rls_policies.sql.

alter table public.student_projects
  add column if not exists field_of_study text,
  add column if not exists academic_year text,
  add column if not exists project_stage text not null default 'in_progress',
  add column if not exists documentation_url text,
  add column if not exists screenshot_urls text[] not null default '{}',
  add column if not exists team_members jsonb not null default '[]'::jsonb,
  add column if not exists seeking_collaborators boolean not null default false,
  add column if not exists collaborator_roles text[] not null default '{}',
  add column if not exists is_featured boolean not null default false,
  add column if not exists featured_month date;

do $$ begin
  alter table public.student_projects
    add constraint student_projects_stage_check
    check (project_stage in ('idea', 'in_progress', 'beta', 'completed'));
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.student_projects
    add constraint student_projects_team_is_array
    check (jsonb_typeof(team_members) = 'array');
exception when duplicate_object then null;
end $$;

create table if not exists public.project_favorites (
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  project_id uuid not null references public.student_projects(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, project_id)
);

create table if not exists public.project_likes (
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  project_id uuid not null references public.student_projects(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, project_id)
);

create table if not exists public.project_comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.student_projects(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  body text not null check (char_length(trim(body)) between 2 and 1500),
  status public.publication_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_join_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.student_projects(id) on delete cascade,
  requester_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  role_requested text,
  message text not null check (char_length(trim(message)) between 10 and 1500),
  status public.application_status not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, requester_id)
);

drop trigger if exists set_project_comments_updated_at on public.project_comments;
create trigger set_project_comments_updated_at
  before update on public.project_comments
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_project_join_requests_updated_at on public.project_join_requests;
create trigger set_project_join_requests_updated_at
  before update on public.project_join_requests
  for each row execute procedure public.set_updated_at();

create index if not exists project_favorites_project_idx on public.project_favorites(project_id);
create index if not exists project_likes_project_idx on public.project_likes(project_id);
create index if not exists project_comments_project_created_idx on public.project_comments(project_id, created_at desc);
create index if not exists project_join_requests_project_idx on public.project_join_requests(project_id, status);
create index if not exists student_projects_filters_idx on public.student_projects(field_of_study, academic_year, project_stage);
create index if not exists student_projects_featured_idx on public.student_projects(featured_month desc) where is_featured;

alter table public.project_favorites enable row level security;
alter table public.project_likes enable row level security;
alter table public.project_comments enable row level security;
alter table public.project_join_requests enable row level security;

revoke all on table public.project_favorites from anon;
revoke all on table public.project_likes from anon;
revoke all on table public.project_comments from anon;
revoke all on table public.project_join_requests from anon;

revoke all on table public.project_favorites from authenticated;
revoke all on table public.project_likes from authenticated;
revoke all on table public.project_comments from authenticated;
revoke all on table public.project_join_requests from authenticated;

grant select, insert, delete on table public.project_favorites to authenticated;
grant select, insert, delete on table public.project_likes to authenticated;
grant select, insert, update, delete on table public.project_comments to authenticated;
grant select, insert, update, delete on table public.project_join_requests to authenticated;

-- Les étudiants peuvent modifier le contenu de leurs projets, mais la sélection
-- mensuelle reste réservée aux modérateurs et administrateurs.
revoke update on table public.student_projects from authenticated;
grant update (
  title, description, tech_stack, repository_url, demo_url, cover_url, status,
  field_of_study, academic_year, project_stage, documentation_url,
  screenshot_urls, team_members, seeking_collaborators, collaborator_roles,
  updated_at
) on table public.student_projects to authenticated;

drop policy if exists projects_insert_own on public.student_projects;
create policy projects_insert_own
on public.student_projects for insert to authenticated
with check (
  owner_id = (select auth.uid())
  and (not is_featured or private.is_staff())
  and (featured_month is null or private.is_staff())
);

drop policy if exists project_favorites_select_own on public.project_favorites;
create policy project_favorites_select_own
on public.project_favorites for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists project_favorites_insert_own on public.project_favorites;
create policy project_favorites_insert_own
on public.project_favorites for insert to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists project_favorites_delete_own on public.project_favorites;
create policy project_favorites_delete_own
on public.project_favorites for delete to authenticated
using (user_id = (select auth.uid()));

drop policy if exists project_likes_select_authenticated on public.project_likes;
create policy project_likes_select_authenticated
on public.project_likes for select to authenticated
using (true);

drop policy if exists project_likes_insert_own on public.project_likes;
create policy project_likes_insert_own
on public.project_likes for insert to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists project_likes_delete_own on public.project_likes;
create policy project_likes_delete_own
on public.project_likes for delete to authenticated
using (user_id = (select auth.uid()));

drop policy if exists project_comments_select_authenticated on public.project_comments;
create policy project_comments_select_authenticated
on public.project_comments for select to authenticated
using (status = 'published' or author_id = (select auth.uid()) or private.is_staff());

drop policy if exists project_comments_insert_own on public.project_comments;
create policy project_comments_insert_own
on public.project_comments for insert to authenticated
with check (author_id = (select auth.uid()) and status = 'published');

drop policy if exists project_comments_update_own_or_staff on public.project_comments;
create policy project_comments_update_own_or_staff
on public.project_comments for update to authenticated
using (author_id = (select auth.uid()) or private.is_staff())
with check (author_id = (select auth.uid()) or private.is_staff());

drop policy if exists project_comments_delete_own_or_staff on public.project_comments;
create policy project_comments_delete_own_or_staff
on public.project_comments for delete to authenticated
using (author_id = (select auth.uid()) or private.is_staff());

drop policy if exists project_join_requests_select_relevant on public.project_join_requests;
create policy project_join_requests_select_relevant
on public.project_join_requests for select to authenticated
using (
  requester_id = (select auth.uid())
  or private.is_staff()
  or exists (
    select 1 from public.student_projects
    where student_projects.id = project_id
      and student_projects.owner_id = (select auth.uid())
  )
);

drop policy if exists project_join_requests_insert_own on public.project_join_requests;
create policy project_join_requests_insert_own
on public.project_join_requests for insert to authenticated
with check (
  requester_id = (select auth.uid())
  and exists (
    select 1 from public.student_projects
    where student_projects.id = project_id
      and student_projects.owner_id <> (select auth.uid())
      and student_projects.seeking_collaborators
      and student_projects.status = 'published'
  )
);

drop policy if exists project_join_requests_update_owner_or_staff on public.project_join_requests;
create policy project_join_requests_update_owner_or_staff
on public.project_join_requests for update to authenticated
using (
  private.is_staff()
  or exists (
    select 1 from public.student_projects
    where student_projects.id = project_id
      and student_projects.owner_id = (select auth.uid())
  )
)
with check (
  private.is_staff()
  or exists (
    select 1 from public.student_projects
    where student_projects.id = project_id
      and student_projects.owner_id = (select auth.uid())
  )
);

drop policy if exists project_join_requests_delete_own_or_staff on public.project_join_requests;
create policy project_join_requests_delete_own_or_staff
on public.project_join_requests for delete to authenticated
using (requester_id = (select auth.uid()) or private.is_staff());

-- Exemple de sélection mensuelle (à exécuter par un administrateur) :
-- update public.student_projects
-- set is_featured = true, featured_month = date_trunc('month', current_date)::date
-- where id = 'UUID_DU_PROJET';
