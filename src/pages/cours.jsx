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

  const favorites = cours.filter((course) => course.isFavorite).map((course) => course.id);

  const toggleFavorite = async (courseId) => {
    const wasFavorite = cours.find((course) => course.id === courseId)?.isFavorite ?? false;
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
      setFavoriteError(toggleError.message || "Le favori n’a pas pu être enregistré.");
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

  // FILTRE DES COURS
  const filtered = cours.filter((c) => {
    const matchSearch = c.titre.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "Tous" || c.categorie === category;
    const matchNiveau = niveauFilter === "Tous" || c.niveau === niveauFilter;
    return matchSearch && matchCat && matchNiveau;
  });

  // PAGINATION
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const currentCourses = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="portal-page">
      <PageHeader
        icon={BookOpen}
        eyebrow="Ressources pédagogiques"
        title="Supports & Cours"
        description="Recherchez vos supports par matière et par niveau, puis téléchargez-les en un clic."
      />

      {/* BARRE DE RECHERCHE + FILTRES */}
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="portal-panel flex flex-col items-center justify-between gap-4 md:flex-row"
      >
        {/* Recherche */}
        <div className="relative w-full md:w-1/2">
          <input
            className="portal-input pl-10"
            placeholder="Rechercher un cours..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
          <Search
            size={20}
            className="absolute left-3 top-3 text-slate-400"
          />
        </div>

        {/* Filtres */}
        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          {/* Catégorie */}
          <select
            className="portal-select"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setCurrentPage(1);
            }}
          >
            {categories.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>

          {/* Niveau */}
          <select
            className="portal-select"
            value={niveauFilter}
            onChange={(e) => {
              setNiveauFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            {niveaux.map((niv) => (
              <option key={niv}>{niv}</option>
            ))}
          </select>

          {/* Bouton Reset */}
          <button
            onClick={() => {
              setCategory("Tous");
              setNiveauFilter("Tous");
              setSearch("");
              setCurrentPage(1);
            }}
            className="portal-secondary-button w-full md:w-auto"
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
          <LoaderCircle className="h-5 w-5 animate-spin" /> Chargement des cours…
        </div>
      )}

      {error && !loading && (
        <div className="portal-empty text-rose-700">
          Impossible de charger les cours.
        </div>
      )}

      {/* GRID DES COURS */}
      {!loading && !error && <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {currentCourses.map((cours, index) => (
          <Motion.div
            key={cours.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="portal-card relative cursor-pointer p-6"
            onClick={() => setSelectedCourse(cours)}
          >
            {/* Bouton favoris */}
            <button
              onClick={async (e) => {
                e.stopPropagation();
                await toggleFavorite(cours.id);
              }}
              className="absolute top-3 right-3 hover:scale-110 transition-transform"
            >
              <Heart
                size={24}
                className={
                  favorites.includes(cours.id)
                    ? "text-red-500 fill-red-500"
                    : "text-gray-300"
                }
              />
            </button>

            {/* Titre */}
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="text-sky-700" size={24} />
              <h2 className="pr-6 text-lg font-bold text-slate-950">
                {cours.titre}
              </h2>
            </div>

            <p className="text-sm text-slate-600">Niveau : {cours.niveau}</p>
            <p className="mt-1 text-xs font-bold text-sky-700">
              Catégorie : {cours.categorie}
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-2">
              <a
                href={cours.pdf}
                download
                className="portal-primary-button w-full px-4 py-2.5 sm:w-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <Download size={18} /> Télécharger
              </a>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCourse(cours);
                }}
                className="w-full text-center text-sm font-bold text-sky-700 hover:text-sky-900 sm:w-auto"
              >
                Générer résumé IA
              </button>
            </div>
          </Motion.div>
        ))}
      </div>}

      {/* Aucun résultat */}
      {!loading && !error && filtered.length === 0 && (
        <p className="portal-empty text-base">
          Aucun cours trouvé.
        </p>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-8 items-center">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i}
              variant={currentPage === i + 1 ? "default" : "outline"}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}

          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight />
          </Button>
        </div>
      )}

      {/* MODAL — Résumé IA */}
      {selectedCourse && (
        <div className="portal-modal-backdrop">
          <Motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="portal-modal"
          >
            <button
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
              onClick={() => setSelectedCourse(null)}
            >
              <X size={24} />
            </button>

            <h2 className="mb-4 pr-10 text-xl font-bold text-slate-950">
              Résumé IA — {selectedCourse.titre}
            </h2>

            <p className="mb-5 text-sm leading-6 text-slate-600">
              Le résumé intelligent mettra en avant les notions essentielles et
              les points à retenir de ce support.
            </p>

            <div>
              <button className="portal-primary-button w-full sm:w-auto">
                Générer maintenant
              </button>
            </div>
          </Motion.div>
        </div>
      )}
    </div>
  );
}
