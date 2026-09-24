import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import {
  ArrowRight,
  Bookmark,
  CalendarDays,
  Code2,
  Filter,
  FolderGit2,
  Heart,
  LoaderCircle,
  MessageCircle,
  Plus,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import fallbackProjects from "@/data/my-projects";
import { usePortalCollection } from "@/hooks/usePortalCollection";
import { studentProjectsApi } from "@/services/projectsApi";

const stageMeta = {
  idea: { label: "Idée validée", className: "bg-amber-100 text-amber-800" },
  in_progress: { label: "En développement", className: "bg-sky-100 text-sky-800" },
  beta: { label: "Version bêta", className: "bg-violet-100 text-violet-800" },
  completed: { label: "Projet finalisé", className: "bg-emerald-100 text-emerald-800" },
};

function ProjectArtwork({ project, compact = false }) {
  if (project.cover_url) {
    return (
      <img
        src={project.cover_url}
        alt={`Capture du projet ${project.title}`}
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="relative h-full min-h-48 overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.08)_1px,transparent_1px)] bg-[size:28px_28px]" />
      <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-violet-500/20 blur-3xl" />
      <div className={`relative flex h-full flex-col justify-between ${compact ? "p-5" : "p-7"}`}>
        <div className="flex items-center justify-between">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10">
            <Code2 className="h-5 w-5 text-cyan-300" />
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-slate-400">
            ENIAD / BUILD
          </span>
        </div>
        <div>
          <p className="font-mono text-xs text-cyan-300">{project.tech_stack?.[0] || "Innovation"}</p>
          <p className={`${compact ? "mt-2 text-xl" : "mt-3 text-3xl"} max-w-md font-black tracking-tight`}>
            {project.title}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PublicProjectsPage() {
  const { data: projects, loading, error, setData } = usePortalCollection(
    studentProjectsApi.list,
    fallbackProjects
  );
  const [search, setSearch] = useState("");
  const [technology, setTechnology] = useState("Toutes");
  const [field, setField] = useState("Toutes");
  const [year, setYear] = useState("Toutes");
  const [actionError, setActionError] = useState("");

  const options = useMemo(() => {
    const technologies = projects.flatMap((project) => project.tech_stack || []);
    return {
      technologies: ["Toutes", ...new Set(technologies)].sort(),
      fields: ["Toutes", ...new Set(projects.map((project) => project.field_of_study).filter(Boolean))].sort(),
      years: ["Toutes", ...new Set(projects.map((project) => project.academic_year).filter(Boolean))].sort().reverse(),
    };
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return projects.filter((project) => {
      const searchable = [
        project.title,
        project.description || project.desc,
        project.author,
        project.field_of_study,
        ...(project.tech_stack || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (
        (!needle || searchable.includes(needle)) &&
        (technology === "Toutes" || project.tech_stack?.includes(technology)) &&
        (field === "Toutes" || project.field_of_study === field) &&
        (year === "Toutes" || project.academic_year === year)
      );
    });
  }, [field, projects, search, technology, year]);

  const featuredProject = projects.find((project) => project.is_featured) || projects[0];

  const toggleInteraction = async (project, type) => {
    const key = type === "like" ? "isLiked" : "isFavorite";
    const countKey = type === "like" ? "likesCount" : null;
    const next = !project[key];
    const snapshot = projects;
    setActionError("");
    setData((items) =>
      items.map((item) =>
        item.id === project.id
          ? {
              ...item,
              [key]: next,
              ...(countKey
                ? { [countKey]: Math.max(0, (item[countKey] || 0) + (next ? 1 : -1)) }
                : {}),
            }
          : item
      )
    );
    try {
      if (type === "like") await studentProjectsApi.setLike(project.id, next);
      else await studentProjectsApi.setFavorite(project.id, next);
    } catch (interactionError) {
      setData(snapshot);
      setActionError(
        interactionError.message || "Cette action nécessite l’activation du module Projets dans Supabase."
      );
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-7 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-2xl shadow-slate-300/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_82%_15%,rgba(139,92,246,0.18),transparent_28%)]" />
        <div className="relative grid min-h-[420px] lg:grid-cols-[0.92fr_1.08fr]">
          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
            <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
              <Sparkles className="h-3.5 w-3.5" /> Sélection du mois
            </span>
            <h1 className="max-w-xl text-4xl font-black leading-[1.04] tracking-tight sm:text-5xl">
              Des projets conçus par les étudiants, ouverts à la communauté.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
              Explorez les réalisations de l’ENIAD, découvrez leur équipe et rejoignez celles qui recherchent de nouveaux talents.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/mes-projets?nouveau=1" className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200">
                <Plus className="h-4 w-4" /> Déposer un projet
              </Link>
              <a href="#catalogue" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                Explorer le catalogue <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {featuredProject && (
            <div className="relative m-4 min-h-80 overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-900 lg:m-6 lg:ml-0">
              <ProjectArtwork project={featuredProject} />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent p-6 pt-20">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-cyan-300">{featuredProject.author}</p>
                    <h2 className="mt-1 text-2xl font-black">{featuredProject.title}</h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(featuredProject.tech_stack || []).slice(0, 4).map((tech) => (
                        <span key={tech} className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs text-slate-200">{tech}</span>
                      ))}
                    </div>
                  </div>
                  <Link to={`/projets/${featuredProject.id}`} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-slate-950">
                    Voir la fiche <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section id="catalogue" className="sticky top-2 z-20 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg shadow-slate-200/50 backdrop-blur-xl">
        <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_repeat(3,minmax(150px,0.35fr))]">
          <label className="relative">
            <span className="sr-only">Rechercher un projet</span>
            <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
            <input className="portal-input pl-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Projet, étudiant ou mot-clé…" />
          </label>
          <label className="relative">
            <span className="sr-only">Technologie</span>
            <select className="portal-select" value={technology} onChange={(event) => setTechnology(event.target.value)}>
              {options.technologies.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">Filière</span>
            <select className="portal-select" value={field} onChange={(event) => setField(event.target.value)}>
              {options.fields.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">Année universitaire</span>
            <select className="portal-select" value={year} onChange={(event) => setYear(event.target.value)}>
              {options.years.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
          <span className="inline-flex items-center gap-2"><Filter className="h-4 w-4" /> {filteredProjects.length} projet{filteredProjects.length !== 1 ? "s" : ""}</span>
          <span className="hidden sm:inline">Filtres : technologie · filière · année</span>
        </div>
      </section>

      {actionError && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{actionError}</p>}

      {loading && <div className="portal-empty flex items-center justify-center gap-2"><LoaderCircle className="h-5 w-5 animate-spin" /> Chargement des projets…</div>}
      {error && !loading && <div className="portal-empty text-rose-700">Impossible de charger les projets publics.</div>}

      {!loading && !error && filteredProjects.length > 0 && (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project, index) => {
            const stage = stageMeta[project.project_stage] || stageMeta.in_progress;
            return (
              <Motion.article key={project.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.04, 0.24) }} className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-xl hover:shadow-slate-200/60">
                <Link to={`/projets/${project.id}`} className="block h-52 overflow-hidden">
                  <ProjectArtwork project={project} compact />
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${stage.className}`}>{stage.label}</span>
                    {project.seeking_collaborators && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700"><Users className="h-3.5 w-3.5" /> Équipe ouverte</span>}
                  </div>
                  <Link to={`/projets/${project.id}`} className="mt-4 text-xl font-black tracking-tight text-slate-950 transition group-hover:text-sky-700">{project.title}</Link>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{project.description || project.desc}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(project.tech_stack || []).slice(0, 4).map((item) => <span key={item} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{item}</span>)}
                  </div>
                  <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                    <FolderGit2 className="h-4 w-4 text-sky-600" />
                    <span className="truncate font-semibold text-slate-700">{project.author}</span>
                    <span>·</span>
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>{project.academic_year || "Année non précisée"}</span>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-5">
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => toggleInteraction(project, "like")} aria-label={project.isLiked ? "Retirer la mention J’aime" : "Aimer ce projet"} className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-bold transition ${project.isLiked ? "bg-rose-50 text-rose-600" : "text-slate-500 hover:bg-slate-100"}`}>
                        <Heart className={`h-4 w-4 ${project.isLiked ? "fill-current" : ""}`} /> {project.likesCount || 0}
                      </button>
                      <Link to={`/projets/${project.id}#commentaires`} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100"><MessageCircle className="h-4 w-4" /> {project.commentsCount || 0}</Link>
                      <button type="button" onClick={() => toggleInteraction(project, "favorite")} aria-label={project.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"} className={`rounded-lg p-2 transition ${project.isFavorite ? "bg-amber-50 text-amber-600" : "text-slate-400 hover:bg-slate-100"}`}><Bookmark className={`h-4 w-4 ${project.isFavorite ? "fill-current" : ""}`} /></button>
                    </div>
                    <Link to={`/projets/${project.id}`} className="inline-flex items-center gap-1 text-sm font-black text-sky-700">Découvrir <ArrowRight className="h-4 w-4" /></Link>
                  </div>
                </div>
              </Motion.article>
            );
          })}
        </section>
      )}

      {!loading && !error && filteredProjects.length === 0 && <div className="portal-empty">Aucun projet ne correspond à ces critères. Modifiez un filtre pour élargir la recherche.</div>}
    </div>
  );
}
