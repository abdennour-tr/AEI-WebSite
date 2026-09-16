import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Download,
  Heart,
  LoaderCircle,
  MapPin,
  Megaphone,
  Search,
  Trash2,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import FavoriteCourses from "@/data/FavoriteCourses";
import { usePortalCollection } from "@/hooks/usePortalCollection";
import { favoritesApi } from "@/services/portalApi";

const fallbackFavorites = FavoriteCourses.map((course) => ({
  ...course,
  favoriteType: "course",
}));

const filters = [
  { value: "all", label: "Tous" },
  { value: "course", label: "Cours" },
  { value: "opportunity", label: "Opportunités" },
  { value: "advertisement", label: "Bons plans" },
];

const typeMeta = {
  course: {
    label: "Cours",
    icon: BookOpen,
    accent: "bg-sky-50 text-sky-700",
  },
  opportunity: {
    label: "Opportunité",
    icon: Briefcase,
    accent: "bg-indigo-50 text-indigo-700",
  },
  advertisement: {
    label: "Bon plan",
    icon: Megaphone,
    accent: "bg-amber-50 text-amber-700",
  },
};

export default function FavoritePage() {
  const { data: favorites, loading, error, setData } = usePortalCollection(
    favoritesApi.list,
    fallbackFavorites
  );
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [actionError, setActionError] = useState("");

  const counts = useMemo(
    () =>
      favorites.reduce(
        (result, item) => ({
          ...result,
          [item.favoriteType]: (result[item.favoriteType] || 0) + 1,
        }),
        {}
      ),
    [favorites]
  );

  const filteredFavorites = favorites.filter((item) => {
    const searchable = `${item.titre || item.title || ""} ${
      item.description || ""
    } ${item.entreprise || ""} ${item.categorie || ""}`.toLowerCase();
    return (
      (activeFilter === "all" || item.favoriteType === activeFilter) &&
      searchable.includes(search.toLowerCase())
    );
  });

  const removeFavorite = async (item) => {
    const snapshot = favorites;
    setActionError("");
    setData((current) =>
      current.filter(
        (favorite) =>
          !(
            favorite.id === item.id &&
            favorite.favoriteType === item.favoriteType
          )
      )
    );

    try {
      await favoritesApi.remove(item);
    } catch (removeError) {
      setData(snapshot);
      setActionError(
        removeError.message || "Le favori n’a pas pu être supprimé."
      );
    }
  };

  return (
    <div className="portal-page">
      <PageHeader
        icon={Heart}
        eyebrow="Ma sélection"
        title="Mes favoris"
        description="Retrouvez au même endroit vos cours, opportunités et bons plans enregistrés."
      />

      <section className="grid gap-3 sm:grid-cols-3">
        {filters.slice(1).map((filter) => {
          const meta = typeMeta[filter.value];
          const TypeIcon = meta.icon;
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${
                activeFilter === filter.value
                  ? "border-sky-300 bg-sky-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-sky-200"
              }`}
            >
              <span>
                <span className="block text-sm font-semibold text-slate-600">
                  {filter.label}
                </span>
                <span className="mt-1 block text-2xl font-bold text-slate-950">
                  {counts[filter.value] || 0}
                </span>
              </span>
              <span className={`rounded-xl p-3 ${meta.accent}`}>
                <TypeIcon className="h-5 w-5" />
              </span>
            </button>
          );
        })}
      </section>

      <section className="portal-panel flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            className="portal-input pl-10"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher dans mes favoris…"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                activeFilter === filter.value
                  ? "bg-sky-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      {actionError && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {actionError}
        </p>
      )}

      {loading && (
        <div className="portal-empty flex items-center justify-center gap-2">
          <LoaderCircle className="h-5 w-5 animate-spin" /> Chargement des favoris…
        </div>
      )}

      {error && !loading && (
        <div className="portal-empty text-rose-700">
          Impossible de charger vos favoris.
        </div>
      )}

      {!loading && !error && filteredFavorites.length > 0 && (
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredFavorites.map((item, index) => {
            const meta = typeMeta[item.favoriteType];
            const TypeIcon = meta.icon;
            const title = item.titre || item.title;

            return (
              <Motion.article
                key={`${item.favoriteType}-${item.id}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="portal-card flex h-full flex-col overflow-hidden"
              >
                {item.favoriteType === "advertisement" && item.image && (
                  <img
                    src={item.image}
                    alt={title}
                    className="h-40 w-full object-cover"
                  />
                )}

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold ${meta.accent}`}
                    >
                      <TypeIcon className="h-4 w-4" /> {meta.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFavorite(item)}
                      aria-label={`Retirer ${title} des favoris`}
                      className="rounded-lg p-2 text-rose-500 transition hover:bg-rose-50 hover:text-rose-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <h2 className="mt-4 text-lg font-bold text-slate-950">
                    {title}
                  </h2>

                  {item.favoriteType === "course" && (
                    <p className="mt-2 text-sm text-slate-600">
                      {item.niveau} · {item.categorie}
                    </p>
                  )}

                  {item.favoriteType === "opportunity" && (
                    <div className="mt-2 space-y-1.5 text-sm text-slate-600">
                      <p>{item.entreprise}</p>
                      <p className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" /> {item.lieu}
                      </p>
                    </div>
                  )}

                  {item.description && (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                      {item.description}
                    </p>
                  )}

                  <div className="mt-auto pt-5">
                    {item.favoriteType === "course" && item.pdf && (
                      <a href={item.pdf} download className="portal-primary-button w-full">
                        <Download className="h-4 w-4" /> Télécharger le cours
                      </a>
                    )}
                    {item.favoriteType === "opportunity" && (
                      <Link
                        to="/stages-opportunites"
                        className="portal-primary-button w-full"
                      >
                        Voir les opportunités <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                    {item.favoriteType === "advertisement" && (
                      <a
                        href={item.url || "/publicites"}
                        target={item.url ? "_blank" : undefined}
                        rel={item.url ? "noreferrer" : undefined}
                        className="portal-primary-button w-full"
                      >
                        Voir le bon plan <ArrowRight className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </Motion.article>
            );
          })}
        </section>
      )}

      {!loading && !error && filteredFavorites.length === 0 && (
        <div className="portal-empty">
          Aucun favori ne correspond à cette sélection.
        </div>
      )}
    </div>
  );
}
