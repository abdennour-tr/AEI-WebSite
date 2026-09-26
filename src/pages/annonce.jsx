import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Home,
  LoaderCircle,
  PackageOpen,
  Pencil,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import fallbackAnnonces from "../data/Annonces";
import fallbackProducts from "../data/Produits";
import PageHeader from "@/components/PageHeader";
import { usePortalCollection } from "@/hooks/usePortalCollection";
import { housingApi, marketplaceApi } from "@/services/portalApi";
import { uploadPublicImages } from "@/services/storageApi";
import ImageUploadField from "@/components/ImageUploadField";

const moderationMeta = {
  pending: { label: "En attente de validation", className: "bg-amber-50 text-amber-800" },
  approved: { label: "Publié", className: "bg-emerald-50 text-emerald-800" },
  rejected: { label: "À corriger", className: "bg-rose-50 text-rose-800" },
};

const emptyHousingForm = {
  title: "",
  description: "",
  city: "Berkane",
  property_type: "Chambre privée",
  monthly_price: "",
  available_from: "",
  contact_phone: "",
};

export default function MyAnnoncePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    data: housingListings,
    loading: housingLoading,
    error: housingError,
    setData: setHousingListings,
  } = usePortalCollection(housingApi.listMine, fallbackAnnonces);
  const {
    data: marketplaceProducts,
    loading: productsLoading,
    error: productsError,
    setData: setMarketplaceProducts,
  } = usePortalCollection(marketplaceApi.listMine, fallbackProducts);

  const itemsPerPage = 6;
  const [activeFilter, setActiveFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImageUrls, setExistingImageUrls] = useState([]);
  const [form, setForm] = useState(emptyHousingForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const publications = useMemo(
    () => [
      ...housingListings.map((item) => ({ ...item, publicationType: "housing" })),
      ...marketplaceProducts.map((item) => ({ ...item, publicationType: "product" })),
    ].sort(
      (first, second) =>
        new Date(second.created_at || 0) - new Date(first.created_at || 0)
    ),
    [housingListings, marketplaceProducts]
  );

  const filteredPublications =
    activeFilter === "all"
      ? publications
      : publications.filter((item) => item.publicationType === activeFilter);
  const counts = {
    all: publications.length,
    housing: housingListings.length,
    product: marketplaceProducts.length,
  };
  const loading = housingLoading || productsLoading;
  const loadError = housingError || productsError;
  const totalPages = Math.ceil(filteredPublications.length / itemsPerPage);
  const displayedPublications = filteredPublications.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyHousingForm);
    setImageFiles([]);
    setExistingImageUrls([]);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (annonce) => {
    setEditingId(annonce.id);
    setForm({
      title: annonce.title || annonce.titre || "",
      description: annonce.description || annonce.desc || "",
      city: annonce.city || annonce.ville || "",
      property_type: annonce.property_type || annonce.type || "Chambre privée",
      monthly_price: String(annonce.monthly_price ?? annonce.prix ?? ""),
      available_from: annonce.available_from || "",
      contact_phone: annonce.contact_phone || "",
    });
    setImageFiles([]);
    setExistingImageUrls(
      annonce.image_urls?.length
        ? annonce.image_urls
        : annonce.image
          ? [annonce.image]
          : []
    );
    setFormError("");
    setModalOpen(true);
  };

  useEffect(() => {
    if (new URLSearchParams(location.search).get("nouvelle") === "1") {
      openCreate();
      navigate("/mes-annonces", { replace: true });
    }
  }, [location.search, navigate]);

  useEffect(() => {
    setPage(1);
  }, [activeFilter]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");

    try {
      const uploadedUrls = await uploadPublicImages("housing-images", imageFiles);
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        city: form.city.trim(),
        property_type: form.property_type,
        monthly_price: Number(form.monthly_price),
        available_from: form.available_from || null,
        contact_phone: form.contact_phone.trim(),
        image_urls: [...existingImageUrls, ...uploadedUrls],
        status: "active",
      };

      if (editingId) {
        const updated = await housingApi.update(editingId, payload);
        setHousingListings((items) =>
          items.map((item) => (item.id === editingId ? updated : item))
        );
      } else {
        const created = await housingApi.create(payload);
        setHousingListings((items) => [created, ...items]);
      }

      setActiveFilter("housing");
      setModalOpen(false);
      setPage(1);
    } catch (submitError) {
      setFormError(submitError.message || "Impossible d’enregistrer l’annonce.");
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (publication) => {
    setDeleteError("");
    setDeleteTarget(publication);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    setDeleteError("");
    try {
      if (deleteTarget.publicationType === "housing") {
        await housingApi.remove(deleteTarget.id);
        setHousingListings((items) =>
          items.filter((item) => item.id !== deleteTarget.id)
        );
      } else {
        await marketplaceApi.remove(deleteTarget.id);
        setMarketplaceProducts((items) =>
          items.filter((item) => item.id !== deleteTarget.id)
        );
      }
      setDeleteTarget(null);
    } catch (error) {
      setDeleteError(error.message || "Impossible de supprimer cette publication.");
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div className="portal-page">
      <PageHeader
        icon={Building2}
        eyebrow="Mes publications"
        title="Mes annonces de colocation / Marketplace"
        description="Suivez, modifiez ou supprimez toutes vos publications depuis un seul espace."
      >
        <div className="flex flex-wrap gap-2">
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-sky-950/20 transition hover:bg-sky-400"
          >
            <Plus className="h-4 w-4" /> Nouvelle colocation
          </button>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/20"
          >
            <ShoppingBag className="h-4 w-4" /> Publier un produit
          </Link>
        </div>
      </PageHeader>

      <section className="portal-panel !p-3">
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            ["all", "Toutes", Building2],
            ["housing", "Colocations", Home],
            ["product", "Marketplace", ShoppingBag],
          ].map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveFilter(id)}
              className={`flex items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-bold transition ${
                activeFilter === id
                  ? "bg-slate-950 text-white shadow-lg"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Icon className="h-4 w-4" /> {label}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  activeFilter === id
                    ? "bg-white/15 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {counts[id]}
              </span>
            </button>
          ))}
        </div>
      </section>

      {loading && (
        <div className="portal-empty flex items-center justify-center gap-2">
          <LoaderCircle className="h-5 w-5 animate-spin" /> Chargement de vos publications…
        </div>
      )}

      {loadError && !loading && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
          Certaines publications n’ont pas pu être chargées. Actualisez la page dans un instant.
        </div>
      )}

      {!loading && displayedPublications.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {displayedPublications.map((publication, index) => {
            const isHousing = publication.publicationType === "housing";
            const status =
              moderationMeta[publication.moderation_status] || moderationMeta.pending;
            const image =
              publication.image || publication.img || publication.image_urls?.[0] || null;

            return (
              <Motion.article
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={`${publication.publicationType}-${publication.id}`}
                className="portal-card flex flex-col"
              >
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  {image ? (
                    <img
                      src={image}
                      alt={publication.titre}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      className={`flex h-full items-center justify-center bg-gradient-to-br ${
                        isHousing
                          ? "from-sky-100 to-slate-100 text-sky-700"
                          : "from-violet-100 to-slate-100 text-violet-700"
                      }`}
                    >
                      {isHousing ? (
                        <Building2 className="h-12 w-12" />
                      ) : (
                        <PackageOpen className="h-12 w-12" />
                      )}
                    </div>
                  )}
                  <span
                    className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black text-white shadow-sm ${
                      isHousing ? "bg-sky-600" : "bg-violet-600"
                    }`}
                  >
                    {isHousing ? <Home className="h-3.5 w-3.5" /> : <ShoppingBag className="h-3.5 w-3.5" />}
                    {isHousing ? "Colocation" : "Marketplace"}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className={`w-fit rounded-full px-2.5 py-1 text-xs font-black ${status.className}`}>
                    {status.label}
                  </div>
                  <h2 className="mt-3 text-lg font-black text-slate-950">
                    {publication.titre}
                  </h2>
                  {publication.moderation_status === "rejected" &&
                    publication.moderation_reason && (
                      <p className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold leading-5 text-rose-700">
                        Motif : {publication.moderation_reason}
                      </p>
                    )}
                  <p
                    className={`mt-3 text-xl font-black ${
                      isHousing ? "text-sky-700" : "text-violet-700"
                    }`}
                  >
                    {publication.prix} DH{isHousing ? " / mois" : ""}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="portal-badge">{publication.ville}</span>
                    {!isHousing && publication.categorie && (
                      <span className="portal-badge">{publication.categorie}</span>
                    )}
                  </div>
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                    {publication.description || publication.desc || "Aucune description."}
                  </p>

                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    {isHousing ? (
                      <button
                        type="button"
                        onClick={() => openEdit(publication)}
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-sky-700 hover:text-sky-900"
                      >
                        <Pencil className="h-4 w-4" /> Modifier
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">Produit étudiant</span>
                    )}
                    <button
                      type="button"
                      onClick={() => requestDelete(publication)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-bold text-rose-600 transition hover:bg-rose-50 hover:text-rose-800"
                    >
                      <Trash2 className="h-4 w-4" /> Supprimer
                    </button>
                  </div>
                </div>
              </Motion.article>
            );
          })}
        </div>
      )}

      {!loading && filteredPublications.length === 0 && (
        <div className="portal-empty text-base">Aucune publication dans cette catégorie.</div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
          >
            <ChevronLeft />
          </Button>
          {Array.from({ length: totalPages }, (_, index) => (
            <Button
              key={index}
              variant={page === index + 1 ? "default" : "outline"}
              onClick={() => setPage(index + 1)}
            >
              {index + 1}
            </Button>
          ))}
          <Button
            variant="outline"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight />
          </Button>
        </div>
      )}

      {modalOpen && (
        <div className="portal-modal-backdrop" role="presentation">
          <div
            className="portal-modal max-w-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="housing-form-title"
          >
            <button
              type="button"
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
              onClick={() => setModalOpen(false)}
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 id="housing-form-title" className="pr-10 text-2xl font-bold text-slate-950">
              {editingId ? "Modifier l’annonce" : "Publier une colocation"}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              L’annonce sera visible par les membres uniquement après validation de l’administration.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2 text-sm font-semibold text-slate-700">
                Titre
                <input className="portal-input mt-2" required minLength={3} maxLength={180} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Chambre lumineuse proche du campus" />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Ville / quartier
                <input className="portal-input mt-2" required value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Type de logement
                <select className="portal-select mt-2 w-full" value={form.property_type} onChange={(event) => setForm({ ...form, property_type: event.target.value })}>
                  <option>Chambre privée</option><option>Chambre partagée</option><option>Studio</option><option>Appartement</option><option>Colocation étudiante</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Prix mensuel (DH)
                <input className="portal-input mt-2" required type="number" min="0" step="1" value={form.monthly_price} onChange={(event) => setForm({ ...form, monthly_price: event.target.value })} />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Disponible à partir du
                <input className="portal-input mt-2" type="date" value={form.available_from} onChange={(event) => setForm({ ...form, available_from: event.target.value })} />
              </label>
              <label className="sm:col-span-2 text-sm font-semibold text-slate-700">
                Numéro de téléphone
                <input className="portal-input mt-2" required type="tel" autoComplete="tel" minLength={8} maxLength={24} pattern="[0-9+ ()-]{8,24}" value={form.contact_phone} onChange={(event) => setForm({ ...form, contact_phone: event.target.value })} placeholder="+212 6 12 34 56 78" />
                <span className="mt-1 block text-xs font-normal text-slate-500">Ce numéro permettra aux étudiants connectés de vous appeler.</span>
              </label>
              <label className="sm:col-span-2 text-sm font-semibold text-slate-700">
                Description
                <textarea className="portal-input mt-2 min-h-28 resize-y" required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Équipements, proximité, conditions…" />
              </label>
              <div className="sm:col-span-2">
                <ImageUploadField files={imageFiles} onFilesChange={setImageFiles} existingUrls={existingImageUrls} onExistingUrlsChange={setExistingImageUrls} maxFiles={6} label="Photos du logement" />
              </div>
              {formError && <p className="sm:col-span-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</p>}
              <div className="sm:col-span-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button type="button" className="portal-secondary-button" onClick={() => setModalOpen(false)}>Annuler</button>
                <button type="submit" className="portal-primary-button" disabled={saving}>{saving && <LoaderCircle className="h-4 w-4 animate-spin" />}{editingId ? "Enregistrer" : "Publier l’annonce"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div
          className="portal-modal-backdrop"
          onMouseDown={() => !deleteBusy && setDeleteTarget(null)}
        >
          <section
            className="portal-modal max-w-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-publication-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button type="button" onClick={() => setDeleteTarget(null)} className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Fermer"><X className="h-5 w-5" /></button>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700"><Trash2 className="h-6 w-6" /></span>
            <h2 id="delete-publication-title" className="mt-4 pr-10 text-2xl font-black text-slate-950">Supprimer cette publication ?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">« {deleteTarget.titre} » sera supprimée définitivement ainsi que ses favoris associés.</p>
            {deleteError && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{deleteError}</p>}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setDeleteTarget(null)} className="portal-secondary-button">Conserver</button>
              <button type="button" onClick={confirmDelete} disabled={deleteBusy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-black text-white transition hover:bg-rose-700 disabled:opacity-50">{deleteBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Supprimer définitivement</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
