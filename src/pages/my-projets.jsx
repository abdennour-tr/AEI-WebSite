import { useState } from "react";
import { motion as Motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FolderKanban,
  Github,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import fallbackProjects from "@/data/my-projects";
import PageHeader from "@/components/PageHeader";
import { usePortalCollection } from "@/hooks/usePortalCollection";
import { studentProjectsApi } from "@/services/projectsApi";

const emptyForm = {
  title: "",
  description: "",
  tech_stack: "",
  field_of_study: "",
  academic_year: "2025–2026",
  project_stage: "in_progress",
  repository_url: "",
  demo_url: "",
  documentation_url: "",
  cover_url: "",
  screenshot_urls: "",
  team_members: "",
  seeking_collaborators: false,
  collaborator_roles: "",
};

export default function ProjetsPage() {
  const { data: projets, loading, error, setData } = usePortalCollection(
    studentProjectsApi.listMine,
    fallbackProjects
  );
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const projetsPerPage = 6;

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (project) => {
    setEditingId(project.id);
    setForm({
      title: project.title || "",
      description: project.description || project.desc || "",
      tech_stack: project.tech_stack?.join(", ") || project.tech || "",
      field_of_study: project.field_of_study || "",
      academic_year: project.academic_year || "2025–2026",
      project_stage: project.project_stage || "in_progress",
      repository_url: project.repository_url || "",
      demo_url: project.demo_url || "",
      documentation_url: project.documentation_url || "",
      cover_url: project.cover_url || "",
      screenshot_urls: project.screenshot_urls?.join(", ") || "",
      team_members: (project.team_members || [])
        .map((member) => `${member.name || ""} | ${member.role || ""}`)
        .join("\n"),
      seeking_collaborators: Boolean(project.seeking_collaborators),
      collaborator_roles: project.collaborator_roles?.join(", ") || "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      tech_stack: form.tech_stack
        .split(",")
        .map((tech) => tech.trim())
        .filter(Boolean),
      field_of_study: form.field_of_study.trim() || null,
      academic_year: form.academic_year.trim() || null,
      project_stage: form.project_stage,
      repository_url: form.repository_url.trim() || null,
      demo_url: form.demo_url.trim() || null,
      documentation_url: form.documentation_url.trim() || null,
      cover_url: form.cover_url.trim() || null,
      screenshot_urls: form.screenshot_urls
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean),
      team_members: form.team_members
        .split("\n")
        .map((line) => {
          const [name, role] = line.split("|").map((part) => part.trim());
          return { name, role: role || "Membre de l’équipe" };
        })
        .filter((member) => member.name),
      seeking_collaborators: form.seeking_collaborators,
      collaborator_roles: form.collaborator_roles
        .split(",")
        .map((role) => role.trim())
        .filter(Boolean),
      status: "published",
    };

    try {
      if (editingId) {
        const updated = await studentProjectsApi.update(editingId, payload);
        setData((items) =>
          items.map((item) => (item.id === editingId ? updated : item))
        );
      } else {
        const created = await studentProjectsApi.create(payload);
        setData((items) => [created, ...items]);
      }
      setModalOpen(false);
      setPage(1);
    } catch (submitError) {
      setFormError(submitError.message || "Impossible d’enregistrer le projet.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (project) => {
    if (!window.confirm(`Supprimer « ${project.title} » ?`)) return;
    try {
      await studentProjectsApi.remove(project.id);
      setData((items) => items.filter((item) => item.id !== project.id));
    } catch (deleteError) {
      window.alert(deleteError.message || "Impossible de supprimer le projet.");
    }
  };

  const totalPages = Math.ceil(projets.length / projetsPerPage);
  const paginated = projets.slice(
    (page - 1) * projetsPerPage,
    page * projetsPerPage
  );

  return (
    <div className="portal-page">
      <PageHeader
        icon={FolderKanban}
        eyebrow="Portfolio étudiant"
        title="Mes projets déposés"
        description="Présentez vos réalisations techniques et suivez les projets partagés avec la communauté."
      >
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-400"
        >
          <Plus className="h-4 w-4" /> Ajouter un projet
        </button>
      </PageHeader>

      {loading && (
        <div className="portal-empty flex items-center justify-center gap-2">
          <LoaderCircle className="h-5 w-5 animate-spin" /> Chargement des projets…
        </div>
      )}

      {error && !loading && (
        <div className="portal-empty text-rose-700">
          Impossible de charger vos projets.
        </div>
      )}

      {!loading && !error && <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {paginated.map((p, index) => (
          <Motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="portal-card relative p-6"
          >
            {p.cover_url ? (
              <img src={p.cover_url} alt="" className="mb-5 h-36 w-full rounded-xl object-cover" />
            ) : (
              <div className="mb-5 h-1.5 w-14 rounded-full bg-sky-500" />
            )}

            <h2 className="mb-2 text-lg font-bold text-slate-950">{p.title}</h2>

            <p className="mb-4 text-sm leading-6 text-slate-600">{p.desc}</p>

            <span className="portal-badge">
              {p.tech}
            </span>

            <p className="mt-4 text-xs text-slate-500">Mis à jour {p.updated}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {p.repository_url && (
                <a
                  className="portal-secondary-button flex-1"
                  href={p.repository_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Github className="h-4 w-4" /> Code source
                </a>
              )}
              {p.demo_url && (
                <a
                  className="portal-primary-button flex-1"
                  href={p.demo_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="h-4 w-4" /> Voir le site
                </a>
              )}
            </div>
            <div className="mt-4 flex justify-between border-t border-slate-100 pt-4">
              <button
                onClick={() => openEdit(p)}
                className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700 hover:text-sky-900"
              >
                <Pencil className="h-4 w-4" /> Modifier
              </button>
              <button
                onClick={() => handleDelete(p)}
                className="inline-flex items-center gap-1 text-sm font-semibold text-rose-600 hover:text-rose-800"
              >
                <Trash2 className="h-4 w-4" /> Supprimer
              </button>
            </div>
          </Motion.div>
        ))}
      </div>}

      {!loading && !error && projets.length === 0 && (
        <div className="portal-empty">
          Aucun projet déposé. Ajoutez votre premier dépôt GitHub ou votre application en ligne.
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-8 items-center">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i}
              variant={page === i + 1 ? "default" : "outline"}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight />
          </Button>
        </div>
      )}

      {modalOpen && (
        <div className="portal-modal-backdrop" role="presentation">
          <div className="portal-modal max-w-4xl" role="dialog" aria-modal="true" aria-labelledby="project-form-title">
            <button
              type="button"
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
              onClick={() => setModalOpen(false)}
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 id="project-form-title" className="pr-10 text-2xl font-bold text-slate-950">
              {editingId ? "Modifier le projet" : "Déposer un projet"}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Construisez une fiche complète : contexte, équipe, technologies, captures et besoins de collaboration.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2 text-sm font-semibold text-slate-700">
                Nom du projet
                <input
                  className="portal-input mt-2"
                  required
                  minLength={3}
                  maxLength={180}
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  placeholder="Plateforme de recommandation de cours"
                />
              </label>
              <label className="sm:col-span-2 text-sm font-semibold text-slate-700">
                Description
                <textarea
                  className="portal-input mt-2 min-h-28 resize-y"
                  required
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder="Objectif, fonctionnalités principales et votre contribution…"
                />
              </label>
              <label className="sm:col-span-2 text-sm font-semibold text-slate-700">
                Technologies, séparées par des virgules
                <input
                  className="portal-input mt-2"
                  value={form.tech_stack}
                  onChange={(event) => setForm({ ...form, tech_stack: event.target.value })}
                  placeholder="React, Supabase, Python"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Filière
                <input
                  className="portal-input mt-2"
                  value={form.field_of_study}
                  onChange={(event) => setForm({ ...form, field_of_study: event.target.value })}
                  placeholder="Intelligence artificielle"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Année universitaire
                <input
                  className="portal-input mt-2"
                  value={form.academic_year}
                  onChange={(event) => setForm({ ...form, academic_year: event.target.value })}
                  placeholder="2025–2026"
                />
              </label>
              <label className="sm:col-span-2 text-sm font-semibold text-slate-700">
                Statut du projet
                <select
                  className="portal-select mt-2"
                  value={form.project_stage}
                  onChange={(event) => setForm({ ...form, project_stage: event.target.value })}
                >
                  <option value="idea">Idée validée</option>
                  <option value="in_progress">En développement</option>
                  <option value="beta">Version bêta</option>
                  <option value="completed">Projet finalisé</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Lien GitHub / GitLab
                <input
                  className="portal-input mt-2"
                  type="url"
                  value={form.repository_url}
                  onChange={(event) => setForm({ ...form, repository_url: event.target.value })}
                  placeholder="https://github.com/…"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Site ou démonstration
                <input
                  className="portal-input mt-2"
                  type="url"
                  value={form.demo_url}
                  onChange={(event) => setForm({ ...form, demo_url: event.target.value })}
                  placeholder="https://mon-projet…"
                />
              </label>
              <label className="sm:col-span-2 text-sm font-semibold text-slate-700">
                Documentation
                <input
                  className="portal-input mt-2"
                  type="url"
                  value={form.documentation_url}
                  onChange={(event) => setForm({ ...form, documentation_url: event.target.value })}
                  placeholder="https://docs.mon-projet…"
                />
              </label>
              <label className="sm:col-span-2 text-sm font-semibold text-slate-700">
                Image de couverture
                <input
                  className="portal-input mt-2"
                  type="url"
                  value={form.cover_url}
                  onChange={(event) => setForm({ ...form, cover_url: event.target.value })}
                  placeholder="https://…"
                />
              </label>
              <label className="sm:col-span-2 text-sm font-semibold text-slate-700">
                Captures supplémentaires, séparées par des virgules
                <input
                  className="portal-input mt-2"
                  value={form.screenshot_urls}
                  onChange={(event) => setForm({ ...form, screenshot_urls: event.target.value })}
                  placeholder="https://capture-1…, https://capture-2…"
                />
              </label>
              <label className="sm:col-span-2 text-sm font-semibold text-slate-700">
                Membres de l’équipe — un par ligne, au format Nom | Rôle
                <textarea
                  className="portal-input mt-2 min-h-28 resize-y"
                  value={form.team_members}
                  onChange={(event) => setForm({ ...form, team_members: event.target.value })}
                  placeholder={"Sara Amrani | Product designer\nOmar Bennani | Développeur backend"}
                />
              </label>
              <label className="sm:col-span-2 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-sky-600"
                  checked={form.seeking_collaborators}
                  onChange={(event) => setForm({ ...form, seeking_collaborators: event.target.checked })}
                />
                <span>
                  <span className="block text-sm font-bold text-slate-900">Nous recherchons des collaborateurs</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">Affiche le bouton « Rejoindre le projet » sur la fiche publique.</span>
                </span>
              </label>
              {form.seeking_collaborators && (
                <label className="sm:col-span-2 text-sm font-semibold text-slate-700">
                  Profils recherchés, séparés par des virgules
                  <input
                    className="portal-input mt-2"
                    value={form.collaborator_roles}
                    onChange={(event) => setForm({ ...form, collaborator_roles: event.target.value })}
                    placeholder="Data engineer, UX designer, Développeur mobile"
                  />
                </label>
              )}

              {formError && (
                <p className="sm:col-span-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {formError}
                </p>
              )}

              <div className="sm:col-span-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button type="button" className="portal-secondary-button" onClick={() => setModalOpen(false)}>
                  Annuler
                </button>
                <button type="submit" className="portal-primary-button" disabled={saving}>
                  {saving && <LoaderCircle className="h-4 w-4 animate-spin" />}
                  {editingId ? "Enregistrer" : "Publier le projet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
