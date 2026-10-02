-- Conserver la validation d'une fiche club lorsqu'un responsable autorisé
-- modifie son contenu ou son logo.
-- À exécuter après 22_club_profile_logo.sql.

create or replace function public.keep_club_approval_after_manager_edit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null and not private.is_staff() then
    if private.manages_club(old.id) then
      -- Le club a déjà été validé : une mise à jour par son propre
      -- responsable ne doit pas le faire disparaître du portail étudiant.
      new.moderation_status := old.moderation_status;
      new.moderation_reason := old.moderation_reason;
      new.moderated_by := old.moderated_by;
      new.moderated_at := old.moderated_at;
    else
      new.moderation_status := 'pending';
      new.moderation_reason := null;
      new.moderated_by := null;
      new.moderated_at := null;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists reset_club_profiles_moderation on public.club_profiles;
create trigger reset_club_profiles_moderation
before update on public.club_profiles
for each row execute procedure public.keep_club_approval_after_manager_edit();

-- Répare la fiche qui a été masquée par l'ancien déclencheur au moment de
-- l'import du logo. Cette ligne est idempotente.
update public.club_profiles
set moderation_status = 'approved',
    moderation_reason = null
where id = 'al-ataa'
  and status = 'active'
  and moderation_status = 'pending'
  and nullif(trim(logo_url), '') is not null;

notify pgrst, 'reload schema';
