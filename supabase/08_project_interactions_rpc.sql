-- AEI Portal — Correctif robuste des interactions de projets
-- À exécuter après 07_student_projects.sql.
-- Les opérations sensibles passent par des fonctions SECURITY DEFINER :
-- la table n'est plus écrite directement depuis le navigateur.

grant usage on schema public to authenticated;
grant select, insert, delete on table public.project_likes to authenticated;
grant select, insert, delete on table public.project_favorites to authenticated;
grant select, insert on table public.project_comments to authenticated;
grant select, insert on table public.project_join_requests to authenticated;

create or replace function public.get_project_engagement()
returns table (
  project_id uuid,
  likes_count bigint,
  comments_count bigint,
  is_liked boolean,
  is_favorite boolean,
  join_request_status text
)
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select
    project.id,
    (select count(*) from public.project_likes likes where likes.project_id = project.id),
    (select count(*) from public.project_comments comments where comments.project_id = project.id and comments.status = 'published'),
    exists (
      select 1 from public.project_likes likes
      where likes.project_id = project.id and likes.user_id = auth.uid()
    ),
    exists (
      select 1 from public.project_favorites favorites
      where favorites.project_id = project.id and favorites.user_id = auth.uid()
    ),
    (
      select request.status::text
      from public.project_join_requests request
      where request.project_id = project.id and request.requester_id = auth.uid()
      limit 1
    )
  from public.student_projects project
  where project.status = 'published';
$$;

create or replace function public.toggle_project_like(
  target_project_id uuid,
  should_like boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  current_user_id uuid := auth.uid();
  total_likes bigint;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.student_projects
    where id = target_project_id and status = 'published'
  ) then
    raise exception 'Project not found' using errcode = 'P0002';
  end if;

  if should_like then
    insert into public.project_likes (user_id, project_id)
    values (current_user_id, target_project_id)
    on conflict (user_id, project_id) do nothing;
  else
    delete from public.project_likes
    where user_id = current_user_id and project_id = target_project_id;
  end if;

  select count(*) into total_likes
  from public.project_likes
  where project_id = target_project_id;

  return jsonb_build_object('is_liked', should_like, 'likes_count', total_likes);
end;
$$;

create or replace function public.toggle_project_favorite(
  target_project_id uuid,
  should_favorite boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if should_favorite then
    insert into public.project_favorites (user_id, project_id)
    values (current_user_id, target_project_id)
    on conflict (user_id, project_id) do nothing;
  else
    delete from public.project_favorites
    where user_id = current_user_id and project_id = target_project_id;
  end if;

  return jsonb_build_object('is_favorite', should_favorite);
end;
$$;

create or replace function public.get_project_favorites()
returns table (project_id uuid, favorite_created_at timestamptz)
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select favorite.project_id, favorite.created_at
  from public.project_favorites favorite
  where favorite.user_id = auth.uid()
  order by favorite.created_at desc;
$$;

create or replace function public.get_project_comments(target_project_id uuid)
returns table (
  id uuid,
  project_id uuid,
  author_id uuid,
  body text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select comment.id, comment.project_id, comment.author_id, comment.body, comment.created_at
  from public.project_comments comment
  where comment.project_id = target_project_id and comment.status = 'published'
  order by comment.created_at desc;
$$;

create or replace function public.add_project_comment(
  target_project_id uuid,
  comment_body text
)
returns uuid
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  current_user_id uuid := auth.uid();
  new_comment_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if char_length(trim(comment_body)) not between 2 and 1500 then
    raise exception 'Comment length is invalid' using errcode = '22023';
  end if;

  insert into public.project_comments (project_id, author_id, body)
  values (target_project_id, current_user_id, trim(comment_body))
  returning id into new_comment_id;

  return new_comment_id;
end;
$$;

create or replace function public.request_to_join_project(
  target_project_id uuid,
  desired_role text,
  request_message text
)
returns uuid
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  current_user_id uuid := auth.uid();
  request_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if char_length(trim(request_message)) not between 10 and 1500 then
    raise exception 'Request length is invalid' using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.student_projects
    where id = target_project_id
      and status = 'published'
      and seeking_collaborators
      and owner_id <> current_user_id
  ) then
    raise exception 'Project is not accepting applications' using errcode = '42501';
  end if;

  insert into public.project_join_requests (
    project_id, requester_id, role_requested, message, status
  ) values (
    target_project_id,
    current_user_id,
    nullif(trim(desired_role), ''),
    trim(request_message),
    'submitted'
  )
  on conflict (project_id, requester_id)
  do update set
    role_requested = excluded.role_requested,
    message = excluded.message,
    status = 'submitted',
    updated_at = now()
  returning id into request_id;

  return request_id;
end;
$$;

revoke all on function public.get_project_engagement() from public, anon;
revoke all on function public.toggle_project_like(uuid, boolean) from public, anon;
revoke all on function public.toggle_project_favorite(uuid, boolean) from public, anon;
revoke all on function public.get_project_favorites() from public, anon;
revoke all on function public.get_project_comments(uuid) from public, anon;
revoke all on function public.add_project_comment(uuid, text) from public, anon;
revoke all on function public.request_to_join_project(uuid, text, text) from public, anon;

grant execute on function public.get_project_engagement() to authenticated;
grant execute on function public.toggle_project_like(uuid, boolean) to authenticated;
grant execute on function public.toggle_project_favorite(uuid, boolean) to authenticated;
grant execute on function public.get_project_favorites() to authenticated;
grant execute on function public.get_project_comments(uuid) to authenticated;
grant execute on function public.add_project_comment(uuid, text) to authenticated;
grant execute on function public.request_to_join_project(uuid, text, text) to authenticated;

notify pgrst, 'reload schema';
