import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  Code2,
  ExternalLink,
  FileText,
  Github,
  Heart,
  LoaderCircle,
  MessageCircle,
  Send,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import fallbackProjects from "@/data/my-projects";
import { studentProjectsApi } from "@/services/projectsApi";
import ShareButton from "@/components/ShareButton";
import ReportButton from "@/components/ReportButton";

const stageLabels = {
  idea: "Idée validée",
  in_progress: "En développement",
  beta: "Version bêta",
  completed: "Projet finalisé",
};

export default function ProjectDetailsPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [commentSaving, setCommentSaving] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinForm, setJoinForm] = useState({ roleRequested: "", message: "" });
  const [joinSaving, setJoinSaving] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let active = true;
    const fallback = fallbackProjects.find((item) => String(item.id) === String(projectId));

    const load = async () => {
      try {
        const [result, projectComments] = await Promise.all([
          studentProjectsApi.get(projectId),
          studentProjectsApi.listComments(projectId),
        ]);
        if (active) {
          setProject(result || fallback || null);
          setComments(projectComments);
        }
      } catch {
        if (active) {
          setProject(fallback || null);
          setComments([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [projectId]);

  const toggleInteraction = async (type) => {
    if (!project) return;
    const key = type === "like" ? "isLiked" : "isFavorite";
    const next = !project[key];
    const snapshot = project;
    setActionError("");
    setProject((current) => ({
      ...current,
      [key]: next,
      ...(type === "like"
        ? { likesCount: Math.max(0, (current.likesCount || 0) + (next ? 1 : -1)) }
        : {}),
    }));
    try {
      if (type === "like") await studentProjectsApi.setLike(project.id, next);
      else await studentProjectsApi.setFavorite(project.id, next);
    } catch (interactionError) {
      setProject(snapshot);
      setActionError(interactionError.message || "Impossible d’enregistrer cette action.");
    }
  };

  const submitComment = async (event) => {
    event.preventDefault();
    if (comment.trim().length < 2) return;
    setCommentSaving(true);
    setActionError("");
    try {
      await studentProjectsApi.addComment(project.id, comment);
      const nextComments = await studentProjectsApi.listComments(project.id);
      setComments(nextComments);
      setProject((current) => ({ ...current, commentsCount: nextComments.length }));
      setComment("");
    } catch (commentError) {
      setActionError(commentError.message || "Le commentaire n’a pas pu être publié.");
    } finally {
      setCommentSaving(false);
    }
  };

  const submitJoinRequest = async (event) => {
    event.preventDefault();
    setJoinSaving(true);
    setActionError("");
    try {
      await studentProjectsApi.requestToJoin(project.id, joinForm);
      setJoinSuccess(true);
      setProject((current) => ({ ...current, joinRequestStatus: "submitted" }));
    } catch (joinError) {
      setActionError(joinError.message || "La demande n’a pas pu être envoyée.");
    } finally {
      setJoinSaving(false);
    }
  };

  if (loading) {
    return <div className="portal-page"><div className="portal-empty flex items-center justify-center gap-2"><LoaderCircle className="h-5 w-5 animate-spin" /> Chargement de la fiche projet…</div></div>;
  }

  if (!project) {
    return (
      <div className="portal-page">
        <div className="portal-empty">
          <h1 className="text-xl font-black text-slate-950">Projet introuvable</h1>
          <Link to="/projets" className="portal-primary-button mt-5">Retour aux projets</Link>
        </div>
      </div>
    );
  }

  const screenshots = [project.cover_url, ...(project.screenshot_urls || [])].filter(Boolean);

  return (
    <div className="mx-auto w-full max-w-[1380px] space-y-7 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <Link to="/projets" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-sky-700"><ArrowLeft className="h-4 w-4" /> Tous les projets</Link>

      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.07)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative grid gap-10 p-7 sm:p-10 lg:grid-cols-[1fr_360px] lg:p-14">
          <div>
            <div className="flex flex-wrap gap-2">
              {project.is_featured && <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-300 px-3 py-1.5 text-xs font-black text-slate-950"><Sparkles className="h-3.5 w-3.5" /> Sélection du mois</span>}
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200">{stageLabels[project.project_stage] || "En développement"}</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200">{project.field_of_study || "Projet multidisciplinaire"}</span>
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">{project.title}</h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">{project.description || project.desc}</p>
            <div className="mt-7 flex flex-wrap gap-2">
              {(project.tech_stack || []).map((tech) => <span key={tech} className="rounded-lg border border-cyan-300/15 bg-cyan-300/10 px-3 py-1.5 font-mono text-xs text-cyan-200">{tech}</span>)}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {project.repository_url && <a href={project.repository_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950"><Github className="h-4 w-4" /> GitHub / GitLab</a>}
              {project.demo_url && <a href={project.demo_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950"><ExternalLink className="h-4 w-4" /> Voir la démonstration</a>}
              {project.documentation_url && <a href={project.documentation_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white"><FileText className="h-4 w-4" /> Documentation</a>}
              <ShareButton title={project.title} text={project.description || project.desc} path={`/projets/${project.id}`} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10" />
              <ReportButton contentType="project" contentId={project.id} title={project.title} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10" />
            </div>
          </div>

          <aside className="self-end rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Porté par</p>
            <p className="mt-2 text-xl font-black">{project.author}</p>
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-5">
              <div><p className="text-2xl font-black text-cyan-300">{project.likesCount || 0}</p><p className="mt-1 text-xs text-slate-400">mentions J’aime</p></div>
              <div><p className="text-2xl font-black text-cyan-300">{project.commentsCount || comments.length}</p><p className="mt-1 text-xs text-slate-400">commentaires</p></div>
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={() => toggleInteraction("like")} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-black transition ${project.isLiked ? "bg-rose-500 text-white" : "bg-white/10 text-white hover:bg-white/15"}`}><Heart className={`h-4 w-4 ${project.isLiked ? "fill-current" : ""}`} /> J’aime</button>
              <button onClick={() => toggleInteraction("favorite")} aria-label="Ajouter aux favoris" className={`rounded-xl px-3.5 py-2.5 transition ${project.isFavorite ? "bg-amber-400 text-slate-950" : "bg-white/10 text-white hover:bg-white/15"}`}><Bookmark className={`h-4 w-4 ${project.isFavorite ? "fill-current" : ""}`} /></button>
            </div>
          </aside>
        </div>
      </section>

      {actionError && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{actionError}</p>}

      <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-7">
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-end justify-between gap-4">
              <div><p className="text-xs font-black uppercase tracking-[0.18em] text-sky-600">Aperçus</p><h2 className="mt-2 text-2xl font-black text-slate-950">Le projet en images</h2></div>
              <span className="text-sm text-slate-500">{screenshots.length} capture{screenshots.length !== 1 ? "s" : ""}</span>
            </div>
            {screenshots.length > 0 ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {screenshots.map((url, index) => <img key={`${url}-${index}`} src={url} alt={`Capture ${index + 1} du projet ${project.title}`} className={`w-full rounded-2xl border border-slate-200 object-cover ${index === 0 ? "sm:col-span-2 aspect-[16/8]" : "aspect-video"}`} />)}
              </div>
            ) : (
              <div className="relative mt-6 flex min-h-72 items-center justify-center overflow-hidden rounded-2xl bg-slate-950 text-center text-white">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.08)_1px,transparent_1px)] bg-[size:28px_28px]" />
                <div className="relative max-w-sm px-6"><Code2 className="mx-auto h-9 w-9 text-cyan-300" /><p className="mt-4 text-lg font-black">Captures en préparation</p><p className="mt-2 text-sm leading-6 text-slate-400">L’équipe pourra ajouter ici les interfaces, prototypes et résultats du projet.</p></div>
              </div>
            )}
          </section>

          <section id="commentaires" className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3"><span className="rounded-xl bg-sky-50 p-3 text-sky-700"><MessageCircle className="h-5 w-5" /></span><div><p className="text-xs font-black uppercase tracking-[0.18em] text-sky-600">Discussion</p><h2 className="text-2xl font-black text-slate-950">Commentaires</h2></div></div>
            <form onSubmit={submitComment} className="mt-6 flex flex-col gap-3 sm:flex-row">
              <textarea className="portal-input min-h-24 flex-1 resize-y" value={comment} onChange={(event) => setComment(event.target.value)} maxLength={1500} placeholder="Posez une question ou partagez un retour constructif…" />
              <button className="portal-primary-button self-end" disabled={commentSaving || comment.trim().length < 2}>{commentSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Publier</button>
            </form>
            <div className="mt-7 space-y-4">
              {comments.map((item) => <article key={item.id} className="rounded-2xl bg-slate-50 p-4"><div className="flex items-center justify-between gap-3"><p className="font-bold text-slate-900">{item.author}</p><time className="text-xs text-slate-400">{item.date}</time></div><p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p></article>)}
              {comments.length === 0 && <p className="rounded-2xl border border-dashed border-slate-200 px-5 py-8 text-center text-sm text-slate-500">Soyez le premier à commenter ce projet.</p>}
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3"><Users className="h-5 w-5 text-sky-600" /><h2 className="text-lg font-black text-slate-950">Équipe projet</h2></div>
            <div className="mt-5 space-y-3">
              {(project.team_members || []).map((member, index) => <div key={`${member.name}-${index}`} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-cyan-300">{member.name?.slice(0, 1) || "E"}</span><div><p className="text-sm font-bold text-slate-900">{member.name}</p><p className="text-xs text-slate-500">{member.role || "Membre de l’équipe"}</p></div></div>)}
              {(!project.team_members || project.team_members.length === 0) && <p className="text-sm text-slate-500">Équipe portée par {project.author}.</p>}
            </div>
          </section>

          {project.seeking_collaborators && (
            <section className="overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-cyan-400 to-sky-500 p-6 text-slate-950 shadow-lg shadow-sky-200/50">
              <p className="text-xs font-black uppercase tracking-[0.18em]">Recrutement ouvert</p>
              <h2 className="mt-3 text-2xl font-black">Rejoignez l’équipe</h2>
              <p className="mt-2 text-sm leading-6 text-sky-950/80">L’équipe recherche actuellement de nouveaux collaborateurs.</p>
              <div className="mt-4 flex flex-wrap gap-2">{(project.collaborator_roles || []).map((role) => <span key={role} className="rounded-full bg-white/60 px-2.5 py-1 text-xs font-bold">{role}</span>)}</div>
              <button onClick={() => setJoinOpen(true)} disabled={project.joinRequestStatus === "submitted"} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:opacity-70">{project.joinRequestStatus === "submitted" ? <><CheckCircle2 className="h-4 w-4" /> Demande envoyée</> : <><Users className="h-4 w-4" /> Rejoindre le projet</>}</button>
            </section>
          )}

          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Informations</p>
            <dl className="mt-4 space-y-4 text-sm"><div className="flex justify-between gap-4"><dt className="text-slate-500">Filière</dt><dd className="text-right font-bold text-slate-900">{project.field_of_study || "Non précisée"}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Année</dt><dd className="font-bold text-slate-900">{project.academic_year || "Non précisée"}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Statut</dt><dd className="font-bold text-slate-900">{stageLabels[project.project_stage] || "En développement"}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Mise à jour</dt><dd className="text-right font-bold text-slate-900">{project.updated}</dd></div></dl>
          </section>
        </aside>
      </div>

      {joinOpen && (
        <div className="portal-modal-backdrop">
          <div className="portal-modal" role="dialog" aria-modal="true" aria-labelledby="join-project-title">
            <button onClick={() => setJoinOpen(false)} aria-label="Fermer" className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            {joinSuccess ? (
              <div className="py-8 text-center"><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><CheckCircle2 className="h-8 w-8" /></span><h2 className="mt-5 text-2xl font-black text-slate-950">Demande envoyée</h2><p className="mt-2 text-sm leading-6 text-slate-600">L’équipe du projet pourra consulter votre proposition et vous contacter.</p><button onClick={() => setJoinOpen(false)} className="portal-primary-button mt-6">Terminer</button></div>
            ) : (
              <><p className="text-xs font-black uppercase tracking-[0.18em] text-sky-600">Collaboration</p><h2 id="join-project-title" className="mt-2 pr-8 text-2xl font-black text-slate-950">Rejoindre {project.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">Présentez rapidement ce que vous souhaitez apporter au projet.</p><form onSubmit={submitJoinRequest} className="mt-6 space-y-4"><label className="block text-sm font-bold text-slate-700">Rôle souhaité<select className="portal-select mt-2" value={joinForm.roleRequested} onChange={(event) => setJoinForm({ ...joinForm, roleRequested: event.target.value })}><option value="">Contribution ouverte</option>{(project.collaborator_roles || []).map((role) => <option key={role}>{role}</option>)}</select></label><label className="block text-sm font-bold text-slate-700">Votre message<textarea required minLength={10} maxLength={1500} className="portal-input mt-2 min-h-32 resize-y" value={joinForm.message} onChange={(event) => setJoinForm({ ...joinForm, message: event.target.value })} placeholder="Compétences, disponibilité et motivation…" /></label><button type="submit" className="portal-primary-button w-full" disabled={joinSaving}>{joinSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Envoyer ma demande</button></form></>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
