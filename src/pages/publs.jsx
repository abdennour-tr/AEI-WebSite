import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, X, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import publicites from "../data/Publs";

export default function PublicitePage() {
  const [favorites, setFavorites] = useState([]);
  const [selectedPub, setSelectedPub] = useState(null);
  const [page, setPage] = useState(1);

  const itemsPerPage = 6;
  const totalPages = Math.ceil(publicites.length / itemsPerPage);

  const toggleFav = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const paginated = publicites.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="space-y-8 lg:p-6 md:p-4 p-2">
      {/* HEADER */}
      <header className="bg-linear-to-r from-sky-600 to-orange-500 text-white p-6 rounded-xl shadow-lg mb-10">
        <h1 className="text-3xl font-bold">
          Découvrez nos Publicités Innovantes
        </h1>
        <p className="text-white/90 mt-1">
          Explorez des campagnes créatives et engageantes conçues pour captiver
          votre audience.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {paginated.map((pub, index) => (
          <motion.div
            key={pub.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`relative rounded-3xl shadow-xl overflow-hidden cursor-pointer group bg-white hover:shadow-2xl transition-all`}
            onClick={() => setSelectedPub(pub)}
          >
            <div className="h-48 w-full overflow-hidden">
              <img
                src={pub.image}
                alt={pub.titre}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="p-6 bg-linear-to-t from-white via-white/80 to-transparent relative">
              <h2 className="text-xl font-bold mb-2">{pub.titre}</h2>
              <p className="text-gray-700 text-sm line-clamp-3">
                {pub.description}
              </p>

              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFav(pub.id);
                  }}
                  className="text-gray-400 hover:text-red-500 transition-transform hover:scale-110"
                >
                  <Heart
                    size={24}
                    className={
                      favorites.includes(pub.id)
                        ? "text-red-500 fill-red-500"
                        : ""
                    }
                  />
                </button>

                <Button
                  variant="default"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(pub.url, "_blank");
                  }}
                  className="flex items-center gap-2 bg-linear-to-r from-sky-500 to-blue-600"
                >
                  Voir la campagne <ArrowRight size={18} />
                </Button>
              </div>
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

      {/* MODAL PUBLICITÉ */}
      {selectedPub && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative"
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
              onClick={() => setSelectedPub(null)}
            >
              <X size={26} />
            </button>

            <img
              src={selectedPub.image}
              alt={selectedPub.titre}
              className="w-full h-64 object-cover rounded-2xl mb-6"
            />

            <h2 className="text-2xl font-bold mb-4">{selectedPub.titre}</h2>
            <p className="text-gray-700 mb-6">{selectedPub.description}</p>

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setSelectedPub(null)}>
                Fermer
              </Button>
              <Button
                className={"bg-linear-to-r from-sky-600 to-orange-500"}
                variant="default"
                onClick={() => window.open(selectedPub.url, "_blank")}
              >
                Voir la campagne
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
