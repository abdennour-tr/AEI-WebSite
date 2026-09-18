import { useState } from "react";
import { motion as Motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import fallbackAnnonces from "../data/Annonces";
import PageHeader from "@/components/PageHeader";
import { usePortalCollection } from "@/hooks/usePortalCollection";
import { housingApi } from "@/services/portalApi";

export default function MyAnnoncePage() {
  const { data: annonces, loading, error, setData } = usePortalCollection(
    housingApi.listMine,
    fallbackAnnonces
  );
  const itemsPerPage = 6;
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    city: "Berkane",
    property_type: "Chambre privée",
    monthly_price: "",
    available_from: "",
    image_url: "",
  });

  const openCreate = () => {
    setEditingId(null);
    setForm({
      title: "",
      description: "",
      city: "Berkane",
      property_type: "Chambre privée",
      monthly_price: "",
      available_from: "",
      image_url: "",
    });
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
      image_url: annonce.image_urls?.[0] || annonce.image || "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      city: form.city.trim(),
      property_type: form.property_type,
      monthly_price: Number(form.monthly_price),
      available_from: form.available_from || null,
      image_urls: form.image_url.trim() ? [form.image_url.trim()] : [],
      status: "active",
    };

    try {
      if (editingId) {
        const updated = await housingApi.update(editingId, payload);
        setData((items) =>
          items.map((item) => (item.id === editingId ? updated : item))
        );
      } else {
        const created = await housingApi.create(payload);
        setData((items) => [created, ...items]);
      }
      setModalOpen(false);
      setPage(1);
    } catch (submitError) {
      setFormError(submitError.message || "Impossible d’enregistrer l’annonce.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (annonce) => {
    if (!window.confirm(`Supprimer « ${annonce.titre} » ?`)) return;
    try {
      await housingApi.remove(annonce.id);
      setData((items) => items.filter((item) => item.id !== annonce.id));
    } catch (deleteError) {
      window.alert(deleteError.message || "Impossible de supprimer l’annonce.");
    }
  };

  const totalPages = Math.ceil(annonces.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const displayedAnnonces = annonces.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="portal-page">
      <PageHeader
        icon={Building2}
        eyebrow="Mes publications"
        title="Mes annonces de colocation"
        description="Gérez les logements que vous avez proposés à la communauté."
      >
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-950/20 transition hover:bg-sky-400"
        >
          <Plus className="h-4 w-4" /> Publier une annonce
        </button>
      </PageHeader>

      {loading && (
        <div className="portal-empty flex items-center justify-center gap-2">
          <LoaderCircle className="h-5 w-5 animate-spin" /> Chargement de vos annonces…
        </div>
      )}

      {error && !loading && (
        <div className="portal-empty text-rose-700">
          Impossible de charger vos annonces. Réessayez dans un instant.
        </div>
      )}

      {!loading && !error && <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {displayedAnnonces.map((annonce, index) => (
          <Motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            key={annonce.id}
            className="portal-card"
          >
            {annonce.image ? (
              <img
                src={annonce.image}
                alt={annonce.titre}
                className="h-48 w-full object-cover"
              />
            ) : (
              <div className="flex h-48 items-center justify-center bg-gradient-to-br from-sky-100 to-slate-100 text-sky-700">
                <Building2 className="h-12 w-12" />
              </div>
            )}

            <div className="p-5 space-y-3">
              <h2 className="text-lg font-bold text-slate-950">
                {annonce.titre}
              </h2>
              {annonce.moderation_status && annonce.moderation_status !== "approved" && (
                <div className={`rounded-xl px-3 py-2 text-xs font-bold ${annonce.moderation_status === "rejected" ? "bg-rose-50 text-rose-800" : "bg-amber-50 text-amber-800"}`}>
                  {annonce.moderation_status === "rejected" ? `À corriger${annonce.moderation_reason ? ` : ${annonce.moderation_reason}` : ""}` : "En attente de validation avant publication"}
                </div>
              )}
              <p className="font-bold text-sky-700">
                {typeof annonce.prix === "number"
                  ? `${annonce.prix} DH / mois`
                  : annonce.prix}
              </p>

              <span className="portal-badge">
                {annonce.ville}
              </span>

              <p className="text-sm leading-6 text-slate-600">{annonce.description}</p>

              {/* BTN EDIT + DELETE */}
              <div className="flex justify-between border-t border-slate-100 pt-4">
                <button
                  onClick={() => openEdit(annonce)}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700 hover:text-sky-900"
                >
                  <Pencil className="h-4 w-4" /> Modifier
                </button>
                <button
                  onClick={() => handleDelete(annonce)}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-rose-600 hover:text-rose-800"
                >
                  <Trash2 className="h-4 w-4" /> Supprimer
                </button>
              </div>
            </div>
          </Motion.div>
        ))}
      </div>}

      {/* AUCUNE ANNONCE */}
      {!loading && !error && annonces.length === 0 && (
        <div className="portal-empty text-base">
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

      {modalOpen && (
        <div className="portal-modal-backdrop" role="presentation">
          <div className="portal-modal max-w-2xl" role="dialog" aria-modal="true" aria-labelledby="housing-form-title">
            <button
              type="button"
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
              onClick={() => setModalOpen(false)}
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 id="housing-form-title" className="pr-10 text-2xl font-bold text-slate-950">
              {editingId ? "Modifier l’annonce" : "Publier une annonce"}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Les informations seront visibles immédiatement par les membres connectés.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2 text-sm font-semibold text-slate-700">
                Titre
                <input
                  className="portal-input mt-2"
                  required
                  minLength={3}
                  maxLength={180}
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  placeholder="Chambre lumineuse proche du campus"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Ville / quartier
                <input
                  className="portal-input mt-2"
                  required
                  value={form.city}
                  onChange={(event) => setForm({ ...form, city: event.target.value })}
                />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Type de logement
                <select
                  className="portal-select mt-2 w-full"
                  value={form.property_type}
                  onChange={(event) => setForm({ ...form, property_type: event.target.value })}
                >
                  <option>Chambre privée</option>
                  <option>Chambre partagée</option>
                  <option>Studio</option>
                  <option>Appartement</option>
                  <option>Colocation étudiante</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Prix mensuel (DH)
                <input
                  className="portal-input mt-2"
                  required
                  type="number"
                  min="0"
                  step="1"
                  value={form.monthly_price}
                  onChange={(event) => setForm({ ...form, monthly_price: event.target.value })}
                />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Disponible à partir du
                <input
                  className="portal-input mt-2"
                  type="date"
                  value={form.available_from}
                  onChange={(event) => setForm({ ...form, available_from: event.target.value })}
                />
              </label>
              <label className="sm:col-span-2 text-sm font-semibold text-slate-700">
                Description
                <textarea
                  className="portal-input mt-2 min-h-28 resize-y"
                  required
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder="Équipements, proximité, conditions…"
                />
              </label>
              <label className="sm:col-span-2 text-sm font-semibold text-slate-700">
                URL de l’image (facultatif)
                <input
                  className="portal-input mt-2"
                  type="url"
                  value={form.image_url}
                  onChange={(event) => setForm({ ...form, image_url: event.target.value })}
                  placeholder="https://…"
                />
              </label>

              {formError && (
                <p className="sm:col-span-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {formError}
                </p>
              )}

              <div className="sm:col-span-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button type="button" className="portal-secondary-button" onClick={() => setModalOpen(false)}>
                  Annuler
                </button>
                <button type="submit" className="portal-primary-button" disabled={saving}>
                  {saving && <LoaderCircle className="h-4 w-4 animate-spin" />}
                  {editingId ? "Enregistrer" : "Publier l’annonce"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
