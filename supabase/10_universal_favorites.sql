-- AEI Portal — favoris universels et notifications de mise à jour.
-- À exécuter après 01_schema.sql, 02_rls_policies.sql, 06_club_admin.sql,
-- 07_student_projects.sql et 08_project_interactions_rpc.sql.

create table if not exists public.club_favorites (
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  club_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, club_id)
);

create table if not exists public.marketplace_product_favorites (
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  product_id uuid not null references public.marketplace_products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.housing_favorites (
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  housing_id uuid not null references public.housing_listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, housing_id)
);

create index if not exists club_favorites_club_idx
  on public.club_favorites (club_id);
create index if not exists marketplace_product_favorites_product_idx
  on public.marketplace_product_favorites (product_id);
create index if not exists housing_favorites_housing_idx
  on public.housing_favorites (housing_id);

alter table public.club_favorites enable row level security;
alter table public.marketplace_product_favorites enable row level security;
alter table public.housing_favorites enable row level security;

revoke all on table public.club_favorites from anon;
revoke all on table public.marketplace_product_favorites from anon;
revoke all on table public.housing_favorites from anon;

revoke all on table public.club_favorites from authenticated;
revoke all on table public.marketplace_product_favorites from authenticated;
revoke all on table public.housing_favorites from authenticated;

grant select, insert, delete on table public.club_favorites to authenticated;
grant select, insert, delete on table public.marketplace_product_favorites to authenticated;
grant select, insert, delete on table public.housing_favorites to authenticated;

drop policy if exists club_favorites_select_own on public.club_favorites;
create policy club_favorites_select_own
on public.club_favorites for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists club_favorites_insert_own on public.club_favorites;
create policy club_favorites_insert_own
on public.club_favorites for insert to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists club_favorites_delete_own on public.club_favorites;
create policy club_favorites_delete_own
on public.club_favorites for delete to authenticated
using (user_id = (select auth.uid()));

drop policy if exists marketplace_favorites_select_own on public.marketplace_product_favorites;
create policy marketplace_favorites_select_own
on public.marketplace_product_favorites for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists marketplace_favorites_insert_own on public.marketplace_product_favorites;
create policy marketplace_favorites_insert_own
on public.marketplace_product_favorites for insert to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists marketplace_favorites_delete_own on public.marketplace_product_favorites;
create policy marketplace_favorites_delete_own
on public.marketplace_product_favorites for delete to authenticated
using (user_id = (select auth.uid()));

drop policy if exists housing_favorites_select_own on public.housing_favorites;
create policy housing_favorites_select_own
on public.housing_favorites for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists housing_favorites_insert_own on public.housing_favorites;
create policy housing_favorites_insert_own
on public.housing_favorites for insert to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists housing_favorites_delete_own on public.housing_favorites;
create policy housing_favorites_delete_own
on public.housing_favorites for delete to authenticated
using (user_id = (select auth.uid()));

-- Crée une notification ciblée pour chaque étudiant qui suit le contenu modifié.
create or replace function private.notify_favorite_content_updated()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  item_title text;
  item_category text;
begin
  if tg_table_name = 'courses' then
    item_title := new.title;
    item_category := 'course';
    insert into public.notifications (user_id, title, body, link)
    select favorite.user_id, 'Un cours favori a été actualisé',
      item_title || ' contient de nouvelles informations.',
      '/favori?categorie=' || item_category
    from public.course_favorites favorite
    where favorite.course_id = new.id;

  elsif tg_table_name = 'student_projects' then
    item_title := new.title;
    item_category := 'project';
    insert into public.notifications (user_id, title, body, link)
    select favorite.user_id, 'Un projet favori a été actualisé',
      item_title || ' contient de nouvelles informations.',
      '/favori?categorie=' || item_category
    from public.project_favorites favorite
    where favorite.project_id = new.id;

  elsif tg_table_name = 'advertisements' then
    item_title := new.title;
    item_category := 'advertisement';
    insert into public.notifications (user_id, title, body, link)
    select favorite.user_id, 'Une annonce favorite a été actualisée',
      item_title || ' contient de nouvelles informations.',
      '/favori?categorie=' || item_category
    from public.advertisement_favorites favorite
    where favorite.advertisement_id = new.id;

  elsif tg_table_name = 'marketplace_products' then
    item_title := new.title;
    item_category := 'product';
    insert into public.notifications (user_id, title, body, link)
    select favorite.user_id, 'Un produit favori a été actualisé',
      item_title || ' contient de nouvelles informations.',
      '/favori?categorie=' || item_category
    from public.marketplace_product_favorites favorite
    where favorite.product_id = new.id;

  elsif tg_table_name = 'housing_listings' then
    item_title := new.title;
    item_category := 'housing';
    insert into public.notifications (user_id, title, body, link)
    select favorite.user_id, 'Une colocation favorite a été actualisée',
      item_title || ' contient de nouvelles informations.',
      '/favori?categorie=' || item_category
    from public.housing_favorites favorite
    where favorite.housing_id = new.id;

  elsif tg_table_name = 'club_profiles' then
    item_title := new.name;
    item_category := 'club';
    insert into public.notifications (user_id, title, body, link)
    select favorite.user_id, 'Un club favori a été actualisé',
      item_title || ' contient de nouvelles informations.',
      '/favori?categorie=' || item_category
    from public.club_favorites favorite
    where favorite.club_id = new.id;
  end if;

  return new;
end;
$$;

revoke all on function private.notify_favorite_content_updated() from public, anon, authenticated;

do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'courses', 'student_projects', 'advertisements',
    'marketplace_products', 'housing_listings', 'club_profiles'
  ]
  loop
    execute format(
      'drop trigger if exists notify_%I_favorites_on_update on public.%I',
      target_table,
      target_table
    );
    execute format(
      'create trigger notify_%I_favorites_on_update after update on public.%I for each row execute function private.notify_favorite_content_updated()',
      target_table,
      target_table
    );
  end loop;
end $$;

-- Active la synchronisation instantanée des favoris dans les différents onglets.
do $$
declare
  realtime_table text;
begin
  foreach realtime_table in array array[
    'course_favorites', 'project_favorites', 'advertisement_favorites',
    'club_favorites', 'marketplace_product_favorites', 'housing_favorites',
    'notifications'
  ]
  loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', realtime_table);
    exception
      when duplicate_object then null;
      when undefined_object then
        raise notice 'Publication Supabase Realtime indisponible pour %', realtime_table;
    end;
  end loop;
end $$;

notify pgrst, 'reload schema';
