import { useEffect, useMemo, useRef, useState } from "react";
import {
  Award,
  Check,
  Github,
  Globe2,
  Linkedin,
  LoaderCircle,
  LockKeyhole,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import fallbackAvatar from "@/assets/profile.jpg";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { listStudentBadges } from "@/services/experienceApi";

const fallbackBadge = {
  badge_code: "aei_member",
  title: "Membre AEI",
  description: "Profil étudiant actif sur le portail de la communauté.",
  icon: "shield",
};

function TagEditor({ label, values, onChange, placeholder }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const value = draft.trim();
    if (!value || values.includes(value)) return;
    onChange([...values, value].slice(0, 12));
    setDraft("");
  };
  return (
    <div>
      <label className="text-sm font-bold text-slate-700">{label}</label>
      <div className="mt-2 flex gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
          className="portal-input"
          placeholder={placeholder}
        />
        <button type="button" onClick={add} className="portal-secondary-button shrink-0 px-3" aria-label={`Ajouter ${label.toLowerCase()}`}>
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex min-h-9 flex-wrap gap-2">
        {values.map((value) => (
          <span key={value} className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1.5 text-sm font-semibold text-sky-800">
            {value}
            <button type="button" onClick={() => onChange(values.filter((item) => item !== value))} className="rounded-full p-0.5 hover:bg-sky-100" aria-label={`Retirer ${value}`}><X className="h-3.5 w-3.5" /></button>
          </span>
        ))}
        {values.length === 0 && <p className="text-sm text-slate-400">Ajoutez au moins un élément pour personnaliser votre profil.</p>}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, profile: accountProfile, refreshProfile } = useAuth();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    bio: "",
    skills: [],
    interests: [],
    portfolioUrl: "",
    githubUrl: "",
    linkedinUrl: "",
    hideEmail: true,
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(fallbackAvatar);
  const [badges, setBadges] = useState([fallbackBadge]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    setForm({
      fullName: accountProfile?.full_name || user?.user_metadata?.full_name || "",
      phone: accountProfile?.phone || "",
      bio: accountProfile?.bio || "",
      skills: Array.isArray(accountProfile?.skills) ? accountProfile.skills : [],
      interests: Array.isArray(accountProfile?.interests)
        ? accountProfile.interests
        : Array.isArray(user?.user_metadata?.onboarding?.interests)
          ? user.user_metadata.onboarding.interests
          : [],
      portfolioUrl: accountProfile?.portfolio_url || "",
      githubUrl: accountProfile?.github_url || "",
      linkedinUrl: accountProfile?.linkedin_url || "",
      hideEmail: accountProfile?.hide_email ?? true,
    });
  }, [accountProfile, user]);

  useEffect(() => {
    if (!supabase || !user) return;
    supabase
      .from("public_profiles")
      .select("avatar_url")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => data?.avatar_url && setAvatarPreview(data.avatar_url));
    listStudentBadges().then((items) => setBadges(items.length ? items : [fallbackBadge]));
  }, [user]);

  const completeness = useMemo(() => {
    const fields = [form.fullName, form.bio, form.skills.length, form.interests.length, form.portfolioUrl || form.githubUrl || form.linkedinUrl];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [form]);

  const saveProfile = async () => {
    if (!supabase || !user) return;
    setSaving(true);
    setMessage("");
    try {
      let avatarUrl = avatarPreview;
      if (avatarFile) {
        const extension = avatarFile.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${user.id}/avatar.${extension}`;
        const { error: uploadError } = await supabase.storage.from("avatars").upload(path, avatarFile, { upsert: true });
        if (uploadError) throw uploadError;
        avatarUrl = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: form.fullName.trim(),
          phone: form.phone.trim() || null,
          bio: form.bio.trim() || null,
          skills: form.skills,
          interests: form.interests,
          portfolio_url: form.portfolioUrl.trim() || null,
          github_url: form.githubUrl.trim() || null,
          linkedin_url: form.linkedinUrl.trim() || null,
          hide_email: form.hideEmail,
        })
        .eq("id", user.id);
      if (profileError) throw profileError;

      const { error: publicError } = await supabase
        .from("public_profiles")
        .update({ display_name: form.fullName.trim(), avatar_url: avatarUrl })
        .eq("user_id", user.id);
      if (publicError) throw publicError;

      setAvatarPreview(avatarUrl);
      setAvatarFile(null);
      await refreshProfile();
      setMessage("Votre profil a été enregistré.");
    } catch (error) {
      setMessage(error.message || "Impossible d’enregistrer le profil.");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!currentPassword || newPassword.length < 8 || !user?.email || !supabase) {
      setPasswordMessage("Saisissez votre mot de passe actuel et un nouveau mot de passe d’au moins 8 caractères.");
      return;
    }
    setSaving(true);
    setPasswordMessage("");
    const { error: verifyError } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword });
    if (verifyError) {
      setPasswordMessage("Le mot de passe actuel est incorrect.");
      setSaving(false);
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordMessage(error ? error.message : "Mot de passe mis à jour avec succès.");
    if (!error) {
      setCurrentPassword("");
      setNewPassword("");
    }
    setSaving(false);
  };

  return (
    <div className="portal-page">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-7 text-white shadow-xl sm:px-8 sm:py-9">
        <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <button type="button" onClick={() => fileInputRef.current?.click()} className="group relative h-28 w-28 shrink-0 overflow-hidden rounded-3xl ring-4 ring-white/10" aria-label="Changer la photo de profil">
            <img src={avatarPreview} alt="Photo de profil" className="h-full w-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center bg-slate-950/70 text-sm font-bold opacity-0 transition group-hover:opacity-100"><Upload className="mr-2 h-4 w-4" /> Modifier</span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
          }} />
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/10 px-3 py-1.5 text-xs font-bold text-violet-200"><Sparkles className="h-3.5 w-3.5" /> Profil étudiant</div>
            <h1 className="mt-3 truncate text-3xl font-bold sm:text-4xl">{form.fullName || "Votre profil"}</h1>
            <p className="mt-2 text-slate-300">{user?.email}</p>
          </div>
          <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 sm:w-56">
            <div className="flex items-center justify-between text-sm"><span className="font-semibold text-slate-300">Profil complété</span><strong>{completeness}%</strong></div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-violet-400" style={{ width: `${completeness}%` }} /></div>
          </div>
        </div>
      </section>

      {message && <p className={`rounded-xl border px-4 py-3 text-sm font-semibold ${message.includes("enregistré") ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-700"}`}>{message}</p>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
        <div className="space-y-6">
          <section className="portal-panel">
            <div className="flex items-center gap-3"><span className="rounded-xl bg-sky-50 p-2.5 text-sky-700"><UserRound className="h-5 w-5" /></span><div><h2 className="text-xl font-bold text-slate-950">Informations principales</h2><p className="text-sm text-slate-500">Présentez clairement votre parcours et vos objectifs.</p></div></div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label><span className="mb-2 block text-sm font-bold text-slate-700">Nom complet</span><input className="portal-input" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} /></label>
              <label><span className="mb-2 block text-sm font-bold text-slate-700">Téléphone</span><input className="portal-input" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+212 …" /></label>
              <label className="sm:col-span-2"><span className="mb-2 block text-sm font-bold text-slate-700">À propos de vous</span><textarea className="portal-input min-h-32 resize-y" value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value.slice(0, 600) })} placeholder="Votre filière, vos objectifs et le type de projets auxquels vous souhaitez contribuer…" /></label>
            </div>
          </section>

          <section className="portal-panel space-y-7">
            <div className="flex items-center gap-3"><span className="rounded-xl bg-violet-50 p-2.5 text-violet-700"><Sparkles className="h-5 w-5" /></span><div><h2 className="text-xl font-bold text-slate-950">Compétences et intérêts</h2><p className="text-sm text-slate-500">Ils personnalisent vos recommandations.</p></div></div>
            <TagEditor label="Compétences" values={form.skills} onChange={(skills) => setForm({ ...form, skills })} placeholder="Ex. React, Python, gestion de projet" />
            <TagEditor label="Centres d’intérêt" values={form.interests} onChange={(interests) => setForm({ ...form, interests })} placeholder="Ex. IA, robotique, entrepreneuriat" />
          </section>

          <section className="portal-panel">
            <div className="flex items-center gap-3"><span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700"><Globe2 className="h-5 w-5" /></span><div><h2 className="text-xl font-bold text-slate-950">Portfolio et présence professionnelle</h2><p className="text-sm text-slate-500">Ajoutez uniquement des liens que vous souhaitez partager.</p></div></div>
            <div className="mt-6 grid gap-5">
              <label><span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700"><Globe2 className="h-4 w-4" /> Portfolio</span><input type="url" className="portal-input" value={form.portfolioUrl} onChange={(event) => setForm({ ...form, portfolioUrl: event.target.value })} placeholder="https://votre-portfolio.com" /></label>
              <div className="grid gap-5 sm:grid-cols-2">
                <label><span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700"><Github className="h-4 w-4" /> GitHub / GitLab</span><input type="url" className="portal-input" value={form.githubUrl} onChange={(event) => setForm({ ...form, githubUrl: event.target.value })} placeholder="https://github.com/…" /></label>
                <label><span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700"><Linkedin className="h-4 w-4" /> LinkedIn</span><input type="url" className="portal-input" value={form.linkedinUrl} onChange={(event) => setForm({ ...form, linkedinUrl: event.target.value })} placeholder="https://linkedin.com/in/…" /></label>
              </div>
            </div>
            <label className="mt-6 flex items-start gap-3 rounded-xl bg-slate-50 p-4"><input type="checkbox" checked={form.hideEmail} onChange={(event) => setForm({ ...form, hideEmail: event.target.checked })} className="mt-1 h-4 w-4" /><span><strong className="block text-sm text-slate-900">Masquer mon adresse e-mail</strong><span className="mt-1 block text-sm text-slate-500">Votre e-mail reste privé sur les espaces visibles par les autres étudiants.</span></span></label>
            <button type="button" onClick={saveProfile} disabled={saving} className="portal-primary-button mt-6 w-full sm:w-auto">{saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Enregistrer mon profil</button>
          </section>

          <section className="portal-panel">
            <div className="flex items-center gap-3"><span className="rounded-xl bg-slate-100 p-2.5 text-slate-700"><LockKeyhole className="h-5 w-5" /></span><div><h2 className="text-xl font-bold text-slate-950">Sécurité du compte</h2><p className="text-sm text-slate-500">Utilisez un mot de passe unique d’au moins 8 caractères.</p></div></div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2"><input type="password" className="portal-input" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder="Mot de passe actuel" /><input type="password" className="portal-input" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Nouveau mot de passe" /></div>
            {passwordMessage && <p className={`mt-3 text-sm font-semibold ${passwordMessage.includes("succès") ? "text-emerald-700" : "text-rose-700"}`}>{passwordMessage}</p>}
            <button type="button" onClick={changePassword} disabled={saving} className="portal-secondary-button mt-4">Mettre à jour le mot de passe</button>
          </section>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-5">
          <section className="portal-panel">
            <div className="flex items-center gap-3"><span className="rounded-xl bg-amber-50 p-2.5 text-amber-700"><Award className="h-5 w-5" /></span><div><h2 className="font-bold text-slate-950">Mes badges</h2><p className="text-sm text-slate-500">{badges.length} obtenu{badges.length > 1 ? "s" : ""}</p></div></div>
            <div className="mt-5 space-y-3">
              {badges.map((badge) => (
                <div key={badge.badge_code} className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
                  <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white"><ShieldCheck className="h-5 w-5" /></span><strong className="text-slate-950">{badge.title}</strong></div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{badge.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-slate-950 p-5 text-white shadow-lg">
            <Check className="h-6 w-6 text-emerald-300" />
            <h2 className="mt-4 font-bold">Profil professionnel</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">Un profil complet améliore les recommandations de clubs, de projets et d’activités.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
