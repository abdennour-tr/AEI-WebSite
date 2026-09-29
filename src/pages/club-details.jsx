import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  BrainCircuit,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Code2,
  ExternalLink,
  Flag,
  Handshake,
  HandHeart,
  Images,
  Lightbulb,
  LoaderCircle,
  MapPin,
  Quote,
  Rocket,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound,
  Wifi,
  X,
  XCircle,
} from "lucide-react";
import { motion as Motion } from "framer-motion";
import { Link, Navigate, useParams } from "react-router-dom";
import clubs from "@/data/Clubs";
import { clubApplicationsApi } from "@/services/portalApi";
import { clubAdminApi } from "@/services/clubAdminApi";
import UserAvatar from "@/components/UserAvatar";
import { listClubSocials } from "@/lib/clubSocials";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import ShareButton from "@/components/ShareButton";
import ReportButton from "@/components/ReportButton";

const iconMap = {
  code: Code2,
  brain: BrainCircuit,
  robot: Bot,
  shield: ShieldCheck,
  rocket: Rocket,
  lightbulb: Lightbulb,
  heart: HandHeart,
};

const themeMap = {
  violet: {
    icon: "bg-violet-500/15 text-violet-200 ring-violet-300/20",
    chip: "bg-violet-50 text-violet-700 ring-violet-100",
    accent: "from-violet-500 to-fuchsia-400",
  },
  sky: {
    icon: "bg-sky-500/15 text-sky-200 ring-sky-300/20",
    chip: "bg-sky-50 text-sky-700 ring-sky-100",
    accent: "from-sky-500 to-cyan-400",
  },
  amber: {
    icon: "bg-amber-500/15 text-amber-100 ring-amber-300/20",
    chip: "bg-amber-50 text-amber-700 ring-amber-100",
    accent: "from-amber-500 to-orange-400",
  },
  rose: {
    icon: "bg-rose-500/15 text-rose-100 ring-rose-300/20",
    chip: "bg-rose-50 text-rose-700 ring-rose-100",
    accent: "from-rose-500 to-pink-400",
  },
  indigo: {
    icon: "bg-indigo-500/15 text-indigo-100 ring-indigo-300/20",
    chip: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    accent: "from-indigo-500 to-sky-400",
  },
  emerald: {
    icon: "bg-emerald-500/15 text-emerald-100 ring-emerald-300/20",
    chip: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    accent: "from-emerald-500 to-teal-400",
  },
  red: {
    icon: "bg-red-500/15 text-red-100 ring-red-300/20",
    chip: "bg-red-50 text-red-700 ring-red-100",
    accent: "from-red-500 to-rose-400",
  },
};

const statusMap = {
  submitted: {
    label: "Demande envoyée",
    description: "Votre candidature est en cours d’examen par le bureau du club.",
    classes: "border-amber-200 bg-amber-50 text-amber-800",
    icon: Clock3,
  },
  accepted: {
    label: "Candidature acceptée",
    description: "Bienvenue ! Le bureau du club prendra contact avec vous.",
    classes: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: CheckCircle2,
  },
  refused: {
    label: "Candidature non retenue",
    description: "Vous pourrez candidater de nouveau lors de la prochaine campagne.",
    classes: "border-rose-200 bg-rose-50 text-rose-800",
    icon: XCircle,
  },
};

const sections = [
  ["presentation", "Présentation"],
  ["activites", "Activités"],
  ["bureau", "Bureau"],
  ["realisations", "Réalisations"],
  ["galerie", "Galerie"],
  ["avis", "Avis"],
];

const formatDateTime = (value) =>
  value
    ? new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "long",
        timeStyle: "short",
      }).format(new Date(value))
    : "Date bientôt annoncée";

const formatEventDate = (value) =>
  value
    ? new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(`${value}T12:00:00`))
    : "Date non précisée";

export default function ClubDetailsPage() {
  const { clubId } = useParams();
  const staticClub = useMemo(
    () => clubs.find((item) => item.id === clubId),
    [clubId]
  );
  const [managedContent, setManagedContent] = useState(null);
  const [loadingManagedContent, setLoadingManagedContent] = useState(true);
  const [application, setApplication] = useState(null);
  const [loadingApplication, setLoadingApplication] = useState(true);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    preferredPole: "",
    availability: "",
    motivation: "",
  });
  const { requireAuth } = useRequireAuth();

  const openJoinForm = () => {
    if (!requireAuth(`Connectez-vous pour envoyer une candidature à ${staticClub?.name || "ce club"}.`)) return;
    setShowJoinForm(true);
  };

  const club = useMemo(() => {
    if (!staticClub || !managedContent?.profile) return staticClub;
    const profile = managedContent.profile;
    return {
      ...staticClub,
      name: profile.name,
      category: profile.category,
      tagline: profile.tagline,
      description: profile.description,
      founded: profile.founded_label || staticClub.founded,
      recruitment: profile.recruitment_label || staticClub.recruitment,
      objectives: profile.objectives?.length ? profile.objectives : staticClub.objectives,
      contactUrl: profile.contact_url || staticClub.contactUrl,
      contactLabel: profile.contact_label || staticClub.contactLabel,
      socials: listClubSocials(profile, staticClub.contactUrl),
    };
  }, [managedContent, staticClub]);

  const boardMembers = useMemo(
    () =>
      (managedContent?.board || []).map((member) => ({
        id: member.id,
        name: member.full_name,
        role: member.role_title,
        photoUrl: member.photo_url,
      })),
    [managedContent?.board]
  );

  const publications = useMemo(
    () => managedContent?.announcements || [],
    [managedContent?.announcements]
  );
  const eventRecaps = useMemo(
    () => publications.filter((item) => item.content_type === "event_recap"),
    [publications]
  );
  const galleryItems = useMemo(
    () =>
      eventRecaps.flatMap((recap) =>
        (recap.image_urls || []).filter(Boolean).map((src, imageIndex) => ({
          id: `${recap.id}-${imageIndex}`,
          src,
          title: recap.title,
          date: formatEventDate(recap.event_date),
          location: recap.event_location,
        }))
      ),
    [eventRecaps]
  );

  const displayedEvents = useMemo(() => {
    if (!managedContent?.events?.length) return club?.upcomingEvents || [];
    return managedContent.events.map((event) => ({
      ...event,
      date: formatDateTime(event.starts_at),
      type: event.event_type,
    }));
  }, [club?.upcomingEvents, managedContent]);

  useEffect(() => {
    if (!staticClub) return undefined;
    let active = true;
    clubAdminApi
      .getPublicContent(clubId)
      .then((content) => {
        if (active) setManagedContent(content);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoadingManagedContent(false);
      });
    clubAdminApi.recordView(clubId).catch(() => undefined);
    return () => {
      active = false;
    };
  }, [clubId, staticClub]);

  useEffect(() => {
    let active = true;
    clubApplicationsApi
      .listMine()
      .then((applications) => {
        if (active) {
          setApplication(
            applications.find((item) => item.club_id === clubId) || null
          );
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoadingApplication(false);
      });

    return () => {
      active = false;
    };
  }, [clubId]);

  useEffect(() => {
    if (!showJoinForm) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape" && !submitting) setShowJoinForm(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [showJoinForm, submitting]);

  if (!club) return <Navigate to="/clubs" replace />;

  const Icon = iconMap[club.icon];
  const theme = themeMap[club.accent];
  const currentStatus = application ? statusMap[application.status] : null;

  const submitApplication = async (event) => {
    event.preventDefault();
    if (!form.preferredPole || !form.availability || form.motivation.trim().length < 20) {
      setError("Complétez les trois champs et écrivez au moins 20 caractères de motivation.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const saved = await clubApplicationsApi.submit({
        clubId: club.id,
        ...form,
      });
      setApplication(saved);
      setShowJoinForm(false);
    } catch {
      setError("La demande n’a pas pu être enregistrée. Vérifiez votre connexion et réessayez.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-12">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${theme.accent}`} />
        <div className="absolute -right-24 -top-40 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 sm:pb-14 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link
              to="/clubs"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Retour à tous les clubs
            </Link>
            <div className="flex items-center gap-2">
              <ReportButton contentType="club" contentId={club.id} title={club.name} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/15" />
              <ShareButton title={club.name} text={club.tagline} path={`/clubs/${club.id}`} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/15" />
            </div>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_21rem] lg:items-end">
            <div>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <span className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl ring-1 ${theme.icon}`}>
                  <Icon className="h-9 w-9" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-sky-200 ring-1 ring-white/10">
                      {club.category}
                    </span>
                    <span className="rounded-full bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-200 ring-1 ring-emerald-300/20">
                      Recrutement actif
                    </span>
                  </div>
                  <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{club.name}</h1>
                  <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">{club.tagline}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              {loadingApplication ? (
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-300">
                  <LoaderCircle className="h-4 w-4 animate-spin" /> Vérification de votre candidature…
                </div>
              ) : currentStatus ? (
                <div>
                  <div className="flex items-center gap-2 font-bold">
                    <currentStatus.icon className="h-5 w-5 text-sky-300" />
                    {currentStatus.label}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{currentStatus.description}</p>
                </div>
              ) : (
                <>
                  <p className="font-bold">Envie de rejoindre l’équipe ?</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">Présentez votre motivation au bureau en quelques minutes.</p>
                  <button
                    type="button"
                    onClick={openJoinForm}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-sky-400"
                  >
                    Demander à rejoindre <ArrowRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <nav className="sticky top-0 z-20 overflow-x-auto border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur" aria-label="Sections de la fiche du club">
        <div className="mx-auto flex w-max min-w-full max-w-7xl gap-1 px-4 sm:px-6 lg:px-8">
          {sections.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="whitespace-nowrap border-b-2 border-transparent px-4 py-4 text-sm font-bold text-slate-500 transition hover:border-sky-500 hover:text-sky-700">
              {label}
            </a>
          ))}
        </div>
      </nav>

      <main className="portal-page !max-w-7xl">
        <section id="presentation" className="scroll-mt-24 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <article className="portal-panel">
            <div className="flex items-center gap-3">
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${theme.accent} text-white`}>
                <Target className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">Présentation</p>
                <h2 className="text-2xl font-bold text-slate-950">Mission et objectifs</h2>
              </div>
            </div>
            <p className="mt-6 text-base leading-8 text-slate-600">{club.description}</p>
            <ul className="mt-6 grid gap-3">
              {club.objectives.map((objective) => (
                <li key={objective} className="flex gap-3 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  {objective}
                </li>
              ))}
            </ul>
          </article>

          <aside className="portal-panel h-fit">
            <h2 className="text-lg font-bold text-slate-950">Repères essentiels</h2>
            <dl className="mt-5 space-y-5">
              <div className="flex gap-3">
                <UsersRound className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" />
                <div><dt className="text-sm font-bold text-slate-900">Profil</dt><dd className="mt-1 text-sm leading-6 text-slate-500">{club.founded}</dd></div>
              </div>
              <div className="flex gap-3">
                <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" />
                <div><dt className="text-sm font-bold text-slate-900">Adhésion</dt><dd className="mt-1 text-sm leading-6 text-slate-500">{club.recruitment}</dd></div>
              </div>
              <div className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" />
                <div><dt className="text-sm font-bold text-slate-900">Localisation</dt><dd className="mt-1 text-sm leading-6 text-slate-500">Campus ENIAD, Berkane</dd></div>
              </div>
            </dl>
            <div className="mt-6 border-t border-slate-100 pt-5">
              <p className="text-sm font-bold text-slate-900">Réseaux sociaux</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {club.socials.map((social) => (
                  <a key={social.key || social.url} href={social.url} target="_blank" rel="noreferrer" className="portal-secondary-button !py-2">
                    {social.label} <ExternalLink className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section id="activites" className="scroll-mt-24 portal-panel">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">Agenda</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">Activités et événements à venir</h2>
            </div>
            <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${theme.chip}`}>{club.activities.length} formats d’activité</span>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {displayedEvents.map((event) => (
              <article key={event.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-sky-700 ring-1 ring-slate-200">{event.type}</span>
                  <CalendarDays className="h-5 w-5 text-slate-400" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-950">{event.title}</h3>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4" />{event.date}</span>
                  <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />{event.location}</span>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-6">
            <h3 className="text-sm font-bold text-slate-900">Activités régulières</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {club.activities.map((activity) => <span key={activity} className="portal-badge">{activity}</span>)}
            </div>
          </div>
        </section>

        <section id="bureau" className="scroll-mt-24">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">Équipe</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">Organisation du bureau</h2>
            </div>
            <span className="w-fit rounded-full bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700 ring-1 ring-sky-100">
              {boardMembers.length} membre{boardMembers.length > 1 ? "s" : ""}
            </span>
          </div>
          {loadingManagedContent ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[0, 1, 2].map((item) => <div key={item} className="h-24 animate-pulse rounded-3xl bg-slate-100" />)}
            </div>
          ) : boardMembers.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {boardMembers.map((member) => (
                <article key={member.id} className="portal-panel flex items-center gap-4 transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <UserAvatar src={member.photoUrl} name={member.name} className="h-14 w-14 rounded-2xl shadow-sm" />
                  <div className="min-w-0"><h3 className="truncate font-bold text-slate-950">{member.name}</h3><p className="mt-1 text-sm font-medium text-sky-700">{member.role}</p></div>
                </article>
              ))}
            </div>
          ) : (
            <div className="portal-empty">
              <UsersRound className="mx-auto mb-3 h-8 w-8 text-slate-300" />
              <p className="font-bold text-slate-800">Le bureau sera présenté prochainement.</p>
              <p className="mt-2 text-sm text-slate-500">Les responsables du club peuvent compléter cette section depuis leur espace de gestion.</p>
            </div>
          )}
        </section>

        <section id="realisations" className="scroll-mt-24 rounded-3xl bg-slate-950 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-sky-300"><Flag className="h-5 w-5" /></span>
              <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-300">Réalisations</p><h2 className="text-2xl font-bold">Projets et initiatives réalisés</h2></div>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-400">Les publications officielles et les événements passés ajoutés par le club sont regroupés ici.</p>
          </div>
          {loadingManagedContent ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">{[0, 1].map((item) => <div key={item} className="h-56 animate-pulse rounded-2xl bg-white/5" />)}</div>
          ) : publications.length ? (
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              {publications.map((publication) => {
                const isRecap = publication.content_type === "event_recap";
                const cover = publication.image_urls?.find(Boolean);
                return (
                  <article key={publication.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] transition duration-300 hover:-translate-y-1 hover:border-sky-400/40 hover:bg-white/[0.09]">
                    {cover && <img src={cover} alt={publication.title} className="h-48 w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100" />}
                    <div className="p-5 sm:p-6">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                        <span className="rounded-full bg-sky-400/10 px-3 py-1.5 text-sky-200 ring-1 ring-sky-300/20">{isRecap ? "Événement passé" : "Annonce & initiative"}</span>
                        <span className="inline-flex items-center gap-1.5 text-slate-400"><CalendarDays className="h-3.5 w-3.5" /> {isRecap ? formatEventDate(publication.event_date) : formatDateTime(publication.published_at)}</span>
                      </div>
                      <h3 className="mt-4 text-xl font-black">{publication.title}</h3>
                      <p className="mt-3 line-clamp-4 text-sm leading-7 text-slate-300">{publication.body}</p>
                      <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-slate-400">
                        {publication.event_location && <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-sky-300" /> {publication.event_location}</span>}
                        {publication.collaborator_names?.length > 0 && <span className="inline-flex items-center gap-1.5"><Handshake className="h-3.5 w-3.5 text-sky-300" /> Avec {publication.collaborator_names.join(", ")}</span>}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/[0.04] px-6 py-10 text-center">
              <Flag className="mx-auto h-8 w-8 text-slate-600" />
              <p className="mt-3 font-bold text-white">Aucune réalisation publiée pour le moment.</p>
              <p className="mt-2 text-sm text-slate-400">Les prochaines annonces et rétrospectives du club apparaîtront automatiquement ici.</p>
            </div>
          )}
        </section>

        <section id="galerie" className="scroll-mt-24">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><Images className="h-5 w-5" /></span>
              <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">Galerie officielle</p><h2 className="text-2xl font-bold text-slate-950">La vie du club en images</h2></div>
            </div>
            {galleryItems.length > 0 && <span className="text-sm font-semibold text-slate-500">{galleryItems.length} photo{galleryItems.length > 1 ? "s" : ""} publiée{galleryItems.length > 1 ? "s" : ""}</span>}
          </div>
          {loadingManagedContent ? (
            <div className="grid gap-4 md:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="aspect-[4/3] animate-pulse rounded-2xl bg-slate-100" />)}</div>
          ) : galleryItems.length ? (
            <div className="grid auto-rows-[15rem] gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {galleryItems.map((image, index) => (
                <figure key={image.id} className={`group relative overflow-hidden rounded-3xl bg-slate-200 shadow-sm ${index === 0 ? "sm:col-span-2 sm:row-span-2" : ""}`}>
                  <img src={image.src} alt={`${image.title} — ${image.date}`} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />
                  <figcaption className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
                    <p className="text-lg font-black leading-tight sm:text-xl">{image.title}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                      <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-sky-300" /> {image.date}</span>
                      {image.location && <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-sky-300" /> {image.location}</span>}
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <div className="portal-empty">
              <Images className="mx-auto mb-3 h-8 w-8 text-slate-300" />
              <p className="font-bold text-slate-800">La galerie attend ses premiers souvenirs.</p>
              <p className="mt-2 text-sm text-slate-500">Les photos ajoutées à un événement passé apparaîtront ici avec son nom et sa date.</p>
            </div>
          )}
        </section>

        <section id="avis" className="scroll-mt-24 portal-panel">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><Quote className="h-5 w-5" /></span>
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">Expériences</p><h2 className="text-2xl font-bold text-slate-950">Avis d’anciens membres</h2></div>
          </div>
          {club.testimonials.length ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {club.testimonials.map((testimonial) => (
                <blockquote key={testimonial.author} className="rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-600">
                  “{testimonial.quote}”
                  <footer className="mt-3 font-bold text-slate-900">{testimonial.author}</footer>
                </blockquote>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center">
              <p className="font-bold text-slate-800">Les premiers témoignages vérifiés seront bientôt publiés.</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">Seuls les avis confirmés par d’anciens membres seront affichés ici.</p>
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-gradient-to-r from-sky-700 to-cyan-600 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold">Prêt à contribuer à {club.name} ?</h2>
              <p className="mt-2 text-base leading-7 text-sky-50">Choisissez un pôle, expliquez ce que vous souhaitez apprendre ou apporter, puis suivez votre candidature directement sur cette fiche.</p>
            </div>
            {currentStatus ? (
              <div className={`flex w-full min-w-0 items-center gap-3 rounded-2xl border px-5 py-4 font-bold sm:w-auto sm:min-w-64 ${currentStatus.classes}`}>
                <currentStatus.icon className="h-5 w-5" /> {currentStatus.label}
              </div>
            ) : (
              <button type="button" onClick={openJoinForm} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-sky-800 transition hover:bg-sky-50">
                <Send className="h-4 w-4" /> Demander à rejoindre
              </button>
            )}
          </div>
        </section>
      </main>

      {showJoinForm && (
        <div className="portal-modal-backdrop" role="presentation" onMouseDown={() => !submitting && setShowJoinForm(false)}>
          <Motion.div initial={{ opacity: 0, scale: 0.97, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="portal-modal max-w-xl" role="dialog" aria-modal="true" aria-labelledby="join-club-title" onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setShowJoinForm(false)} disabled={submitting} className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900" aria-label="Fermer"><X className="h-5 w-5" /></button>
            <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${theme.accent} text-white`}><Send className="h-5 w-5" /></span>
            <h2 id="join-club-title" className="mt-5 pr-8 text-2xl font-bold text-slate-950">Rejoindre {club.name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Votre demande sera transmise au bureau du club et son statut restera visible sur cette fiche.</p>

            <form onSubmit={submitApplication} className="mt-6 space-y-5">
              <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Pôle qui vous intéresse</span><select className="portal-select" value={form.preferredPole} onChange={(event) => setForm({ ...form, preferredPole: event.target.value })} required><option value="">Sélectionnez un pôle</option><option value="technique">Technique / projets</option><option value="events">Événementiel</option><option value="communication">Communication & média</option><option value="partnerships">Partenariats</option><option value="undecided">Je souhaite être orienté</option></select></label>
              <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Disponibilité habituelle</span><select className="portal-select" value={form.availability} onChange={(event) => setForm({ ...form, availability: event.target.value })} required><option value="">Sélectionnez votre disponibilité</option><option value="weekdays">En semaine</option><option value="evenings">En soirée</option><option value="weekends">Le week-end</option><option value="flexible">Flexible</option></select></label>
              <label className="block"><span className="mb-2 flex items-center justify-between gap-3 text-sm font-bold text-slate-700"><span>Votre motivation</span><span className="font-medium text-slate-400">{form.motivation.length}/500</span></span><textarea className="portal-input min-h-32 resize-y" value={form.motivation} onChange={(event) => setForm({ ...form, motivation: event.target.value.slice(0, 500) })} placeholder="Ce que vous souhaitez apprendre, apporter ou construire avec le club…" required /></label>
              {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700" role="alert">{error}</p>}
              <button type="submit" disabled={submitting} className="portal-primary-button w-full">{submitting ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Envoi en cours…</> : <><Send className="h-4 w-4" /> Envoyer ma demande</>}</button>
            </form>
          </Motion.div>
        </div>
      )}
    </div>
  );
}
