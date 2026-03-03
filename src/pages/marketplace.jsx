import { useState } from "react";
import { Search, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import produits from "../data/Produits";

export default function MarketPlacePage() {
  const categories = ["Informatique", "Téléphone", "Accessoires", "Mobilier"];
  const villes = [...new Set(produits.map((p) => p.ville))];
  const triOptions = [
    "Prix: Croissant",
    "Prix: Décroissant",
    "Récent",
    "Ancien",
  ];

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterVille, setFilterVille] = useState("");
  const [sort, setSort] = useState("");

  const [page, setPage] = useState(1);
  const perPage = 6;

  // FILTRAGE + TRI
  const filteredProducts = produits
    .filter((p) => p.titre.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => (filterCat ? p.categorie === filterCat : true))
    .filter((p) => (filterVille ? p.ville === filterVille : true))
    .sort((a, b) => {
      if (sort === "Prix: Croissant") return a.prix - b.prix;
      if (sort === "Prix: Décroissant") return b.prix - a.prix;
      return 0;
    });

  const totalPages = Math.ceil(filteredProducts.length / perPage);
  const paginated = filteredProducts.slice(
    (page - 1) * perPage,
    page * perPage
  );

  return (
    <div className="space-y-8 lg:p-6 md:p-4 p-2">
      <div className="rounded-3xl p-6 md:p-12 bg-linear-to-r from-purple-600 via-pink-500 to-orange-400 text-white shadow-lg sm:text-center mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-wide">
          Marketplace Étudiant
        </h1>
        <p className="text-sm sm:text-base md:text-lg mt-3 opacity-90">
          Achetez, vendez ou échangez facilement entre étudiants.
        </p>
      </div>

      {/* FILTRES */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-lg mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full border border-gray-300 pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-pink-500 text-sm md:text-base"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
          </div>

          <select
            className="border border-gray-300 p-3 rounded-xl text-sm md:text-base"
            onChange={(e) => {
              setPage(1);
              setFilterCat(e.target.value);
            }}
          >
            <option value="">Catégorie</option>
            {categories.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>

          <select
            className="border border-gray-300 p-3 rounded-xl text-sm md:text-base"
            onChange={(e) => {
              setPage(1);
              setFilterVille(e.target.value);
            }}
          >
            <option value="">Ville</option>
            {villes.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>

          <select
            className="border border-gray-300 p-3 rounded-xl text-sm md:text-base"
            onChange={(e) => {
              setPage(1);
              setSort(e.target.value);
            }}
          >
            <option value="">Trier par</option>
            {triOptions.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* PRODUITS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 gap-8">
        {paginated.map((p, index) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-3xl shadow-xl hover:shadow-2xl overflow-hidden transition-all duration-300 group"
          >
            <div className="h-48 sm:h-56 md:h-64 overflow-hidden">
              <img
                src={p.img}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                alt=""
              />
            </div>

            <div className="p-5 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
                {p.titre}
              </h2>

              <p className="text-xs sm:text-sm text-gray-500 mb-2">
                📍 {p.ville}
              </p>

              <span className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                {p.categorie}
              </span>

              <p className="text-gray-600 text-sm mt-3">{p.etat}</p>

              <div className="text-xl sm:text-2xl font-extrabold text-green-600 mt-2">
                {p.prix} DH
              </div>

              <p className="text-xs sm:text-sm text-gray-500 mt-1">{p.date}</p>

              <button className="mt-5 w-full bg-linear-to-r from-sky-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition flex items-center justify-center gap-2 text-sm sm:text-base">
                <ShoppingCart size={18} />
                Voir le produit
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-10 items-center">
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

      <div className="flex justify-end mt-14">
        <button className="bg-linear-to-r from-green-500 to-emerald-600 text-white px-6 md:px-8 py-4 rounded-2xl font-semibold hover:opacity-90 transition shadow-xl text-sm sm:text-base">
          Publier un produit
        </button>
      </div>
    </div>
  );
}
