import { createElement } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronRight,
  Clock3,
  Home,
  MessageCircleMore,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import event1 from "../assets/events/event1.png";
import event2 from "../assets/events/event2.png";
import event3 from "../assets/events/event3.png";

const quickLinks = [
  {
    title: "Cours & ressources",
    description: "Supports, exercices et documents organisés par niveau.",
    to: "/cours",
    icon: BookOpen,
    accent: "bg-blue-50 text-blue-700",
  },
  {
    title: "Stages & opportunités",
    description: "Des offres sélectionnées pour préparer votre avenir.",
    to: "/stages-opportunites",
    icon: BriefcaseBusiness,
    accent: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "Colocation",
    description: "Trouvez un logement ou publiez votre propre annonce.",
    to: "/colocation",
    icon: Home,
    accent: "bg-amber-50 text-amber-700",
  },
  {
    title: "Marketplace",
    description: "Achetez et vendez entre étudiants en toute simplicité.",
    to: "/marketplace",
    icon: ShoppingBag,
    accent: "bg-violet-50 text-violet-700",
  },
];

const events = [
  {
    title: "Journée d’intégration",
    date: "18 septembre 2026",
    category: "Vie étudiante",
    description:
      "Une journée pour découvrir le campus, rencontrer les associations et créer vos premiers liens.",
    image: event1,
  },
  {
    title: "Hackathon IA",
    date: "26 septembre 2026",
    category: "Innovation",
    image: event2,
  },
  {
    title: "Rencontre entrepreneuriat",
    date: "3 octobre 2026",
    category: "Carrière",
    image: event3,
  },
];

const announcements = [
  {
    title: "Colocation à 8 minutes du campus",
    description: "Deux chambres disponibles dans un appartement meublé.",
    meta: "350 DH / mois",
    type: "Logement",
    icon: Building2,
    to: "/colocation",
  },
  {
    title: "Pack de révision — Mathématiques",
    description: "Fiches synthétiques, exercices et corrigés pour préparer vos examens.",
    meta: "Nouveau support",
    type: "Cours",
    icon: BookOpen,
    to: "/cours",
  },
  {
    title: "Stage d’initiation en intelligence artificielle",
    description: "Une première expérience encadrée au sein d’une équipe produit.",
    meta: "Candidature ouverte",
    type: "Opportunité",
    icon: BriefcaseBusiness,
    to: "/stages-opportunites",
  },
];

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-sky-700">
          {eyebrow}
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

function HomePage() {
  return (
    <div className="bg-slate-50 text-slate-950">
      <section className="relative isolate overflow-hidden bg-slate-950 px-5 py-12 text-white sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-semibold text-sky-100 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
              L’espace numérique de la communauté AEI
            </div>
            <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Votre quotidien étudiant,
              <span className="block bg-linear-to-r from-sky-300 to-cyan-200 bg-clip-text text-transparent">
                réuni au même endroit.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Accédez à vos cours, trouvez une opportunité, échangez avec la
              communauté et profitez pleinement de votre vie sur le campus.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/cours"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-950/30 transition hover:bg-sky-400"
              >
                Explorer les ressources
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/evenements"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                Voir l’agenda
                <CalendarDays className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3 border-t border-white/10 pt-6 text-sm">
              <div>
                <p className="font-bold text-white">Apprendre</p>
                <p className="mt-1 text-xs text-slate-400">Cours & supports</p>
              </div>
              <div>
                <p className="font-bold text-white">S’entraider</p>
                <p className="mt-1 text-xs text-slate-400">Forum & échanges</p>
              </div>
              <div>
                <p className="font-bold text-white">Évoluer</p>
                <p className="mt-1 text-xs text-slate-400">Stages & projets</p>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:mx-0 lg:ml-auto">
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">
                    Aujourd’hui
                  </p>
                  <p className="mt-1 text-lg font-bold">Votre espace étudiant</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/15 text-sky-300">
                  <BookOpen className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <Link
                  to="/evenements"
                  className="group flex items-center gap-4 rounded-2xl bg-white p-4 text-slate-900 transition hover:-translate-y-0.5"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-sky-700">À LA UNE</p>
                    <p className="truncate font-bold">Journée d’intégration</p>
                    <p className="mt-0.5 text-xs text-slate-500">18 septembre · Campus AEI</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1" />
                </Link>

                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/forum-communaute"
                    className="rounded-2xl border border-white/10 bg-white/8 p-4 transition hover:bg-white/12"
                  >
                    <MessageCircleMore className="h-5 w-5 text-cyan-300" />
                    <p className="mt-3 text-sm font-bold">Communauté</p>
                    <p className="mt-1 text-xs text-slate-400">Poser une question</p>
                  </Link>
                  <Link
                    to="/chatbot"
                    className="rounded-2xl border border-white/10 bg-white/8 p-4 transition hover:bg-white/12"
                  >
                    <Bot className="h-5 w-5 text-cyan-300" />
                    <p className="mt-3 text-sm font-bold">Assistant AEI</p>
                    <p className="mt-1 text-xs text-slate-400">Obtenir de l’aide</p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-20 px-5 py-14 sm:px-8 sm:py-18 lg:px-12 lg:py-20">
        <section>
          <SectionHeading
            eyebrow="Accès rapides"
            title="Tout ce dont vous avez besoin"
            description="Des services pensés pour vous faire gagner du temps, de votre premier cours à votre première expérience professionnelle."
          />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {quickLinks.map(({ title, description, to, icon, accent }) => (
              <Link
                key={title}
                to={to}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl hover:shadow-slate-200/60"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}>
                  {createElement(icon, { className: "h-5 w-5" })}
                </div>
                <h3 className="mt-5 font-bold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-sky-700">
                  Accéder
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading
            eyebrow="Vie du campus"
            title="Les prochains rendez-vous"
            description="Participez aux événements qui font vivre la communauté AEI."
            action={
              <Link
                to="/evenements"
                className="inline-flex items-center gap-1 text-sm font-bold text-sky-700 hover:text-sky-900"
              >
                Voir tout l’agenda <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />

          <div className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
            <article className="group relative min-h-[420px] overflow-hidden rounded-3xl bg-slate-900 shadow-xl">
              <img
                src={events[0].image}
                alt={events[0].title}
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/45 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-semibold">
                  <span className="rounded-full bg-sky-500 px-3 py-1.5">
                    {events[0].category}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-slate-200">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {events[0].date}
                  </span>
                </div>
                <h3 className="text-2xl font-bold sm:text-3xl">{events[0].title}</h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
                  {events[0].description}
                </p>
              </div>
            </article>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
              {events.slice(1).map((event) => (
                <article
                  key={event.title}
                  className="group flex min-h-48 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-2/5 object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="flex flex-1 flex-col justify-center p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
                      {event.category}
                    </p>
                    <h3 className="mt-2 font-bold leading-snug text-slate-950">
                      {event.title}
                    </h3>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock3 className="h-3.5 w-3.5" /> {event.date}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section>
          <SectionHeading
            eyebrow="À ne pas manquer"
            title="Dernières annonces"
            description="Une sélection des nouvelles publications de la communauté."
          />
          <div className="grid gap-5 md:grid-cols-3">
            {announcements.map(({ title, description, meta, type, icon, to }) => (
              <Link
                key={title}
                to={to}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-sky-200 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {type}
                  </span>
                  {createElement(icon, { className: "h-5 w-5 text-sky-700" })}
                </div>
                <h3 className="mt-6 text-lg font-bold leading-snug text-slate-950">
                  {title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                  {description}
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs font-semibold text-slate-500">{meta}</span>
                  <ArrowRight className="h-4 w-4 text-sky-700 transition group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden rounded-3xl bg-sky-700 px-6 py-10 text-white shadow-xl shadow-sky-100 sm:px-10 lg:flex lg:items-center lg:justify-between lg:px-12">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[40px] border-white/5" />
          <div className="relative max-w-2xl">
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
              <Bot className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold sm:text-3xl">
              Une question ? L’assistant AEI vous accompagne.
            </h2>
            <p className="mt-3 text-sm leading-6 text-sky-100 sm:text-base">
              Trouvez rapidement une information sur vos cours, les services du
              portail ou la vie étudiante.
            </p>
          </div>
          <Link
            to="/chatbot"
            className="relative mt-7 inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-sky-800 transition hover:bg-sky-50 lg:mt-0"
          >
            Démarrer une conversation
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>
    </div>
  );
}

export default HomePage;
