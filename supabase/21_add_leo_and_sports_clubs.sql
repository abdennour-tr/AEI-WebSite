-- Ajout des clubs Leo et Sportif à l'annuaire officiel.
-- Cette migration est idempotente et peut être réexécutée sans doublon.

insert into public.club_profiles (
  id,
  name,
  category,
  tagline,
  description,
  founded_label,
  recruitment_label,
  contact_label,
  contact_url,
  objectives,
  status
)
values
  (
    'leo',
    'Leo Club',
    'Engagement & leadership',
    'Servir la communauté, développer le leadership et agir ensemble.',
    'Le Leo Club rassemble les étudiants souhaitant mener des actions citoyennes, solidaires et utiles tout en développant leur esprit d’initiative et leur leadership.',
    'Club service & leadership',
    'Ouvert aux étudiants motivés par l’engagement associatif',
    'Contacter le Leo Club',
    null,
    array[
      'Organiser des actions au service de la communauté.',
      'Développer le leadership et la prise d’initiative.',
      'Renforcer la solidarité et le travail en équipe.'
    ],
    'active'
  ),
  (
    'club-sportif',
    'Club Sportif',
    'Sport & bien-être',
    'Rassembler les étudiants par le sport, l’esprit d’équipe et le dépassement de soi.',
    'Le Club Sportif anime la vie sportive de l’ENIAD à travers des entraînements, des rencontres et des activités favorisant la santé, la cohésion et le fair-play.',
    'Club sport & bien-être',
    'Ouvert à tous les niveaux et à toutes les disciplines',
    'Contacter le Club Sportif',
    null,
    array[
      'Encourager une pratique sportive accessible à tous.',
      'Organiser des rencontres et activités sportives.',
      'Développer la cohésion, le fair-play et le bien-être étudiant.'
    ],
    'active'
  )
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  tagline = excluded.tagline,
  description = excluded.description,
  founded_label = excluded.founded_label,
  recruitment_label = excluded.recruitment_label,
  contact_label = excluded.contact_label,
  objectives = excluded.objectives,
  status = excluded.status,
  updated_at = now();
