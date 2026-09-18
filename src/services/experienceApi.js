import clubs from "@/data/Clubs";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const staticPages = [
  ["Clubs étudiants", "Vie associative, activités et adhésions", "/clubs", "Navigation"],
  ["Projets publics", "Réalisations et collaborations étudiantes", "/projets", "Navigation"],
  ["Cours et ressources", "Supports pédagogiques disponibles", "/cours", "Navigation"],
  ["Agenda universitaire", "Ateliers, conférences et compétitions", "/evenements", "Navigation"],
  ["Marketplace", "Produits proposés par les étudiants", "/marketplace", "Navigation"],
  ["Colocations", "Logements et chambres disponibles", "/colocation", "Navigation"],
  ["Mes favoris", "Votre sélection personnelle", "/favori", "Navigation"],
  ["Mon profil", "Compétences, intérêts et portfolio", "/profile", "Navigation"],
];

const normalize = (value) => value.trim().toLocaleLowerCase("fr");

function localResults(query) {
  const normalized = normalize(query);
  const pages = staticPages
    .filter(([title, subtitle]) => normalize(`${title} ${subtitle}`).includes(normalized))
    .map(([title, subtitle, to, type]) => ({ title, subtitle, to, type }));
  const clubResults = clubs
    .filter((club) =>
      normalize(`${club.name} ${club.category} ${club.tagline}`).includes(normalized)
    )
    .slice(0, 4)
    .map((club) => ({
      title: club.name,
      subtitle: club.category,
      to: `/clubs/${club.id}`,
      type: "Club",
    }));
  return [...clubResults, ...pages].slice(0, 8);
}

async function safeQuery(query) {
  const { data, error } = await query;
  if (error) return [];
  return data || [];
}

export async function searchPortal(query) {
  const trimmed = query.trim();
  if (trimmed.length < 2) return localResults(trimmed || "clubs").slice(0, 6);
  const local = localResults(trimmed);
  if (!isSupabaseConfigured || !supabase) return local;
  const term = `%${trimmed}%`;
  const [courses, projects, events, products, housing, advertisements] =
    await Promise.all([
      safeQuery(
        supabase.from("courses").select("id,title,category").eq("status", "published").ilike("title", term).limit(4)
      ),
      safeQuery(
        supabase.from("student_projects").select("id,title,field_of_study").eq("status", "published").ilike("title", term).limit(4)
      ),
      safeQuery(
        supabase.from("events").select("id,title,location").eq("status", "published").ilike("title", term).limit(4)
      ),
      safeQuery(
        supabase.from("marketplace_products").select("id,title,category").eq("status", "active").ilike("title", term).limit(4)
      ),
      safeQuery(
        supabase.from("housing_listings").select("id,title,city").eq("status", "active").ilike("title", term).limit(4)
      ),
      safeQuery(
        supabase.from("advertisements").select("id,title,description").eq("status", "published").ilike("title", term).limit(4)
      ),
    ]);

  return [
    ...local,
    ...courses.map((item) => ({ title: item.title, subtitle: item.category, to: "/cours", type: "Cours" })),
    ...projects.map((item) => ({ title: item.title, subtitle: item.field_of_study || "Projet étudiant", to: `/projets/${item.id}`, type: "Projet" })),
    ...events.map((item) => ({ title: item.title, subtitle: item.location, to: "/evenements", type: "Événement" })),
    ...products.map((item) => ({ title: item.title, subtitle: item.category, to: "/marketplace", type: "Produit" })),
    ...housing.map((item) => ({ title: item.title, subtitle: item.city, to: "/colocation", type: "Colocation" })),
    ...advertisements.map((item) => ({ title: item.title, subtitle: item.description, to: "/publicites", type: "Annonce" })),
  ].slice(0, 12);
}

export async function listStudentBadges() {
  if (!supabase) return [];
  return safeQuery(
    supabase.from("student_badges").select("*").order("awarded_at", { ascending: false })
  );
}
