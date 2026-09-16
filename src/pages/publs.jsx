import { useState } from "react";
import { motion as Motion } from "framer-motion";
import { Heart, X, ArrowRight, ChevronLeft, ChevronRight, LoaderCircle, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import fallbackAdvertisements from "../data/Publs";
import PageHeader from "@/components/PageHeader";
import { usePortalCollection } from "@/hooks/usePortalCollection";
import { advertisementsApi } from "@/services/portalApi";

export default function PublicitePage() {
  const { data: publicites, loading, error, setData } = usePortalCollection(
    advertisementsApi.list,
    fallbackAdvertisements
  );
  const [favoriteError, setFavoriteError] = useState("");
  const [selectedPub, setSelectedPub] = useState(null);
  const [page, setPage] = useState(1);

  const itemsPerPage = 6;
  const totalPages = Math.ceil(publicites.length / itemsPerPage);

  const favorites = publicites
    .filter((advertisement) => advertisement.isFavorite)
    .map((advertisement) => advertisement.id);

  const toggleFav = async (id) => {
    const wasFavorite =
      publicites.find((advertisement) => advertisement.id === id)?.isFavorite ?? false;
    const willBeFavorite = !wasFavorite;
    setFavoriteError("");
    setData((items) =>
      items.map((advertisement) =>
        advertisement.id === id
          ? { ...advertisement, isFavorite: willBeFavorite }
          : advertisement
      )
    );
    try {
      await advertisementsApi.setFavorite(id, willBeFavorite);
    } catch (toggleError) {
      setData((items) =>
        items.map((advertisement) =>
          advertisement.id === id
            ? { ...advertisement, isFavorite: wasFavorite }
            : advertisement
        )
      );
      setFavoriteError(toggleError.message || "Le favori n’a pas pu être enregistré.");
    }
  };

  const paginated = publicites.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="portal-page">
      <PageHeader
        icon={Megaphone}
        eyebrow="Découvertes"
        title="Publicités & bons plans"
        description="Découvrez les campagnes, services et offres sélectionnés pour la communauté étudiante."
      />

      {favoriteError && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {favoriteError}
        </p>
      )}

      {loading && (
        <div className="portal-empty flex items-center justify-center gap-2">
          <LoaderCircle className="h-5 w-5 animate-spin" /> Chargement des campagnes…
        </div>
      )}

      {error && !loading && (
        <div className="portal-empty text-rose-700">
          Impossible de charger les campagnes.
        </div>
      )}

      {!loading && !error && <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {paginated.map((pub, index) => (
          <Motion.div
            key={pub.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="portal-card group relative cursor-pointer"
            onClick={() => setSelectedPub(pub)}
          >
            <div className="h-48 w-full overflow-hidden">
              <img
                src={pub.image}
                alt={pub.titre}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="relative p-6">
              <h2 className="mb-2 text-lg font-bold text-slate-950">{pub.titre}</h2>
              <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                {pub.description}
              </p>

              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFav(pub.id);
                  }}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
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
                  className="portal-primary-button h-auto"
                >
                  Voir la campagne <ArrowRight size={18} />
                </Button>
              </div>
            </div>
          </Motion.div>
        ))}
      </div>}

      {!loading && !error && publicites.length === 0 && (
        <div className="portal-empty">Aucune campagne publiée pour le moment.</div>
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

      {/* MODAL PUBLICITÉ */}
      {selectedPub && (
        <div className="portal-modal-backdrop">
          <Motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="portal-modal max-w-2xl"
          >
            <button
              className="absolute right-4 top-4 rounded-lg bg-white/90 p-2 text-slate-500 shadow hover:text-slate-950"
              onClick={() => setSelectedPub(null)}
            >
              <X size={26} />
            </button>

            <img
              src={selectedPub.image}
              alt={selectedPub.titre}
              className="w-full h-64 object-cover rounded-2xl mb-6"
            />

            <h2 className="mb-4 text-2xl font-bold text-slate-950">{selectedPub.titre}</h2>
            <p className="mb-6 leading-7 text-slate-600">{selectedPub.description}</p>

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setSelectedPub(null)}>
                Fermer
              </Button>
              <Button
                className="portal-primary-button h-auto"
                variant="default"
                onClick={() => window.open(selectedPub.url, "_blank")}
              >
                Voir la campagne
              </Button>
            </div>
          </Motion.div>
        </div>
      )}
    </div>
  );
}
