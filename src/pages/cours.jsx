import { useState } from "react";
import {
  Search,
  BookOpen,
  Download,
  X,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import cours from "../data/Cours";
import FavoriteCourses from "../data/FavoriteCourses";

export default function CoursPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tous");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [favorites, setFavorites] = useState([...FavoriteCourses]);
  const [currentPage, setCurrentPage] = useState(1);
  const [niveauFilter, setNiveauFilter] = useState("Tous");

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
    <div className="space-y-8 lg:p-6 md:p-4 p-2">
      {/* HEADER */}
      <header className="bg-linear-to-r from-sky-600 to-orange-500 text-white p-6 rounded-xl shadow-lg mb-10">
        <h1 className="text-2xl md:text-3xl font-bold">Supports & Cours</h1>
      </header>

      {/* BARRE DE RECHERCHE + FILTRES */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-md mb-10"
      >
        {/* Recherche */}
        <div className="relative w-full md:w-1/2">
          <input
            className="w-full border border-gray-300 rounded-xl py-2 md:py-3 pl-10 pr-4 shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            placeholder="Rechercher un cours..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
          <Search
            size={20}
            className="absolute top-2.5 md:top-3 left-3 text-gray-500"
          />
        </div>

        {/* Filtres */}
        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          {/* Catégorie */}
          <select
            className="rounded-xl p-2 md:p-3 shadow-md w-full bg-white text-gray-700 border border-gray-200
            focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
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
            className="rounded-xl p-2 md:p-3 shadow-md w-full bg-white text-gray-700 border border-gray-200
            focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
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
            className="w-full md:w-auto p-2 md:p-3 bg-gray-100 hover:bg-gray-200 rounded-xl shadow transition"
          >
            Réinitialiser
          </button>
        </div>
      </motion.div>

      {/* GRID DES COURS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentCourses.map((cours, index) => (
          <motion.div
            key={cours.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative bg-white rounded-2xl shadow-sm p-6 border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => setSelectedCourse(cours)}
          >
            {/* Bouton favoris */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFavorites((prev) =>
                  prev.includes(cours.id)
                    ? prev.filter((id) => id !== cours.id)
                    : [...prev, cours.id]
                );
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
              <BookOpen className="text-blue-600" size={26} />
              <h2 className="text-xl font-semibold text-gray-900">
                {cours.titre}
              </h2>
            </div>

            <p className="text-sm text-gray-600">Niveau : {cours.niveau}</p>
            <p className="text-xs text-blue-700 font-medium mt-1">
              Catégorie : {cours.categorie}
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-2">
              <a
                href={cours.pdf}
                download
                className="flex items-center gap-2 bg-linear-to-r from-sky-500 to-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition-all w-full sm:w-auto justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <Download size={18} /> Télécharger
              </a>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCourse(cours);
                }}
                className="text-blue-600 font-medium hover:underline w-full sm:w-auto text-center"
              >
                Générer résumé IA
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Aucun résultat */}
      {filtered.length === 0 && (
        <p className="text-gray-500 mt-10 text-center text-lg">
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 sm:p-6 z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 sm:p-8 max-w-md sm:max-w-lg w-full shadow-lg relative"
          >
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
              onClick={() => setSelectedCourse(null)}
            >
              <X size={24} />
            </button>

            <h2 className="text-xl font-bold mb-4">
              Résumé IA — {selectedCourse.titre}
            </h2>

            <p className="text-gray-700 mb-4">
              👉 Le résumé IA sera généré automatiquement via une API OpenAI ou
              un modèle local.
            </p>

            <div>
              <button className="bg-linear-to-r from-sky-500 to-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 w-full sm:w-auto">
                Générer maintenant
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
