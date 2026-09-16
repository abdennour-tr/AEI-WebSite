import { createElement } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  BriefcaseBusiness,
  Code2,
  HandHeart,
  HeartHandshake,
  Home,
  Lightbulb,
  Network,
  Rocket,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  UsersRound,
  Wrench,
} from "lucide-react";
import clubs from "@/data/Clubs";

const clubIcons = {
  code: Code2,
  brain: BrainCircuit,
  robot: Bot,
  shield: ShieldCheck,
  rocket: Rocket,
  lightbulb: Lightbulb,
  heart: HandHeart,
};

const secondaryServices = [
  {
    title: "Cours & ressources",
    description: "Supports et documents pour accompagner votre parcours académique.",
    to: "/cours",
    icon: BrainCircuit,
  },
  {
    title: "Stages & opportunités",
    description: "Offres et expériences pour préparer votre avenir professionnel.",
    to: "/stages-opportunites",
    icon: BriefcaseBusiness,
  },
  {
    title: "Colocation",
    description: "Annonces de logements partagées par la communauté étudiante.",
    to: "/colocation",
    icon: Home,
  },
  {
    title: "Marketplace",
    description: "Acheter et vendre du matériel entre étudiants de l’école.",
    to: "/marketplace",
    icon: ShoppingBag,
  },
];

const benefits = [
  {
    title: "Créer ses premiers liens",
    description: "Rencontrez des étudiants d’autres promotions autour d’intérêts communs.",
    icon: UsersRound,
  },
  {
    title: "Apprendre en pratiquant",
    description: "Passez des cours à des projets, ateliers et défis concrets en équipe.",
    icon: Wrench,
  },
  {
    title: "Développer son réseau",
    description: "Échangez avec des intervenants, des entreprises et d’autres écoles.",
    icon: Network,
  },
  {
    title: "Prendre confiance",
    description: "Organisez, présentez, collaborez et découvrez les rôles qui vous correspondent.",
    icon: HeartHandshake,
  },
];

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-sky-700">
          {eyebrow}
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-base leading-7 text-slate-600">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export default function HomePage() {
  const featuredClubs = clubs.slice(0, 3);

  return (
    <div className="bg-slate-50 text-slate-950">
      <section className="relative isolate overflow-hidden bg-slate-950 px-5 py-12 text-white sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.12fr_0.88fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-semibold text-sky-100 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
              Le point d’entrée vers la vie associative de l’ENIAD
            </div>
            <h1 className="max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Trouvez votre place,
              <span className="block bg-linear-to-r from-sky-300 to-cyan-200 bg-clip-text text-transparent">
                rejoignez un club.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Découvrez tous les clubs de l’école, leurs activités et la manière de les intégrer. Le portail vous aide à rencontrer votre communauté, apprendre par la pratique et vous engager dès vos premiers jours à l’ENIAD.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/clubs"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-950/30 transition hover:bg-sky-400"
              >
                Explorer les clubs <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/clubs#rejoindre"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                Comment rejoindre un club
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-3 border-t border-white/10 pt-6">
              {["Technologie", "IA & Data", "Robotique", "Solidarité", "Entrepreneuriat"].map((domain) => (
                <span key={domain} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
                  {domain}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:mx-0 lg:ml-auto">
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">
                    Votre parcours d’intégration
                  </p>
                  <p className="mt-1 text-lg font-bold">Commencez par ce qui vous passionne</p>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-400/15 text-sky-300">
                  <UsersRound className="h-5 w-5" />
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  ["01", "Découvrez les clubs", "Missions, activités et projets récents"],
                  ["02", "Rencontrez les équipes", "Stands, événements et sessions ouvertes"],
                  ["03", "Passez à l’action", "Contactez le club et choisissez votre pôle"],
                ].map(([number, title, description]) => (
                  <div key={number} className="flex items-start gap-4 rounded-2xl bg-white p-4 text-slate-900">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-xs font-bold text-sky-700">
                      {number}
                    </span>
                    <div>
                      <p className="font-bold">{title}</p>
                      <p className="mt-1 text-sm text-slate-500">{description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to="/clubs"
                className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold transition hover:bg-white/10"
              >
                Voir les {clubs.length} clubs recensés
                <ArrowRight className="h-4 w-4 text-cyan-300" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-20 px-5 py-14 sm:px-8 sm:py-18 lg:px-12 lg:py-20">
        <section>
          <SectionHeading
            eyebrow="Clubs à découvrir"
            title="Choisissez un domaine, rencontrez une équipe"
            description="Chaque club propose une façon différente d’apprendre, de contribuer et de créer des liens durables au sein de l’école."
            action={
              <Link to="/clubs" className="inline-flex items-center gap-1 text-sm font-bold text-sky-700 hover:text-sky-900">
                Voir tous les clubs <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />

          <div className="grid gap-5 lg:grid-cols-3">
            {featuredClubs.map((club) => {
              const Icon = clubIcons[club.icon];
              return (
                <Link
                  key={club.id}
                  to="/clubs"
                  className="group portal-card flex flex-col p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      {club.category}
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-slate-950">{club.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{club.tagline}</p>
                  <span className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-sky-700">
                    Découvrir le club <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
          <SectionHeading
            eyebrow="Bien plus qu’une activité"
            title="Ce que la vie associative vous apporte"
            description="Intégrer un club, c’est trouver plus rapidement ses repères et acquérir des expériences qui complètent les cours."
          />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {benefits.map(({ title, description, icon }) => (
              <article key={title} className="rounded-2xl bg-slate-50 p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sky-700 shadow-sm">
                  {createElement(icon, { className: "h-5 w-5" })}
                </span>
                <h3 className="mt-4 font-bold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading
            eyebrow="Services complémentaires"
            title="Le reste du portail vous accompagne ensuite"
            description="Une fois intégré à la communauté, retrouvez les ressources académiques et les services pratiques utiles au quotidien."
          />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {secondaryServices.map(({ title, description, to, icon }) => (
              <Link key={title} to={to} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-sky-50 group-hover:text-sky-700">
                  {createElement(icon, { className: "h-5 w-5" })}
                </span>
                <h3 className="mt-4 font-bold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-sky-700">
                  Accéder <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden rounded-3xl bg-sky-700 px-6 py-10 text-white shadow-xl shadow-sky-100 sm:px-10 lg:flex lg:items-center lg:justify-between lg:px-12">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[40px] border-white/5" />
          <div className="relative max-w-2xl">
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
              <HeartHandshake className="h-6 w-6" />
            </span>
            <h2 className="text-2xl font-bold sm:text-3xl">Votre intégration commence par une rencontre.</h2>
            <p className="mt-3 text-base leading-7 text-sky-100">
              Explorez les clubs, choisissez une première activité et contactez l’équipe qui vous ressemble.
            </p>
          </div>
          <Link to="/clubs" className="relative mt-7 inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-sky-800 transition hover:bg-sky-50 lg:mt-0">
            Trouver mon club <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>
    </div>
  );
}
