import { useEffect, useState } from "react";
import { AlertCircle, Eye, EyeOff, LoaderCircle, Lock, ShieldCheck, User, X } from "lucide-react";
import logo from "@/assets/AEI.png";

export default function StudentAuthModal({ request, configured, signIn, onClose, onAuthenticated }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    const { data, error } = await signIn(email.trim(), password);
    if (error) {
      setErrorMessage(error.message === "Invalid login credentials" ? "Adresse e-mail ou mot de passe incorrect." : error.message);
      setSubmitting(false);
      return;
    }
    onAuthenticated(data?.user);
  };

  return (
    <div className="portal-modal-backdrop z-[100] p-4" onMouseDown={() => !submitting && onClose()}>
      <section className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="student-auth-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="relative overflow-hidden bg-slate-950 px-6 pb-6 pt-7 text-white">
          <div className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-sky-500/25 blur-3xl" />
          <button type="button" onClick={onClose} disabled={submitting} className="absolute right-4 top-4 rounded-xl bg-white/10 p-2 text-slate-300 transition hover:bg-white/15 hover:text-white" aria-label="Fermer"><X className="h-5 w-5" /></button>
          <div className="relative flex items-center gap-3 pr-10">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white"><img src={logo} alt="AEI" className="h-8 w-auto" /></span>
            <div><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Espace étudiant</p><h2 id="student-auth-title" className="mt-1 text-2xl font-black">Authentification requise</h2></div>
          </div>
          <p className="relative mt-4 text-sm leading-6 text-slate-300">{request.reason || "Vous devez vous authentifier pour accéder à cette partie du portail."}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6 sm:p-7">
          <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Adresse e-mail</span><span className="relative block"><User className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><input autoFocus required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="portal-input pl-10" placeholder="prenom.nom@ump.ac.ma" /></span></label>
          <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Mot de passe</span><span className="relative block"><Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><input required type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="portal-input pl-10 pr-11" placeholder="Votre mot de passe" /><button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-3 rounded-lg p-1 text-slate-400 hover:text-sky-700" aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span></label>

          {!configured && <p className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> Supabase doit être configuré pour activer la connexion.</p>}
          {errorMessage && <p className="flex gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {errorMessage}</p>}

          <button type="submit" disabled={submitting || !configured} className="portal-primary-button w-full">{submitting ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Connexion…</> : "Se connecter et continuer"}</button>
          <p className="flex items-start justify-center gap-2 text-center text-xs leading-5 text-slate-400"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> Connexion sécurisée. Vous serez dirigé automatiquement vers la page demandée.</p>
        </form>
      </section>
    </div>
  );
}
