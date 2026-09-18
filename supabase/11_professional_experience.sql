-- AEI Portal — profil étudiant enrichi, badges et expérience professionnelle.
-- À exécuter après les scripts 01 à 10.

alter table public.profiles
  add column if not exists skills text[] not null default '{}',
  add column if not exists interests text[] not null default '{}',
  add column if not exists portfolio_url text,
  add column if not exists github_url text,
  add column if not exists linkedin_url text;

grant update (skills, interests, portfolio_url, github_url, linkedin_url, updated_at)
  on table public.profiles to authenticated;

create table if not exists public.student_badges (
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_code text not null,
  title text not null,
  description text not null,
  icon text not null default 'award',
  awarded_at timestamptz not null default now(),
  primary key (user_id, badge_code)
);

alter table public.student_badges enable row level security;
revoke all on table public.student_badges from anon;
revoke all on table public.student_badges from authenticated;
grant select on table public.student_badges to authenticated;

drop policy if exists student_badges_select_own on public.student_badges;
create policy student_badges_select_own
on public.student_badges for select to authenticated
using (user_id = (select auth.uid()));

insert into public.student_badges (user_id, badge_code, title, description, icon)
select
  id,
  'aei_member',
  'Membre AEI',
  'Profil étudiant actif sur le portail de la communauté.',
  'shield'
from auth.users
on conflict (user_id, badge_code) do nothing;

-- Attribue automatiquement le badge lors de la création des prochains comptes.
create or replace function private.award_welcome_badge()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.student_badges (user_id, badge_code, title, description, icon)
  values (
    new.id,
    'aei_member',
    'Membre AEI',
    'Profil étudiant actif sur le portail de la communauté.',
    'shield'
  )
  on conflict (user_id, badge_code) do nothing;
  return new;
end;
$$;

drop trigger if exists award_welcome_badge_after_profile on public.profiles;
create trigger award_welcome_badge_after_profile
after insert on public.profiles
for each row execute function private.award_welcome_badge();

do $$
begin
  begin
    alter publication supabase_realtime add table public.notifications;
  exception when duplicate_object then null;
  end;
end $$;

notify pgrst, 'reload schema';
