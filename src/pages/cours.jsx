import { useState } from "react";
import {
  Search,
  BookOpen,
  Download,
  X,
  Heart,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
} from "lucide-react";
import { motion as Motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";
import fallbackCourses from "../data/Cours";
import { usePortalCollection } from "@/hooks/usePortalCollection";
import { coursesApi } from "@/services/portalApi";

export default function CoursPage() {
  const { data: cours, loading, error, setData } = usePortalCollection(
    coursesApi.list,
    fallbackCourses
  );
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tous");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [favoriteError, setFavoriteError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [niveauFilter, setNiveauFilter] = useState("Tous");

  const favorites = cours
    .filter((course) => course.isFavorite)
    .map((course) => course.id);

  const toggleFavorite = async (courseId) => {
    const wasFavorite =
      cours.find((course) => course.id === courseId)?.isFavorite ?? false;
    const next = !wasFavorite;
    setFavoriteError("");
    setData((items) =>
      items.map((course) =>
        course.id === courseId ? { ...course, isFavorite: next } : course
      )
    );

    try {
      await coursesApi.setFavorite(courseId, next);
    } catch (toggleError) {
      setData((items) =>
        items.map((course) =>
          course.id === courseId
            ? { ...course, isFavorite: wasFavorite }
            : course
        )
      );
      setFavoriteError(
        toggleError.message || "Le favori n’a pas pu être enregistré."
      );
    }
  };

  const niveaux = ["Tous", "CP1", "CP2", "CI"];
  const categories = [
    "Tous",
    "Math",
    "Statistiques",
    "IA",
    "Langues",
    "Physique",
    "Informatique",
  ];

  const filtered = cours.filter((course) => {
    const matchSearch = course.titre
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchCat = category === "Tous" || course.categorie === category;
    const matchNiveau =
      niveauFilter === "Tous" || course.niveau === niveauFilter;
    return matchSearch && matchCat && matchNiveau;
  });

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentCourses = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetFilters = () => {
    setCategory("Tous");
    setNiveauFilter("Tous");
    setSearch("");
    setCurrentPage(1);
  };

  return (
    <div className="portal-page min-w-0">
      <PageHeader
        icon={BookOpen}
        eyebrow="Ressources pédagogiques"
        title="Supports & Cours"
        description="Recherchez vos supports par matière et par niveau, puis téléchargez-les en un clic."
      />

      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="portal-panel grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,28rem)] lg:items-center"
      >
        <label className="relative block min-w-0">
          <span className="sr-only">Rechercher un cours</span>
          <input
            className="portal-input w-full pl-10"
            placeholder="Rechercher un cours..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
          />
          <Search
            size={20}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </label>

        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="min-w-0">
            <span className="sr-only">Catégorie</span>
            <select
              className="portal-select w-full min-w-0"
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setCurrentPage(1);
              }}
            >
              {categories.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </label>

          <label className="min-w-0">
            <span className="sr-only">Niveau</span>
            <select
              className="portal-select w-full min-w-0"
              value={niveauFilter}
              onChange={(event) => {
                setNiveauFilter(event.target.value);
                setCurrentPage(1);
              }}
            >
              {niveaux.map((niveau) => (
                <option key={niveau}>{niveau}</option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={resetFilters}
            className="portal-secondary-button w-full justify-center sm:col-span-2"
          >
            Réinitialiser
          </button>
        </div>
      </Motion.div>

      {favoriteError && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {favoriteError}
        </p>
      )}

      {loading && (
        <div className="portal-empty flex items-center justify-center gap-2">
          <LoaderCircle className="h-5 w-5 animate-spin" /> Chargement des
          cours…
        </div>
      )}

      {error && !loading && (
        <div className="portal-empty text-rose-700">
          Impossible de charger les cours.
        </div>
      )}

      {!loading && !error && (
        <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {currentCourses.map((course, index) => (
            <Motion.article
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="portal-card relative min-w-0 cursor-pointer overflow-hidden p-5 sm:p-6"
              onClick={() => setSelectedCourse(course)}
            >
              <button
                type="button"
                onClick={async (event) => {
                  event.stopPropagation();
                  await toggleFavorite(course.id);
                }}
                className="absolute right-3 top-3 rounded-lg p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
                aria-label={
                  favorites.includes(course.id)
                    ? "Retirer des favoris"
                    : "Ajouter aux favoris"
                }
              >
                <Heart
                  size={24}
                  className={
                    favorites.includes(course.id)
                      ? "fill-red-500 text-red-500"
                      : "text-gray-300"
                  }
                />
              </button>

              <div className="mb-3 flex min-w-0 items-start gap-3 pr-8">
                <BookOpen className="mt-0.5 shrink-0 text-sky-700" size={24} />
                <h2 className="min-w-0 break-words text-lg font-bold leading-snug text-slate-950">
                  {course.titre}
                </h2>
              </div>

              <p className="text-sm text-slate-600">Niveau : {course.niveau}</p>
              <p className="mt-1 break-words text-xs font-bold text-sky-700">
                Catégorie : {course.categorie}
              </p>

              <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <a
                  href={course.pdf}
                  download
                  className="portal-primary-button w-full justify-center px-4 py-2.5 text-center"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Download size={18} /> Télécharger
                </a>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedCourse(course);
                  }}
                  className="min-h-11 w-full rounded-xl px-3 text-center text-sm font-bold leading-tight text-sky-700 transition hover:bg-sky-50 hover:text-sky-900"
                >
                  Générer résumé IA
                </button>
              </div>
            </Motion.article>
          ))}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <p className="portal-empty text-base">Aucun cours trouvé.</p>
      )}

      {totalPages > 1 && (
        <nav
          className="mt-8 flex flex-wrap items-center justify-center gap-2 md:gap-3"
          aria-label="Pagination des cours"
        >
          <Button
            variant="outline"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
            aria-label="Page précédente"
          >
            <ChevronLeft />
          </Button>

          {Array.from({ length: totalPages }, (_, index) => (
            <Button
              key={index}
              variant={currentPage === index + 1 ? "default" : "outline"}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </Button>
          ))}

          <Button
            variant="outline"
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
            disabled={currentPage === totalPages}
            aria-label="Page suivante"
          >
            <ChevronRight />
          </Button>
        </nav>
      )}

      {selectedCourse && (
        <div
          className="portal-modal-backdrop p-4"
          onMouseDown={() => setSelectedCourse(null)}
        >
          <Motion.section
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="portal-modal max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto p-5 sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="course-summary-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-3 top-3 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 sm:right-4 sm:top-4"
              onClick={() => setSelectedCourse(null)}
              aria-label="Fermer"
            >
              <X size={24} />
            </button>

            <h2
              id="course-summary-title"
              className="mb-4 break-words pr-10 text-xl font-bold text-slate-950"
            >
              Résumé IA — {selectedCourse.titre}
            </h2>

            <p className="mb-5 text-sm leading-6 text-slate-600">
              Le résumé intelligent mettra en avant les notions essentielles et
              les points à retenir de ce support.
            </p>

            <button className="portal-primary-button w-full justify-center sm:w-auto">
              Générer maintenant
            </button>
          </Motion.section>
        </div>
      )}
    </div>
  );
}
