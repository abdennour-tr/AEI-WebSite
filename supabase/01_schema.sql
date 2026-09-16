-- AEI Portal — Schéma principal Supabase
-- À exécuter en premier dans Supabase > SQL Editor.

create extension if not exists pgcrypto;
create schema if not exists private;

do $$ begin
  create type public.app_role as enum ('student', 'moderator', 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.publication_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.listing_status as enum ('active', 'reserved', 'sold', 'archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.registration_status as enum ('registered', 'waitlisted', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.application_status as enum ('submitted', 'reviewing', 'accepted', 'rejected', 'withdrawn');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.message_sender as enum ('user', 'assistant', 'system');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  phone text,
  bio text,
  role public.app_role not null default 'student',
  hide_email boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.public_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete restrict default auth.uid(),
  title text not null check (char_length(title) between 2 and 180),
  description text,
  level text not null check (level in ('CP1', 'CP2', 'CI')),
  category text not null,
  pdf_url text,
  status public.publication_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.course_favorites (
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

create table if not exists public.housing_listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title text not null check (char_length(title) between 3 and 180),
  description text not null,
  city text not null,
  property_type text not null,
  monthly_price numeric(10,2) not null check (monthly_price >= 0),
  available_from date,
  image_urls text[] not null default '{}',
  status public.listing_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketplace_products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title text not null check (char_length(title) between 3 and 180),
  description text,
  category text not null,
  city text not null,
  item_condition text not null,
  price numeric(10,2) not null check (price >= 0),
  image_urls text[] not null default '{}',
  status public.listing_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete restrict default auth.uid(),
  title text not null check (char_length(title) between 3 and 180),
  description text not null,
  tag text,
  location text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  cover_url text,
  capacity integer check (capacity is null or capacity > 0),
  status public.publication_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at >= starts_at)
);

create table if not exists public.event_registrations (
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  status public.registration_status not null default 'registered',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete restrict default auth.uid(),
  title text not null check (char_length(title) between 3 and 180),
  company text not null,
  description text not null,
  city text,
  duration text,
  application_url text,
  deadline date,
  status public.publication_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.opportunity_favorites (
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, opportunity_id)
);

create table if not exists public.opportunity_applications (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  applicant_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  cover_letter text,
  cv_url text,
  status public.application_status not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (opportunity_id, applicant_id)
);

create table if not exists public.student_projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title text not null check (char_length(title) between 3 and 180),
  description text not null,
  tech_stack text[] not null default '{}',
  repository_url text,
  demo_url text,
  cover_url text,
  status public.publication_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.forum_topics (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title text not null check (char_length(title) between 3 and 180),
  body text not null check (char_length(body) >= 3),
  tag text,
  status public.publication_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.forum_replies (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.forum_topics(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  body text not null check (char_length(body) >= 1),
  status public.publication_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.forum_likes (
  topic_id uuid not null references public.forum_topics(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  created_at timestamptz not null default now(),
  primary key (topic_id, user_id)
);

create table if not exists public.advertisements (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete restrict default auth.uid(),
  title text not null check (char_length(title) between 3 and 180),
  description text not null,
  image_url text,
  target_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  status public.publication_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at >= starts_at)
);

create table if not exists public.advertisement_favorites (
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  advertisement_id uuid not null references public.advertisements(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, advertisement_id)
);

create table if not exists public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title text not null default 'Nouvelle conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  sender public.message_sender not null,
  content text not null check (char_length(content) >= 1),
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  generated_name text;
begin
  generated_name := coalesce(
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    split_part(coalesce(new.email, 'etudiant'), '@', 1)
  );

  insert into public.profiles (id, email, full_name)
  values (new.id, coalesce(new.email, ''), generated_name)
  on conflict (id) do nothing;

  insert into public.public_profiles (user_id, display_name, avatar_url)
  values (new.id, generated_name, new.raw_user_meta_data ->> 'avatar_url')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.sync_public_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.public_profiles
  set display_name = new.full_name,
      updated_at = now()
  where user_id = new.id;
  return new;
end;
$$;

drop trigger if exists sync_public_profile_after_update on public.profiles;
create trigger sync_public_profile_after_update
  after update of full_name on public.profiles
  for each row execute procedure public.sync_public_profile();

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'public_profiles', 'courses', 'housing_listings',
    'marketplace_products', 'events', 'event_registrations', 'opportunities',
    'opportunity_applications', 'student_projects', 'forum_topics',
    'forum_replies', 'advertisements', 'chat_conversations'
  ]
  loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format(
      'create trigger set_%I_updated_at before update on public.%I for each row execute procedure public.set_updated_at()',
      table_name,
      table_name
    );
  end loop;
end $$;

create index if not exists courses_created_by_idx on public.courses(created_by);
create index if not exists courses_status_idx on public.courses(status);
create index if not exists course_favorites_course_idx on public.course_favorites(course_id);
create index if not exists housing_owner_idx on public.housing_listings(owner_id);
create index if not exists housing_status_city_idx on public.housing_listings(status, city);
create index if not exists marketplace_seller_idx on public.marketplace_products(seller_id);
create index if not exists marketplace_status_category_idx on public.marketplace_products(status, category);
create index if not exists events_created_by_idx on public.events(created_by);
create index if not exists events_status_starts_idx on public.events(status, starts_at);
create index if not exists event_registrations_user_idx on public.event_registrations(user_id);
create index if not exists opportunities_created_by_idx on public.opportunities(created_by);
create index if not exists opportunities_status_deadline_idx on public.opportunities(status, deadline);
create index if not exists opportunity_favorites_opportunity_idx on public.opportunity_favorites(opportunity_id);
create index if not exists applications_applicant_idx on public.opportunity_applications(applicant_id);
create index if not exists projects_owner_idx on public.student_projects(owner_id);
create index if not exists projects_status_idx on public.student_projects(status);
create index if not exists forum_topics_author_idx on public.forum_topics(author_id);
create index if not exists forum_topics_status_created_idx on public.forum_topics(status, created_at desc);
create index if not exists forum_replies_topic_idx on public.forum_replies(topic_id);
create index if not exists forum_replies_author_idx on public.forum_replies(author_id);
create index if not exists forum_likes_user_idx on public.forum_likes(user_id);
create index if not exists advertisements_status_idx on public.advertisements(status);
create index if not exists conversations_user_idx on public.chat_conversations(user_id);
create index if not exists messages_conversation_created_idx on public.chat_messages(conversation_id, created_at);
create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);
