import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  Code2,
  ExternalLink,
  HandHeart,
  Heart,
  HeartHandshake,
  Lightbulb,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import clubs from "@/data/Clubs";
import { usePortalCollection } from "@/hooks/usePortalCollection";
import { clubApplicationsApi, clubFavoritesApi } from "@/services/portalApi";

const iconMap = {
  code: Code2,
  brain: BrainCircuit,
  robot: Bot,
  shield: ShieldCheck,
  rocket: Rocket,
  lightbulb: Lightbulb,
  heart: HandHeart,
};

const accentMap = {
  violet: "bg-violet-50 text-violet-700 ring-violet-100",
  sky: "bg-sky-50 text-sky-700 ring-sky-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  rose: "bg-rose-50 text-rose-700 ring-rose-100",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  red: "bg-red-50 text-red-700 ring-red-100",
};

const categories = [
  "Tous",
  "Développement & innovation",
  "IA & Data",
  "Robotique & IoT",
  "Cybersécurité",
  "Innovation & carrière",
  "Entrepreneuriat social",
  "Solidarité & citoyenneté",
];

export default function ClubsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tous");
  const [applications, setApplications] = useState([]);
  const [favoriteError, setFavoriteError] = useState("");
  const { data: favoriteIds, setData: setFavoriteIds } = usePortalCollection(
    clubFavoritesApi.listIds,
    []
  );

  useEffect(() => {
    let active = true;
    clubApplicationsApi
      .listMine()
      .then((items) => {
        if (active) setApplications(items);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const filteredClubs = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("fr");
    return clubs.filter((club) => {
      const matchesCategory = category === "Tous" || club.category === category;
      const matchesSearch =
        !query ||
        [club.name, club.category, club.tagline, ...club.activities]
          .join(" ")
          .toLocaleLowerCase("fr")
          .includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

  const toggleFavorite = async (club) => {
    const wasFavorite = favoriteIds.includes(club.id);
    setFavoriteError("");
    setFavoriteIds((current) =>
      wasFavorite
        ? current.filter((clubId) => clubId !== club.id)
        : [...current, club.id]
    );
    try {
      await clubFavoritesApi.setFavorite(club.id, !wasFavorite);
    } catch (error) {
      setFavoriteIds((current) =>
        wasFavorite
          ? [...new Set([...current, club.id])]
          : current.filter((clubId) => clubId !== club.id)
      );
      setFavoriteError(error.message || "Le favori n’a pas pu être enregistré.");
    }
  };

  return (
    <div className="portal-page">
      <PageHeader
        icon={UsersRound}
        eyebrow="Vie associative ENIAD"
        title="Trouvez le club où vous allez grandir"
        description="Découvrez les missions, activités et modalités d’adhésion des clubs de l’école. Vous n’avez pas besoin d’être expert : choisissez d’abord ce que vous avez envie d’apprendre et d’apporter."
      >
        <a
          href="#rejoindre"
          className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-950/20 transition hover:bg-sky-400"
        >
          Comment rejoindre un club <ArrowRight className="h-4 w-4" />
        </a>
      </PageHeader>

      {favoriteError && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {favoriteError}
        </p>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="portal-panel md:col-span-2">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">
            Pourquoi s’engager ?
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">
            Votre première équipe, vos premiers projets, votre place dans l’école.
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Les clubs facilitent les rencontres entre promotions, permettent de pratiquer hors des cours et donnent un cadre concret pour développer des compétences techniques, humaines et professionnelles.
          </p>
        </div>
        <div className="rounded-2xl bg-sky-700 p-6 text-white shadow-lg shadow-sky-100">
          <p className="text-4xl font-bold">{clubs.length}</p>
          <p className="mt-1 font-semibold">clubs recensés</p>
          <p className="mt-3 text-sm leading-6 text-sky-100">
            Technologie, IA, robotique, sécurité, entrepreneuriat et solidarité.
          </p>
        </div>
      </section>

      <section className="portal-panel flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xl">
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
          <input
            className="portal-input pl-11"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un club, une activité ou une compétence…"
          />
        </div>
        <select
          className="portal-select w-full lg:w-72"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="Filtrer les clubs par domaine"
        >
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </section>

      <section aria-label="Annuaire des clubs" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredClubs.map((club, index) => {
          const Icon = iconMap[club.icon];
          const application = applications.find(
            (item) => item.club_id === club.id
          );
          return (
            <Motion.article
              key={club.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="portal-card flex h-full flex-col p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${accentMap[club.accent]}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {club.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(club)}
                    className={`rounded-xl p-2.5 transition ${
                      favoriteIds.includes(club.id)
                        ? "bg-rose-500 text-white shadow-md shadow-rose-100"
                        : "bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                    }`}
                    aria-label={
                      favoriteIds.includes(club.id)
                        ? `Retirer ${club.name} des favoris`
                        : `Ajouter ${club.name} aux favoris`
                    }
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        favoriteIds.includes(club.id) ? "fill-current" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-950">{club.name}</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-sky-700">
                {club.tagline}
              </p>
              <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
                {club.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {club.highlights.slice(0, 2).map((highlight) => (
                  <span key={highlight} className="portal-badge">
                    {highlight}
                  </span>
                ))}
              </div>

              {application && (
                <div
                  className={`mt-5 rounded-xl border px-3 py-2 text-sm font-bold ${
                    application.status === "accepted"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : application.status === "refused"
                        ? "border-rose-200 bg-rose-50 text-rose-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                  }`}
                >
                  {application.status === "accepted"
                    ? "Candidature acceptée"
                    : application.status === "refused"
                      ? "Candidature non retenue"
                      : "Demande envoyée"}
                </div>
              )}

              <Link
                to={`/clubs/${club.id}`}
                className="portal-primary-button mt-4 w-full"
              >
                Voir la fiche complète <ArrowRight className="h-4 w-4" />
              </Link>
            </Motion.article>
          );
        })}
      </section>

      {filteredClubs.length === 0 && (
        <div className="portal-empty">
          Aucun club ne correspond à cette recherche. Essayez un autre domaine.
        </div>
      )}

      <section id="rejoindre" className="scroll-mt-24 rounded-3xl bg-slate-950 p-6 text-white shadow-xl sm:p-9">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-sky-400/15 text-sky-300">
              <Sparkles className="h-5 w-5" />
            </span>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-sky-300">
              Parcours d’intégration
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              Rejoindre un club en quatre étapes simples
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-300">
              Les périodes de recrutement sont annoncées par les clubs et pendant la semaine d’intégration. Vous pouvez aussi contacter directement un club tout au long de l’année.
            </p>
          </div>

          <ol className="grid gap-3 sm:grid-cols-2">
            {[
              ["1", "Explorez", "Comparez les missions et les activités qui vous motivent."],
              ["2", "Rencontrez", "Assistez à un stand, une réunion ou une activité ouverte."],
              ["3", "Candidatez", "Contactez le club et présentez votre motivation simplement."],
              ["4", "Contribuez", "Rejoignez un pôle ou un projet adapté à votre disponibilité."],
            ].map(([number, title, description]) => (
              <li key={number} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500 text-sm font-bold">
                    {number}
                  </span>
                  <div>
                    <h3 className="font-bold">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="portal-panel flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
            <HeartHandshake className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-950">Vous ne savez pas encore quel club choisir ?</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              L’Association des Étudiants Ingénieurs peut vous orienter vers les responsables et les prochaines activités.
            </p>
          </div>
        </div>
        <a
          href="https://ma.linkedin.com/company/ade-eniad"
          target="_blank"
          rel="noreferrer"
          className="portal-secondary-button shrink-0"
        >
          Contacter l’AEI <ExternalLink className="h-4 w-4" />
        </a>
      </section>

    </div>
  );
}
