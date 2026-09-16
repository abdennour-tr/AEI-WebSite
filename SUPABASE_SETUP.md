# Architecture Supabase — Portail AEI

## Principe de sécurité

Les mots de passe ne sont jamais enregistrés dans une table `public`. Ils sont
gérés et chiffrés par Supabase Auth dans le schéma interne `auth`. La table
`public.profiles` référence `auth.users.id` et conserve uniquement les données
métier du compte.

La clé `service_role` ne doit jamais être ajoutée au frontend, au dépôt Git ou
à un fichier commençant par `VITE_`. Le navigateur utilise uniquement la clé
publique/publishable ; les règles RLS protègent chaque ligne.

## Modèle de données

| Domaine | Tables | Rôle |
| --- | --- | --- |
| Comptes | `profiles`, `public_profiles` | Données privées du compte et identité publique minimale |
| Cours | `courses`, `course_favorites` | Supports pédagogiques et favoris personnels |
| Colocation | `housing_listings` | Annonces publiées et gérées par leur propriétaire |
| Marketplace | `marketplace_products` | Produits vendus par les étudiants |
| Évènements | `events`, `event_registrations` | Agenda et inscriptions individuelles |
| Opportunités | `opportunities`, `opportunity_favorites`, `opportunity_applications` | Stages, favoris et candidatures |
| Projets | `student_projects` | Portfolio des réalisations étudiantes |
| Forum | `forum_topics`, `forum_replies`, `forum_likes` | Discussions, réponses et réactions |
| Publicités | `advertisements`, `advertisement_favorites` | Campagnes validées et favoris |
| Assistant IA | `chat_conversations`, `chat_messages` | Historique privé des conversations |
| Système | `notifications` | Notifications privées destinées à un utilisateur |

Les tables de contenu possèdent un auteur/propriétaire, un statut, des dates de
création et de modification et les index nécessaires aux filtres. Les fichiers
sont stockés dans Supabase Storage ; seules leurs URL sont enregistrées dans
Postgres.

## Ordre d’exécution dans Supabase

Dans **Supabase → SQL Editor**, exécuter les fichiers dans cet ordre :

1. `supabase/01_schema.sql` — types, tables, relations, index et déclencheurs.
2. `supabase/02_rls_policies.sql` — permissions et politiques Row Level Security.
3. `supabase/03_storage.sql` — buckets et règles d’accès aux fichiers.

Chaque script doit terminer sans erreur avant de passer au suivant.

## Création du premier administrateur

La création d’un utilisateur Auth avec un mot de passe ne doit pas être faite
par une insertion SQL directe dans `auth.users`.

1. Ouvrir **Authentication → Users → Add user**.
2. Utiliser l’adresse `atrariabdennour642@gmail.com`.
3. Utiliser temporairement le mot de passe demandé `123456789`.
4. Activer **Auto Confirm User**.
5. Exécuter `supabase/04_promote_initial_admin.sql` dans le SQL Editor.

Le déclencheur `handle_new_user` créera automatiquement les lignes dans
`profiles` et `public_profiles`. Le quatrième script attribuera ensuite le rôle
`admin`. Pour une mise en production, remplacer immédiatement ce mot de passe
par un mot de passe long et unique et activer la MFA.

## Configuration du frontend

Créer un fichier `.env.local` à la racine à partir de `.env.example` :

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

Les deux valeurs se trouvent dans **Project Settings → API**. Après modification,
redémarrer le serveur Vite.

Le site utilise ensuite automatiquement :

- une session persistante et renouvelée par Supabase ;
- une redirection vers `/connexion` pour tout visiteur non authentifié ;
- une déconnexion Supabase réelle depuis la barre de navigation ;
- le profil de l’utilisateur connecté ;
- les politiques RLS pour empêcher l’accès aux données d’un autre utilisateur.

## Contenu initial

Le script `scripts/seed-supabase.mjs` initialise les rubriques avec un contenu
réel et réexécutable sans doublons. Il utilise une session administrateur
ordinaire et respecte donc les politiques RLS ; aucun mot de passe ni aucune clé
administrateur n’est stocké dans le dépôt.

```powershell
$env:SUPABASE_SEED_EMAIL="adresse-admin@example.com"
$env:SUPABASE_SEED_PASSWORD="mot-de-passe"
npm run seed:supabase
```

Les annonces, projets, favoris et likes ajoutés ensuite depuis l’interface sont
écrits directement dans les tables Supabase correspondantes.

## Règles d’autorisation retenues

- Tous les écrans nécessitent une session authentifiée.
- Un étudiant gère uniquement ses annonces, produits, projets, favoris,
  candidatures et conversations.
- Les ressources institutionnelles — cours, évènements, opportunités et
  publicités — sont publiées par un modérateur ou un administrateur.
- Les profils privés ne sont visibles que par leur propriétaire ou un
  administrateur.
- Les autres membres voient uniquement `public_profiles` : nom d’affichage et
  avatar.
- Les réponses de l’assistant dans `chat_messages` doivent être insérées par un
  backend sécurisé ou une Edge Function, jamais avec une clé `service_role`
  exposée dans le navigateur.
