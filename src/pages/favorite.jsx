import { useState } from "react";
import {
  Search,
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
import FavoriteCourses from "../data/FavoriteCourses";
import { usePortalCollection } from "@/hooks/usePortalCollection";
import { coursesApi } from "@/services/portalApi";

export default function FavoritePage() {
  const { data: remoteFavorites, loading, error, setData } = usePortalCollection(
    coursesApi.listFavorites,
    FavoriteCourses
  );
  const [actionError, setActionError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Tous");
  const [niveauFilter, setNiveauFilter] = useState("Tous");
  const [page, setPage] = useState(1);

  const favoritesPerPage = 6;

  const categories = ["Tous", "Math", "Stats", "IA"];
  const niveaux = ["Tous", "CP1", "CP2", "CI"];

  // Filtrage
  const filtered = remoteFavorites.filter((c) => {
    const matchSearch = c.titre.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      categoryFilter === "Tous" || c.categorie === categoryFilter;
    const matchNiv = niveauFilter === "Tous" || c.niveau === niveauFilter;
    return matchSearch && matchCat && matchNiv;
  });

  const totalPages = Math.ceil(filtered.length / favoritesPerPage);

  const paginated = filtered.slice(
    (page - 1) * favoritesPerPage,
    page * favoritesPerPage
  );

  return (
    <div className="portal-page">
      <PageHeader
        icon={Heart}
        eyebrow="Ma bibliothèque"
        title="Mes cours favoris"
        description="Retrouvez les supports que vous avez enregistrés pour y accéder rapidement."
      />

      {actionError && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {actionError}
        </p>
      )}

      {/* Recherche + filtres */}
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="portal-panel flex flex-col items-center justify-between gap-4 md:flex-row"
      >
        <div className="relative w-full max-w-xl">
          <input
            type="text"
            placeholder="Rechercher un cours..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="portal-input pl-10"
          />
          <Search
            size={20}
            className="absolute left-3 top-3 text-slate-400"
          />
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <select
            className="portal-select"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
          >
            <option> -- Catégorie -- </option>
            {categories.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>

          <select
            className="portal-select"
            value={niveauFilter}
            onChange={(e) => {
              setNiveauFilter(e.target.value);
              setPage(1);
            }}
          >
            <option> -- Niveau -- </option>
            {niveaux.map((niv) => (
              <option key={niv}>{niv}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setCategoryFilter("Tous");
              setNiveauFilter("Tous");
              setSearch("");
              setPage(1);
            }}
            className="portal-secondary-button w-full md:w-auto"
          >
            Réinitialiser
          </button>
        </div>
      </Motion.div>

      {loading && (
        <div className="portal-empty flex items-center justify-center gap-2">
          <LoaderCircle className="h-5 w-5 animate-spin" /> Chargement des favoris…
        </div>
      )}

      {error && !loading && (
        <div className="portal-empty text-rose-700">
          Impossible de charger vos favoris.
        </div>
      )}

      {/* Grid des favoris */}
      {!loading && !error && <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {paginated.map((cours, index) => (
          <Motion.div
            key={cours.id}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{
              scale: 1.03,
              boxShadow: "0 12px 25px rgba(0,0,0,0.08)",
            }}
            whileTap={{ scale: 0.97 }}
            className="portal-card relative cursor-pointer p-6"
          >
            <Motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={async () => {
                const snapshot = remoteFavorites;
                setActionError("");
                setData((items) => items.filter((item) => item.id !== cours.id));
                try {
                  await coursesApi.setFavorite(cours.id, false);
                } catch (removeError) {
                  setData(snapshot);
                  setActionError(removeError.message || "Le favori n’a pas pu être supprimé.");
                }
              }}
              className="absolute top-3 right-3"
            >
              <Heart size={24} className="text-red-500 fill-red-500" />
            </Motion.button>

            <h2 className="mb-2 pr-7 text-lg font-bold text-slate-950">
              {cours.titre}
            </h2>
            <p className="text-sm text-slate-600">Niveau : {cours.niveau}</p>
            <p className="mt-1 text-xs font-bold text-sky-700">
              Catégorie : {cours.categorie}
            </p>

            <Motion.a
              href={cours.pdf}
              download
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className="portal-primary-button mt-5 w-full"
            >
              <Download size={18} /> Télécharger
            </Motion.a>
          </Motion.div>
        ))}
      </div>}

      {!loading && !error && filtered.length === 0 && (
        <p className="portal-empty text-base">
          Aucun favori trouvé.
        </p>
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
    </div>
  );
}
