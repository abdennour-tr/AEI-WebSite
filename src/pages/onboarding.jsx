import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Check,
  Code2,
  GraduationCap,
  HandHeart,
  Lightbulb,
  LoaderCircle,
  LogOut,
  Palette,
  Rocket,
  ShieldCheck,
  Sparkles,
  Users,
  Wifi,
} from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import logo from "../assets/AEI.png";

const levels = [
  { value: "CP1", label: "1re année préparatoire" },
  { value: "CP2", label: "2e année préparatoire" },
  { value: "CI1", label: "1re année cycle ingénieur" },
  { value: "CI2", label: "2e année cycle ingénieur" },
  { value: "CI3", label: "3e année cycle ingénieur" },
];

const specialties = [
  "Tronc commun",
  "Génie informatique",
  "Intelligence artificielle & data",
  "Systèmes embarqués & IoT",
  "Autre spécialité",
];

const interests = [
  { value: "ai_data", label: "IA & Data", icon: BrainCircuit },
  { value: "web_mobile", label: "Web & Mobile", icon: Code2 },
  { value: "robotics_iot", label: "Robotique & IoT", icon: Wifi },
  { value: "cybersecurity", label: "Cybersécurité", icon: ShieldCheck },
  { value: "entrepreneurship", label: "Entrepreneuriat", icon: Lightbulb },
  { value: "solidarity", label: "Solidarité", icon: HandHeart },
  { value: "communication", label: "Design & communication", icon: Palette },
  { value: "career", label: "Carrière & réseau", icon: Rocket },
];

const goals = [
  { value: "join_club", label: "Rejoindre un club" },
  { value: "learn", label: "Développer mes compétences" },
  { value: "network", label: "Rencontrer d’autres étudiants" },
  { value: "build", label: "Participer à des projets" },
  { value: "events", label: "Découvrir les événements" },
];

const availabilities = [
  { value: "weekdays", label: "En semaine" },
  { value: "evenings", label: "En soirée" },
  { value: "weekends", label: "Le week-end" },
  { value: "flexible", label: "Je suis flexible" },
];

const clubMatches = {
  ai_data: {
    name: "NurlAI",
    category: "IA & Data",
    reason: "Pour progresser en machine learning et data science sur des cas pratiques.",
    icon: BrainCircuit,
  },
  web_mobile: {
    name: "InnoVerse",
    category: "Développement & innovation",
    reason: "Pour créer des applications, participer à des hackathons et rejoindre une équipe produit.",
    icon: Code2,
  },
  robotics_iot: {
    name: "RIoT ENIADB",
    category: "Robotique & IoT",
    reason: "Pour concevoir des prototypes mêlant code, électronique et systèmes embarqués.",
    icon: Wifi,
  },
  cybersecurity: {
    name: "SECORA Club",
    category: "Cybersécurité",
    reason: "Pour découvrir l’ethical hacking, l’OSINT et les entraînements CTF.",
    icon: ShieldCheck,
  },
  entrepreneurship: {
    name: "Enactus ENIAD Berkane",
    category: "Entrepreneuriat social",
    reason: "Pour transformer une idée en projet concret avec un impact positif.",
    icon: Lightbulb,
  },
  solidarity: {
    name: "Club Al Ataa",
    category: "Solidarité & citoyenneté",
    reason: "Pour contribuer aux actions bénévoles et solidaires de la communauté.",
    icon: HandHeart,
  },
  communication: {
    name: "InnoVerse",
    category: "Création & communication",
    reason: "Pour valoriser des projets étudiants au sein d’un pôle média ou événementiel.",
    icon: Palette,
  },
  career: {
    name: "TechRise",
    category: "Innovation & carrière",
    reason: "Pour rencontrer des professionnels et développer votre réseau.",
    icon: Rocket,
  },
};

function ChoiceCard({ selected, onClick, children, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`group relative flex min-h-14 items-center gap-3 rounded-2xl border p-4 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200 ${
        selected
          ? "border-sky-500 bg-sky-50 text-sky-950 shadow-sm"
          : "border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50/50"
      } ${className}`}
    >
      {children}
      <span
        className={`ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
          selected
            ? "border-sky-600 bg-sky-600 text-white"
            : "border-slate-300 bg-white text-transparent"
        }`}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </span>
    </button>
  );
}

export default function OnboardingPage() {
  const { user, profile, completeOnboarding, signOut } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName:
      profile?.full_name ||
      user?.user_metadata?.full_name ||
      user?.email?.split("@")[0] ||
      "",
    level: "",
    specialty: "",
    interests: [],
    goals: [],
    availability: "",
  });

  const recommendations = useMemo(() => {
    const seen = new Set();
    return form.interests
      .map((interest) => clubMatches[interest])
      .filter((club) => {
        if (!club || seen.has(club.name)) return false;
        seen.add(club.name);
        return true;
      })
      .slice(0, 3);
  }, [form.interests]);

  if (user?.user_metadata?.onboarding_completed) {
    return <Navigate to="/" replace />;
  }

  const toggleValue = (field, value, limit) => {
    setForm((current) => {
      const selected = current[field].includes(value);
      if (!selected && current[field].length >= limit) return current;
      return {
        ...current,
        [field]: selected
          ? current[field].filter((item) => item !== value)
          : [...current[field], value],
      };
    });
  };

  const canContinue =
    (step === 0 && form.fullName.trim().length >= 2 && form.level && form.specialty) ||
    (step === 1 && form.interests.length >= 2) ||
    (step === 2 && form.goals.length >= 1 && form.availability) ||
    step === 3;

  const finish = async () => {
    setSaving(true);
    setError("");
    const { error: saveError } = await completeOnboarding(form);

    if (saveError) {
      setError("Nous n’avons pas pu enregistrer vos préférences. Réessayez.");
      setSaving(false);
      return;
    }

    navigate("/", { replace: true });
  };

  const next = () => {
    if (!canContinue) return;
    if (step === 3) finish();
    else setStep((current) => current + 1);
  };

  const stepLabels = ["Votre parcours", "Vos intérêts", "Vos objectifs", "Vos clubs"];

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-5 text-slate-950 sm:px-6 sm:py-8">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute -bottom-48 left-1/4 h-[30rem] w-[30rem] rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-6xl flex-col">
        <header className="mb-6 flex items-center justify-between gap-4 text-white">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-lg">
              <img src={logo} alt="AEI" className="h-8 w-auto object-contain" />
            </span>
            <div>
              <p className="text-sm font-bold">Portail étudiant AEI</p>
              <p className="text-xs text-slate-400">Configuration de votre espace</p>
            </div>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Se déconnecter</span>
          </button>
        </header>

        <section className="grid flex-1 overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="relative hidden overflow-hidden bg-gradient-to-br from-sky-700 via-sky-800 to-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold ring-1 ring-white/15">
                <Sparkles className="h-3.5 w-3.5" /> Première connexion
              </span>
              <h1 className="mt-7 text-4xl font-bold leading-tight tracking-tight">
                Trouvez votre place dans la communauté AEI.
              </h1>
              <p className="mt-5 max-w-sm text-base leading-7 text-sky-100/80">
                Quelques réponses suffisent pour vous orienter vers les clubs et les expériences qui vous correspondent.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <Users className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold">Un accueil sur mesure</p>
                  <p className="mt-0.5 text-xs leading-5 text-sky-100/70">
                    Ce questionnaire ne sera affiché qu’une seule fois.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex min-h-[680px] flex-col p-5 sm:p-8 lg:p-10">
            <div className="mb-8">
              <div className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                <span>Étape {step + 1} sur 4</span>
                <span>{stepLabels[step]}</span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
                aria-label="Progression du parcours d’intégration"
                aria-valuemin="1"
                aria-valuemax="4"
                aria-valuenow={step + 1}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-500"
                  style={{ width: `${((step + 1) / 4) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex-1">
              {step === 0 && (
                <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                  <div className="mb-7">
                    <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                      <GraduationCap className="h-6 w-6" />
                    </span>
                    <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Parlez-nous de votre parcours</h2>
                    <p className="mt-2 text-base leading-7 text-slate-500">Ces informations nous aideront à adapter les recommandations à votre niveau.</p>
                  </div>
                  <div className="space-y-5">
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700">Nom complet</span>
                      <input
                        className="portal-input"
                        value={form.fullName}
                        onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                        placeholder="Votre nom complet"
                        autoComplete="name"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700">Niveau d’études</span>
                      <select
                        className="portal-select"
                        value={form.level}
                        onChange={(event) => setForm({ ...form, level: event.target.value })}
                      >
                        <option value="">Sélectionnez votre niveau</option>
                        {levels.map((level) => <option key={level.value} value={level.value}>{level.label}</option>)}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700">Filière ou orientation</span>
                      <select
                        className="portal-select"
                        value={form.specialty}
                        onChange={(event) => setForm({ ...form, specialty: event.target.value })}
                      >
                        <option value="">Sélectionnez votre orientation</option>
                        {specialties.map((specialty) => <option key={specialty} value={specialty}>{specialty}</option>)}
                      </select>
                    </label>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Qu’est-ce qui vous passionne ?</h2>
                  <p className="mt-2 text-base leading-7 text-slate-500">Choisissez entre 2 et 4 centres d’intérêt.</p>
                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    {interests.map((interest) => {
                      const Icon = interest.icon;
                      const selected = form.interests.includes(interest.value);
                      return (
                        <ChoiceCard
                          key={interest.value}
                          selected={selected}
                          onClick={() => toggleValue("interests", interest.value, 4)}
                        >
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${selected ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-white"}`}>
                            <Icon className="h-4.5 w-4.5" />
                          </span>
                          {interest.label}
                        </ChoiceCard>
                      );
                    })}
                  </div>
                  <p className="mt-4 text-sm font-medium text-slate-400">{form.interests.length}/4 sélectionnés</p>
                </div>
              )}

              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Que souhaitez-vous accomplir ?</h2>
                  <p className="mt-2 text-base leading-7 text-slate-500">Sélectionnez jusqu’à 3 objectifs, puis indiquez vos disponibilités.</p>
                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    {goals.map((goal) => (
                      <ChoiceCard
                        key={goal.value}
                        selected={form.goals.includes(goal.value)}
                        onClick={() => toggleValue("goals", goal.value, 3)}
                      >
                        {goal.label}
                      </ChoiceCard>
                    ))}
                  </div>
                  <fieldset className="mt-7">
                    <legend className="mb-3 text-sm font-bold text-slate-700">Vos disponibilités habituelles</legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {availabilities.map((availability) => (
                        <ChoiceCard
                          key={availability.value}
                          selected={form.availability === availability.value}
                          onClick={() => setForm({ ...form, availability: availability.value })}
                        >
                          {availability.label}
                        </ChoiceCard>
                      ))}
                    </div>
                  </fieldset>
                </div>
              )}

              {step === 3 && (
                <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <Sparkles className="h-6 w-6" />
                  </span>
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Vos clubs recommandés</h2>
                  <p className="mt-2 text-base leading-7 text-slate-500">Voici les communautés qui correspondent le mieux à vos intérêts.</p>
                  <div className="mt-7 space-y-3">
                    {recommendations.map((club, index) => {
                      const Icon = club.icon;
                      return (
                        <article key={club.name} className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
                            <Icon className="h-5 w-5" />
                          </span>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-bold text-slate-950">{club.name}</h3>
                              {index === 0 && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">Meilleure affinité</span>}
                            </div>
                            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-sky-700">{club.category}</p>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{club.reason}</p>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                  <div className="mt-5 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm leading-6 text-sky-900">
                    Vous retrouverez les informations d’adhésion et les contacts de ces clubs dans l’espace <strong>Découvrir les clubs</strong>.
                  </div>
                </div>
              )}
            </div>

            {error && <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700" role="alert">{error}</p>}

            <footer className="mt-8 flex items-center justify-between gap-3 border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={() => setStep((current) => Math.max(0, current - 1))}
                disabled={step === 0 || saving}
                className="portal-secondary-button"
              >
                <ArrowLeft className="h-4 w-4" /> Retour
              </button>
              <button
                type="button"
                onClick={next}
                disabled={!canContinue || saving}
                className="portal-primary-button min-w-36"
              >
                {saving ? (
                  <><LoaderCircle className="h-4 w-4 animate-spin" /> Enregistrement…</>
                ) : step === 3 ? (
                  <>Accéder à mon espace <Check className="h-4 w-4" /></>
                ) : (
                  <>Continuer <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}
