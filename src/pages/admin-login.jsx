import { useState } from "react";
import { AlertCircle, Eye, EyeOff, LoaderCircle, Lock, ShieldCheck, User } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import logo from "../assets/AEI.png";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { configured, loading, profileLoading, session, profile, signIn, signOut } = useAuth();
  const navigate = useNavigate();

  const hasAdminAccess = Boolean(
    session && profile && ["admin", "moderator"].includes(profile.role)
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    const { data, error } = await signIn(email.trim(), password);
    if (error) {
      setErrorMessage(
        error.message === "Invalid login credentials"
          ? "Identifiants administrateur incorrects."
          : error.message
      );
      setSubmitting(false);
      return;
    }

    const userId = data?.user?.id;
    const { data: adminProfile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (profileError || !["admin", "moderator"].includes(adminProfile?.role)) {
      await signOut();
      setErrorMessage("Ce compte ne dispose pas d’un accès à l’administration.");
      setSubmitting(false);
      return;
    }

    navigate("/admin/tableau-de-bord", { replace: true });
  };

  if (!loading && !profileLoading && hasAdminAccess) {
    return <Navigate to="/admin/tableau-de-bord" replace />;
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070b17] p-5 text-white">
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="absolute -bottom-24 left-1/4 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
      <section className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.06] p-7 shadow-2xl backdrop-blur-xl sm:p-9">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-xl">
          <img src={logo} alt="AEI" className="h-10 w-auto object-contain" />
        </div>
        <div className="mt-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-bold text-cyan-200">
            <ShieldCheck className="h-4 w-4" /> Accès privé
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight">Administration AEI</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Cet espace indépendant est réservé aux administrateurs et modérateurs autorisés.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Adresse professionnelle</span>
            <span className="relative block">
              <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
              <input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="portal-input border-white/10 bg-white/10 pl-11 text-white placeholder:text-slate-500 focus:border-cyan-300" placeholder="administration@aei.ma" />
            </span>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Mot de passe</span>
            <span className="relative block">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
              <input required type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="portal-input border-white/10 bg-white/10 pl-11 pr-12 text-white placeholder:text-slate-500 focus:border-cyan-300" placeholder="••••••••••••" />
              <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-3 rounded-lg p-1 text-slate-400 hover:text-white" aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}>
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </span>
          </label>

          {errorMessage && <div className="flex gap-2 rounded-xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{errorMessage}</div>}

          <button type="submit" disabled={submitting || !configured} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 py-3.5 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50">
            {submitting ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Vérification…</> : <><ShieldCheck className="h-4 w-4" /> Accéder au centre de contrôle</>}
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-5 text-slate-500">
          Les tentatives et actions sensibles sont protégées par les rôles Supabase et le journal d’audit.
        </p>
      </section>
    </main>
  );
}
