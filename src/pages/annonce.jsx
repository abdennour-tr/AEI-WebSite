import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import annonces from "../data/Annonces";

export default function MyAnnoncePage() {
  const itemsPerPage = 6;
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(annonces.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const displayedAnnonces = annonces.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="space-y-8 lg:p-6 md:p-4 p-2">
      <div>
        <header className="bg-linear-to-r from-sky-600 to-orange-500 text-white p-6 rounded-xl shadow-lg mb-10">
          <h1 className="text-3xl font-bold">Mes annonces de colocation</h1>
          <p className="text-white/90 mt-1">
            Retrouvez ici toutes les annonces que vous avez publiées.
          </p>
        </header>
      </div>

      <div className="flex justify-end">
        <button className="bg-linear-to-r from-green-500 to-emerald-600 text-white px-5 py-3 rounded-lg shadow-md transition-transform hover:scale-105">
          + Publier une annonce
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {displayedAnnonces.map((annonce, index) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            key={annonce.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
          >
            <img
              src={annonce.image}
              alt={annonce.titre}
              className="w-full h-48 object-cover"
            />

            <div className="p-5 space-y-3">
              <h2 className="text-xl font-semibold text-gray-900">
                {annonce.titre}
              </h2>
              <p className="text-sky-700 font-bold">{annonce.prix}</p>

              <span className="inline-block bg-sky-100 text-sky-700 text-sm px-3 py-1 rounded-full">
                {annonce.ville}
              </span>

              <p className="text-gray-600 text-sm">{annonce.description}</p>

              {/* BTN EDIT + DELETE */}
              <div className="flex justify-between pt-3">
                <button className="text-sky-600 hover:underline text-sm">
                  Modifier
                </button>
                <button className="text-red-500 hover:underline text-sm">
                  Supprimer
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* AUCUNE ANNONCE */}
      {annonces.length === 0 && (
        <div className="text-center text-gray-500 mt-10 text-lg">
          Vous n'avez encore publié aucune annonce.
        </div>
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
