import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Configuration Supabase administrateur manquante dans .env.local.");
}

const clubs = [
  {
    id: "leo",
    name: "Leo Club",
    category: "Engagement & leadership",
    tagline: "Servir la communauté, développer le leadership et agir ensemble.",
    description:
      "Le Leo Club rassemble les étudiants souhaitant mener des actions citoyennes, solidaires et utiles tout en développant leur esprit d’initiative et leur leadership.",
    founded_label: "Club service & leadership",
    recruitment_label: "Ouvert aux étudiants motivés par l’engagement associatif",
    contact_label: "Contacter le Leo Club",
    contact_url: null,
    objectives: [
      "Organiser des actions au service de la communauté.",
      "Développer le leadership et la prise d’initiative.",
      "Renforcer la solidarité et le travail en équipe.",
    ],
    status: "active",
  },
  {
    id: "club-sportif",
    name: "Club Sportif",
    category: "Sport & bien-être",
    tagline:
      "Rassembler les étudiants par le sport, l’esprit d’équipe et le dépassement de soi.",
    description:
      "Le Club Sportif anime la vie sportive de l’ENIAD à travers des entraînements, des rencontres et des activités favorisant la santé, la cohésion et le fair-play.",
    founded_label: "Club sport & bien-être",
    recruitment_label: "Ouvert à tous les niveaux et à toutes les disciplines",
    contact_label: "Contacter le Club Sportif",
    contact_url: null,
    objectives: [
      "Encourager une pratique sportive accessible à tous.",
      "Organiser des rencontres et activités sportives.",
      "Développer la cohésion, le fair-play et le bien-être étudiant.",
    ],
    status: "active",
  },
];

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await supabase
  .from("club_profiles")
  .upsert(clubs, { onConflict: "id" })
  .select("id,name,category,status");

if (error) throw error;

console.log("Clubs enregistrés dans Supabase :");
console.table(data);
