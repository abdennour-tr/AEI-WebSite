import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BellRing,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  Eye,
  FileText,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Megaphone,
  Menu,
  Send,
  Settings2,
  Sparkles,
  TrendingUp,
  UserCheck,
  UsersRound,
  X,
  XCircle,
} from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { clubAdminApi } from "@/services/clubAdminApi";
import logo from "../assets/AEI.png";

const navigation = [
  { id: "overview", label: "Vue d’ensemble", icon: LayoutDashboard },
  { id: "profile", label: "Fiche du club", icon: Settings2 },
  { id: "events", label: "Événements", icon: CalendarDays },
  { id: "announcements", label: "Annonces", icon: Megaphone },
  { id: "applications", label: "Candidatures", icon: ClipboardList },
  { id: "notifications", label: "Notifications", icon: BellRing },
];

const statusLabels = {
  submitted: "À examiner",
  accepted: "Acceptée",
  refused: "Refusée",
  draft: "Brouillon",
  published: "Publié",
  archived: "Archivé",
};

const formatDate = (value, includeTime = false) =>
  value
    ? new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "medium",
        ...(includeTime ? { timeStyle: "short" } : {}),
      }).format(new Date(value))
    : "Date à définir";

function PanelTitle({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-600">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export default function ClubAdminDashboardPage() {
  const access = useOutletContext();
  const { user, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [club, setClub] = useState(access.club);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [profileForm, setProfileForm] = useState({
    name: access.club.name,
    category: access.club.category,
    tagline: access.club.tagline,
    description: access.club.description,
    recruitment_label: access.club.recruitment_label || "",
    contact_url: access.club.contact_url || "",
    objectives: (access.club.objectives || []).join("\n"),
  });
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    event_type: "Atelier",
    location: "Campus ENIAD",
    starts_at: "",
    capacity: "",
    status: "draft",
  });
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    body: "",
    status: "draft",
  });
  const [notificationForm, setNotificationForm] = useState({ title: "", body: "" });

  const loadDashboard = async () => {
    const data = await clubAdminApi.getDashboard(access.club_id);
    setDashboard(data);
  };

  useEffect(() => {
    let active = true;
    clubAdminApi
      .getDashboard(access.club_id)
      .then((data) => {
        if (active) setDashboard(data);
      })
      .catch(() => {
        if (active) setNotice({ type: "error", text: "Impossible de charger les données du club." });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [access.club_id]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(null), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const pendingApplications = useMemo(
    () => dashboard?.applications.filter((item) => item.status === "submitted") || [],
    [dashboard]
  );

  const runAction = async (action, successMessage) => {
    setBusy(true);
    try {
      await action();
      await loadDashboard();
      setNotice({ type: "success", text: successMessage });
      return true;
    } catch {
      setNotice({ type: "error", text: "L’action n’a pas pu être enregistrée. Réessayez." });
      return false;
    } finally {
      setBusy(false);
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const updated = await clubAdminApi.updateProfile(access.club_id, {
        ...profileForm,
        objectives: profileForm.objectives
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 6),
      });
      setClub(updated);
      setNotice({ type: "success", text: "La fiche publique du club a été mise à jour." });
    } catch {
      setNotice({ type: "error", text: "La fiche n’a pas pu être enregistrée." });
    } finally {
      setBusy(false);
    }
  };

  const createEvent = async (event) => {
    event.preventDefault();
    const saved = await runAction(
      () =>
        clubAdminApi.createEvent(access.club_id, {
          ...eventForm,
          starts_at: new Date(eventForm.starts_at).toISOString(),
          capacity: eventForm.capacity ? Number(eventForm.capacity) : null,
        }),
      eventForm.status === "published" ? "Événement publié sur la fiche du club." : "Brouillon d’événement enregistré."
    );
    if (saved) setEventForm({ title: "", description: "", event_type: "Atelier", location: "Campus ENIAD", starts_at: "", capacity: "", status: "draft" });
  };

  const createAnnouncement = async (event) => {
    event.preventDefault();
    const saved = await runAction(
      () => clubAdminApi.createAnnouncement(access.club_id, announcementForm),
      announcementForm.status === "published" ? "Annonce publiée sur la fiche du club." : "Brouillon d’annonce enregistré."
    );
    if (saved) setAnnouncementForm({ title: "", body: "", status: "draft" });
  };

  const sendNotification = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const count = await clubAdminApi.notifyMembers(
        access.club_id,
        notificationForm.title,
        notificationForm.body
      );
      setNotificationForm({ title: "", body: "" });
      setNotice({ type: "success", text: `${count} notification${count > 1 ? "s" : ""} envoyée${count > 1 ? "s" : ""}.` });
    } catch {
      setNotice({ type: "error", text: "Les notifications n’ont pas pu être envoyées." });
    } finally {
      setBusy(false);
    }
  };

  const stats = dashboard?.stats || { views: 0, applications: 0, registrations: 0, attendance: 0, members: 0 };
  const activeNav = navigation.find((item) => item.id === activeSection);

  return (
    <div className="flex min-h-screen bg-[#f4f7fb] text-slate-950">
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-[#080d1b] p-5 text-white shadow-2xl transition-transform lg:static lg:translate-x-0 ${mobileMenu ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white"><img src={logo} alt="AEI" className="h-7 w-auto" /></span>
            <div><p className="text-sm font-bold">Club Command</p><p className="text-xs text-slate-500">Responsables AEI</p></div>
          </Link>
          <button type="button" onClick={() => setMobileMenu(false)} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 lg:hidden" aria-label="Fermer le menu"><X className="h-5 w-5" /></button>
        </div>

        <div className="mt-7 rounded-2xl border border-cyan-400/15 bg-gradient-to-br from-cyan-400/10 to-violet-500/10 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400 text-sm font-black text-slate-950">{club.name.slice(0, 2).toUpperCase()}</span>
            <div className="min-w-0"><p className="truncate text-sm font-bold">{club.name}</p><p className="mt-0.5 text-xs text-cyan-200">{access.manager_role === "president" ? "Présidence" : "Responsable"}</p></div>
          </div>
        </div>

        <nav className="mt-7 flex-1 space-y-1" aria-label="Navigation responsable">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button key={item.id} type="button" onClick={() => { setActiveSection(item.id); setMobileMenu(false); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${active ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-950/20" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
                <Icon className="h-5 w-5" /> {item.label}
                {item.id === "applications" && pendingApplications.length > 0 && <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-bold ${active ? "bg-slate-950 text-white" : "bg-violet-500 text-white"}`}>{pendingApplications.length}</span>}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/10 pt-4">
          <Link to={`/clubs/${access.club_id}`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white"><Eye className="h-5 w-5" /> Voir la fiche publique</Link>
          <button type="button" onClick={signOut} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-300 transition hover:bg-rose-400/10"><LogOut className="h-5 w-5" /> Déconnexion</button>
        </div>
      </aside>

      {mobileMenu && <button type="button" className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden" onClick={() => setMobileMenu(false)} aria-label="Fermer le menu" />}

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setMobileMenu(true)} className="rounded-xl border border-slate-200 p-2 text-slate-600 lg:hidden" aria-label="Ouvrir le menu"><Menu className="h-5 w-5" /></button>
            <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">{activeNav?.label}</p><p className="text-sm font-bold text-slate-900">{club.name}</p></div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-right sm:block"><span className="block text-sm font-bold text-slate-800">{user?.user_metadata?.full_name || user?.email?.split("@")[0]}</span><span className="block text-xs text-slate-400">{user?.email}</span></span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-xs font-bold text-cyan-300">{(user?.email || "RC").slice(0, 2).toUpperCase()}</span>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
          {notice && (
            <div className={`fixed right-5 top-20 z-50 flex max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-xl ${notice.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}>
              {notice.type === "success" ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0" />}{notice.text}
            </div>
          )}

          {loading ? (
            <div className="flex min-h-[60vh] items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin text-cyan-600" /></div>
          ) : (
            <>
              {activeSection === "overview" && (
                <div className="space-y-6">
                  <section className="relative overflow-hidden rounded-3xl bg-[#080d1b] p-6 text-white shadow-xl sm:p-8">
                    <div className="absolute -right-12 -top-16 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl" />
                    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                      <div><span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-cyan-200"><Sparkles className="h-3.5 w-3.5" /> Tableau de bord responsable</span><h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">Bonjour, pilotez {club.name}.</h1><p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">Suivez l’engagement de la communauté et maintenez la fiche du club à jour.</p></div>
                      <button type="button" onClick={() => setActiveSection("applications")} className="inline-flex w-fit items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950">{pendingApplications.length} demande{pendingApplications.length > 1 ? "s" : ""} à examiner <ChevronRight className="h-4 w-4" /></button>
                    </div>
                  </section>

                  <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      [Eye, "Vues de la fiche", stats.views, "Depuis l’activation"],
                      [ClipboardList, "Demandes", stats.applications, `${pendingApplications.length} en attente`],
                      [UserCheck, "Inscriptions", stats.registrations, `${stats.members} membres actifs`],
                      [Activity, "Participations", stats.attendance, "Présences confirmées"],
                    ].map(([Icon, label, value, hint]) => (
                      <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-cyan-300"><Icon className="h-5 w-5" /></span><TrendingUp className="h-4 w-4 text-emerald-500" /></div>
                        <p className="mt-5 text-3xl font-bold tracking-tight">{value}</p><p className="mt-1 text-sm font-bold text-slate-700">{label}</p><p className="mt-2 text-xs text-slate-400">{hint}</p>
                      </article>
                    ))}
                  </section>

                  <section className="grid gap-6 xl:grid-cols-2">
                    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                      <PanelTitle eyebrow="À traiter" title="Candidatures récentes" action={<button type="button" onClick={() => setActiveSection("applications")} className="text-sm font-bold text-cyan-700">Tout afficher</button>} />
                      <div className="mt-5 space-y-3">
                        {pendingApplications.slice(0, 4).map((application) => <div key={application.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-xs font-bold text-violet-700">{(application.applicant?.display_name || "ET").slice(0, 2).toUpperCase()}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{application.applicant?.display_name || "Étudiant AEI"}</p><p className="mt-0.5 text-xs text-slate-500">Pôle {application.preferred_pole} · {formatDate(application.created_at)}</p></div><span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">À examiner</span></div>)}
                        {!pendingApplications.length && <p className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">Aucune candidature en attente.</p>}
                      </div>
                    </article>
                    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                      <PanelTitle eyebrow="Agenda" title="Prochains événements" action={<button type="button" onClick={() => setActiveSection("events")} className="text-sm font-bold text-cyan-700">Gérer</button>} />
                      <div className="mt-5 space-y-3">
                        {dashboard.events.slice(0, 4).map((item) => <div key={item.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700"><CalendarDays className="h-5 w-5" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{item.title}</p><p className="mt-0.5 text-xs text-slate-500">{formatDate(item.starts_at, true)}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>{statusLabels[item.status]}</span></div>)}
                        {!dashboard.events.length && <p className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">Aucun événement créé.</p>}
                      </div>
                    </article>
                  </section>
                </div>
              )}

              {activeSection === "profile" && (
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                  <PanelTitle eyebrow="Contenu public" title="Gérer la fiche du club" description="Les modifications enregistrées apparaîtront sur la fiche publique d’InnoVerse." action={<Link to={`/clubs/${access.club_id}`} className="portal-secondary-button"><Eye className="h-4 w-4" /> Prévisualiser</Link>} />
                  <form onSubmit={saveProfile} className="mt-8 grid gap-5 lg:grid-cols-2">
                    <label className="block"><span className="mb-2 block text-sm font-bold">Nom du club</span><input className="portal-input" value={profileForm.name} onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })} required /></label>
                    <label className="block"><span className="mb-2 block text-sm font-bold">Catégorie</span><input className="portal-input" value={profileForm.category} onChange={(event) => setProfileForm({ ...profileForm, category: event.target.value })} required /></label>
                    <label className="block lg:col-span-2"><span className="mb-2 block text-sm font-bold">Phrase d’accroche</span><input className="portal-input" value={profileForm.tagline} onChange={(event) => setProfileForm({ ...profileForm, tagline: event.target.value })} required /></label>
                    <label className="block lg:col-span-2"><span className="mb-2 block text-sm font-bold">Présentation</span><textarea className="portal-input min-h-36 resize-y" value={profileForm.description} onChange={(event) => setProfileForm({ ...profileForm, description: event.target.value })} required /></label>
                    <label className="block"><span className="mb-2 block text-sm font-bold">Conditions de recrutement</span><input className="portal-input" value={profileForm.recruitment_label} onChange={(event) => setProfileForm({ ...profileForm, recruitment_label: event.target.value })} /></label>
                    <label className="block"><span className="mb-2 block text-sm font-bold">Lien du réseau social</span><input type="url" className="portal-input" value={profileForm.contact_url} onChange={(event) => setProfileForm({ ...profileForm, contact_url: event.target.value })} /></label>
                    <label className="block lg:col-span-2"><span className="mb-2 block text-sm font-bold">Objectifs <span className="font-normal text-slate-400">— un objectif par ligne</span></span><textarea className="portal-input min-h-32 resize-y" value={profileForm.objectives} onChange={(event) => setProfileForm({ ...profileForm, objectives: event.target.value })} /></label>
                    <div className="lg:col-span-2 flex justify-end"><button type="submit" disabled={busy} className="portal-primary-button min-w-44">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Enregistrer la fiche</button></div>
                  </form>
                </section>
              )}

              {activeSection === "events" && (
                <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
                  <form onSubmit={createEvent} className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                    <PanelTitle eyebrow="Programmation" title="Créer un événement" description="Enregistrez un brouillon ou publiez-le immédiatement." />
                    <div className="mt-7 space-y-4">
                      <input className="portal-input" placeholder="Titre de l’événement" value={eventForm.title} onChange={(event) => setEventForm({ ...eventForm, title: event.target.value })} required />
                      <textarea className="portal-input min-h-28 resize-y" placeholder="Description" value={eventForm.description} onChange={(event) => setEventForm({ ...eventForm, description: event.target.value })} required />
                      <div className="grid gap-4 sm:grid-cols-2"><input className="portal-input" placeholder="Type : atelier, conférence…" value={eventForm.event_type} onChange={(event) => setEventForm({ ...eventForm, event_type: event.target.value })} required /><input className="portal-input" placeholder="Lieu" value={eventForm.location} onChange={(event) => setEventForm({ ...eventForm, location: event.target.value })} required /></div>
                      <div className="grid gap-4 sm:grid-cols-2"><label><span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Date et heure</span><input type="datetime-local" className="portal-input" value={eventForm.starts_at} onChange={(event) => setEventForm({ ...eventForm, starts_at: event.target.value })} required /></label><label><span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Capacité</span><input type="number" min="1" className="portal-input" placeholder="Illimitée" value={eventForm.capacity} onChange={(event) => setEventForm({ ...eventForm, capacity: event.target.value })} /></label></div>
                      <select className="portal-select" value={eventForm.status} onChange={(event) => setEventForm({ ...eventForm, status: event.target.value })}><option value="draft">Enregistrer comme brouillon</option><option value="published">Publier maintenant</option></select>
                      <button type="submit" disabled={busy} className="portal-primary-button w-full"><CalendarDays className="h-4 w-4" /> Enregistrer l’événement</button>
                    </div>
                  </form>
                  <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                    <PanelTitle eyebrow="Calendrier" title="Événements du club" description={`${dashboard.events.length} événement${dashboard.events.length > 1 ? "s" : ""} enregistré${dashboard.events.length > 1 ? "s" : ""}.`} />
                    <div className="mt-6 space-y-3">
                      {dashboard.events.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex flex-col gap-4 sm:flex-row sm:items-center"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-cyan-300"><CalendarDays className="h-5 w-5" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{item.title}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{statusLabels[item.status]}</span></div><p className="mt-1 text-sm text-slate-500">{formatDate(item.starts_at, true)} · {item.location}</p></div><button type="button" disabled={busy} onClick={() => runAction(() => clubAdminApi.setEventStatus(item.id, item.status === "published" ? "draft" : "published"), item.status === "published" ? "Événement remis en brouillon." : "Événement publié.")} className="portal-secondary-button !py-2">{item.status === "published" ? "Dépublier" : "Publier"}</button></div></article>)}
                      {!dashboard.events.length && <p className="portal-empty !py-10">Aucun événement pour le moment.</p>}
                    </div>
                  </section>
                </div>
              )}

              {activeSection === "announcements" && (
                <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
                  <form onSubmit={createAnnouncement} className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                    <PanelTitle eyebrow="Communication" title="Nouvelle annonce" description="Informez les visiteurs de la fiche du club." />
                    <div className="mt-7 space-y-4"><input className="portal-input" placeholder="Titre de l’annonce" value={announcementForm.title} onChange={(event) => setAnnouncementForm({ ...announcementForm, title: event.target.value })} required /><textarea className="portal-input min-h-36 resize-y" placeholder="Contenu de l’annonce" value={announcementForm.body} onChange={(event) => setAnnouncementForm({ ...announcementForm, body: event.target.value })} required /><select className="portal-select" value={announcementForm.status} onChange={(event) => setAnnouncementForm({ ...announcementForm, status: event.target.value })}><option value="draft">Enregistrer comme brouillon</option><option value="published">Publier maintenant</option></select><button type="submit" disabled={busy} className="portal-primary-button w-full"><Megaphone className="h-4 w-4" /> Enregistrer l’annonce</button></div>
                  </form>
                  <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><PanelTitle eyebrow="Publications" title="Annonces du club" /><div className="mt-6 space-y-3">{dashboard.announcements.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex flex-col gap-4 sm:flex-row sm:items-start"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700"><FileText className="h-5 w-5" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{item.title}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{statusLabels[item.status]}</span></div><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{item.body}</p></div><button type="button" disabled={busy} onClick={() => runAction(() => clubAdminApi.setAnnouncementStatus(item.id, item.status === "published" ? "draft" : "published"), item.status === "published" ? "Annonce remise en brouillon." : "Annonce publiée.")} className="portal-secondary-button !py-2">{item.status === "published" ? "Dépublier" : "Publier"}</button></div></article>)}{!dashboard.announcements.length && <p className="portal-empty !py-10">Aucune annonce pour le moment.</p>}</div></section>
                </div>
              )}

              {activeSection === "applications" && (
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                  <PanelTitle eyebrow="Recrutement" title="Demandes d’adhésion" description="Examinez la motivation de chaque étudiant. Une acceptation crée automatiquement son adhésion et lui envoie une notification." />
                  <div className="mt-7 space-y-4">
                    {dashboard.applications.map((application) => (
                      <article key={application.id} className="rounded-2xl border border-slate-200 p-5">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-sm font-bold text-violet-700">{(application.applicant?.display_name || "ET").slice(0, 2).toUpperCase()}</span>
                          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-slate-950">{application.applicant?.display_name || "Étudiant AEI"}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${application.status === "accepted" ? "bg-emerald-100 text-emerald-700" : application.status === "refused" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>{statusLabels[application.status]}</span></div><div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500"><span>Pôle : {application.preferred_pole}</span><span>Disponibilité : {application.availability}</span><span>{formatDate(application.created_at)}</span></div><p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">{application.motivation}</p></div>
                          {application.status === "submitted" && <div className="flex gap-2 lg:flex-col"><button type="button" disabled={busy} onClick={() => runAction(() => clubAdminApi.reviewApplication(application.id, "accepted"), "Candidature acceptée et étudiant ajouté aux membres.")} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"><Check className="h-4 w-4" /> Accepter</button><button type="button" disabled={busy} onClick={() => runAction(() => clubAdminApi.reviewApplication(application.id, "refused"), "Candidature refusée et étudiant informé.")} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-100"><X className="h-4 w-4" /> Refuser</button></div>}
                        </div>
                      </article>
                    ))}
                    {!dashboard.applications.length && <p className="portal-empty">Aucune demande d’adhésion reçue.</p>}
                  </div>
                </section>
              )}

              {activeSection === "notifications" && (
                <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
                  <form onSubmit={sendNotification} className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                    <PanelTitle eyebrow="Membres" title="Envoyer une notification" description="Le message apparaîtra dans l’espace de chaque membre actif d’InnoVerse." />
                    <div className="mt-7 space-y-4"><input className="portal-input" placeholder="Objet de la notification" value={notificationForm.title} onChange={(event) => setNotificationForm({ ...notificationForm, title: event.target.value })} required /><textarea className="portal-input min-h-40 resize-y" placeholder="Votre message aux membres…" value={notificationForm.body} onChange={(event) => setNotificationForm({ ...notificationForm, body: event.target.value })} required /><button type="submit" disabled={busy} className="portal-primary-button w-full"><Send className="h-4 w-4" /> Envoyer à {stats.members} membre{stats.members > 1 ? "s" : ""}</button></div>
                  </form>
                  <section className="relative overflow-hidden rounded-3xl bg-[#080d1b] p-7 text-white shadow-xl">
                    <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-violet-500/20 blur-3xl" />
                    <div className="relative"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950"><BellRing className="h-6 w-6" /></span><h2 className="mt-6 text-2xl font-bold">Communication ciblée</h2><p className="mt-3 max-w-lg text-sm leading-7 text-slate-300">Seuls les membres actifs du club reçoivent ces notifications. Les étudiants acceptés sont ajoutés automatiquement à cette audience.</p><div className="mt-8 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-white/10 bg-white/5 p-5"><p className="text-3xl font-bold text-cyan-300">{stats.members}</p><p className="mt-1 text-sm font-semibold text-slate-300">membres actifs</p></div><div className="rounded-2xl border border-white/10 bg-white/5 p-5"><p className="text-3xl font-bold text-violet-300">{stats.attendance}</p><p className="mt-1 text-sm font-semibold text-slate-300">participations confirmées</p></div></div></div>
                  </section>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
