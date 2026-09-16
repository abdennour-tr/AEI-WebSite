-- AEI Portal — Promotion du premier compte en administrateur
-- IMPORTANT : créez d'abord ce compte dans Authentication > Users > Add user.
-- E-mail : atrariabdennour642@gmail.com
-- Mot de passe temporaire demandé : 123456789
-- Cochez « Auto Confirm User », puis exécutez uniquement ce fichier.

do $$
declare
  target_user_id uuid;
begin
  select id into target_user_id
  from auth.users
  where lower(email) = lower('atrariabdennour642@gmail.com')
  limit 1;

  if target_user_id is null then
    raise exception 'Utilisateur introuvable. Créez-le d''abord dans Authentication > Users.';
  end if;

  update public.profiles
  set full_name = 'Abdennour TRARI',
      role = 'admin',
      updated_at = now()
  where id = target_user_id;

  update public.public_profiles
  set display_name = 'Abdennour TRARI',
      updated_at = now()
  where user_id = target_user_id;
end $$;

