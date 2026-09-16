import { useState } from "react";
import { motion as Motion } from "framer-motion";
import {
  Search,
  MapPin,
  Briefcase,
  Building2,
  X,
  Heart,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import fallbackOpportunities from "../data/Stage";
import PageHeader from "@/components/PageHeader";
import { usePortalCollection } from "@/hooks/usePortalCollection";
import { opportunitiesApi } from "@/services/portalApi";

export default function StagePage() {
  const { data: offres, loading, error, setData } = usePortalCollection(
    opportunitiesApi.list,
    fallbackOpportunities
  );
  const [search, setSearch] = useState("");
  const [ville, setVille] = useState("Toutes");
  const [duree, setDuree] = useState("Toutes");
  const [selected, setSelected] = useState(null);
  const [favoriteError, setFavoriteError] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 6;

  const fav = offres.filter((offer) => offer.isFavorite).map((offer) => offer.id);

  const toggleFav = async (id) => {
    const wasFavorite = offres.find((offer) => offer.id === id)?.isFavorite ?? false;
    const willBeFavorite = !wasFavorite;
    setFavoriteError("");
    setData((items) =>
      items.map((offer) =>
        offer.id === id ? { ...offer, isFavorite: willBeFavorite } : offer
      )
    );
    try {
      await opportunitiesApi.setFavorite(id, willBeFavorite);
    } catch (toggleError) {
      setData((items) =>
        items.map((offer) =>
          offer.id === id ? { ...offer, isFavorite: wasFavorite } : offer
        )
      );
      setFavoriteError(toggleError.message || "Le favori n’a pas pu être enregistré.");
    }
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
    <div className="portal-page">
      <PageHeader
        icon={Briefcase}
        eyebrow="Carrière"
        title="Stages & Opportunités"
        description="Découvrez des expériences qui correspondent à votre parcours et préparez votre avenir professionnel."
      />

      {/* FILTRE */}
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="portal-panel flex flex-col items-center justify-between gap-4 md:flex-row"
      >
        <div className="relative w-full md:w-1/2">
          <input
            className="portal-input pl-10"
            placeholder="Rechercher un stage..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <Search
            size={20}
            className="absolute left-3 top-3 text-slate-400"
          />
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <select
            className="portal-select"
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
            className="portal-select"
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
            className="portal-secondary-button w-full"
          >
            Réinitialiser
          </button>
        </div>
      </Motion.div>

      {favoriteError && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {favoriteError}
        </p>
      )}

      {loading && (
        <div className="portal-empty flex items-center justify-center gap-2">
          <LoaderCircle className="h-5 w-5 animate-spin" /> Chargement des opportunités…
        </div>
      )}

      {error && !loading && (
        <div className="portal-empty text-rose-700">
          Impossible de charger les opportunités.
        </div>
      )}

      {/* LISTE DES OPPORTUNITÉS */}
      {!loading && !error && <div className="grid cursor-pointer grid-cols-1 gap-5 md:grid-cols-2">
        {paginated.map((o, index) => (
          <Motion.div
            key={o.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelected(o)}
            className="portal-card relative p-6"
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
                <Heart className="text-rose-500" fill="currentColor" size={23} />
              ) : (
                <Heart className="text-slate-300" size={23} />
              )}
            </button>

            <h2 className="pr-8 text-lg font-bold text-slate-950">{o.titre}</h2>

            <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
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

            <p className="mt-4 text-sm leading-6 text-slate-600">{o.description}</p>
          </Motion.div>
        ))}
      </div>}

      {/* Aucune opportunité */}
      {!loading && !error && filtered.length === 0 && (
        <p className="portal-empty text-base">
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
        <div className="portal-modal-backdrop">
          <Motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="portal-modal"
          >
            <button
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
              onClick={() => setSelected(null)}
            >
              <X size={26} />
            </button>

            <h2 className="pr-10 text-xl font-bold text-slate-950 sm:text-2xl">
              {selected.titre}
            </h2>

            <p className="mt-4 leading-7 text-slate-600">{selected.description}</p>

            <div className="mt-4 md:mt-6 flex justify-end">
              <button className="portal-primary-button">
                Postuler maintenant
              </button>
            </div>
          </Motion.div>
        </div>
      )}
    </div>
  );
}
