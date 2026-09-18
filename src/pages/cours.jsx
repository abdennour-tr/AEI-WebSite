import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Bot,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  GraduationCap,
  Heart,
  LibraryBig,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { motion as Motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import EmptyState from "@/components/EmptyState";
import fallbackCourses from "@/data/Cours";
import { usePortalCollection } from "@/hooks/usePortalCollection";
import { coursesApi } from "@/services/portalApi";
import codingBook from "@/assets/icons/livre-de-codage.png";
import mathsBook from "@/assets/icons/livre-de-maths (1).png";
import physicsBook from "@/assets/icons/livre-de-physique.png";

const categoryThemes = {
  Math: { label: "Mathématiques", image: mathsBook, cover: "from-fuchsia-700 via-rose-600 to-orange-400", soft: "bg-rose-50 text-rose-700" },
  Statistiques: { label: "Statistiques", image: mathsBook, cover: "from-indigo-800 via-indigo-600 to-sky-400", soft: "bg-indigo-50 text-indigo-700" },
  IA: { label: "Intelligence artificielle", image: codingBook, cover: "from-violet-800 via-violet-600 to-fuchsia-400", soft: "bg-violet-50 text-violet-700" },
  Informatique: { label: "Informatique", image: codingBook, cover: "from-slate-950 via-slate-800 to-cyan-600", soft: "bg-cyan-50 text-cyan-700" },
  Physique: { label: "Physique", image: physicsBook, cover: "from-cyan-800 via-sky-600 to-blue-400", soft: "bg-sky-50 text-sky-700" },
  Langues: { label: "Communication", image: null, cover: "from-amber-700 via-orange-500 to-rose-400", soft: "bg-amber-50 text-amber-800" },
};

const levels = ["Tous", "CP1", "CP2", "CI"];
const categories = ["Tous", "Math", "Statistiques", "IA", "Langues", "Physique", "Informatique"];

function CourseCover({ course, compact = false }) {
  const theme = categoryThemes[course.categorie] || categoryThemes.Informatique;
  return (
    <div className={`relative isolate flex shrink-0 flex-col overflow-hidden rounded-r-2xl rounded-l-md bg-gradient-to-br ${theme.cover} text-white shadow-[0_18px_35px_-18px_rgba(15,23,42,0.8)] ${compact ? "h-52 w-36" : "h-64 w-full sm:w-44"}`}>
      <div className="absolute inset-y-0 left-0 w-2 border-r border-white/15 bg-slate-950/25" />
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full border-[24px] border-white/5" />
      <div className="relative flex h-full flex-col p-5 pl-6">
        <div className="flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/70"><span>Bibliothèque AEI</span><span>{course.niveau}</span></div>
        <div className="flex flex-1 items-center justify-center py-3">
          {theme.image ? <img src={theme.image} alt="" className={`${compact ? "h-20 w-20" : "h-24 w-24"} object-contain drop-shadow-2xl`} /> : <BookOpen className={`${compact ? "h-16 w-16" : "h-20 w-20"} text-white/90`} />}
        </div>
        <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/65">{theme.label}</p><p className={`mt-1 font-black leading-tight ${compact ? "text-base" : "text-lg"}`}>{course.titre}</p></div>
      </div>
    </div>
  );
}

export default function CoursPage() {
  const { data: courses, loading, error, setData } = usePortalCollection(coursesApi.list, fallbackCourses);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tous");
  const [level, setLevel] = useState("Tous");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [favoriteError, setFavoriteError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => courses.filter((course) => {
    const query = search.trim().toLocaleLowerCase("fr");
    const matchesSearch = !query || `${course.titre} ${course.description || ""} ${course.categorie}`.toLocaleLowerCase("fr").includes(query);
    return matchesSearch && (category === "Tous" || course.categorie === category) && (level === "Tous" || course.niveau === level);
  }), [category, courses, level, search]);

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentCourses = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const favoriteCount = courses.filter((course) => course.isFavorite).length;

  const setFilter = (setter, value) => { setter(value); setCurrentPage(1); };
  const resetFilters = () => { setSearch(""); setCategory("Tous"); setLevel("Tous"); setCurrentPage(1); };

  const toggleFavorite = async (courseId) => {
    const wasFavorite = courses.find((course) => course.id === courseId)?.isFavorite ?? false;
    setFavoriteError("");
    setData((items) => items.map((course) => course.id === courseId ? { ...course, isFavorite: !wasFavorite } : course));
    try {
      await coursesApi.setFavorite(courseId, !wasFavorite);
    } catch (toggleError) {
      setData((items) => items.map((course) => course.id === courseId ? { ...course, isFavorite: wasFavorite } : course));
      setFavoriteError(toggleError.message || "Le favori n’a pas pu être enregistré.");
    }
  };

  return (
    <div className="portal-page">
      <PageHeader icon={LibraryBig} eyebrow="Bibliothèque numérique" title="Cours & ouvrages pédagogiques" description="Parcourez les supports comme une bibliothèque, filtrez par niveau et conservez vos ouvrages essentiels." />

      <section className="grid gap-4 rounded-3xl bg-slate-950 p-5 text-white shadow-xl sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex items-center gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950"><BookOpen className="h-6 w-6" /></span><div><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Votre rayon</p><p className="mt-1 text-lg font-black">{filtered.length} ouvrage{filtered.length > 1 ? "s" : ""} disponible{filtered.length > 1 ? "s" : ""}</p></div></div>
        <div className="grid grid-cols-2 gap-3 sm:flex"><div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"><p className="text-2xl font-black text-cyan-300">{categories.length - 1}</p><p className="text-xs text-slate-400">disciplines</p></div><div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"><p className="text-2xl font-black text-cyan-300">{favoriteCount}</p><p className="text-xs text-slate-400">favori{favoriteCount > 1 ? "s" : ""}</p></div></div>
      </section>

      <section className="portal-panel space-y-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_11rem_11rem_auto]">
          <label className="relative"><span className="sr-only">Rechercher un cours</span><Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" /><input className="portal-input pl-10" placeholder="Rechercher un titre, une notion ou une matière…" value={search} onChange={(event) => setFilter(setSearch, event.target.value)} /></label>
          <label><span className="sr-only">Niveau</span><select className="portal-select" value={level} onChange={(event) => setFilter(setLevel, event.target.value)}>{levels.map((item) => <option key={item}>{item === "Tous" ? "Tous les niveaux" : item}</option>)}</select></label>
          <label><span className="sr-only">Catégorie</span><select className="portal-select" value={category} onChange={(event) => setFilter(setCategory, event.target.value)}>{categories.map((item) => <option key={item} value={item}>{item === "Tous" ? "Toutes les matières" : categoryThemes[item]?.label || item}</option>)}</select></label>
          <button type="button" onClick={resetFilters} className="portal-secondary-button justify-center">Réinitialiser</button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Filtrer par matière">{categories.map((item) => <button key={item} type="button" onClick={() => setFilter(setCategory, item)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition ${category === item ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{item === "Tous" ? "Toute la bibliothèque" : categoryThemes[item]?.label || item}</button>)}</div>
      </section>

      {favoriteError && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{favoriteError}</p>}
      {loading && <LoadingSkeleton cards={6} />}
      {error && !loading && <EmptyState icon={BookOpen} title="Bibliothèque indisponible" description="Les ouvrages ne peuvent pas être chargés pour le moment. Réessayez dans quelques instants." />}

      {!loading && !error && currentCourses.length > 0 && <div className="grid gap-5 xl:grid-cols-2">
        {currentCourses.map((course, index) => {
          const theme = categoryThemes[course.categorie] || categoryThemes.Informatique;
          return <Motion.article key={course.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl">
            <div className="flex flex-col sm:flex-row">
              <div className="relative flex justify-center bg-slate-100/80 p-5 sm:items-center"><CourseCover course={course} /><button type="button" onClick={() => toggleFavorite(course.id)} className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl shadow-lg backdrop-blur transition ${course.isFavorite ? "bg-rose-500 text-white" : "bg-white/90 text-slate-500 hover:text-rose-600"}`} aria-label={course.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}><Heart className={`h-5 w-5 ${course.isFavorite ? "fill-current" : ""}`} /></button></div>
              <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-black ${theme.soft}`}>{theme.label}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{course.niveau}</span></div>
                <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950">{course.titre}</h2>
                <p className="mt-3 line-clamp-4 text-sm leading-7 text-slate-600">{course.description || "Support pédagogique préparé pour accompagner votre progression et vos révisions."}</p>
                <div className="mt-5 flex items-center gap-4 border-t border-slate-100 pt-4 text-xs font-bold text-slate-400"><span className="inline-flex items-center gap-1.5"><FileText className="h-4 w-4" /> Support PDF</span><span className="inline-flex items-center gap-1.5"><GraduationCap className="h-4 w-4" /> Niveau {course.niveau}</span></div>
                <div className="mt-auto grid grid-cols-2 gap-2 pt-5"><button type="button" onClick={() => setSelectedCourse(course)} className="portal-secondary-button justify-center"><Sparkles className="h-4 w-4" /> Aperçu</button>{course.pdf ? <a href={course.pdf} download className="portal-primary-button justify-center"><Download className="h-4 w-4" /> Télécharger</a> : <button type="button" disabled className="portal-primary-button justify-center opacity-50"><Download className="h-4 w-4" /> Indisponible</button>}</div>
              </div>
            </div>
          </Motion.article>;
        })}
      </div>}

      {!loading && !error && filtered.length === 0 && <EmptyState icon={Search} title="Aucun ouvrage trouvé" description="Essayez un autre mot-clé, un niveau différent ou revenez à toute la bibliothèque." />}

      {totalPages > 1 && <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination des cours"><Button variant="outline" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1} aria-label="Page précédente"><ChevronLeft /></Button>{Array.from({ length: totalPages }, (_, index) => <Button key={index} variant={currentPage === index + 1 ? "default" : "outline"} onClick={() => setCurrentPage(index + 1)}>{index + 1}</Button>)}<Button variant="outline" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages} aria-label="Page suivante"><ChevronRight /></Button></nav>}

      {selectedCourse && <div className="portal-modal-backdrop" onMouseDown={() => setSelectedCourse(null)}><Motion.section initial={{ opacity: 0, scale: 0.97, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="portal-modal max-w-3xl" role="dialog" aria-modal="true" aria-labelledby="course-preview-title" onMouseDown={(event) => event.stopPropagation()}><button type="button" onClick={() => setSelectedCourse(null)} className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900" aria-label="Fermer"><X className="h-5 w-5" /></button><div className="grid gap-7 sm:grid-cols-[9rem_minmax(0,1fr)]"><CourseCover course={selectedCourse} compact /><div><span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-700"><Bot className="h-3.5 w-3.5" /> Assistant pédagogique</span><h2 id="course-preview-title" className="mt-4 pr-8 text-3xl font-black tracking-tight text-slate-950">{selectedCourse.titre}</h2><p className="mt-4 text-base leading-8 text-slate-600">{selectedCourse.description || "Ce support accompagne votre progression et vos révisions."}</p><div className="mt-5 flex flex-wrap gap-2"><span className="portal-badge">{categoryThemes[selectedCourse.categorie]?.label || selectedCourse.categorie}</span><span className="portal-badge">Niveau {selectedCourse.niveau}</span></div><div className="mt-7 flex flex-col gap-3 sm:flex-row">{selectedCourse.pdf && <a href={selectedCourse.pdf} download className="portal-primary-button justify-center"><Download className="h-4 w-4" /> Télécharger le support</a>}<button type="button" className="portal-secondary-button justify-center"><Sparkles className="h-4 w-4" /> Générer le résumé IA <ArrowUpRight className="h-4 w-4" /></button></div></div></div></Motion.section></div>}
    </div>
  );
}
