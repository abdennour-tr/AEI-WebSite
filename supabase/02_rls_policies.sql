-- AEI Portal — Sécurité, droits et politiques RLS
-- À exécuter après 01_schema.sql.

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

create or replace function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid()) and role in ('moderator', 'admin')
  );
$$;

revoke all on schema private from public;
grant usage on schema private to authenticated;
revoke execute on function private.is_admin() from public;
revoke execute on function private.is_staff() from public;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.is_staff() to authenticated;

alter table public.profiles enable row level security;
alter table public.public_profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_favorites enable row level security;
alter table public.housing_listings enable row level security;
alter table public.marketplace_products enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
alter table public.opportunities enable row level security;
alter table public.opportunity_favorites enable row level security;
alter table public.opportunity_applications enable row level security;
alter table public.student_projects enable row level security;
alter table public.forum_topics enable row level security;
alter table public.forum_replies enable row level security;
alter table public.forum_likes enable row level security;
alter table public.advertisements enable row level security;
alter table public.advertisement_favorites enable row level security;
alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;
alter table public.notifications enable row level security;

revoke all on table public.profiles from anon;
revoke all on table public.public_profiles from anon;
revoke all on table public.courses from anon;
revoke all on table public.course_favorites from anon;
revoke all on table public.housing_listings from anon;
revoke all on table public.marketplace_products from anon;
revoke all on table public.events from anon;
revoke all on table public.event_registrations from anon;
revoke all on table public.opportunities from anon;
revoke all on table public.opportunity_favorites from anon;
revoke all on table public.opportunity_applications from anon;
revoke all on table public.student_projects from anon;
revoke all on table public.forum_topics from anon;
revoke all on table public.forum_replies from anon;
revoke all on table public.forum_likes from anon;
revoke all on table public.advertisements from anon;
revoke all on table public.advertisement_favorites from anon;
revoke all on table public.chat_conversations from anon;
revoke all on table public.chat_messages from anon;
revoke all on table public.notifications from anon;

revoke all on table public.profiles from authenticated;
grant select on table public.profiles to authenticated;
grant update (full_name, phone, bio, hide_email, updated_at)
  on table public.profiles to authenticated;

revoke all on table public.public_profiles from authenticated;
grant select on table public.public_profiles to authenticated;
grant update (display_name, avatar_url, updated_at)
  on table public.public_profiles to authenticated;

grant select, insert, update, delete on table public.courses to authenticated;
grant select, insert, delete on table public.course_favorites to authenticated;
grant select, insert, update, delete on table public.housing_listings to authenticated;
grant select, insert, update, delete on table public.marketplace_products to authenticated;
grant select, insert, update, delete on table public.events to authenticated;
grant select, insert, update, delete on table public.event_registrations to authenticated;
grant select, insert, update, delete on table public.opportunities to authenticated;
grant select, insert, delete on table public.opportunity_favorites to authenticated;
grant select, insert, update, delete on table public.opportunity_applications to authenticated;
grant select, insert, update, delete on table public.student_projects to authenticated;
grant select, insert, update, delete on table public.forum_topics to authenticated;
grant select, insert, update, delete on table public.forum_replies to authenticated;
grant select, insert, delete on table public.forum_likes to authenticated;
grant select, insert, update, delete on table public.advertisements to authenticated;
grant select, insert, delete on table public.advertisement_favorites to authenticated;
grant select, insert, update, delete on table public.chat_conversations to authenticated;
grant select, insert, delete on table public.chat_messages to authenticated;
grant select, update on table public.notifications to authenticated;

-- Profils privés
drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin
on public.profiles for select to authenticated
using ((select auth.uid()) = id or private.is_admin());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- Profils publics
drop policy if exists public_profiles_select_authenticated on public.public_profiles;
create policy public_profiles_select_authenticated
on public.public_profiles for select to authenticated
using (true);

drop policy if exists public_profiles_update_own on public.public_profiles;
create policy public_profiles_update_own
on public.public_profiles for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- Cours : lecture par tous les membres, écriture par l'équipe
drop policy if exists courses_select_authenticated on public.courses;
create policy courses_select_authenticated
on public.courses for select to authenticated
using (status = 'published' or created_by = (select auth.uid()) or private.is_staff());

drop policy if exists courses_insert_staff on public.courses;
create policy courses_insert_staff
on public.courses for insert to authenticated
with check (private.is_staff() and created_by = (select auth.uid()));

drop policy if exists courses_update_staff on public.courses;
create policy courses_update_staff
on public.courses for update to authenticated
using (private.is_staff())
with check (private.is_staff());

drop policy if exists courses_delete_staff on public.courses;
create policy courses_delete_staff
on public.courses for delete to authenticated
using (private.is_staff());

drop policy if exists course_favorites_select_own on public.course_favorites;
create policy course_favorites_select_own
on public.course_favorites for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists course_favorites_insert_own on public.course_favorites;
create policy course_favorites_insert_own
on public.course_favorites for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists course_favorites_delete_own on public.course_favorites;
create policy course_favorites_delete_own
on public.course_favorites for delete to authenticated
using ((select auth.uid()) = user_id);

-- Colocation
drop policy if exists housing_select_authenticated on public.housing_listings;
create policy housing_select_authenticated
on public.housing_listings for select to authenticated
using (status = 'active' or owner_id = (select auth.uid()) or private.is_staff());

drop policy if exists housing_insert_own on public.housing_listings;
create policy housing_insert_own
on public.housing_listings for insert to authenticated
with check (owner_id = (select auth.uid()));

drop policy if exists housing_update_own_or_staff on public.housing_listings;
create policy housing_update_own_or_staff
on public.housing_listings for update to authenticated
using (owner_id = (select auth.uid()) or private.is_staff())
with check (owner_id = (select auth.uid()) or private.is_staff());

drop policy if exists housing_delete_own_or_staff on public.housing_listings;
create policy housing_delete_own_or_staff
on public.housing_listings for delete to authenticated
using (owner_id = (select auth.uid()) or private.is_staff());

-- Marketplace
drop policy if exists products_select_authenticated on public.marketplace_products;
create policy products_select_authenticated
on public.marketplace_products for select to authenticated
using (status = 'active' or seller_id = (select auth.uid()) or private.is_staff());

drop policy if exists products_insert_own on public.marketplace_products;
create policy products_insert_own
on public.marketplace_products for insert to authenticated
with check (seller_id = (select auth.uid()));

drop policy if exists products_update_own_or_staff on public.marketplace_products;
create policy products_update_own_or_staff
on public.marketplace_products for update to authenticated
using (seller_id = (select auth.uid()) or private.is_staff())
with check (seller_id = (select auth.uid()) or private.is_staff());

drop policy if exists products_delete_own_or_staff on public.marketplace_products;
create policy products_delete_own_or_staff
on public.marketplace_products for delete to authenticated
using (seller_id = (select auth.uid()) or private.is_staff());

-- Évènements
drop policy if exists events_select_authenticated on public.events;
create policy events_select_authenticated
on public.events for select to authenticated
using (status = 'published' or created_by = (select auth.uid()) or private.is_staff());

drop policy if exists events_insert_staff on public.events;
create policy events_insert_staff
on public.events for insert to authenticated
with check (private.is_staff() and created_by = (select auth.uid()));

drop policy if exists events_update_staff on public.events;
create policy events_update_staff
on public.events for update to authenticated
using (private.is_staff())
with check (private.is_staff());

drop policy if exists events_delete_staff on public.events;
create policy events_delete_staff
on public.events for delete to authenticated
using (private.is_staff());

drop policy if exists registrations_select_relevant on public.event_registrations;
create policy registrations_select_relevant
on public.event_registrations for select to authenticated
using (
  user_id = (select auth.uid())
  or private.is_staff()
  or exists (
    select 1 from public.events
    where events.id = event_id and events.created_by = (select auth.uid())
  )
);

drop policy if exists registrations_insert_own on public.event_registrations;
create policy registrations_insert_own
on public.event_registrations for insert to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists registrations_update_own on public.event_registrations;
create policy registrations_update_own
on public.event_registrations for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists registrations_delete_own on public.event_registrations;
create policy registrations_delete_own
on public.event_registrations for delete to authenticated
using (user_id = (select auth.uid()));

-- Stages et candidatures
drop policy if exists opportunities_select_authenticated on public.opportunities;
create policy opportunities_select_authenticated
on public.opportunities for select to authenticated
using (status = 'published' or created_by = (select auth.uid()) or private.is_staff());

drop policy if exists opportunities_insert_staff on public.opportunities;
create policy opportunities_insert_staff
on public.opportunities for insert to authenticated
with check (private.is_staff() and created_by = (select auth.uid()));

drop policy if exists opportunities_update_staff on public.opportunities;
create policy opportunities_update_staff
on public.opportunities for update to authenticated
using (private.is_staff())
with check (private.is_staff());

drop policy if exists opportunities_delete_staff on public.opportunities;
create policy opportunities_delete_staff
on public.opportunities for delete to authenticated
using (private.is_staff());

drop policy if exists opportunity_favorites_select_own on public.opportunity_favorites;
create policy opportunity_favorites_select_own
on public.opportunity_favorites for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists opportunity_favorites_insert_own on public.opportunity_favorites;
create policy opportunity_favorites_insert_own
on public.opportunity_favorites for insert to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists opportunity_favorites_delete_own on public.opportunity_favorites;
create policy opportunity_favorites_delete_own
on public.opportunity_favorites for delete to authenticated
using (user_id = (select auth.uid()));

drop policy if exists applications_select_relevant on public.opportunity_applications;
create policy applications_select_relevant
on public.opportunity_applications for select to authenticated
using (
  applicant_id = (select auth.uid())
  or private.is_staff()
  or exists (
    select 1 from public.opportunities
    where opportunities.id = opportunity_id
      and opportunities.created_by = (select auth.uid())
  )
);

drop policy if exists applications_insert_own on public.opportunity_applications;
create policy applications_insert_own
on public.opportunity_applications for insert to authenticated
with check (applicant_id = (select auth.uid()));

drop policy if exists applications_update_staff on public.opportunity_applications;
create policy applications_update_staff
on public.opportunity_applications for update to authenticated
using (private.is_staff())
with check (private.is_staff());

drop policy if exists applications_delete_own_or_staff on public.opportunity_applications;
create policy applications_delete_own_or_staff
on public.opportunity_applications for delete to authenticated
using (applicant_id = (select auth.uid()) or private.is_staff());

-- Projets étudiants
drop policy if exists projects_select_authenticated on public.student_projects;
create policy projects_select_authenticated
on public.student_projects for select to authenticated
using (status = 'published' or owner_id = (select auth.uid()) or private.is_staff());

drop policy if exists projects_insert_own on public.student_projects;
create policy projects_insert_own
on public.student_projects for insert to authenticated
with check (owner_id = (select auth.uid()));

drop policy if exists projects_update_own_or_staff on public.student_projects;
create policy projects_update_own_or_staff
on public.student_projects for update to authenticated
using (owner_id = (select auth.uid()) or private.is_staff())
with check (owner_id = (select auth.uid()) or private.is_staff());

drop policy if exists projects_delete_own_or_staff on public.student_projects;
create policy projects_delete_own_or_staff
on public.student_projects for delete to authenticated
using (owner_id = (select auth.uid()) or private.is_staff());

-- Forum
drop policy if exists topics_select_authenticated on public.forum_topics;
create policy topics_select_authenticated
on public.forum_topics for select to authenticated
using (status = 'published' or author_id = (select auth.uid()) or private.is_staff());

drop policy if exists topics_insert_own on public.forum_topics;
create policy topics_insert_own
on public.forum_topics for insert to authenticated
with check (author_id = (select auth.uid()));

drop policy if exists topics_update_own_or_staff on public.forum_topics;
create policy topics_update_own_or_staff
on public.forum_topics for update to authenticated
using (author_id = (select auth.uid()) or private.is_staff())
with check (author_id = (select auth.uid()) or private.is_staff());

drop policy if exists topics_delete_own_or_staff on public.forum_topics;
create policy topics_delete_own_or_staff
on public.forum_topics for delete to authenticated
using (author_id = (select auth.uid()) or private.is_staff());

drop policy if exists replies_select_authenticated on public.forum_replies;
create policy replies_select_authenticated
on public.forum_replies for select to authenticated
using (status = 'published' or author_id = (select auth.uid()) or private.is_staff());

drop policy if exists replies_insert_own on public.forum_replies;
create policy replies_insert_own
on public.forum_replies for insert to authenticated
with check (author_id = (select auth.uid()));

drop policy if exists replies_update_own_or_staff on public.forum_replies;
create policy replies_update_own_or_staff
on public.forum_replies for update to authenticated
using (author_id = (select auth.uid()) or private.is_staff())
with check (author_id = (select auth.uid()) or private.is_staff());

drop policy if exists replies_delete_own_or_staff on public.forum_replies;
create policy replies_delete_own_or_staff
on public.forum_replies for delete to authenticated
using (author_id = (select auth.uid()) or private.is_staff());

drop policy if exists forum_likes_select_authenticated on public.forum_likes;
create policy forum_likes_select_authenticated
on public.forum_likes for select to authenticated
using (true);

drop policy if exists forum_likes_insert_own on public.forum_likes;
create policy forum_likes_insert_own
on public.forum_likes for insert to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists forum_likes_delete_own on public.forum_likes;
create policy forum_likes_delete_own
on public.forum_likes for delete to authenticated
using (user_id = (select auth.uid()));

-- Publicités
drop policy if exists ads_select_authenticated on public.advertisements;
create policy ads_select_authenticated
on public.advertisements for select to authenticated
using (status = 'published' or created_by = (select auth.uid()) or private.is_staff());

drop policy if exists ads_insert_staff on public.advertisements;
create policy ads_insert_staff
on public.advertisements for insert to authenticated
with check (private.is_staff() and created_by = (select auth.uid()));

drop policy if exists ads_update_staff on public.advertisements;
create policy ads_update_staff
on public.advertisements for update to authenticated
using (private.is_staff())
with check (private.is_staff());

drop policy if exists ads_delete_staff on public.advertisements;
create policy ads_delete_staff
on public.advertisements for delete to authenticated
using (private.is_staff());

drop policy if exists ad_favorites_select_own on public.advertisement_favorites;
create policy ad_favorites_select_own
on public.advertisement_favorites for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists ad_favorites_insert_own on public.advertisement_favorites;
create policy ad_favorites_insert_own
on public.advertisement_favorites for insert to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists ad_favorites_delete_own on public.advertisement_favorites;
create policy ad_favorites_delete_own
on public.advertisement_favorites for delete to authenticated
using (user_id = (select auth.uid()));

-- Chat privé
drop policy if exists conversations_select_own on public.chat_conversations;
create policy conversations_select_own
on public.chat_conversations for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists conversations_insert_own on public.chat_conversations;
create policy conversations_insert_own
on public.chat_conversations for insert to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists conversations_update_own on public.chat_conversations;
create policy conversations_update_own
on public.chat_conversations for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists conversations_delete_own on public.chat_conversations;
create policy conversations_delete_own
on public.chat_conversations for delete to authenticated
using (user_id = (select auth.uid()));

drop policy if exists messages_select_own_conversation on public.chat_messages;
create policy messages_select_own_conversation
on public.chat_messages for select to authenticated
using (
  exists (
    select 1 from public.chat_conversations
    where chat_conversations.id = conversation_id
      and chat_conversations.user_id = (select auth.uid())
  )
);

drop policy if exists messages_insert_user_message on public.chat_messages;
create policy messages_insert_user_message
on public.chat_messages for insert to authenticated
with check (
  sender = 'user'
  and user_id = (select auth.uid())
  and exists (
    select 1 from public.chat_conversations
    where chat_conversations.id = conversation_id
      and chat_conversations.user_id = (select auth.uid())
  )
);

drop policy if exists messages_delete_own_conversation on public.chat_messages;
create policy messages_delete_own_conversation
on public.chat_messages for delete to authenticated
using (
  exists (
    select 1 from public.chat_conversations
    where chat_conversations.id = conversation_id
      and chat_conversations.user_id = (select auth.uid())
  )
);

-- Notifications
drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own
on public.notifications for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own
on public.notifications for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));
