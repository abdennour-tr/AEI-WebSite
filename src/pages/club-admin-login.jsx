import { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Layers3,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import logo from "../assets/AEI.png";

export default function ClubAdminLoginPage() {
  const { configured, session, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (session) return <Navigate to="/club-admin" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const { error: signInError } = await signIn(email.trim(), password);
    if (signInError) {
      setError(
        signInError.message === "Invalid login credentials"
          ? "Adresse e-mail ou mot de passe incorrect."
          : signInError.message
      );
      setSubmitting(false);
      return;
    }
    navigate("/club-admin", { replace: true });
  };

  return (
    <main className="grid min-h-screen bg-[#070b17] text-white lg:grid-cols-[1.08fr_0.92fr]">
      <section className="relative hidden overflow-hidden p-12 lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-[30rem] w-[30rem] rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xl"><img src={logo} alt="AEI" className="h-8 w-auto" /></span>
            <div><p className="font-bold">Portail AEI</p><p className="text-xs text-slate-400">Administration des clubs</p></div>
          </Link>
        </div>
        <div className="relative max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-bold text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" /> Club Command Center
          </span>
          <h1 className="mt-6 text-5xl font-bold leading-[1.08] tracking-tight xl:text-6xl">
            Pilotez la vie de votre club depuis un seul espace.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
            Contenus, événements, candidatures, membres et communication : chaque responsable dispose uniquement des outils de son club.
          </p>
        </div>
        <div className="relative grid grid-cols-3 gap-3">
          {[
            [Layers3, "Contenus", "Fiche et annonces"],
            [ShieldCheck, "Accès privé", "Droits par club"],
            [Sparkles, "Pilotage", "Statistiques utiles"],
          ].map(([Icon, title, text]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <Icon className="h-5 w-5 text-cyan-300" />
              <p className="mt-3 text-sm font-bold">{title}</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative flex min-h-screen items-center justify-center border-l border-white/10 bg-white/[0.025] p-5 sm:p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Retour au portail étudiant
          </Link>
          <div className="rounded-3xl border border-white/10 bg-white p-7 text-slate-950 shadow-2xl sm:p-9">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-cyan-300 shadow-lg"><LockKeyhole className="h-6 w-6" /></span>
            <h2 className="mt-6 text-3xl font-bold tracking-tight">Espace responsables</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">Utilisez l’adresse e-mail et le mot de passe associés à votre responsabilité de club.</p>

            {!configured && (
              <div className="mt-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><AlertCircle className="h-5 w-5 shrink-0" /> Supabase doit être configuré pour activer cet accès.</div>
            )}

            <form onSubmit={submit} className="mt-7 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Adresse e-mail professionnelle</span>
                <span className="relative block"><Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" /><input type="email" className="portal-input pl-11" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nomclub_aei@enaid.ump.ma" autoComplete="email" required /></span>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Mot de passe</span>
                <span className="relative block"><LockKeyhole className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" /><input type={showPassword ? "text" : "password"} className="portal-input pl-11 pr-12" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Votre mot de passe" autoComplete="current-password" required /><button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-3 rounded-lg p-1 text-slate-400 hover:text-slate-700" aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}>{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></span>
              </label>
              {error && <p className="flex gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
              <button type="submit" disabled={submitting || !configured} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
                {submitting ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Connexion…</> : "Accéder au tableau de bord"}
              </button>
            </form>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Accès vérifié et limité au club associé</div>
          </div>
        </div>
      </section>
    </main>
  );
}
