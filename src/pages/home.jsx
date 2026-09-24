import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FolderGit2,
  Heart,
  Sparkles,
  UsersRound,
} from "lucide-react";
import clubs from "@/data/Clubs";
import fallbackEvents from "@/data/Events";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { agendaApi, formatAgendaEvent } from "@/services/agendaApi";
import { clubApplicationsApi, favoritesApi, notificationsApi } from "@/services/portalApi";

const quickActions = [
  ["Découvrir les clubs", "Trouvez une équipe et candidatez", "/clubs", UsersRound, "bg-violet-50 text-violet-700"],
  ["Consulter l’agenda", "Ateliers, conférences et compétitions", "/evenements", CalendarDays, "bg-sky-50 text-sky-700"],
  ["Explorer les cours", "Supports et ressources pédagogiques", "/cours", BookOpen, "bg-emerald-50 text-emerald-700"],
  ["Voir les projets", "Réalisations publiques des étudiants", "/projets", FolderGit2, "bg-amber-50 text-amber-700"],
];

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon après-midi";
  return "Bonsoir";
};

function recommendClubs(metadata) {
  const preferences = JSON.stringify(metadata?.onboarding || {}).toLocaleLowerCase("fr");
  const scored = clubs.map((club) => {
    const content = `${club.name} ${club.category} ${club.tagline} ${club.activities.join(" ")}`.toLocaleLowerCase("fr");
    const keywords = preferences.split(/[^a-zà-ÿ0-9]+/).filter((word) => word.length > 3);
    return { club, score: keywords.filter((word) => content.includes(word)).length };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, 3).map(({ club }) => club);
}

export default function HomePage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState({
    favorites: [],
    notifications: [],
    applications: [],
    events: fallbackEvents.map(formatAgendaEvent),
  });
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "étudiant";
  const recommendations = useMemo(() => recommendClubs(user?.user_metadata), [user?.user_metadata]);

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      const [favorites, notifications, applications, events] = await Promise.allSettled([
        favoritesApi.list(),
        notificationsApi.list(),
        clubApplicationsApi.listMine(),
        agendaApi.list(),
      ]);
      if (!active) return;
      setSnapshot({
        favorites: favorites.status === "fulfilled" ? favorites.value : [],
        notifications: notifications.status === "fulfilled" ? notifications.value : [],
        applications: applications.status === "fulfilled" ? applications.value : [],
        events:
          events.status === "fulfilled" && events.value.length
            ? events.value
            : fallbackEvents.map(formatAgendaEvent),
      });
      setLoading(false);
    };
    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  const nextEvents = snapshot.events
    .filter((event) => new Date(event.starts_at) >= new Date())
    .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))
    .slice(0, 3);
  const unread = snapshot.notifications.filter((item) => !item.read_at).length;
  const accepted = snapshot.applications.filter((item) => item.status === "accepted").length;

  return (
    <div className="portal-page">
      <section className="relative min-w-0 overflow-hidden rounded-2xl bg-slate-950 px-5 py-6 text-white shadow-xl sm:rounded-3xl sm:px-8 sm:py-9">
        <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-sky-500/15 blur-3xl" />
        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1.5 text-xs font-bold text-sky-200">
              <Sparkles className="h-3.5 w-3.5" /> Tableau de bord étudiant
            </div>
            <h1 className="mt-4 break-words text-2xl font-bold tracking-tight sm:text-4xl">
              {greeting()}, {displayName}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
              Retrouvez vos prochaines activités, vos candidatures et les contenus qui correspondent à vos intérêts.
            </p>
          </div>
          <Link to="/profile" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-sky-50 sm:w-auto sm:shrink-0">
            Compléter mon profil <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {loading ? (
        <LoadingSkeleton cards={4} />
      ) : (
        <>
          <section className="grid min-w-0 grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
            {[
              [snapshot.favorites.length, "favoris", Heart, "text-rose-600 bg-rose-50", "/favori"],
              [nextEvents.length, "événements à venir", CalendarDays, "text-sky-700 bg-sky-50", "/evenements"],
              [snapshot.applications.length, "candidatures clubs", CheckCircle2, "text-emerald-700 bg-emerald-50", "/clubs"],
              [unread, "notifications non lues", Bell, "text-amber-700 bg-amber-50", "/favori"],
            ].map(([value, label, Icon, color, to]) => (
              <Link key={label} to={to} className="portal-panel group flex min-w-0 flex-col items-start gap-3 p-3 transition hover:border-sky-200 min-[430px]:flex-row min-[430px]:items-center sm:gap-4 sm:p-5">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${color}`}><Icon className="h-5 w-5" /></span>
                <span className="min-w-0"><strong className="block text-xl font-bold text-slate-950 sm:text-2xl">{value}</strong><span className="mt-0.5 block break-words text-xs font-semibold leading-5 text-slate-500 sm:text-sm">{label}</span></span>
              </Link>
            ))}
          </section>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
            <section className="portal-panel">
              <div className="flex flex-col items-start justify-between gap-2 min-[430px]:flex-row min-[430px]:items-center min-[430px]:gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">À votre agenda</p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950">Prochains rendez-vous</h2>
                </div>
                <Link to="/evenements" className="text-sm font-bold text-sky-700 hover:text-sky-900">Agenda complet</Link>
              </div>
              {nextEvents.length ? (
                <div className="mt-6 grid gap-3">
                  {nextEvents.map((event) => (
                    <Link key={`${event.source || "event"}-${event.id}`} to="/evenements" className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 p-3 transition hover:border-sky-200 hover:bg-sky-50/50 sm:gap-4 sm:p-4">
                      <span className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-slate-950 text-white"><strong className="text-lg leading-none">{event.dayNumber}</strong><span className="mt-1 text-[10px] font-bold text-sky-300">{event.monthShort}</span></span>
                      <span className="min-w-0 flex-1"><strong className="block truncate text-slate-950">{event.title}</strong><span className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-slate-500 sm:text-sm"><Clock3 className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{event.timeLabel} · {event.organizer || "AEI ENIAD"}</span></span></span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="mt-6"><EmptyState icon={CalendarDays} title="Aucun événement programmé" description="Consultez l’agenda plus tard ou explorez les clubs pour découvrir leurs prochaines activités." actionLabel="Explorer les clubs" to="/clubs" /></div>
              )}
            </section>

            <section className="portal-panel">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-700">Pour vous</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">Clubs recommandés</h2>
              <div className="mt-6 space-y-3">
                {recommendations.map((club) => (
                  <Link key={club.id} to={`/clubs/${club.id}`} className="group flex items-center gap-3 rounded-2xl bg-slate-50 p-4 transition hover:bg-violet-50">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white font-bold text-violet-700 shadow-sm">{club.shortName.slice(0, 2)}</span>
                    <span className="min-w-0 flex-1"><strong className="block truncate text-slate-950">{club.name}</strong><span className="mt-0.5 block truncate text-sm text-slate-500">{club.category}</span></span>
                    <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
              {accepted > 0 && <p className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">Vous êtes déjà accepté dans {accepted} club{accepted > 1 ? "s" : ""}.</p>}
            </section>
          </div>

          <section>
            <div className="mb-5"><p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">Accès rapide</p><h2 className="mt-1 text-2xl font-bold text-slate-950">Continuer votre parcours</h2></div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {quickActions.map(([title, description, to, Icon, color]) => (
                <Link key={title} to={to} className="portal-card group p-5">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}><Icon className="h-5 w-5" /></span>
                  <h3 className="mt-5 font-bold text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-sky-700">Accéder <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
