import p from "../assets/profile.jpg";
import { useState, useRef } from "react";
import { Trash2, Lock, User, Check } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const { user, profile: accountProfile, refreshProfile } = useAuth();
  const initial = {
    avatar: p,
    nom:
      accountProfile?.full_name ||
      user?.user_metadata?.full_name ||
      user?.email?.split("@")[0] ||
      "Étudiant AEI",
    email: user?.email || "",
    role: accountProfile?.role === "admin" ? "Administrateur" : "Étudiant",
    phone: accountProfile?.phone || "",
    bio: accountProfile?.bio || "",
    lastLogin: user?.last_sign_in_at
      ? new Intl.DateTimeFormat("fr-FR", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(user.last_sign_in_at))
      : "Session actuelle",
    twoFA: false,
    hideEmail: accountProfile?.hide_email ?? true,
  };

  // États UI
  const [profile, setProfile] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(initial.avatar);
  const [saving, setSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // Password change
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");

  // Delete account modal
  const [showDelete, setShowDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  // Activity (mock)
  const [activity] = useState([
    {
      id: 1,
      text: "Connexion depuis Firefox (Windows)",
      at: "16 septembre 2026 · 16:10",
    },
    {
      id: 2,
      text: "Téléchargement : 'linear_algebra.pdf'",
      at: "12 septembre 2026 · 09:22",
    },
    { id: 3, text: "Modification profil", at: "4 septembre 2026 · 18:41" },
  ]);

  const fileInputRef = useRef(null);

  const pwdStrength = [
    newPwd.length >= 8,
    /[A-Z]/.test(newPwd),
    /[0-9]/.test(newPwd),
    /[\W_]/.test(newPwd),
  ].filter(Boolean).length;
  const passwordsMismatch = Boolean(confirmPwd && newPwd !== confirmPwd);

  const handleSaveProfile = async () => {
    if (!supabase || !user) return;
    setSaving(true);
    setProfileMsg("");

    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: profile.nom.trim(),
          phone: profile.phone.trim() || null,
          bio: profile.bio.trim() || null,
          hide_email: profile.hideEmail,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      if (avatarFile) {
        const extension = avatarFile.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${user.id}/avatar.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("avatars").getPublicUrl(path);
        const { error: publicProfileError } = await supabase
          .from("public_profiles")
          .update({
            display_name: profile.nom.trim(),
            avatar_url: data.publicUrl,
          })
          .eq("user_id", user.id);

        if (publicProfileError) throw publicProfileError;
        setAvatarPreview(data.publicUrl);
      }

      await refreshProfile();
      setAvatarFile(null);
      setEditing(false);
      setProfileMsg("Profil enregistré avec succès.");
    } catch (error) {
      setProfileMsg(error.message || "Impossible d’enregistrer le profil.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPwd || !newPwd || passwordsMismatch) {
      setPwdMsg("Vérifiez les champs de mot de passe.");
      return;
    }
    if (pwdStrength < 3) {
      setPwdMsg(
        "Le mot de passe est trop faible (ajoutez chiffres/symboles/majuscules)."
      );
      return;
    }
    if (!supabase || !user?.email) return;

    setPwdMsg("");
    setSaving(true);

    const { error: verificationError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPwd,
    });

    if (verificationError) {
      setPwdMsg("Le mot de passe actuel est incorrect.");
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPwd,
    });

    if (updateError) {
      setPwdMsg(updateError.message);
    } else {
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      setPwdMsg("Mot de passe mis à jour avec succès.");
    }
    setSaving(false);
  };

  // Activer / désactiver 2FA (frontend toggle only) — nécessite backend + authenticator/ SMS
  const toggle2FA = () => {
    // Si on active, démarrer le flow d'enrôlement 2FA (QR + code)
    setProfile((p) => ({ ...p, twoFA: !p.twoFA }));
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== "SUPPRIMER") return;
    setSaving(true);
    // API: suppression définitive après vérification 2FA
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    // rediriger ou afficher message selon flow
    alert("Compte supprimé (simulation). Revenir à l'accueil.");
    // window.location.href = "/";
  };

  // Accessibilité: keyboard trigger for file input
  const onAvatarClick = () => fileInputRef.current?.click();

  return (
    <div className="portal-page">
      <PageHeader
        icon={User}
        eyebrow="Paramètres du compte"
        title="Mon profil"
        description="Gérez vos informations personnelles, vos préférences et la sécurité de votre compte."
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => setEditing((s) => !s)}
            className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-bold text-sky-800 transition hover:bg-sky-50"
          >
            {editing ? "Annuler" : "Modifier le profil"}
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/15"
            title="Supprimer le compte"
          >
            <Trash2 size={16} />
            <span>Supprimer</span>
          </button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: profile card */}
        <section className="portal-panel h-fit">
          <div className="flex flex-col items-center text-center">
            <div
              onClick={onAvatarClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onAvatarClick()}
              className="mb-4 h-28 w-28 cursor-pointer overflow-hidden rounded-3xl border-4 border-white shadow-lg ring-1 ring-slate-200"
              aria-label="Changer la photo de profil"
              style={{ boxShadow: "0 8px 30px rgba(2,6,23,0.08)" }}
            >
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setAvatarFile(f);
                  const reader = new FileReader();
                  reader.onload = () => setAvatarPreview(reader.result);
                  reader.readAsDataURL(f);
                }
              }}
            />

            <h2 className="text-xl font-bold text-slate-950">{profile.nom}</h2>
            <p className="text-sm text-slate-500">{profile.role}</p>

            <div className="mt-4 w-full space-y-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Email</span>
                <span className="text-sm font-medium text-gray-800">
                  {profile.hideEmail
                    ? profile.email.replace(/(.{2})(.*)(@.*)/, "$1***$3")
                    : profile.email}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Téléphone</span>
                <span className="text-sm text-gray-800">{profile.phone}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Dernière connexion
                </span>
                <span className="text-sm text-gray-800">
                  {profile.lastLogin}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">2-FA</span>
                <span className="text-sm">
                  {profile.twoFA ? (
                    <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                      <Check size={14} /> Activé
                    </span>
                  ) : (
                    <span className="text-yellow-600 font-medium">
                      Désactivé
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="mt-6 w-full">
              <button
                onClick={() =>
                  setProfile((p) => ({ ...p, hideEmail: !p.hideEmail }))
                }
                className="portal-secondary-button w-full"
              >
                {profile.hideEmail ? "Afficher l'email" : "Masquer l'email"}
              </button>
            </div>
          </div>
        </section>

        {/* Middle column: edit & security */}
        <section className="lg:col-span-2 space-y-6">
          {/* Profile edit */}
          <div className="portal-panel">
            <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-slate-950">
              <User size={18} /> Informations personnelles
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col">
                <span className="text-sm text-gray-600 mb-1">Nom complet</span>
                <input
                  value={profile.nom}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, nom: e.target.value }))
                  }
                  className="portal-input disabled:bg-slate-50 disabled:text-slate-500"
                  disabled={!editing}
                  aria-label="Nom complet"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm text-gray-600 mb-1">Téléphone</span>
                <input
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, phone: e.target.value }))
                  }
                  className="portal-input disabled:bg-slate-50 disabled:text-slate-500"
                  disabled={!editing}
                  aria-label="Téléphone"
                />
              </label>

              <label className="md:col-span-2 flex flex-col">
                <span className="text-sm text-gray-600 mb-1">Bio</span>
                <textarea
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, bio: e.target.value }))
                  }
                  rows={3}
                  className="portal-input disabled:bg-slate-50 disabled:text-slate-500"
                  disabled={!editing}
                />
              </label>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleSaveProfile}
                disabled={!editing || saving}
                className="portal-primary-button"
              >
                {saving ? "Enregistrement..." : "Enregistrer les modifications"}
              </button>

              <button
                onClick={() => {
                  // rollback demo: reset to initial (pour l'exemple)
                  setProfile(initial);
                  setAvatarFile(null);
                  setAvatarPreview(initial.avatar);
                  setEditing(false);
                }}
                className="portal-secondary-button"
                disabled={!editing}
              >
                Réinitialiser
              </button>
            </div>
            {profileMsg && (
              <p
                className={`mt-4 text-sm ${
                  profileMsg.includes("succès") ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {profileMsg}
              </p>
            )}
          </div>

          {/* Security / Password */}
          <div className="portal-panel">
            <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-slate-950">
              <Lock size={18} /> Sécurité du compte
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <label className="flex flex-col md:col-span-1">
                <span className="text-sm text-gray-600 mb-1">
                  Mot de passe actuel
                </span>
                <input
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  type="password"
                  className="portal-input"
                  placeholder="••••••••"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm text-gray-600 mb-1">
                  Nouveau mot de passe
                </span>
                <input
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  type="password"
                  className="portal-input"
                  placeholder="Au moins 8 caractères"
                />
                {/* strength */}
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden">
                    <div
                      style={{ width: `${(pwdStrength / 4) * 100}%` }}
                      className={`h-full ${
                        pwdStrength >= 3
                          ? "bg-green-500"
                          : pwdStrength === 2
                          ? "bg-yellow-400"
                          : "bg-red-400"
                      }`}
                    />
                  </div>
                  <span className="text-xs text-gray-600">
                    {pwdStrength >= 3
                      ? "Fort"
                      : pwdStrength === 2
                      ? "Moyen"
                      : "Faible"}
                  </span>
                </div>
              </label>

              <label className="flex flex-col">
                <span className="text-sm text-gray-600 mb-1">
                  Confirmer le nouveau mot de passe
                </span>
                <input
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  type="password"
                  className="portal-input"
                  placeholder="Confirmer"
                />
              </label>
            </div>

            {(pwdMsg || passwordsMismatch) && (
              <p
                className={`mt-3 text-sm ${
                  pwdMsg.includes("succès") ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {passwordsMismatch
                  ? "Les mots de passe ne correspondent pas."
                  : pwdMsg}
              </p>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleChangePassword}
                className="portal-primary-button"
                disabled={saving}
              >
                {saving ? "Traitement..." : "Changer le mot de passe"}
              </button>

              <button
                onClick={() => {
                  setCurrentPwd("");
                  setNewPwd("");
                  setConfirmPwd("");
                  setPwdMsg("");
                }}
                className="portal-secondary-button"
              >
                Annuler
              </button>
            </div>
          </div>

          {/* Privacy & Connected */}
          <div className="portal-panel grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-3">Confidentialité</h4>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-medium">Masquer mon email</div>
                  <div className="text-sm text-gray-500">
                    Empêche l'affichage public de votre adresse.
                  </div>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.hideEmail}
                    onChange={() =>
                      setProfile((p) => ({ ...p, hideEmail: !p.hideEmail }))
                    }
                    className="form-checkbox h-5 w-5"
                    aria-label="Masquer email"
                  />
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    Authentification 2-facteurs (2FA)
                  </div>
                  <div className="text-sm text-gray-500">
                    Activez 2FA pour sécuriser l'accès (SMS / Authenticator).
                  </div>
                </div>
                <div>
                  <button
                    onClick={toggle2FA}
                    className={`px-3 py-2 rounded-lg font-medium ${
                      profile.twoFA
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-800"
                    }`}
                    aria-pressed={profile.twoFA}
                  >
                    {profile.twoFA ? "Désactiver" : "Activer"}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Comptes connectés</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Google</div>
                    <div className="text-sm text-gray-500">
                      Connexion via Google
                    </div>
                  </div>
                  <div>
                    <button className="portal-secondary-button px-3 py-2">
                      Déconnecter
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">GitHub</div>
                    <div className="text-sm text-gray-500">
                      Connexion via GitHub
                    </div>
                  </div>
                  <div>
                    <button className="portal-secondary-button px-3 py-2">
                      Déconnecter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity log */}
          <div className="portal-panel">
            <h4 className="mb-4 font-bold text-slate-950">Activité récente</h4>
            <ul className="divide-y divide-slate-100 text-sm text-slate-700">
              {activity.map((a) => (
                <li key={a.id} className="flex items-start justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <div className="font-medium">{a.text}</div>
                    <div className="text-xs text-gray-500">{a.at}</div>
                  </div>
                  <div className="text-xs text-gray-400">—</div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* DELETE modal */}
      {showDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
          className="portal-modal-backdrop"
        >
          <div className="portal-modal">
            <h2 id="delete-title" className="text-xl font-bold mb-2">
              Supprimer mon compte
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Cette action est irréversible. Pour confirmer, tapez{" "}
              <span className="font-mono">SUPPRIMER</span> et cliquez sur «
              Supprimer ».
            </p>

            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Tapez SUPPRIMER"
              className="portal-input mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDelete(false)}
                className="portal-secondary-button"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={confirmText !== "SUPPRIMER" || saving}
                className="portal-danger-button bg-rose-600 text-white hover:bg-rose-700"
              >
                {saving ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
