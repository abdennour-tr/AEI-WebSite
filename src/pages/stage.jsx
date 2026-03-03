import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Briefcase,
  Building2,
  X,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import offres from "../data/Stage";

export default function StagePage() {
  const [search, setSearch] = useState("");
  const [ville, setVille] = useState("Toutes");
  const [duree, setDuree] = useState("Toutes");
  const [selected, setSelected] = useState(null);
  const [fav, setFav] = useState([]);
  const [page, setPage] = useState(1);
  const perPage = 6;

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("favoris_stages")) || [];
    setFav(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("favoris_stages", JSON.stringify(fav));
  }, [fav]);

  const toggleFav = (id) => {
    setFav((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const villes = ["Toutes", ...new Set(offres.map((o) => o.lieu))];
  const durees = ["Toutes", ...new Set(offres.map((o) => o.duree))];

  const filtered = offres.filter((o) => {
    const matchTitre = o.titre.toLowerCase().includes(search.toLowerCase());
    const matchVille = ville === "Toutes" || o.lieu === ville;
    const matchDuree = duree === "Toutes" || o.duree === duree;
    return matchTitre && matchVille && matchDuree;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-8 lg:p-6 md:p-4 p-2">
      {/* HEADER */}
      <header className="bg-linear-to-r from-sky-600 to-orange-500 text-white p-6 rounded-xl shadow-lg mb-10">
        <h1 className="text-3xl font-bold">Stages & Opportunités</h1>
        <p className="opacity-90 mt-2 text-sm md:text-lg">
          Explorez des stages adaptés à votre futur parcours professionnel.
        </p>
      </header>

      {/* FILTRE */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-md"
      >
        <div className="relative w-full md:w-1/2">
          <input
            className="w-full border border-gray-300 rounded-xl py-2 md:py-3 pl-10 pr-4 shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            placeholder="Rechercher un stage..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
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
            value={ville}
            onChange={(e) => {
              setVille(e.target.value);
              setPage(1);
            }}
          >
            {villes.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>

          <select
            className="rounded-xl p-2 md:p-3 shadow-md w-full bg-white text-gray-700 border border-gray-200
            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
            transition-all duration-300 cursor-pointer"
            value={duree}
            onChange={(e) => {
              setDuree(e.target.value);
              setPage(1);
            }}
          >
            {durees.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setVille("Toutes");
              setDuree("Toutes");
              setSearch("");
              setPage(1);
            }}
            className=" w-full p-2 md:p-3 bg-gray-100 hover:bg-gray-200 rounded-xl shadow"
          >
            Réinitialiser
          </button>
        </div>
      </motion.div>

      {/* LISTE DES OPPORTUNITÉS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 cursor-pointer">
        {paginated.map((o, index) => (
          <motion.div
            key={o.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelected(o)}
            className={`relative bg-linear-to-br ${o.couleur} text-white p-4 md:p-6 rounded-2xl shadow-lg`}
          >
            {/* FAVORIS */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFav(o.id);
              }}
              className="absolute top-3 right-3"
            >
              {fav.includes(o.id) ? (
                <Heart className="text-red-500" fill="red" size={26} />
              ) : (
                <Heart size={26} />
              )}
            </button>

            <h2 className="text-lg md:text-xl font-bold">{o.titre}</h2>

            <div className="mt-2 md:mt-3 space-y-1 text-sm opacity-90">
              <p className="flex items-center gap-2">
                <Building2 size={16} /> {o.entreprise}
              </p>
              <p className="flex items-center gap-2">
                <MapPin size={16} /> {o.lieu}
              </p>
              <p className="flex items-center gap-2">
                <Briefcase size={16} /> Durée : {o.duree}
              </p>
            </div>

            <p className="mt-2 md:mt-4 text-sm opacity-80">{o.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Aucune opportunité */}
      {filtered.length === 0 && (
        <p className="text-center text-gray-500 mt-10 text-lg">
          Aucun stage trouvé.
        </p>
      )}

      {/* PAGINATION */}
      {filtered.length > 0 && (
        <div className="flex justify-center gap-2 md:gap-3 mt-8 items-center flex-wrap">
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

      {/* POPUP */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-4 md:p-6 max-w-lg w-full shadow-xl relative"
          >
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
              onClick={() => setSelected(null)}
            >
              <X size={26} />
            </button>

            <h2 className="text-xl md:text-2xl font-bold text-purple-600">
              {selected.titre}
            </h2>

            <p className="mt-2 md:mt-4 text-gray-800">{selected.description}</p>

            <div className="mt-4 md:mt-6 flex justify-end">
              <button className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700">
                Postuler maintenant
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
