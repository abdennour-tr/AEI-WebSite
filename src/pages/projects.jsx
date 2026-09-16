import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import {
  ExternalLink,
  FolderKanban,
  Github,
  LoaderCircle,
  Plus,
  Search,
  UserRound,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import fallbackProjects from "@/data/my-projects";
import { usePortalCollection } from "@/hooks/usePortalCollection";
import { projectsApi } from "@/services/portalApi";

export default function PublicProjectsPage() {
  const { data: projects, loading, error } = usePortalCollection(
    projectsApi.list,
    fallbackProjects
  );
  const [search, setSearch] = useState("");
  const [technology, setTechnology] = useState("Toutes");

  const technologies = useMemo(() => {
    const values = projects.flatMap((project) =>
      project.tech_stack?.length
        ? project.tech_stack
        : String(project.tech || "")
            .split("/")
            .map((item) => item.trim())
            .filter(Boolean)
    );
    return ["Toutes", ...new Set(values)].sort((a, b) =>
      a === "Toutes" ? -1 : b === "Toutes" ? 1 : a.localeCompare(b)
    );
  }, [projects]);

  const filteredProjects = projects.filter((project) => {
    const searchable = `${project.title} ${project.description || project.desc || ""} ${
      project.tech || ""
    } ${project.author || ""}`.toLowerCase();
    const projectTechnologies = project.tech_stack?.length
      ? project.tech_stack
      : String(project.tech || "")
          .split("/")
          .map((item) => item.trim());

    return (
      searchable.includes(search.toLowerCase()) &&
      (technology === "Toutes" || projectTechnologies.includes(technology))
    );
  });

  return (
    <div className="portal-page">
      <PageHeader
        icon={FolderKanban}
        eyebrow="Réalisations de la communauté"
        title="Projets publics des étudiants"
        description="Découvrez les applications, recherches et prototypes publiés par les étudiants de l’ENIAD."
      >
        <Link
          to="/mes-projets"
          className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-400"
        >
          <Plus className="h-4 w-4" /> Déposer mon projet
        </Link>
      </PageHeader>

      <section className="portal-panel flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full max-w-2xl">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            className="portal-input pl-10"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un projet, un étudiant ou une technologie…"
          />
        </div>
        <select
          className="portal-select w-full md:w-56"
          value={technology}
          onChange={(event) => setTechnology(event.target.value)}
          aria-label="Filtrer par technologie"
        >
          {technologies.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </section>

      {loading && (
        <div className="portal-empty flex items-center justify-center gap-2">
          <LoaderCircle className="h-5 w-5 animate-spin" /> Chargement des projets…
        </div>
      )}

      {error && !loading && (
        <div className="portal-empty text-rose-700">
          Impossible de charger les projets publics.
        </div>
      )}

      {!loading && !error && filteredProjects.length > 0 && (
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project, index) => (
            <Motion.article
              key={project.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="portal-card flex h-full flex-col overflow-hidden"
            >
              {project.cover_url ? (
                <img
                  src={project.cover_url}
                  alt={`Aperçu du projet ${project.title}`}
                  className="h-44 w-full object-cover"
                />
              ) : (
                <div className="flex h-32 items-center justify-center bg-gradient-to-br from-sky-700 via-blue-700 to-indigo-800 text-white">
                  <FolderKanban className="h-10 w-10" />
                </div>
              )}

              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <UserRound className="h-4 w-4 text-sky-600" />
                  {project.author || "Étudiant ENIAD"}
                </div>
                <h2 className="mt-3 text-xl font-bold text-slate-950">
                  {project.title}
                </h2>
                <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600">
                  {project.description || project.desc}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(project.tech_stack?.length
                    ? project.tech_stack
                    : String(project.tech || "")
                        .split("/")
                        .map((item) => item.trim())
                        .filter(Boolean)
                  ).map((item) => (
                    <span key={item} className="portal-badge">
                      {item}
                    </span>
                  ))}
                </div>

                <div className="mt-auto flex flex-wrap gap-2 pt-6">
                  {project.repository_url && (
                    <a
                      href={project.repository_url}
                      target="_blank"
                      rel="noreferrer"
                      className="portal-secondary-button flex-1"
                    >
                      <Github className="h-4 w-4" /> Code source
                    </a>
                  )}
                  {project.demo_url && (
                    <a
                      href={project.demo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="portal-primary-button flex-1"
                    >
                      <ExternalLink className="h-4 w-4" /> Voir le projet
                    </a>
                  )}
                </div>
              </div>
            </Motion.article>
          ))}
        </section>
      )}

      {!loading && !error && filteredProjects.length === 0 && (
        <div className="portal-empty">
          Aucun projet public ne correspond à votre recherche.
        </div>
      )}
    </div>
  );
}
