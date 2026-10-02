import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  ExternalLink,
  LoaderCircle,
  Megaphone,
  Newspaper,
  Sparkles,
  UsersRound,
} from "lucide-react";
import clubs from "@/data/Clubs";
import fallbackEvents from "@/data/Events";
import fallbackAdvertisements from "@/data/Publs";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import { publicFeedApi } from "@/services/publicFeedApi";

function ProtectedHomeLink({ to, reason, children, ...props }) {
  const { session } = useAuth();
  const { openAuthModal } = useAuthModal();
  return <Link to={to} {...props} onClick={(event) => {
    if (session) return;
    event.preventDefault();
    openAuthModal({ destination: to, reason });
  }}>{children}</Link>;
}

function fallbackFeed() {
  const clubPosts = clubs.slice(0, 4).map((club, index) => ({
    id: `club-${club.id}`,
    kind: "announcement",
    label: "À la une des clubs",
    author: club.name,
    title: club.tagline,
    description: club.description,
    publishedAt: new Date(Date.now() - index * 86400000).toISOString(),
    to: `/clubs/${club.id}`,
  }));
  const eventPosts = fallbackEvents.slice(0, 3).map((event, index) => ({
    id: `fallback-event-${event.id || index}`,
    kind: "event",
    label: "Événement à venir",
    author: event.organizer || "AEI ENIADB",
    title: event.title,
    description: event.description,
    image: event.cover_url,
    publishedAt: event.starts_at || new Date(Date.now() + index * 86400000).toISOString(),
    location: event.location,
    to: "/evenements",
  }));
  const adPosts = fallbackAdvertisements.slice(0, 2).map((advertisement, index) => ({
    id: `fallback-ad-${advertisement.id || index}`,
    kind: "advertisement",
    label: "Bon plan partenaire",
    author: "AEI ENIADB",
    title: advertisement.titre || advertisement.title,
    description: advertisement.description,
    image: advertisement.image || advertisement.image_url,
    externalUrl: advertisement.url || advertisement.target_url,
    publishedAt: new Date(Date.now() - (index + 2) * 86400000).toISOString(),
    to: "/publicites",
  }));
  return [...clubPosts, ...eventPosts, ...adPosts].sort(
    (left, right) => new Date(right.publishedAt) - new Date(left.publishedAt)
  );
}

function formatDate(value) {
  if (!value) return "À l’instant";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function FeedCard({ item }) {
  const initials = item.author
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/60">
      <div className="flex items-center gap-3 p-5 sm:px-6">
        {item.authorImage ? (
          <img src={item.authorImage} alt={`Logo de ${item.author}`} className="h-11 w-11 shrink-0 rounded-2xl border border-slate-200 bg-white object-contain p-1" />
        ) : (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-xs font-black text-cyan-300">{initials}</span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-black text-slate-950">{item.author}</p>
          <p className="mt-0.5 text-xs text-slate-400">{formatDate(item.publishedAt)}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-[11px] font-black ${item.kind === "event" ? "bg-violet-50 text-violet-700" : item.kind === "advertisement" ? "bg-amber-50 text-amber-700" : "bg-sky-50 text-sky-700"}`}>{item.label}</span>
      </div>
      {item.image && <img src={item.image} alt="" className="max-h-[34rem] w-full border-y border-slate-100 object-cover" />}
      <div className="p-5 sm:px-6 sm:pb-6">
        <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">{item.title}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
        {item.location && <p className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600"><CalendarDays className="h-4 w-4 text-violet-600" /> {item.location}</p>}
        <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
          <ProtectedHomeLink to={item.to} reason={`Authentifiez-vous pour découvrir « ${item.title} ».`} className="portal-secondary-button !py-2.5">Découvrir <ArrowRight className="h-4 w-4" /></ProtectedHomeLink>
          {item.externalUrl && <a href={item.externalUrl} target="_blank" rel="noreferrer" className="portal-primary-button !py-2.5">Voir le lien <ExternalLink className="h-4 w-4" /></a>}
        </div>
      </div>
    </article>
  );
}

export default function HomePage() {
  const { session } = useAuth();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const fallback = useMemo(() => fallbackFeed(), []);

  useEffect(() => {
    let active = true;
    publicFeedApi
      .list()
      .then((items) => active && setFeed(items.length ? items : fallback))
      .catch(() => active && setFeed(fallback))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [fallback]);

  return (
    <div className="portal-page">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-10 text-white shadow-xl sm:px-10 lg:px-12 lg:py-14">
        <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-black text-cyan-200"><Sparkles className="h-4 w-4" /> La vie du campus, en direct</span>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">Actualités, clubs et opportunités de l’AEI ENIADB.</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">Découvrez librement les nouveautés de l’association, les publications des clubs, les événements et les bons plans de la communauté.</p>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <p className="text-sm leading-6 text-slate-300">{session ? "Retrouvez vos favoris, inscriptions et candidatures depuis votre espace personnel." : "Ce fil d’actualité est accessible librement. Une authentification est demandée pour ouvrir toutes les autres rubriques du portail."}</p>
            <ProtectedHomeLink to="/tableau-de-bord" reason="Authentifiez-vous pour accéder à votre espace étudiant." className="portal-primary-button w-full !bg-cyan-300 !text-slate-950 hover:!bg-cyan-200">{session ? "Ouvrir mon tableau de bord" : "Se connecter à l’espace étudiant"} <ArrowRight className="h-4 w-4" /></ProtectedHomeLink>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: <UsersRound className="h-5 w-5" />, title: "Clubs", description: "Découvrez les équipes, leurs activités et leurs projets.", to: "/clubs", tone: "bg-violet-50 text-violet-700" },
          { icon: <CalendarDays className="h-5 w-5" />, title: "Agenda", description: "Consultez les événements ouverts à la communauté.", to: "/evenements", tone: "bg-sky-50 text-sky-700" },
          { icon: <Megaphone className="h-5 w-5" />, title: "Bons plans", description: "Retrouvez les campagnes et annonces sélectionnées.", to: "/publicites", tone: "bg-amber-50 text-amber-700" },
        ].map(({ icon, title, description, to, tone }) => (
          <ProtectedHomeLink key={title} to={to} reason={`Authentifiez-vous pour accéder à la rubrique « ${title} ».`} className="portal-card group p-5 sm:p-6">
            <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}>{icon}</span>
            <h2 className="mt-4 text-lg font-black text-slate-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-black text-sky-700">Explorer <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
          </ProtectedHomeLink>
        ))}
      </section>

      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-sky-700"><Newspaper className="h-4 w-4" /> Fil d’actualité</p><h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Les dernières nouvelles</h2></div>
          <span className="hidden text-sm font-semibold text-slate-400 sm:block">Du plus récent au plus ancien</span>
        </div>
        {loading ? <div className="portal-empty flex items-center justify-center gap-2"><LoaderCircle className="h-5 w-5 animate-spin" /> Chargement des actualités…</div> : <div className="space-y-6">{feed.map((item) => <FeedCard key={item.id} item={item} />)}</div>}
      </div>
    </div>
  );
}
