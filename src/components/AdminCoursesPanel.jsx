import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, Download, FilePlus2, FileText, LoaderCircle, Pencil, Sparkles, Trash2, UploadCloud, X } from "lucide-react";
import { adminApi } from "@/services/adminApi";

const emptyForm = {
  title: "",
  description: "",
  level: "CP1",
  category: "Informatique",
  status: "published",
  mode: "course_only",
};

export default function AdminCoursesPanel() {
  const inputRef = useRef(null);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadCourses = useCallback(async () => {
    setLoading(true);
    try {
      setCourses(await adminApi.listCourses());
    } catch (loadError) {
      setError(loadError.message || "Les cours n’ont pas pu être chargés.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCourses(); }, [loadCourses]);

  const reset = () => {
    setForm(emptyForm);
    setFile(null);
    setEditing(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const startEdit = (course) => {
    setEditing(course);
    setForm({
      title: course.title,
      description: course.description || "",
      level: course.level,
      category: course.category,
      status: course.status,
      mode: course.summary_status === "ready" && course.ai_summary ? "course_with_summary" : "course_only",
    });
    setFile(null);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const chooseFile = (event) => {
    const selected = event.target.files?.[0] || null;
    if (selected && selected.type !== "application/pdf") {
      setError("Sélectionnez uniquement un fichier PDF.");
      event.target.value = "";
      return;
    }
    if (selected && selected.size > 25 * 1024 * 1024) {
      setError("Le PDF dépasse la limite de 25 Mo.");
      event.target.value = "";
      return;
    }
    setFile(selected);
    setError("");
  };

  const saveCourse = async (event) => {
    event.preventDefault();
    if (!editing && !file) {
      setError("Ajoutez le fichier PDF du cours.");
      return;
    }
    if (form.mode === "course_with_summary" && !file && !editing?.ai_summary) {
      setError("Importez le PDF afin de générer son résumé IA.");
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");
    let uploadedPath = "";
    try {
      let summary = form.mode === "course_with_summary" ? editing?.ai_summary || "" : "";
      if (form.mode === "course_with_summary" && file) {
        setNotice("Analyse du PDF et génération du résumé avec Groq…");
        summary = await adminApi.generateCourseSummary(file, form.title);
      }

      if (file) {
        setNotice("Téléversement sécurisé du support…");
        uploadedPath = await adminApi.uploadCourseFile(file);
      }

      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        level: form.level,
        category: form.category.trim(),
        status: form.status,
        file_path: uploadedPath || editing?.file_path || null,
        pdf_url: uploadedPath ? null : editing?.pdf_url || null,
        ai_summary: summary || null,
        summary_status: summary ? "ready" : "none",
        summary_generated_at: summary ? new Date().toISOString() : null,
      };

      if (editing) await adminApi.updateCourse(editing.id, payload);
      else await adminApi.createCourse(payload);

      if (uploadedPath && editing?.file_path && editing.file_path !== uploadedPath) {
        await adminApi.removeCourseFile(editing.file_path).catch(() => undefined);
      }
      await loadCourses();
      reset();
      setNotice(editing ? "Cours mis à jour avec succès." : "Cours ajouté à la bibliothèque.");
    } catch (saveError) {
      if (uploadedPath) await adminApi.removeCourseFile(uploadedPath).catch(() => undefined);
      setNotice("");
      setError(saveError.message || "Le cours n’a pas pu être enregistré.");
    } finally {
      setBusy(false);
    }
  };

  const deleteCourse = async () => {
    if (!deleting) return;
    setBusy(true);
    setError("");
    try {
      await adminApi.deleteCourse(deleting);
      setDeleting(null);
      await loadCourses();
      setNotice("Cours supprimé de la bibliothèque.");
    } catch (deleteError) {
      setError(deleteError.message || "Le cours n’a pas pu être supprimé.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <form onSubmit={saveCourse} className="portal-panel h-fit">
          <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Bibliothèque</p><h2 className="mt-1 text-2xl font-black">{editing ? "Modifier le cours" : "Ajouter un cours"}</h2><p className="mt-2 text-sm leading-6 text-slate-500">Importez le PDF puis choisissez si Groq doit produire un résumé pédagogique.</p></div>{editing && <button type="button" onClick={reset} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100" aria-label="Annuler la modification"><X className="h-5 w-5" /></button>}</div>

          <div className="mt-6 space-y-4">
            <label className="block"><span className="mb-2 block text-sm font-bold">Titre du cours</span><input className="portal-input" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Ex. Algorithmique avancée" minLength={2} maxLength={180} required /></label>
            <label className="block"><span className="mb-2 block text-sm font-bold">Description</span><textarea className="portal-input min-h-28 resize-y" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Objectifs et contenu du support…" /></label>
            <div className="grid gap-4 sm:grid-cols-2"><label><span className="mb-2 block text-sm font-bold">Niveau</span><select className="portal-select" value={form.level} onChange={(event) => setForm({ ...form, level: event.target.value })}><option>CP1</option><option>CP2</option><option>CI</option></select></label><label><span className="mb-2 block text-sm font-bold">Catégorie</span><input className="portal-input" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Informatique" required /></label></div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => setForm({ ...form, mode: "course_only" })} className={`rounded-2xl border p-4 text-left transition ${form.mode === "course_only" ? "border-cyan-500 bg-cyan-50 ring-2 ring-cyan-100" : "border-slate-200 hover:border-slate-300"}`}><FileText className="h-5 w-5 text-cyan-700" /><strong className="mt-3 block text-sm">Cours seulement</strong><span className="mt-1 block text-xs leading-5 text-slate-500">Le PDF sera disponible sans résumé.</span></button>
              <button type="button" onClick={() => setForm({ ...form, mode: "course_with_summary" })} className={`rounded-2xl border p-4 text-left transition ${form.mode === "course_with_summary" ? "border-violet-500 bg-violet-50 ring-2 ring-violet-100" : "border-slate-200 hover:border-slate-300"}`}><Sparkles className="h-5 w-5 text-violet-700" /><strong className="mt-3 block text-sm">Cours + résumé IA</strong><span className="mt-1 block text-xs leading-5 text-slate-500">Groq analyse le PDF après l’import.</span></button>
            </div>

            <input ref={inputRef} type="file" accept="application/pdf" className="sr-only" onChange={chooseFile} />
            <button type="button" onClick={() => inputRef.current?.click()} className="flex min-h-28 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/60 px-4 py-5 text-center hover:border-sky-400"><UploadCloud className="h-6 w-6 text-sky-700" /><span className="mt-2 text-sm font-black text-slate-800">{file ? file.name : editing?.file_path || editing?.pdf_url ? "Remplacer le PDF actuel" : "Choisir le PDF du cours"}</span><span className="mt-1 text-xs text-slate-500">PDF — 25 Mo maximum</span></button>
            {file && <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800"><span className="truncate">{file.name}</span><button type="button" onClick={() => { setFile(null); if (inputRef.current) inputRef.current.value = ""; }} className="p-1" aria-label="Retirer le fichier"><X className="h-4 w-4" /></button></div>}

            <label className="block"><span className="mb-2 block text-sm font-bold">Visibilité</span><select className="portal-select" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option value="published">Publié</option><option value="draft">Brouillon</option><option value="archived">Archivé</option></select></label>
            {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}
            {notice && <p className="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800">{notice}</p>}
            <button type="submit" disabled={busy} className="portal-primary-button w-full justify-center">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FilePlus2 className="h-4 w-4" />} {busy ? "Traitement en cours…" : editing ? "Enregistrer les modifications" : "Ajouter le cours"}</button>
          </div>
        </form>

        <section className="portal-panel">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Catalogue</p><h2 className="mt-1 text-2xl font-black">Cours publiés et brouillons</h2><p className="mt-2 text-sm text-slate-500">{courses.length} support{courses.length > 1 ? "s" : ""} enregistré{courses.length > 1 ? "s" : ""}.</p></div><button type="button" onClick={loadCourses} className="portal-secondary-button" disabled={loading}>Actualiser</button></div>
          <div className="mt-6 space-y-3">
            {loading && <div className="portal-empty flex items-center justify-center gap-2"><LoaderCircle className="h-5 w-5 animate-spin" /> Chargement…</div>}
            {!loading && courses.map((course) => <article key={course.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex flex-col gap-4 sm:flex-row sm:items-center"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-cyan-300"><BookOpen className="h-5 w-5" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-black">{course.title}</h3><span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${course.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{course.status === "published" ? "Publié" : course.status === "draft" ? "Brouillon" : "Archivé"}</span>{course.summary_status === "ready" && <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-black text-violet-700"><Sparkles className="h-3 w-3" /> Résumé IA</span>}</div><p className="mt-1 text-sm text-slate-500">{course.level} · {course.category}</p></div><div className="flex gap-2">{course.download_url && <a href={course.download_url} target="_blank" rel="noreferrer" className="portal-secondary-button !px-3 !py-2" aria-label={`Ouvrir ${course.title}`}><Download className="h-4 w-4" /></a>}<button type="button" onClick={() => startEdit(course)} className="portal-secondary-button !px-3 !py-2" aria-label={`Modifier ${course.title}`}><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => setDeleting(course)} className="rounded-xl border border-rose-200 bg-rose-50 px-3 text-rose-700 hover:bg-rose-100" aria-label={`Supprimer ${course.title}`}><Trash2 className="h-4 w-4" /></button></div></div></article>)}
            {!loading && !courses.length && <div className="portal-empty"><BookOpen className="mx-auto mb-3 h-8 w-8 text-slate-300" />Aucun cours enregistré. Utilisez le formulaire pour constituer la bibliothèque.</div>}
          </div>
        </section>
      </section>

      {deleting && <div className="portal-modal-backdrop" onMouseDown={() => !busy && setDeleting(null)}><section className="portal-modal max-w-lg" role="dialog" aria-modal="true" aria-labelledby="delete-course-title" onMouseDown={(event) => event.stopPropagation()}><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700"><Trash2 className="h-6 w-6" /></span><h2 id="delete-course-title" className="mt-4 text-2xl font-black">Supprimer ce cours ?</h2><p className="mt-2 text-sm leading-6 text-slate-500">« {deleting.title} » et son PDF seront supprimés définitivement de la bibliothèque.</p><div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={() => setDeleting(null)} className="portal-secondary-button" disabled={busy}>Conserver</button><button type="button" onClick={deleteCourse} className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-black text-white hover:bg-rose-700" disabled={busy}>{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Supprimer définitivement</button></div></section></div>}
    </div>
  );
}
