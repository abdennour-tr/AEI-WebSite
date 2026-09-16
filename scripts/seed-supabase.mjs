import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const email = process.env.SUPABASE_SEED_EMAIL;
const password = process.env.SUPABASE_SEED_PASSWORD;

if (!url || !key || !email || !password) {
  throw new Error(
    "VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, SUPABASE_SEED_EMAIL and SUPABASE_SEED_PASSWORD are required."
  );
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

const { data: login, error: loginError } = await supabase.auth.signInWithPassword({
  email,
  password,
});

if (loginError) throw loginError;

const ownerId = login.user.id;
const futureDate = (days, hour = 10) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(hour, 0, 0, 0);
  return date.toISOString();
};

const futureDay = (days) => futureDate(days).slice(0, 10);

const seeds = {
  courses: [
    {
      id: "10000000-0000-4000-8000-000000000001",
      created_by: ownerId,
      title: "Analyse 1 — Fondamentaux",
      description: "Limites, continuité, dérivation et exercices corrigés pour consolider les bases.",
      level: "CP1",
      category: "Math",
      pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      status: "published",
    },
    {
      id: "10000000-0000-4000-8000-000000000002",
      created_by: ownerId,
      title: "Introduction à Python",
      description: "Syntaxe, structures de données, fonctions et premiers projets en Python.",
      level: "CP1",
      category: "Informatique",
      pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      status: "published",
    },
    {
      id: "10000000-0000-4000-8000-000000000003",
      created_by: ownerId,
      title: "Machine Learning appliqué",
      description: "Régression, classification, validation et étude de cas avec des données réelles.",
      level: "CI",
      category: "IA",
      pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      status: "published",
    },
  ],
  housing_listings: [
    {
      id: "20000000-0000-4000-8000-000000000001",
      owner_id: ownerId,
      title: "Chambre lumineuse proche du campus",
      description: "Chambre meublée, Wi-Fi inclus et espaces communs calmes pour étudier.",
      city: "Berkane — centre-ville",
      property_type: "Chambre privée",
      monthly_price: 900,
      available_from: futureDay(7),
      image_urls: ["https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg?auto=compress&cs=tinysrgb&w=1200"],
      status: "active",
    },
    {
      id: "20000000-0000-4000-8000-000000000002",
      owner_id: ownerId,
      title: "Studio étudiant équipé",
      description: "Studio indépendant dans un quartier calme, cuisine équipée et charges maîtrisées.",
      city: "Berkane — Hay Al Quds",
      property_type: "Studio",
      monthly_price: 1250,
      available_from: futureDay(14),
      image_urls: ["https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1200"],
      status: "active",
    },
  ],
  marketplace_products: [
    {
      id: "30000000-0000-4000-8000-000000000001",
      seller_id: ownerId,
      title: "Ordinateur portable étudiant",
      description: "Portable fiable pour le développement et les travaux universitaires.",
      category: "Informatique",
      city: "Berkane",
      item_condition: "Très bon état",
      price: 3200,
      image_urls: ["https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1200"],
      status: "active",
    },
    {
      id: "30000000-0000-4000-8000-000000000002",
      seller_id: ownerId,
      title: "Bureau compact",
      description: "Bureau stable et pratique pour une chambre étudiante.",
      category: "Mobilier",
      city: "Berkane",
      item_condition: "Bon état",
      price: 450,
      image_urls: ["https://images.pexels.com/photos/1957478/pexels-photo-1957478.jpeg?auto=compress&cs=tinysrgb&w=1200"],
      status: "active",
    },
  ],
  events: [
    {
      id: "40000000-0000-4000-8000-000000000001",
      created_by: ownerId,
      title: "Rencontre IA & Data",
      description: "Retours d’expérience, démonstrations et échange avec des professionnels de la donnée.",
      tag: "Technologie",
      location: "Amphi principal",
      starts_at: futureDate(20, 14),
      ends_at: futureDate(20, 17),
      capacity: 120,
      status: "published",
    },
    {
      id: "40000000-0000-4000-8000-000000000002",
      created_by: ownerId,
      title: "Atelier Git & GitHub",
      description: "Apprendre à versionner un projet, collaborer avec des branches et présenter son portfolio.",
      tag: "Développement",
      location: "Salle informatique 2",
      starts_at: futureDate(30, 9),
      ends_at: futureDate(30, 12),
      capacity: 40,
      status: "published",
    },
  ],
  opportunities: [
    {
      id: "50000000-0000-4000-8000-000000000001",
      created_by: ownerId,
      title: "Stage développement web React",
      company: "Atlas Digital",
      description: "Participation à une application web moderne, revues de code et intégration d’API.",
      city: "Oujda",
      duration: "2 mois",
      application_url: "https://www.linkedin.com/jobs/",
      deadline: futureDay(45),
      status: "published",
    },
    {
      id: "50000000-0000-4000-8000-000000000002",
      created_by: ownerId,
      title: "Stage Data & Intelligence Artificielle",
      company: "North AI Lab",
      description: "Préparation de données, entraînement de modèles et restitution des résultats.",
      city: "À distance",
      duration: "3 mois",
      application_url: "https://www.linkedin.com/jobs/",
      deadline: futureDay(60),
      status: "published",
    },
  ],
  student_projects: [
    {
      id: "60000000-0000-4000-8000-000000000001",
      owner_id: ownerId,
      title: "Portail étudiant AEI",
      description: "Plateforme communautaire pour centraliser cours, opportunités, projets et échanges étudiants.",
      tech_stack: ["React", "Supabase", "Tailwind CSS"],
      repository_url: "https://github.com/",
      demo_url: null,
      status: "published",
    },
    {
      id: "60000000-0000-4000-8000-000000000002",
      owner_id: ownerId,
      title: "Assistant de révision intelligent",
      description: "Application qui transforme les notes de cours en fiches synthétiques et questionnaires.",
      tech_stack: ["Python", "FastAPI", "React"],
      repository_url: "https://github.com/",
      demo_url: null,
      status: "published",
    },
  ],
  forum_topics: [
    {
      id: "70000000-0000-4000-8000-000000000001",
      author_id: ownerId,
      title: "Comment présenter un projet sur GitHub ?",
      body: "Partageons nos bonnes pratiques pour le README, les captures et les démonstrations.",
      tag: "Développement",
      status: "published",
    },
    {
      id: "70000000-0000-4000-8000-000000000002",
      author_id: ownerId,
      title: "Conseils pour trouver son premier stage",
      body: "CV, portfolio, candidatures spontanées : quelles méthodes ont fonctionné pour vous ?",
      tag: "Carrière",
      status: "published",
    },
  ],
  advertisements: [
    {
      id: "80000000-0000-4000-8000-000000000001",
      created_by: ownerId,
      title: "Pass étudiant — outils numériques",
      description: "Une sélection de ressources et services utiles pour les projets et la vie universitaire.",
      image_url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
      target_url: "https://education.github.com/pack",
      starts_at: new Date().toISOString(),
      ends_at: futureDate(120),
      status: "published",
    },
    {
      id: "80000000-0000-4000-8000-000000000002",
      created_by: ownerId,
      title: "Ressources GitHub Education",
      description: "Découvrez les outils gratuits proposés aux étudiants pour apprendre, coder et déployer.",
      image_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
      target_url: "https://education.github.com/",
      starts_at: new Date().toISOString(),
      ends_at: futureDate(120),
      status: "published",
    },
  ],
};

for (const [table, rows] of Object.entries(seeds)) {
  const { error } = await supabase.from(table).upsert(rows, { onConflict: "id" });
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`${table}: ${rows.length} records ready`);
}

await supabase.auth.signOut();

