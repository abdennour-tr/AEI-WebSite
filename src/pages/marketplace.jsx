import { useState } from "react";
import { Search, ShoppingCart, ChevronLeft, ChevronRight, Heart, Plus } from "lucide-react";
import { motion as Motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import fallbackProducts from "../data/Produits";
import PageHeader from "@/components/PageHeader";
import { usePortalCollection } from "@/hooks/usePortalCollection";
import { marketplaceApi } from "@/services/portalApi";

export default function MarketPlacePage() {
  const { data: produits, setData } = usePortalCollection(
    marketplaceApi.list,
    fallbackProducts
  );
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
  const [favoriteError, setFavoriteError] = useState("");

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

  const toggleFavorite = async (product) => {
    const previous = Boolean(product.isFavorite);
    setFavoriteError("");
    setData((items) =>
      items.map((item) =>
        item.id === product.id ? { ...item, isFavorite: !previous } : item
      )
    );
    try {
      await marketplaceApi.setFavorite(product.id, !previous);
    } catch (error) {
      setData((items) =>
        items.map((item) =>
          item.id === product.id ? { ...item, isFavorite: previous } : item
        )
      );
      setFavoriteError(error.message || "Le favori n’a pas pu être enregistré.");
    }
  };

  return (
    <div className="portal-page">
      <PageHeader
        icon={ShoppingCart}
        eyebrow="Échanges entre étudiants"
        title="Marketplace étudiant"
        description="Achetez, vendez ou échangez du matériel simplement au sein de la communauté AEI."
      >
        <button className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-400">
          <Plus className="h-4 w-4" /> Publier un produit
        </button>
      </PageHeader>

      {favoriteError && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {favoriteError}
        </p>
      )}

      {/* FILTRES */}
      <div className="portal-panel">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher..."
              className="portal-input pl-10"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
          </div>

          <select
            className="portal-select"
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
            className="portal-select"
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
            className="portal-select"
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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {paginated.map((p, index) => (
          <Motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="portal-card group"
          >
            <div className="relative h-52 overflow-hidden">
              <img
                src={p.img}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                alt=""
              />
              <button
                type="button"
                onClick={() => toggleFavorite(p)}
                className={`absolute right-4 top-4 rounded-xl p-2.5 shadow-lg backdrop-blur transition ${
                  p.isFavorite
                    ? "bg-rose-500 text-white"
                    : "bg-white/90 text-slate-600 hover:text-rose-600"
                }`}
                aria-label={p.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <Heart className={`h-5 w-5 ${p.isFavorite ? "fill-current" : ""}`} />
              </button>
            </div>

            <div className="p-5 sm:p-6">
              <h2 className="mb-1 text-lg font-bold text-slate-950">
                {p.titre}
              </h2>

              <p className="mb-3 text-sm text-slate-500">
                {p.ville}
              </p>

              <span className="portal-badge">
                {p.categorie}
              </span>

              <p className="mt-4 text-sm text-slate-600">{p.etat}</p>

              <div className="mt-2 text-2xl font-bold text-sky-700">
                {p.prix} DH
              </div>

              <p className="mt-1 text-xs text-slate-500">{p.date}</p>

              <button className="portal-primary-button mt-5 w-full">
                <ShoppingCart size={18} />
                Voir le produit
              </button>
            </div>
          </Motion.div>
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

    </div>
  );
}
