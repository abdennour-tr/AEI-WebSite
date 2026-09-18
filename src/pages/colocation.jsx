import { useState } from "react";
import { motion as Motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Building2, ChevronLeft, ChevronRight, Clock3, Heart, MapPin, Plus } from "lucide-react";
import fallbackAnnonces from "@/data/Colocation";
import PageHeader from "@/components/PageHeader";
import { usePortalCollection } from "@/hooks/usePortalCollection";
import { housingApi } from "@/services/portalApi";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import EmptyState from "@/components/EmptyState";
import ReportButton from "@/components/ReportButton";

export default function ColocationPage() {
  const { data: annoncesData, loading, error, setData } = usePortalCollection(
    housingApi.list,
    fallbackAnnonces
  );
  const villes = [...new Set(annoncesData.map((annD) => annD.ville))];

  // STATES FILTRES
  const [ville, setVille] = useState("");
  const [prix, setPrix] = useState("");
  const [date, setDate] = useState("");
  const [favoriteError, setFavoriteError] = useState("");

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

  const toggleFavorite = async (listing) => {
    const previous = Boolean(listing.isFavorite);
    setFavoriteError("");
    setData((items) =>
      items.map((item) =>
        item.id === listing.id ? { ...item, isFavorite: !previous } : item
      )
    );
    try {
      await housingApi.setFavorite(listing.id, !previous);
    } catch (error) {
      setData((items) =>
        items.map((item) =>
          item.id === listing.id ? { ...item, isFavorite: previous } : item
        )
      );
      setFavoriteError(error.message || "Le favori n’a pas pu être enregistré.");
    }
  };

  return (
    <div className="portal-page">
      <PageHeader
        icon={Building2}
        eyebrow="Logement étudiant"
        title="Annonces de colocation"
        description="Trouvez un logement adapté à votre budget et proche de votre campus."
      >
        <button className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-400">
          <Plus className="h-4 w-4" /> Publier une annonce
        </button>
      </PageHeader>

      {favoriteError && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {favoriteError}
        </p>
      )}

      {/* FILTRES */}
      <div className="portal-panel flex flex-col gap-5 md:flex-row md:items-end">
        <div className="flex flex-col w-full md:w-1/3">
          <label className="mb-2 text-sm font-bold text-slate-700">
            Emplacement
          </label>
          <select
            onChange={(e) => {
              setVille(e.target.value);
              setPage(1);
            }}
            className="portal-select"
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
          <label className="mb-2 text-sm font-bold text-slate-700">Prix</label>
          <select
            onChange={(e) => {
              setPrix(e.target.value);
              setPage(1);
            }}
            className="portal-select"
          >
            <option value="">Par défaut</option>
            <option value="asc">Prix croissant</option>
            <option value="desc">Prix décroissant</option>
          </select>
        </div>

        <div className="flex flex-col w-full md:w-1/3">
          <label className="mb-2 text-sm font-bold text-slate-700">
            Date de publication
          </label>
          <select
            onChange={(e) => {
              setDate(e.target.value);
              setPage(1);
            }}
            className="portal-select"
          >
            <option value="">Par défaut</option>
            <option value="recent">Plus récent</option>
            <option value="old">Plus ancien</option>
          </select>
        </div>
      </div>

      {/* GRID ANNONCES */}
      {loading && <LoadingSkeleton cards={6} />}

      {error && !loading && (
        <EmptyState title="Les colocations sont indisponibles" description="Les annonces ne peuvent pas être chargées pour le moment. Réessayez dans quelques instants." />
      )}

      {!loading && !error && annonces.length > 0 && <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {annonces.map((annonce, index) => (
          <Motion.div
            key={annonce.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="portal-card"
          >
            <div className="relative h-48 w-full overflow-hidden">
              <img
                src={annonce.cover}
                className="w-full h-full object-cover"
                alt="cover"
              />
              <button
                type="button"
                onClick={() => toggleFavorite(annonce)}
                className={`absolute right-4 top-4 rounded-xl p-2.5 shadow-lg backdrop-blur transition ${
                  annonce.isFavorite
                    ? "bg-rose-500 text-white"
                    : "bg-white/90 text-slate-600 hover:text-rose-600"
                }`}
                aria-label={annonce.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <Heart className={`h-5 w-5 ${annonce.isFavorite ? "fill-current" : ""}`} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={annonce.avatar}
                  className="w-12 h-12 rounded-full border border-gray-300 shadow-sm"
                  alt="avatar"
                />
                <div>
                  <h2 className="text-base font-bold text-slate-950">
                    {annonce.nom}
                  </h2>
                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                    <MapPin className="h-3.5 w-3.5" /> {annonce.ville}
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <span className="portal-badge">
                  {annonce.type}
                </span>
              </div>

              <p className="mb-4 text-sm leading-6 text-slate-600">
                {annonce.desc}
              </p>

              <div className="mb-2 text-xl font-bold text-sky-700">
                {annonce.prix} DH / mois
              </div>

              <p className="flex items-center gap-1.5 text-sm text-slate-500">
                <Clock3 className="h-4 w-4" /> Il y a {annonce.posted} jours
              </p>

              <button className="portal-primary-button mt-5 w-full">
                Voir l’annonce
              </button>
              <ReportButton contentType="housing" contentId={annonce.id} title={annonce.titre} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-amber-700" />
            </div>
          </Motion.div>
        ))}
      </div>}

      {!loading && !error && annonces.length === 0 && (
        <EmptyState icon={Building2} title="Aucune colocation ne correspond" description="Changez la ville ou le tri, ou publiez une annonce pour aider la communauté." />
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
