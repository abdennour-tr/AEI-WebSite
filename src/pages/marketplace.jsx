import { useState } from "react";
import { Search, ShoppingCart, ChevronLeft, ChevronRight, Heart, LoaderCircle, MapPin, PackageOpen, PhoneCall, Plus, X } from "lucide-react";
import { motion as Motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import fallbackProducts from "../data/Produits";
import PageHeader from "@/components/PageHeader";
import { usePortalCollection } from "@/hooks/usePortalCollection";
import { marketplaceApi } from "@/services/portalApi";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import EmptyState from "@/components/EmptyState";
import ReportButton from "@/components/ReportButton";
import ImageUploadField from "@/components/ImageUploadField";
import { uploadPublicImages } from "@/services/storageApi";

const emptyProductForm = {
  title: "",
  description: "",
  category: "Informatique",
  city: "Berkane",
  item_condition: "Très bon état",
  price: "",
  contact_phone: "",
};

export default function MarketPlacePage() {
  const { data: produits, loading, error, setData } = usePortalCollection(
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
  const [publishOpen, setPublishOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [publishNotice, setPublishNotice] = useState("");
  const [productFiles, setProductFiles] = useState([]);
  const [form, setForm] = useState(emptyProductForm);

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

  const openPublish = () => {
    setForm(emptyProductForm);
    setProductFiles([]);
    setFormError("");
    setPublishNotice("");
    setPublishOpen(true);
  };

  const publishProduct = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const imageUrls = await uploadPublicImages("product-images", productFiles);
      await marketplaceApi.create({
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category,
        city: form.city.trim(),
        item_condition: form.item_condition,
        price: Number(form.price),
        contact_phone: form.contact_phone.trim(),
        image_urls: imageUrls,
        status: "active",
      });
      setPublishOpen(false);
      setPublishNotice("Votre produit a été transmis à l’administration. Il apparaîtra dans le Marketplace après validation.");
      setPage(1);
    } catch (submitError) {
      setFormError(submitError.message || "Impossible de publier le produit.");
    } finally {
      setSaving(false);
    }
  };
  const selectedImages = selectedProduct
    ? selectedProduct.image_urls?.length
      ? selectedProduct.image_urls
      : selectedProduct.img
        ? [selectedProduct.img]
        : []
    : [];

  return (
    <div className="portal-page">
      <PageHeader
        icon={ShoppingCart}
        eyebrow="Échanges entre étudiants"
        title="Marketplace étudiant"
        description="Achetez, vendez ou échangez du matériel simplement au sein de la communauté AEI."
      >
        <button type="button" onClick={openPublish} className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-400">
          <Plus className="h-4 w-4" /> Publier un produit
        </button>
      </PageHeader>

      {favoriteError && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {favoriteError}
        </p>
      )}

      {publishNotice && (
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold leading-6 text-emerald-800">
          <span>{publishNotice}</span>
          <button type="button" onClick={() => setPublishNotice("")} className="rounded-lg p-1 text-emerald-700 hover:bg-emerald-100" aria-label="Fermer le message"><X className="h-4 w-4" /></button>
        </div>
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
      {loading && <LoadingSkeleton cards={6} />}

      {error && !loading && (
        <EmptyState title="Marketplace indisponible" description="Les produits ne peuvent pas être chargés pour le moment. Actualisez la page dans quelques instants." />
      )}

      {!loading && !error && paginated.length > 0 && <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {paginated.map((p, index) => (
          <Motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="portal-card group"
          >
            <div className="relative h-52 overflow-hidden">
              {p.img ? <img
                src={p.img}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                alt={p.titre}
              /> : <div className="flex h-full items-center justify-center bg-gradient-to-br from-sky-100 to-slate-100 text-sky-700"><PackageOpen className="h-12 w-12" /></div>}
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

              <button type="button" onClick={() => setSelectedProduct(p)} className="portal-primary-button mt-5 w-full">
                <ShoppingCart size={18} />
                Voir le produit
              </button>
              <ReportButton contentType="product" contentId={p.id} title={p.titre} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-amber-700" />
            </div>
          </Motion.div>
        ))}
      </div>}

      {!loading && !error && paginated.length === 0 && (
        <EmptyState icon={ShoppingCart} title="Aucun produit ne correspond" description="Modifiez vos filtres ou publiez le premier produit de cette catégorie." />
      )}

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

      {selectedProduct && (
        <div className="portal-modal-backdrop" onMouseDown={() => setSelectedProduct(null)}>
          <section className="portal-modal max-w-3xl" role="dialog" aria-modal="true" aria-labelledby="product-details-title" onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setSelectedProduct(null)} className="absolute right-4 top-4 z-10 rounded-xl bg-white/90 p-2 text-slate-500 shadow hover:text-slate-900" aria-label="Fermer"><X className="h-5 w-5" /></button>
            {selectedImages.length ? (
              <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-2xl">
                {selectedImages.slice(0, 4).map((url, index) => <img key={url} src={url} alt={`${selectedProduct.titre} ${index + 1}`} className={`w-full object-cover ${index === 0 && selectedImages.length === 1 ? "col-span-2 h-72" : "h-40"}`} />)}
              </div>
            ) : <div className="flex h-48 items-center justify-center rounded-2xl bg-sky-50 text-sky-700"><PackageOpen className="h-14 w-14" /></div>}
            <div className="mt-6 pr-10">
              <span className="portal-badge">{selectedProduct.categorie}</span>
              <h2 id="product-details-title" className="mt-3 text-2xl font-black text-slate-950">{selectedProduct.titre}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{selectedProduct.description || "Aucune description supplémentaire."}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-400">Prix</p><p className="mt-1 text-xl font-black text-sky-700">{selectedProduct.prix} DH</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-400">État</p><p className="mt-1 font-bold text-slate-800">{selectedProduct.etat}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-400">Ville</p><p className="mt-1 flex items-center gap-1 font-bold text-slate-800"><MapPin className="h-4 w-4 text-sky-600" />{selectedProduct.ville}</p></div>
              </div>
              {selectedProduct.contact_phone ? (
                <a href={`tel:${selectedProduct.contact_phone.replace(/[^\d+]/g, "")}`} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-black text-white transition hover:bg-emerald-700">
                  <PhoneCall className="h-5 w-5" /> Appeler le vendeur · {selectedProduct.contact_phone}
                </a>
              ) : (
                <p className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-500">Numéro de contact non renseigné.</p>
              )}
              <ReportButton contentType="product" contentId={selectedProduct.id} title={selectedProduct.titre} className="portal-secondary-button mt-6 w-full" />
            </div>
          </section>
        </div>
      )}

      {publishOpen && (
        <div className="portal-modal-backdrop" onMouseDown={() => !saving && setPublishOpen(false)}>
          <section className="portal-modal max-w-2xl" role="dialog" aria-modal="true" aria-labelledby="product-form-title" onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setPublishOpen(false)} className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Fermer"><X className="h-5 w-5" /></button>
            <h2 id="product-form-title" className="pr-10 text-2xl font-black text-slate-950">Publier un produit</h2>
            <p className="mt-2 text-sm text-slate-500">Présentez clairement votre produit. Il sera soumis à la validation de l’équipe AEI.</p>
            <form onSubmit={publishProduct} className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2 text-sm font-bold text-slate-700">Titre<input required minLength={3} maxLength={180} className="portal-input mt-2" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Ordinateur portable étudiant" /></label>
              <label className="sm:col-span-2 text-sm font-bold text-slate-700">Description<textarea className="portal-input mt-2 min-h-28 resize-y" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Caractéristiques, accessoires inclus, raison de la vente…" /></label>
              <label className="text-sm font-bold text-slate-700">Catégorie<select className="portal-select mt-2" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
              <label className="text-sm font-bold text-slate-700">Ville<input required className="portal-input mt-2" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} /></label>
              <label className="text-sm font-bold text-slate-700">État<select className="portal-select mt-2" value={form.item_condition} onChange={(event) => setForm({ ...form, item_condition: event.target.value })}><option>Neuf</option><option>Comme neuf</option><option>Très bon état</option><option>Bon état</option><option>État correct</option></select></label>
              <label className="text-sm font-bold text-slate-700">Prix (DH)<input required type="number" min="0" step="1" className="portal-input mt-2" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></label>
              <label className="sm:col-span-2 text-sm font-bold text-slate-700">Numéro de téléphone<input required type="tel" autoComplete="tel" minLength={8} maxLength={24} pattern="[0-9+ ()-]{8,24}" className="portal-input mt-2" value={form.contact_phone} onChange={(event) => setForm({ ...form, contact_phone: event.target.value })} placeholder="+212 6 12 34 56 78" /><span className="mt-1 block text-xs font-normal text-slate-500">Visible uniquement par les membres connectés afin qu’ils puissent vous appeler.</span></label>
              <div className="sm:col-span-2"><ImageUploadField files={productFiles} onFilesChange={setProductFiles} maxFiles={6} label="Photos du produit" /></div>
              {formError && <p className="sm:col-span-2 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{formError}</p>}
              <div className="sm:col-span-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" className="portal-secondary-button" onClick={() => setPublishOpen(false)}>Annuler</button><button type="submit" className="portal-primary-button" disabled={saving}>{saving && <LoaderCircle className="h-4 w-4 animate-spin" />}Publier le produit</button></div>
            </form>
          </section>
        </div>
      )}

    </div>
  );
}
