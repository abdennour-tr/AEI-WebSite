import { createElement, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  Activity, AlertTriangle, Bell, BookOpen, Check, ClipboardCheck, Clock3,
  Database, FileWarning, LayoutDashboard, LoaderCircle, LockKeyhole, RefreshCw,
  LogOut, Search, Shield, ShieldCheck, Trash2, UsersRound, X,
} from "lucide-react";
import { adminApi } from "@/services/adminApi";
import { useAuth } from "@/hooks/useAuth";
import AdminCoursesPanel from "@/components/AdminCoursesPanel";

const tabs = [
  ["overview", "Vue d’ensemble", LayoutDashboard],
  ["moderation", "Validations", ClipboardCheck],
  ["reports", "Signalements", FileWarning],
  ["content", "Tous les contenus", Database, true],
  ["courses", "Gestion des cours", BookOpen, true],
  ["users", "Utilisateurs", UsersRound, true],
  ["deletions", "Données personnelles", Trash2],
  ["audit", "Journal d’audit", Activity],
];
const roleLabels = { student: "Étudiant", moderator: "Modérateur", admin: "Administrateur" };
const statusLabels = { pending: "En attente", approved: "Approuvé", reviewing: "En cours", resolved: "Résolu", dismissed: "Classé", requested: "Demandée", processing: "En traitement", completed: "Terminée", rejected: "Refusé", published: "Publié", active: "Actif", draft: "Brouillon", archived: "Archivé", sold: "Vendu", reserved: "Réservé" };
const contentTypeLabels = {
  project: "Projet étudiant",
  housing: "Colocation",
  product: "Marketplace",
  event: "Événement AEI",
  club_event: "Événement de club",
  advertisement: "Publicité",
  forum: "Discussion",
  course: "Cours",
  opportunity: "Opportunité",
  club_announcement: "Annonce de club",
};

const timestamp = (value) => {
  const parsed = new Date(value || 0).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
};

const newestFirst = (items, getDate) => [...items].sort(
  (first, second) => timestamp(getDate(second)) - timestamp(getDate(first))
);

const formatActivityDate = (value) => value
  ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
  : "Date indisponible";

function Empty({ children }) {
  return <div className="rounded-2xl border border-dashed border-slate-200 px-5 py-10 text-center text-sm text-slate-500">{children}</div>;
}

function Metric({ icon: Icon, label, value, className }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5"><div className="flex items-start justify-between gap-4"><span className={`flex h-11 w-11 items-center justify-center rounded-xl ${className}`}>{createElement(Icon, { className: "h-5 w-5" })}</span><strong className="text-3xl font-black text-white">{value}</strong></div><p className="mt-4 text-sm font-semibold text-slate-300">{label}</p></div>;
}

export default function AdminDashboardPage() {
  const { role, profile } = useOutletContext();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [queue, setQueue] = useState([]);
  const [reports, setReports] = useState([]);
  const [content, setContent] = useState([]);
  const [users, setUsers] = useState([]);
  const [deletions, setDeletions] = useState([]);
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");
  const [configurationMissing, setConfigurationMissing] = useState(false);
  const [moderationDialog, setModerationDialog] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [contentSearch, setContentSearch] = useState("");
  const [contentType, setContentType] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const results = await Promise.allSettled([
      adminApi.listModerationQueue(), adminApi.listReports(),
      role === "admin" ? adminApi.listManagedContent() : Promise.resolve([]),
      role === "admin" ? adminApi.listProfiles() : Promise.resolve([]),
      adminApi.listDeletionRequests(), adminApi.listAuditLog(),
    ]);
    const failure = results.find((result) => result.status === "rejected");
    if (failure) {
      const code = failure.reason?.code;
      setConfigurationMissing(["42P01", "42703", "PGRST202", "PGRST204", "PGRST205"].includes(code));
      setError(failure.reason?.message || "Certaines données d’administration sont indisponibles.");
    } else setConfigurationMissing(false);
    setQueue(newestFirst(results[0].status === "fulfilled" ? results[0].value : [], (item) => item.updated_at || item.created_at));
    setReports(newestFirst(results[1].status === "fulfilled" ? results[1].value : [], (item) => item.created_at));
    setContent(newestFirst(results[2].status === "fulfilled" ? results[2].value : [], (item) => item.created_on));
    setUsers(newestFirst(results[3].status === "fulfilled" ? results[3].value : [], (item) => item.created_at));
    setDeletions(newestFirst(results[4].status === "fulfilled" ? results[4].value : [], (item) => item.created_at));
    setAudit(newestFirst(results[5].status === "fulfilled" ? results[5].value : [], (item) => item.created_at));
    setLoading(false);
  }, [role]);

  useEffect(() => {
    load();
    const unsubscribe = adminApi.subscribeReports(() => load());
    return () => { unsubscribe(); };
  }, [load]);

  const pendingReports = reports.filter((item) => item.status === "pending");
  const pendingDeletions = deletions.filter((item) => ["requested", "processing"].includes(item.status));
  const attentionCount = queue.length + pendingReports.length + pendingDeletions.length;
  const tabCounts = { moderation: queue.length, reports: pendingReports.length, deletions: pendingDeletions.length };
  const notificationGroups = [
    { tab: "moderation", label: "Contenus à valider", count: queue.length, tone: "bg-cyan-50 text-cyan-800" },
    { tab: "reports", label: "Signalements ouverts", count: pendingReports.length, tone: "bg-amber-50 text-amber-800" },
    { tab: "deletions", label: "Demandes de suppression", count: pendingDeletions.length, tone: "bg-rose-50 text-rose-800" },
  ];
  const visibleTabs = tabs.filter((tab) => !tab[3] || role === "admin");
  const filteredContent = useMemo(() => content.filter((item) => {
    const matchesType = !contentType || item.content_type === contentType;
    const term = contentSearch.trim().toLowerCase();
    const matchesSearch = !term || item.content_title?.toLowerCase().includes(term);
    return matchesType && matchesSearch;
  }), [content, contentSearch, contentType]);
  const metrics = useMemo(() => [
    [ClipboardCheck, "Contenus à valider", queue.length, "bg-cyan-300/15 text-cyan-200"],
    [AlertTriangle, "Signalements ouverts", pendingReports.length, "bg-amber-300/15 text-amber-200"],
    [UsersRound, "Comptes suivis", role === "admin" ? users.length : "—", "bg-violet-300/15 text-violet-200"],
    [Trash2, "Demandes de suppression", pendingDeletions.length, "bg-rose-300/15 text-rose-200"],
  ], [pendingDeletions.length, pendingReports.length, queue.length, role, users.length]);

  const runAction = async (key, action) => {
    setActionId(key); setError("");
    try { await action(); await load(); return true; }
    catch (actionError) { setError(actionError.message || "L’action n’a pas pu être enregistrée."); return false; }
    finally { setActionId(""); }
  };

  const moderate = (item, decision) => {
    if (decision === "rejected") {
      setModerationDialog({ item, reason: "" });
      return;
    }
    runAction(`moderation-${item.contentType}-${item.id}`, () => adminApi.moderate(item.contentType, item.id, decision, ""));
  };

  const confirmRejection = async (event) => {
    event.preventDefault();
    if (!moderationDialog?.reason.trim()) return;
    const { item, reason } = moderationDialog;
    const saved = await runAction(`moderation-${item.contentType}-${item.id}`, () => adminApi.moderate(item.contentType, item.id, "rejected", reason.trim()));
    if (saved) setModerationDialog(null);
  };

  const confirmDelete = async (event) => {
    event.preventDefault();
    if (!deleteDialog?.reason.trim()) return;
    const { item, reason } = deleteDialog;
    const saved = await runAction(`delete-${item.content_type}-${item.content_id}`, () => adminApi.deleteContent(item.content_type, item.content_id, reason.trim()));
    if (saved) setDeleteDialog(null);
  };

  const CardTitle = ({ eyebrow, title, description }) => <div><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">{eyebrow}</p><h2 className="mt-1 text-2xl font-black">{title}</h2>{description && <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>}</div>;

  return (
    <main className="min-h-screen bg-[#070b17] text-white">
      <div className="grid min-h-screen lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="border-b border-white/10 bg-[#0b1120] p-5 lg:border-b-0 lg:border-r lg:p-6">
          <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950"><ShieldCheck className="h-6 w-6" /></span><div><p className="font-black">AEI Control</p><p className="text-xs text-slate-400">Administration sécurisée</p></div></div>
          <nav className="mt-7 grid gap-1 sm:grid-cols-3 lg:grid-cols-1" aria-label="Navigation administration">
            {visibleTabs.map(([id, label, Icon]) => <button key={id} type="button" onClick={() => { setActiveTab(id); setNotificationsOpen(false); }} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${activeTab === id ? "bg-cyan-300 text-slate-950" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}>{createElement(Icon, { className: "h-4 w-4 shrink-0" })}<span className="min-w-0 flex-1 truncate">{label}</span>{tabCounts[id] > 0 && <span className={`flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-black ${activeTab === id ? "bg-slate-950 text-white" : "bg-rose-500 text-white"}`}>{tabCounts[id] > 99 ? "99+" : tabCounts[id]}</span>}</button>)}
          </nav>
          <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Session vérifiée</p><p className="mt-2 truncate text-sm font-bold">{profile.full_name || profile.email}</p><p className="mt-1 text-xs text-slate-400">{roleLabels[role]}</p></div>
          <button type="button" onClick={async () => { await signOut(); navigate("/admin", { replace: true }); }} className="mt-4 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-400 transition hover:bg-white/5 hover:text-white"><LogOut className="h-4 w-4" /> Fermer la session</button>
        </aside>

        <section className="min-w-0 bg-slate-50 text-slate-950">
          <header className="border-b border-slate-200 bg-white px-5 py-5 sm:px-8"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Centre de confiance</p><h1 className="mt-1 text-2xl font-black sm:text-3xl">Pilotage et modération</h1></div><div className="flex items-center gap-2"><div className="relative"><button type="button" onClick={() => setNotificationsOpen((open) => !open)} aria-label={`${attentionCount} notification${attentionCount === 1 ? "" : "s"} nécessitant votre attention`} aria-expanded={notificationsOpen} className={`relative flex h-11 w-11 items-center justify-center rounded-xl border transition ${notificationsOpen ? "border-cyan-300 bg-cyan-50 text-cyan-800" : "border-slate-200 bg-white text-slate-600 hover:border-cyan-300 hover:text-cyan-800"}`}><Bell className={`h-5 w-5 ${attentionCount > 0 ? "text-rose-600" : ""}`} />{attentionCount > 0 && <span className="absolute -right-1.5 -top-1.5 flex min-h-5 min-w-5 animate-pulse items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-black text-white ring-2 ring-white">{attentionCount > 99 ? "99+" : attentionCount}</span>}</button>{notificationsOpen && <div className="absolute right-0 top-14 z-40 w-[min(22rem,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"><div className="border-b border-slate-100 px-5 py-4"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-black text-slate-950">Centre de notifications</p><p className="mt-1 text-xs text-slate-500">Éléments nécessitant une action</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-black ${attentionCount > 0 ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>{attentionCount}</span></div></div><div className="space-y-1 p-2">{notificationGroups.map((notification) => <button key={notification.tab} type="button" onClick={() => { setActiveTab(notification.tab); setNotificationsOpen(false); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50"><span className={`flex h-9 min-w-9 items-center justify-center rounded-xl text-sm font-black ${notification.tone}`}>{notification.count}</span><span className="min-w-0 flex-1 text-sm font-bold text-slate-700">{notification.label}</span><span className="text-xs font-semibold text-cyan-700">Voir</span></button>)}</div>{attentionCount === 0 && <p className="border-t border-slate-100 px-5 py-4 text-center text-sm font-semibold text-emerald-700">Tout est à jour.</p>}</div>}</div><button type="button" onClick={load} className="portal-secondary-button" disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /><span className="hidden sm:inline">Actualiser</span></button></div></div></header>
          <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8">
            {configurationMissing && <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><LockKeyhole className="mt-0.5 h-5 w-5 shrink-0" /><div><strong>Activation Supabase requise</strong><p>Le tableau de bord est installé. Exécutez le script d’administration fourni pour activer les validations, signalements et journaux.</p></div></div>}
            {error && !configurationMissing && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}

            {activeTab === "overview" && <>
              <section className="overflow-hidden rounded-3xl bg-slate-950 p-6 shadow-xl sm:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-bold text-cyan-200"><Shield className="h-3.5 w-3.5" /> Sécurité opérationnelle</span><h2 className="mt-4 text-3xl font-black text-white">Bonjour, {profile.full_name?.split(" ")[0] || "administrateur"}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Les actions sensibles sont contrôlées par les rôles Supabase et consignées dans un journal protégé.</p></div><div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm font-bold text-emerald-200">Accès {roleLabels[role].toLowerCase()} actif</div></div><div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([Icon, label, value, tone]) => <Metric key={label} icon={Icon} label={label} value={value} className={tone} />)}</div></section>
              <div className="grid gap-6 xl:grid-cols-2"><section className="portal-panel"><div className="flex items-center justify-between"><CardTitle eyebrow="Priorité" title="À vérifier" /><button onClick={() => setActiveTab("moderation")} className="text-sm font-bold text-cyan-700">Tout voir</button></div><div className="mt-5 space-y-3">{queue.slice(0, 4).map((item) => <div key={`${item.contentType}-${item.id}`} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4"><span className="rounded-lg bg-cyan-50 px-2.5 py-1 text-xs font-black text-cyan-800">{item.contentLabel}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{item.contentTitle}</p><p className="mt-1 text-xs text-slate-400">{formatActivityDate(item.updated_at || item.created_at)}</p></div></div>)}{!loading && queue.length === 0 && <Empty>Aucun contenu en attente.</Empty>}</div></section><section className="portal-panel"><div className="flex items-center justify-between"><CardTitle eyebrow="Confiance" title="Signalements récents" /><button onClick={() => setActiveTab("reports")} className="text-sm font-bold text-amber-700">Tout voir</button></div><div className="mt-5 space-y-3">{pendingReports.slice(0, 4).map((report) => <div key={report.id} className="rounded-2xl border border-slate-100 p-4"><strong className="text-sm">{report.reason}</strong><p className="mt-2 text-xs text-slate-500">{report.content_type} · {report.reporter?.display_name || "Membre AEI"} · {formatActivityDate(report.created_at)}</p></div>)}{!loading && pendingReports.length === 0 && <Empty>Aucun signalement ouvert.</Empty>}</div></section></div>
            </>}

            {activeTab === "moderation" && <section className="portal-panel"><CardTitle eyebrow="File de validation" title="Contenus avant publication" description="Les demandes les plus récentes apparaissent en premier. Vérifiez la conformité, la pertinence et l’exactitude avant publication." /><div className="mt-6 space-y-3">{queue.map((item) => { const key = `moderation-${item.contentType}-${item.id}`; return <article key={key} className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-5 lg:flex-row lg:items-center"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-black text-cyan-800">{item.contentLabel}</span><span className="inline-flex items-center gap-1 text-xs text-slate-400"><Clock3 className="h-3.5 w-3.5" /> {formatActivityDate(item.updated_at || item.created_at)}</span></div><h3 className="mt-2 truncate text-lg font-black">{item.contentTitle}</h3><p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">{item.description || item.tagline || "Aucune description fournie."}</p></div><div className="flex shrink-0 gap-2"><button onClick={() => moderate(item, "rejected")} disabled={actionId === key} className="portal-secondary-button text-rose-700"><X className="h-4 w-4" /> Refuser</button><button onClick={() => moderate(item, "approved")} disabled={actionId === key} className="portal-primary-button">{actionId === key ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Approuver</button></div></article>; })}{!loading && queue.length === 0 && <Empty>Tous les contenus ont été traités.</Empty>}</div></section>}

            {activeTab === "reports" && <section className="portal-panel"><CardTitle eyebrow="Confiance" title="Signalements de la communauté" description="Les signalements sont classés du plus récent au plus ancien. Chaque décision est enregistrée dans le journal d’audit." /><div className="mt-6 space-y-3">{reports.map((report) => { const key = `report-${report.id}`; return <article key={report.id} className="rounded-2xl border border-slate-200 p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-center"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-800">{statusLabels[report.status] || report.status}</span><span className="text-xs text-slate-400">{report.content_type} · {report.content_id}</span><span className="inline-flex items-center gap-1 text-xs text-slate-400"><Clock3 className="h-3.5 w-3.5" /> {formatActivityDate(report.created_at)}</span></div><h3 className="mt-2 font-black">{report.reason}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{report.details || "Aucun détail complémentaire."}</p></div>{report.status === "pending" && <div className="flex gap-2"><button onClick={() => runAction(key, () => adminApi.reviewReport(report.id, "dismissed", "Signalement classé"))} className="portal-secondary-button" disabled={actionId === key}>Classer</button><button onClick={() => runAction(key, () => adminApi.reviewReport(report.id, "resolved", "Signalement traité"))} className="portal-primary-button" disabled={actionId === key}>Résoudre</button></div>}</div></article>; })}{!loading && reports.length === 0 && <Empty>Aucun signalement enregistré.</Empty>}</div></section>}

            {activeTab === "content" && role === "admin" && <section className="portal-panel"><CardTitle eyebrow="Contrôle global" title="Tous les contenus du portail" description="Consultez et supprimez les projets, annonces, produits, événements, cours, opportunités et publications communautaires. Chaque suppression est définitive et enregistrée dans le journal d’audit." /><div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_15rem]"><label className="relative"><Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><input value={contentSearch} onChange={(event) => setContentSearch(event.target.value)} className="portal-input pl-10" placeholder="Rechercher un contenu…" /></label><select value={contentType} onChange={(event) => setContentType(event.target.value)} className="portal-select"><option value="">Toutes les catégories</option>{Object.entries(contentTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><div className="mt-6 space-y-3">{filteredContent.map((item) => { const key = `delete-${item.content_type}-${item.content_id}`; return <article key={key} className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700">{contentTypeLabels[item.content_type] || item.content_type}</span>{item.moderation_state && <span className={`rounded-full px-2.5 py-1 text-xs font-black ${item.moderation_state === "approved" ? "bg-emerald-50 text-emerald-700" : item.moderation_state === "rejected" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}>{statusLabels[item.moderation_state] || item.moderation_state}</span>}<span className="text-xs text-slate-400">{item.content_status}</span></div><h3 className="mt-2 truncate font-black text-slate-950">{item.content_title}</h3><p className="mt-1 text-xs text-slate-400">Créé le {new Date(item.created_on).toLocaleDateString("fr-FR")}</p></div><button type="button" disabled={actionId === key} onClick={() => setDeleteDialog({ item, reason: "" })} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-black text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"><Trash2 className="h-4 w-4" /> Supprimer</button></article>; })}{!loading && filteredContent.length === 0 && <Empty>Aucun contenu ne correspond à ces critères.</Empty>}</div></section>}

            {activeTab === "courses" && role === "admin" && <AdminCoursesPanel />}

            {activeTab === "users" && role === "admin" && <section className="portal-panel"><CardTitle eyebrow="Accès" title="Rôles et autorisations" description="Les responsables de clubs sont attribués séparément à un club précis. Les rôles ci-dessous concernent le portail global." /><div className="mt-6 overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400"><th className="px-3 py-3">Utilisateur</th><th className="px-3 py-3">E-mail</th><th className="px-3 py-3">Rôle</th><th className="px-3 py-3 text-right">Modifier</th></tr></thead><tbody>{users.map((user) => <tr key={user.id} className="border-b border-slate-100"><td className="px-3 py-4 font-bold">{user.full_name || "Sans nom"}</td><td className="px-3 py-4 text-slate-500">{user.email}</td><td className="px-3 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold">{roleLabels[user.role] || user.role}</span></td><td className="px-3 py-4 text-right"><select value={user.role} disabled={actionId === `role-${user.id}`} onChange={(event) => runAction(`role-${user.id}`, () => adminApi.setRole(user.id, event.target.value))} className="portal-select ml-auto max-w-44"><option value="student">Étudiant</option><option value="moderator">Modérateur</option><option value="admin">Administrateur</option></select></td></tr>)}</tbody></table></div></section>}

            {activeTab === "deletions" && <section className="portal-panel"><CardTitle eyebrow="Confidentialité" title="Demandes liées aux données" description="Suivez les demandes de suppression et conservez une trace de leur traitement." /><div className="mt-6 space-y-3">{deletions.map((request) => { const key = `deletion-${request.id}`; return <article key={request.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-5 lg:flex-row lg:items-center"><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-black text-rose-800">{statusLabels[request.status] || request.status}</span><span className="text-xs text-slate-400">{new Date(request.created_at).toLocaleDateString("fr-FR")}</span></div><h3 className="mt-2 font-black">{request.profile?.full_name || request.profile?.email || "Compte étudiant"}</h3><p className="mt-1 text-sm text-slate-500">{request.reason || "Suppression du compte et des données personnelles."}</p></div>{["requested", "processing"].includes(request.status) && <div className="flex gap-2"><button onClick={() => runAction(key, () => adminApi.reviewDeletionRequest(request.id, "processing", "Prise en charge"))} className="portal-secondary-button" disabled={actionId === key}>Prendre en charge</button><button onClick={() => runAction(key, () => adminApi.reviewDeletionRequest(request.id, "completed", "Suppression vérifiée"))} className="portal-primary-button" disabled={actionId === key}>Marquer terminée</button></div>}</article>; })}{!loading && deletions.length === 0 && <Empty>Aucune demande de suppression.</Empty>}</div></section>}

            {activeTab === "audit" && <section className="portal-panel"><CardTitle eyebrow="Traçabilité" title="Journal des actions administratives" description="Historique horodaté des validations, décisions et changements de rôle." /><div className="mt-6 space-y-3">{audit.map((entry) => <article key={entry.id} className="flex gap-4 rounded-2xl border border-slate-200 p-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-cyan-300"><Activity className="h-4 w-4" /></span><div className="min-w-0"><p className="font-bold">{entry.action}</p><p className="mt-1 text-sm text-slate-500">{entry.actor?.display_name || "Administrateur"} · {entry.target_type || "portail"} {entry.target_id ? `· ${entry.target_id}` : ""}</p><p className="mt-1 text-xs text-slate-400">{new Date(entry.created_at).toLocaleString("fr-FR")}</p></div></article>)}{!loading && audit.length === 0 && <Empty>Le journal ne contient encore aucune action.</Empty>}</div></section>}
          </div>
        </section>
      </div>

      {moderationDialog && <div className="portal-modal-backdrop" onMouseDown={() => !actionId && setModerationDialog(null)}><form onSubmit={confirmRejection} className="portal-modal max-w-lg" role="dialog" aria-modal="true" aria-labelledby="rejection-title" onMouseDown={(event) => event.stopPropagation()}><button type="button" onClick={() => setModerationDialog(null)} className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Fermer"><X className="h-5 w-5" /></button><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700"><AlertTriangle className="h-6 w-6" /></span><h2 id="rejection-title" className="mt-4 pr-10 text-2xl font-black text-slate-950">Refuser cette publication</h2><p className="mt-2 text-sm leading-6 text-slate-500">Expliquez clairement à l’auteur ce qu’il doit corriger dans « {moderationDialog.item.contentTitle} ».</p><label className="mt-5 block text-sm font-bold text-slate-700">Motif du refus<textarea autoFocus required minLength={3} maxLength={600} value={moderationDialog.reason} onChange={(event) => setModerationDialog({ ...moderationDialog, reason: event.target.value })} className="portal-input mt-2 min-h-32 resize-y" placeholder="Exemple : informations incomplètes ou contenu non conforme…" /></label>{error && <p className="mt-3 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}<div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" className="portal-secondary-button" onClick={() => setModerationDialog(null)}>Annuler</button><button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-black text-white hover:bg-rose-700" disabled={Boolean(actionId)}>{actionId ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />} Confirmer le refus</button></div></form></div>}

      {deleteDialog && <div className="portal-modal-backdrop" onMouseDown={() => !actionId && setDeleteDialog(null)}><form onSubmit={confirmDelete} className="portal-modal max-w-lg" role="dialog" aria-modal="true" aria-labelledby="delete-content-title" onMouseDown={(event) => event.stopPropagation()}><button type="button" onClick={() => setDeleteDialog(null)} className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Fermer"><X className="h-5 w-5" /></button><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700"><Trash2 className="h-6 w-6" /></span><h2 id="delete-content-title" className="mt-4 pr-10 text-2xl font-black text-slate-950">Supprimer définitivement</h2><p className="mt-2 text-sm leading-6 text-slate-500">Vous allez supprimer « {deleteDialog.item.content_title} » et ses données associées. Cette action sera enregistrée dans le journal d’audit.</p><label className="mt-5 block text-sm font-bold text-slate-700">Motif administratif<textarea autoFocus required minLength={3} maxLength={600} value={deleteDialog.reason} onChange={(event) => setDeleteDialog({ ...deleteDialog, reason: event.target.value })} className="portal-input mt-2 min-h-28 resize-y" placeholder="Indiquez pourquoi ce contenu doit être supprimé…" /></label>{error && <p className="mt-3 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}<div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" className="portal-secondary-button" onClick={() => setDeleteDialog(null)}>Conserver</button><button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-black text-white hover:bg-rose-700" disabled={Boolean(actionId)}>{actionId ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Supprimer définitivement</button></div></form></div>}
    </main>
  );
}
