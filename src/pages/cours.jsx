import { useMemo, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, Download, FileText, GraduationCap, Heart, LoaderCircle, Search, Sparkles, X } from "lucide-react";
import { motion as Motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import fallbackCourses from "@/data/Cours";
import { usePortalCollection } from "@/hooks/usePortalCollection";
import { coursesApi } from "@/services/portalApi";

const toneByCategory = {
  Math: "from-indigo-600 to-violet-500",
  Statistiques: "from-violet-600 to-fuchsia-500",
  IA: "from-cyan-600 to-blue-600",
  Langues: "from-amber-500 to-orange-500",
  Physique: "from-emerald-600 to-teal-500",
  Informatique: "from-slate-800 to-cyan-700",
};

export default function CoursPage() {
  const { data: courses, loading, error, setData } = usePortalCollection(coursesApi.list, fallbackCourses);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tous");
  const [level, setLevel] = useState("Tous");
  const [currentPage, setCurrentPage] = useState(1);
  const [summaryCourse, setSummaryCourse] = useState(null);
  const [favoriteError, setFavoriteError] = useState("");

  const categories = useMemo(() => ["Tous", ...new Set(courses.map((course) => course.categorie).filter(Boolean))], [courses]);
  const levels = useMemo(() => ["Tous", ...new Set(courses.map((course) => course.niveau).filter(Boolean))], [courses]);
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("fr");
    return courses.filter((course) => {
      const searchable = `${course.titre} ${course.description || ""} ${course.categorie || ""}`.toLocaleLowerCase("fr");
      return (!query || searchable.includes(query)) && (category === "Tous" || course.categorie === category) && (level === "Tous" || course.niveau === level);
    });
  }, [category, courses, level, search]);

  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const visibleCourses = filtered.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  const updateFilter = (setter, value) => { setter(value); setCurrentPage(1); };

  const toggleFavorite = async (course) => {
    const previous = Boolean(course.isFavorite);
    setFavoriteError("");
    setData((items) => items.map((item) => item.id === course.id ? { ...item, isFavorite: !previous } : item));
    try {
      await coursesApi.setFavorite(course.id, !previous);
    } catch (toggleError) {
      setData((items) => items.map((item) => item.id === course.id ? { ...item, isFavorite: previous } : item));
      setFavoriteError(toggleError.message || "Le favori n’a pas pu être enregistré.");
    }
  };

  return (
    <div className="portal-page min-w-0">
      <PageHeader icon={BookOpen} eyebrow="Bibliothèque pédagogique" title="Cours & supports ENIAD" description="Une bibliothèque claire et structurée pour retrouver vos supports, préparer vos révisions et consulter les résumés pédagogiques disponibles.">
        <div className="grid w-full gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur"><strong className="block text-2xl">{courses.length}</strong><span className="text-xs text-slate-300">supports disponibles</span></div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur"><strong className="block text-2xl">{courses.filter((course) => course.hasSummary).length}</strong><span className="text-xs text-slate-300">résumés IA</span></div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur"><strong className="block text-2xl">{Math.max(0, levels.length - 1)}</strong><span className="text-xs text-slate-300">niveaux couverts</span></div>
        </div>
      </PageHeader>

      <section className="portal-panel overflow-hidden p-0">
        <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6"><p className="text-xs font-black uppercase tracking-[0.17em] text-sky-700">Rechercher dans la bibliothèque</p></div>
        <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_14rem_11rem_auto] lg:items-center">
          <label className="relative block min-w-0"><span className="sr-only">Rechercher un cours</span><Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><input className="portal-input pl-11" placeholder="Titre, matière ou notion…" value={search} onChange={(event) => updateFilter(setSearch, event.target.value)} /></label>
          <select className="portal-select" value={category} onChange={(event) => updateFilter(setCategory, event.target.value)} aria-label="Catégorie">{categories.map((item) => <option key={item}>{item}</option>)}</select>
          <select className="portal-select" value={level} onChange={(event) => updateFilter(setLevel, event.target.value)} aria-label="Niveau">{levels.map((item) => <option key={item}>{item}</option>)}</select>
          <button type="button" className="portal-secondary-button justify-center" onClick={() => { setSearch(""); setCategory("Tous"); setLevel("Tous"); setCurrentPage(1); }}>Réinitialiser</button>
        </div>
      </section>

      {favoriteError && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{favoriteError}</p>}
      {loading && <div className="portal-empty flex items-center justify-center gap-2"><LoaderCircle className="h-5 w-5 animate-spin" /> Chargement des cours…</div>}
      {error && !loading && <div className="portal-empty text-rose-700">Impossible de charger les cours.</div>}

      {!loading && !error && visibleCourses.length > 0 && (
        <section className="grid min-w-0 gap-5 md:grid-cols-2 2xl:grid-cols-3" aria-label="Liste des cours">
          {visibleCourses.map((course, index) => {
            const tone = toneByCategory[course.categorie] || "from-sky-700 to-cyan-600";
            return (
              <Motion.article key={course.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="group relative flex min-w-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className={`relative h-28 bg-gradient-to-br ${tone} p-5 text-white`}>
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full border border-white/15 bg-white/10" />
                  <div className="relative flex items-start justify-between gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/15 backdrop-blur"><FileText className="h-6 w-6" /></span><button type="button" onClick={() => toggleFavorite(course)} className="rounded-xl border border-white/20 bg-white/10 p-2.5 text-white transition hover:bg-white/20" aria-label={course.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}><Heart className={`h-5 w-5 ${course.isFavorite ? "fill-rose-400 text-rose-200" : ""}`} /></button></div>
                  <div className="absolute bottom-4 left-5 flex gap-2"><span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black backdrop-blur">{course.niveau}</span><span className="rounded-full bg-slate-950/25 px-3 py-1 text-xs font-bold backdrop-blur">{course.categorie}</span></div>
                </div>
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="flex items-start gap-3"><GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" /><h2 className="text-xl font-black leading-snug text-slate-950">{course.titre}</h2></div>
                  <p className="mt-3 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-slate-500">{course.description || "Support pédagogique disponible pour les étudiants de l’ENIAD."}</p>
                  {course.hasSummary && <div className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-700"><Sparkles className="h-3.5 w-3.5" /> Résumé IA disponible</div>}
                  <div className={`mt-6 grid gap-2 ${course.hasSummary ? "sm:grid-cols-2" : "grid-cols-1"}`}>
                    {course.pdf ? <a href={course.pdf} target="_blank" rel="noreferrer" className="portal-primary-button justify-center"><Download className="h-4 w-4" /> Ouvrir le cours</a> : <span className="flex min-h-11 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-400">PDF indisponible</span>}
                    {course.hasSummary && <button type="button" onClick={() => setSummaryCourse(course)} className="portal-secondary-button justify-center border-violet-200 text-violet-700 hover:bg-violet-50"><Sparkles className="h-4 w-4" /> Voir le résumé</button>}
                  </div>
                </div>
              </Motion.article>
            );
          })}
        </section>
      )}

      {!loading && !error && filtered.length === 0 && <div className="portal-empty"><BookOpen className="mx-auto mb-3 h-9 w-9 text-slate-300" /><p className="font-bold text-slate-700">Aucun cours ne correspond à ces critères.</p><p className="mt-1 text-sm">Réinitialisez les filtres ou essayez une autre recherche.</p></div>}
      {!loading && !error && totalPages > 1 && <nav className="flex items-center justify-center gap-2" aria-label="Pagination des cours"><button type="button" className="portal-secondary-button !px-3" disabled={safePage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} aria-label="Page précédente"><ChevronLeft className="h-4 w-4" /></button><span className="px-4 text-sm font-bold text-slate-600">Page {safePage} sur {totalPages}</span><button type="button" className="portal-secondary-button !px-3" disabled={safePage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} aria-label="Page suivante"><ChevronRight className="h-4 w-4" /></button></nav>}

      {summaryCourse && <div className="portal-modal-backdrop p-4" onMouseDown={() => setSummaryCourse(null)}><Motion.section initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="portal-modal max-h-[calc(100dvh-2rem)] max-w-3xl overflow-y-auto p-0" role="dialog" aria-modal="true" aria-labelledby="course-summary-title" onMouseDown={(event) => event.stopPropagation()}><div className="relative overflow-hidden rounded-t-3xl bg-slate-950 p-6 text-white sm:p-8"><div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-violet-500/20 blur-2xl" /><button type="button" onClick={() => setSummaryCourse(null)} className="absolute right-4 top-4 rounded-xl bg-white/10 p-2 text-slate-300 hover:bg-white/20 hover:text-white" aria-label="Fermer"><X className="h-5 w-5" /></button><span className="inline-flex items-center gap-2 rounded-full bg-violet-400/15 px-3 py-1.5 text-xs font-black text-violet-200"><Sparkles className="h-3.5 w-3.5" /> Synthèse pédagogique IA</span><h2 id="course-summary-title" className="mt-4 pr-10 text-2xl font-black sm:text-3xl">{summaryCourse.titre}</h2><p className="mt-2 text-sm text-slate-400">{summaryCourse.niveau} · {summaryCourse.categorie}</p></div><div className="p-6 sm:p-8"><p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{summaryCourse.summary}</p><div className="mt-7 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end"><button type="button" onClick={() => setSummaryCourse(null)} className="portal-secondary-button justify-center">Fermer</button>{summaryCourse.pdf && <a href={summaryCourse.pdf} target="_blank" rel="noreferrer" className="portal-primary-button justify-center"><Download className="h-4 w-4" /> Consulter le cours complet</a>}</div></div></Motion.section></div>}
    </div>
  );
}
