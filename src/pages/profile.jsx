import p from "../assets/profile.jpg";
import { useState, useEffect, useRef } from "react";
import { Send, Trash2, Lock, User, Check } from "lucide-react";

export default function ProfilePage() {
  const initial = {
    avatar: p,
    nom: "Abdenour TRARI",
    email: "abdenour.trari@example.com",
    role: "Étudiant",
    phone: "+212 6 12 34 56 78",
    bio: "Étudiant en ingénierie — passion IA & dev fullstack.",
    lastLogin: "2025-12-03 14:16",
    twoFA: false,
    hideEmail: false,
  };

  // États UI
  const [profile, setProfile] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(initial.avatar);
  const [saving, setSaving] = useState(false);

  // Password change
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdStrength, setPwdStrength] = useState(0);

  // Delete account modal
  const [showDelete, setShowDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  // Activity (mock)
  const [activity] = useState([
    {
      id: 1,
      text: "Connexion depuis Firefox (Windows)",
      at: "2025-12-03 14:16",
    },
    {
      id: 2,
      text: "Téléchargement : 'linear_algebra.pdf'",
      at: "2025-11-30 09:22",
    },
    { id: 3, text: "Modification profil", at: "2025-11-25 18:41" },
  ]);

  const fileInputRef = useRef(null);

  // avatar preview
  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(profile.avatar);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(avatarFile);
  }, [avatarFile, profile.avatar]);

  // password strength (simple heuristic)
  useEffect(() => {
    let score = 0;
    if (newPwd.length >= 8) score += 1;
    if (/[A-Z]/.test(newPwd)) score += 1;
    if (/[0-9]/.test(newPwd)) score += 1;
    if (/[\W_]/.test(newPwd)) score += 1;
    setPwdStrength(score);
    if (confirmPwd && newPwd !== confirmPwd) {
      setPwdMsg("Les mots de passe ne correspondent pas.");
    } else {
      setPwdMsg("");
    }
  }, [newPwd, confirmPwd]);

  // Simuler save — remplacer par appel API réel
  const handleSaveProfile = async () => {
    setSaving(true);
    // TODO: upload avatarFile to server, then save profile fields securely (with auth token)
    await new Promise((r) => setTimeout(r, 900));
    setProfile((p) => ({ ...p, ...profile })); // ici déjà local
    setAvatarFile(null);
    setEditing(false);
    setSaving(false);
  };

  // Simuler changer mot de passe — doit être sécurisé côté serveur
  const handleChangePassword = async () => {
    if (!currentPwd || !newPwd || newPwd !== confirmPwd) {
      setPwdMsg("Vérifiez les champs de mot de passe.");
      return;
    }
    if (pwdStrength < 3) {
      setPwdMsg(
        "Le mot de passe est trop faible (ajoutez chiffres/symboles/majuscules)."
      );
      return;
    }
    setPwdMsg("");
    // Appel API ici : envoi currentPwd, newPwd avec token d'authentification
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setCurrentPwd("");
    setNewPwd("");
    setConfirmPwd("");
    setSaving(false);
    setPwdMsg("Mot de passe mis à jour avec succès.");
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
    <div className="space-y-8 lg:p-6 md:p-4 p-2">
      <header className=" bg-linear-to-r from-sky-600 to-orange-500 text-white p-6 rounded-xl shadow-lg mb-10">
        <h1 className="text-3xl font-bold">Mon profil</h1>
        <p className="text-white/90 mt-1">
          Gère tes informations personnelles, la sécurité et la confidentialité.
        </p>
      </header>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div></div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditing((s) => !s)}
            className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium shadow"
          >
            {editing ? "Annuler" : "Modifier le profil"}
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="flex items-center px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold shadow "
            title="Supprimer le compte"
          >
            <Trash2 size={16} />
            <span className="ml-2 hidden sm:inline">Supprimer compte</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: profile card */}
        <section className="bg-white rounded-2xl shadow p-6">
          <div className="flex flex-col items-center text-center">
            <div
              onClick={onAvatarClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onAvatarClick()}
              className="w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-md -mt-16 mb-4 cursor-pointer"
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
                if (f) setAvatarFile(f);
              }}
            />

            <h2 className="text-xl font-bold">{profile.nom}</h2>
            <p className="text-sm text-gray-500">{profile.role}</p>

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
                className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50"
              >
                {profile.hideEmail ? "Afficher l'email" : "Masquer l'email"}
              </button>
            </div>
          </div>
        </section>

        {/* Middle column: edit & security */}
        <section className="lg:col-span-2 space-y-6">
          {/* Profile edit */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
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
                  className="border rounded-xl px-4 py-3"
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
                  className="border rounded-xl px-4 py-3"
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
                  className="border rounded-xl px-4 py-3"
                  disabled={!editing}
                />
              </label>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleSaveProfile}
                disabled={!editing || saving}
                className="px-4 py-2 rounded-lg bg-sky-600 text-white font-medium disabled:opacity-60"
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
                className="px-4 py-2 rounded-lg border"
                disabled={!editing}
              >
                Réinitialiser
              </button>
            </div>
          </div>

          {/* Security / Password */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
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
                  className="border rounded-xl px-4 py-3"
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
                  className="border rounded-xl px-4 py-3"
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
                  className="border rounded-xl px-4 py-3"
                  placeholder="Confirmer"
                />
              </label>
            </div>

            {pwdMsg && <p className="text-sm text-red-500 mt-3">{pwdMsg}</p>}

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleChangePassword}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-60"
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
                className="px-4 py-2 rounded-lg border"
              >
                Annuler
              </button>
            </div>
          </div>

          {/* Privacy & Connected */}
          <div className="bg-white rounded-2xl shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 text-gray-800"
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
                    <button className="px-3 py-2 rounded-lg border">
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
                    <button className="px-3 py-2 rounded-lg border">
                      Déconnecter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity log */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h4 className="font-semibold mb-3">Activité récente</h4>
            <ul className="space-y-3 text-sm text-gray-700">
              {activity.map((a) => (
                <li key={a.id} className="flex items-start justify-between">
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-lg">
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
              className="w-full border rounded-xl px-4 py-3 mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDelete(false)}
                className="px-4 py-2 rounded-lg border"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={confirmText !== "SUPPRIMER" || saving}
                className="px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-60"
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
