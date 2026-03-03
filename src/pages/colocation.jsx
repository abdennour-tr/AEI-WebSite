import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import annoncesData from "@/data/Colocation";

export default function ColocationPage() {
  const villes = annoncesData.map((annD) => annD.ville);

  // STATES FILTRES
  const [ville, setVille] = useState("");
  const [prix, setPrix] = useState("");
  const [date, setDate] = useState("");

  // PAGINATION
  const [page, setPage] = useState(1);
  const perPage = 6;

  // APPLICATION DES FILTRES
  const annoncesFiltres = annoncesData
    .filter((a) => (ville ? a.ville === ville : true))
    .sort((a, b) => {
      if (prix === "asc") return a.prix - b.prix;
      if (prix === "desc") return b.prix - a.prix;

      if (date === "recent") return a.posted - b.posted;
      if (date === "old") return b.posted - a.posted;

      return 0;
    });

  const totalPages = Math.ceil(annoncesFiltres.length / perPage);
  const annonces = annoncesFiltres.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-8 lg:p-6 md:p-4 p-2">
      <header className=" bg-linear-to-r from-sky-600 to-orange-500 text-white p-6 rounded-xl shadow-lg mb-10">
        <h1 className="text-3xl font-bold">Annonces de Colocation</h1>
        <p className="text-white/90 mt-1">
          Explorez les annonces postées par les étudiants.
        </p>
      </header>

      {/* FILTRES */}
      <div className="bg-white p-6 rounded-2xl shadow-md mb-10 flex flex-col gap-6 md:flex-row md:items-center md:gap-10">
        <div className="flex flex-col w-full md:w-1/3">
          <label className="text-gray-700 font-semibold mb-1">
            Emplacement
          </label>
          <select
            onChange={(e) => {
              setVille(e.target.value);
              setPage(1);
            }}
            className="border rounded-xl px-4 py-2"
          >
            <option value="">Toutes les villes</option>
            {villes.map((v, index) => (
              <option key={index} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col w-full md:w-1/3">
          <label className="text-gray-700 font-semibold mb-1">Prix</label>
          <select
            onChange={(e) => {
              setPrix(e.target.value);
              setPage(1);
            }}
            className="border rounded-xl px-4 py-2"
          >
            <option value="">Par défaut</option>
            <option value="asc">Prix croissant</option>
            <option value="desc">Prix décroissant</option>
          </select>
        </div>

        <div className="flex flex-col w-full md:w-1/3">
          <label className="text-gray-700 font-semibold mb-1">
            Date de publication
          </label>
          <select
            onChange={(e) => {
              setDate(e.target.value);
              setPage(1);
            }}
            className="border rounded-xl px-4 py-2"
          >
            <option value="">Par défaut</option>
            <option value="recent">Plus récent</option>
            <option value="old">Plus ancien</option>
          </select>
        </div>
      </div>

      {/* GRID ANNONCES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {annonces.map((annonce, index) => (
          <motion.div
            key={annonce.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="h-48 w-full overflow-hidden">
              <img
                src={annonce.cover}
                className="w-full h-full object-cover"
                alt="cover"
              />
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={annonce.avatar}
                  className="w-12 h-12 rounded-full border border-gray-300 shadow-sm"
                  alt="avatar"
                />
                <div>
                  <h2 className="font-semibold text-gray-900 text-lg">
                    {annonce.nom}
                  </h2>
                  <p className="text-gray-500 text-sm">📍 {annonce.ville}</p>
                </div>
              </div>

              <div className="mb-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                  {annonce.type}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {annonce.desc}
              </p>

              <div className="text-xl font-bold text-blue-600 mb-2">
                {annonce.prix} DH / mois
              </div>

              <p className="text-sm text-gray-500 flex items-center gap-1">
                🕒 Il y a {annonce.posted} jours
              </p>

              <button className="mt-5 w-full bg-linear-to-r from-sky-500 to-blue-600 text-white py-2 rounded-xl font-semibold hover:opacity-90 transition">
                Voir l’annonce
              </button>
            </div>
          </motion.div>
        ))}
      </div>

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

      {/* Bouton publier */}
      <div className="flex justify-end mt-12">
        <button className="bg-linear-to-r from-green-500 to-emerald-600 text-white px-7 py-3 rounded-2xl font-semibold hover:opacity-90 transition shadow-lg">
          Publier une annonce
        </button>
      </div>
    </div>
  );
}
