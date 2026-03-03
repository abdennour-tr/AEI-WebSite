import { useState } from "react";
import {
  Search,
  Download,
  X,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import FavoriteCourses from "../data/FavoriteCourses";

export default function FavoritePage() {
  const [favorites, setFavorites] = useState(FavoriteCourses);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Tous");
  const [niveauFilter, setNiveauFilter] = useState("Tous");
  const [page, setPage] = useState(1);

  const favoritesPerPage = 6;

  const categories = ["Tous", "Math", "Stats", "IA"];
  const niveaux = ["Tous", "CP1", "CP2", "CI"];

  // Filtrage
  const filtered = favorites.filter((c) => {
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
    <div className="space-y-8 lg:p-6 md:p-4 p-2">
      <header className=" bg-linear-to-r from-sky-600 to-orange-500 text-white p-6 rounded-xl shadow-lg mb-10">
        <h1 className="text-3xl font-bold">Mes Favoris</h1>
        <p className="text-white/90 mt-1">
          Retrouvez ici toutes vos cours favoris.
        </p>
      </header>

      {/* Recherche + filtres */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-md"
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
            className="w-full border border-gray-300 rounded-xl py-2 md:py-3 pl-10 pr-4 shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
          <Search
            size={20}
            className="absolute top-2.5 md:top-3 left-3 text-gray-500"
          />
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <select
            className="rounded-xl p-2 md:p-3 shadow-md w-full bg-white text-gray-700 border border-gray-200
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
              transition-all duration-300 cursor-pointer"
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
            className="rounded-xl p-2 md:p-3 shadow-md w-full bg-white text-gray-700 border border-gray-200
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
              transition-all duration-300 cursor-pointer"
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
            className="w-full md:w-auto p-2 md:p-3 bg-gray-100 hover:bg-gray-200 rounded-xl shadow transition"
          >
            Réinitialiser
          </button>
        </div>
      </motion.div>

      {/* Grid des favoris */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginated.map((cours, index) => (
          <motion.div
            key={cours.id}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{
              scale: 1.03,
              boxShadow: "0 12px 25px rgba(0,0,0,0.08)",
            }}
            whileTap={{ scale: 0.97 }}
            className="relative bg-white rounded-2xl shadow-sm p-6 border border-gray-200 cursor-pointer"
          >
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() =>
                setFavorites(favorites.filter((c) => c.id !== cours.id))
              }
              className="absolute top-3 right-3"
            >
              <Heart size={24} className="text-red-500 fill-red-500" />
            </motion.button>

            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {cours.titre}
            </h2>
            <p className="text-sm text-gray-600">Niveau : {cours.niveau}</p>
            <p className="text-xs text-blue-700 font-medium mt-1">
              Catégorie : {cours.categorie}
            </p>

            <motion.a
              href={cours.pdf}
              download
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-linear-to-r from-sky-500 to-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition-all mt-4"
            >
              <Download size={18} /> Télécharger
            </motion.a>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-gray-500 mt-10 text-center text-lg">
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
