import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import {
  ArrowRight,
  BellRing,
  BookOpen,
  Building2,
  Check,
  FolderGit2,
  Heart,
  LoaderCircle,
  MapPin,
  Megaphone,
  Search,
  ShoppingBag,
  Trash2,
  UsersRound,
} from "lucide-react";
import FavoriteCourses from "@/data/FavoriteCourses";
import { usePortalCollection } from "@/hooks/usePortalCollection";
import { favoritesApi } from "@/services/portalApi";

const fallbackFavorites = FavoriteCourses.map((course) => ({
  ...course,
  favoriteType: "course",
}));

const filters = [
  { value: "all", label: "Tous" },
  { value: "club", label: "Clubs" },
  { value: "project", label: "Projets" },
  { value: "course", label: "Cours" },
  { value: "advertisement", label: "Annonces" },
  { value: "product", label: "Produits" },
  { value: "housing", label: "Colocations" },
];

const typeMeta = {
  club: {
    label: "Club",
    icon: UsersRound,
    accent: "bg-violet-50 text-violet-700 ring-violet-100",
    button: "Découvrir le club",
    to: (item) => `/clubs/${item.id}`,
  },
  project: {
    label: "Projet",
    icon: FolderGit2,
    accent: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    button: "Voir le projet",
    to: (item) => `/projets/${item.id}`,
  },
  course: {
    label: "Cours",
    icon: BookOpen,
    accent: "bg-sky-50 text-sky-700 ring-sky-100",
    button: "Ouvrir le cours",
    to: () => "/cours",
  },
  advertisement: {
    label: "Annonce",
    icon: Megaphone,
    accent: "bg-amber-50 text-amber-700 ring-amber-100",
    button: "Voir l’annonce",
    to: () => "/publicites",
  },
  product: {
    label: "Produit",
    icon: ShoppingBag,
    accent: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    button: "Voir le produit",
    to: () => "/marketplace",
  },
  housing: {
    label: "Colocation",
    icon: Building2,
    accent: "bg-rose-50 text-rose-700 ring-rose-100",
    button: "Voir l’annonce",
    to: () => "/colocation",
  },
};

const formatUpdateDate = (value) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const getTitle = (item) => item.name || item.titre || item.title || "Favori";
const getImage = (item) =>
  item.image || item.img || item.cover || item.cover_url || item.screenshot_urls?.[0] || "";

function FavoriteCard({ item, index, onRemove }) {
  const meta = typeMeta[item.favoriteType];
  const TypeIcon = meta.icon;
  const title = getTitle(item);
  const image = getImage(item);
  const internalTarget = meta.to(item);
  const externalTarget =
    item.favoriteType === "course" && item.pdf
      ? item.pdf
      : item.favoriteType === "advertisement" && item.url
        ? item.url
        : null;

  return (
    <Motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.035 }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg"
    >
      {image && (
        <div className="h-40 overflow-hidden bg-slate-100">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <span
            className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold ring-1 ${meta.accent}`}
          >
            <TypeIcon className="h-4 w-4" /> {meta.label}
          </span>
          <button
            type="button"
            onClick={() => onRemove(item)}
            aria-label={`Retirer ${title} des favoris`}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <h2 className="mt-4 text-lg font-bold text-slate-950">{title}</h2>

        {item.favoriteType === "club" && (
          <p className="mt-2 text-sm font-semibold leading-6 text-violet-700">
            {item.tagline}
          </p>
        )}
        {item.favoriteType === "course" && (
          <p className="mt-2 text-sm text-slate-600">
            {item.niveau} · {item.categorie}
          </p>
        )}
        {item.favoriteType === "project" && (
          <p className="mt-2 text-sm text-slate-600">
            {item.field_of_study || "Projet étudiant"} · {item.academic_year || "Année non précisée"}
          </p>
        )}
        {(item.favoriteType === "product" || item.favoriteType === "housing") && (
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {item.ville}
            </span>
            <strong className="text-base text-sky-700">
              {item.prix} DH{item.favoriteType === "housing" ? " / mois" : ""}
            </strong>
          </div>
        )}

        {(item.description || item.desc) && (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
            {item.description || item.desc}
          </p>
        )}

        <div className="mt-auto pt-5">
          {externalTarget ? (
            <a
              href={externalTarget}
              target="_blank"
              rel="noreferrer"
              className="portal-primary-button w-full"
            >
              {meta.button} <ArrowRight className="h-4 w-4" />
            </a>
          ) : (
            <Link to={internalTarget} className="portal-primary-button w-full">
              {meta.button} <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </Motion.article>
  );
}

export default function FavoritePage() {
  const requestedFilter = new URLSearchParams(window.location.search).get("categorie");
  const initialFilter = filters.some((filter) => filter.value === requestedFilter)
    ? requestedFilter
    : "all";
  const {
    data: favorites,
    loading,
    error,
    setData,
    reload,
  } = usePortalCollection(favoritesApi.list, fallbackFavorites);
  const [updates, setUpdates] = useState([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [actionError, setActionError] = useState("");

  const loadUpdates = async () => {
    try {
      setUpdates(await favoritesApi.listUpdates());
    } catch {
      setUpdates([]);
    }
  };

  useEffect(() => {
    let active = true;
    let unsubscribe = () => undefined;
    const refresh = () => {
      reload();
      loadUpdates();
    };

    loadUpdates();
    favoritesApi
      .subscribe(() => active && refresh())
      .then((cleanup) => {
        if (active) unsubscribe = cleanup;
        else cleanup();
      })
      .catch(() => undefined);
    window.addEventListener("aei:favorites-changed", refresh);

    return () => {
      active = false;
      unsubscribe();
      window.removeEventListener("aei:favorites-changed", refresh);
    };
  }, [reload]);

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
    const searchable = `${getTitle(item)} ${item.description || item.desc || ""} ${
      item.categorie || item.category || ""
    } ${item.tech || ""} ${item.ville || ""}`.toLocaleLowerCase("fr");
    return (
      (activeFilter === "all" || item.favoriteType === activeFilter) &&
      searchable.includes(search.trim().toLocaleLowerCase("fr"))
    );
  });

  const unreadUpdates = updates.filter((update) => !update.read_at).length;

  const removeFavorite = async (item) => {
    const snapshot = favorites;
    setActionError("");
    setData((current) =>
      current.filter(
        (favorite) =>
          !(favorite.id === item.id && favorite.favoriteType === item.favoriteType)
      )
    );
    try {
      await favoritesApi.remove(item);
    } catch (removeError) {
      setData(snapshot);
      setActionError(removeError.message || "Le favori n’a pas pu être supprimé.");
    }
  };

  const markUpdateRead = async (update) => {
    if (update.read_at) return;
    const readAt = new Date().toISOString();
    setUpdates((items) =>
      items.map((item) => (item.id === update.id ? { ...item, read_at: readAt } : item))
    );
    try {
      await favoritesApi.markUpdateRead(update.id);
    } catch {
      setUpdates((items) =>
        items.map((item) => (item.id === update.id ? { ...item, read_at: null } : item))
      );
    }
  };

  return (
    <div className="portal-page">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-7 text-white shadow-xl sm:px-8 sm:py-9">
        <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-sky-500/15 blur-3xl" />
        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-300" /> Synchronisé avec Supabase
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Mes favoris</h1>
            <p className="mt-3 text-base leading-7 text-slate-300">
              Votre sélection personnelle de clubs, projets, cours, annonces, produits et colocations.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-72">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-3xl font-bold">{favorites.length}</p>
              <p className="mt-1 text-sm text-slate-400">éléments enregistrés</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-3xl font-bold text-sky-300">{unreadUpdates}</p>
              <p className="mt-1 text-sm text-slate-400">mises à jour à lire</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Catégories de favoris" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {filters.slice(1).map((filter) => {
          const meta = typeMeta[filter.value];
          const TypeIcon = meta.icon;
          const active = activeFilter === filter.value;
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={`rounded-2xl border p-4 text-left transition ${
                active
                  ? "border-sky-400 bg-sky-50 shadow-md shadow-sky-100"
                  : "border-slate-200 bg-white hover:border-sky-200 hover:shadow-sm"
              }`}
            >
              <span className={`inline-flex rounded-xl p-2.5 ring-1 ${meta.accent}`}>
                <TypeIcon className="h-5 w-5" />
              </span>
              <span className="mt-4 block text-2xl font-bold text-slate-950">
                {counts[filter.value] || 0}
              </span>
              <span className="mt-0.5 block text-sm font-semibold text-slate-500">
                {filter.label}
              </span>
            </button>
          );
        })}
      </section>

      {actionError && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {actionError}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem] xl:items-start">
        <section className="space-y-5">
          <div className="portal-panel flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-xl">
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
              <input
                className="portal-input pl-11"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher dans toute votre sélection…"
              />
            </div>
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                activeFilter === "all"
                  ? "bg-sky-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Afficher tout
            </button>
          </div>

          {loading && (
            <div className="portal-empty flex items-center justify-center gap-2">
              <LoaderCircle className="h-5 w-5 animate-spin" /> Synchronisation des favoris…
            </div>
          )}

          {error && !loading && (
            <div className="portal-empty text-rose-700">
              Impossible de charger vos favoris. Vérifiez que le module Supabase est activé.
            </div>
          )}

          {!loading && !error && filteredFavorites.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2">
              {filteredFavorites.map((item, index) => (
                <FavoriteCard
                  key={`${item.favoriteType}-${item.id}`}
                  item={item}
                  index={index}
                  onRemove={removeFavorite}
                />
              ))}
            </div>
          )}

          {!loading && !error && filteredFavorites.length === 0 && (
            <div className="portal-empty">
              <Heart className="mx-auto h-7 w-7 text-slate-300" />
              <p className="mt-3 font-bold text-slate-800">Aucun favori dans cette sélection</p>
              <p className="mt-1 text-sm text-slate-500">
                Utilisez le cœur présent sur les fiches pour construire votre collection.
              </p>
            </div>
          )}
        </section>

        <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-5">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-amber-50 p-2.5 text-amber-700">
                  <BellRing className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-bold text-slate-950">Mises à jour</h2>
                  <p className="text-sm text-slate-500">Contenus que vous suivez</p>
                </div>
              </div>
              {unreadUpdates > 0 && (
                <span className="rounded-full bg-sky-600 px-2.5 py-1 text-xs font-bold text-white">
                  {unreadUpdates}
                </span>
              )}
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {updates.map((update) => (
              <button
                key={update.id}
                type="button"
                onClick={() => markUpdateRead(update)}
                className={`w-full px-5 py-4 text-left transition hover:bg-slate-50 ${
                  update.read_at ? "bg-white" : "bg-sky-50/60"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      update.read_at
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-sky-600 text-white"
                    }`}
                  >
                    {update.read_at ? <Check className="h-3.5 w-3.5" /> : <BellRing className="h-3.5 w-3.5" />}
                  </span>
                  <span>
                    <span className="block text-sm font-bold leading-5 text-slate-900">
                      {update.title}
                    </span>
                    {update.body && (
                      <span className="mt-1 block text-sm leading-5 text-slate-600">
                        {update.body}
                      </span>
                    )}
                    <span className="mt-2 block text-xs font-semibold text-slate-400">
                      {formatUpdateDate(update.created_at)}
                    </span>
                  </span>
                </div>
              </button>
            ))}
            {updates.length === 0 && (
              <div className="px-5 py-8 text-center">
                <BellRing className="mx-auto h-6 w-6 text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-600">
                  Aucune mise à jour pour le moment.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
