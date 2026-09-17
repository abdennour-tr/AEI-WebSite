import { useEffect, useState } from "react";
import { ArrowLeft, LoaderCircle, LockKeyhole, ShieldX } from "lucide-react";
import { Link, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { clubAdminApi } from "@/services/clubAdminApi";

export default function ClubAdminRoute() {
  const { loading: authLoading, session, signOut } = useAuth();
  const [access, setAccess] = useState(null);
  const [checking, setChecking] = useState(true);
  const [configurationMissing, setConfigurationMissing] = useState(false);

  useEffect(() => {
    if (authLoading || !session) return;
    let active = true;
    clubAdminApi
      .getAccess()
      .then((result) => {
        if (active) setAccess(result);
      })
      .catch((error) => {
        if (active && ["42P01", "PGRST205"].includes(error?.code)) {
          setConfigurationMissing(true);
        }
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
  }, [authLoading, session]);

  if (authLoading || (session && checking)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070b17] text-white">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-300">
          <LoaderCircle className="h-5 w-5 animate-spin text-cyan-400" />
          Vérification de vos accès responsables…
        </div>
      </div>
    );
  }

  if (!session) return <Navigate to="/club-admin/connexion" replace />;

  if (configurationMissing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070b17] p-5 text-white">
        <div className="w-full max-w-lg rounded-3xl border border-cyan-400/20 bg-white/5 p-8 text-center shadow-2xl backdrop-blur">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
            <LockKeyhole className="h-7 w-7" />
          </span>
          <h1 className="mt-5 text-2xl font-bold">Configuration Supabase requise</h1>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            L’espace responsable est prêt. Le schéma Clubs doit être activé dans Supabase avant sa première utilisation.
          </p>
          <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950">
            <ArrowLeft className="h-4 w-4" /> Retour au portail
          </Link>
        </div>
      </div>
    );
  }

  if (!access) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070b17] p-5 text-white">
        <div className="w-full max-w-lg rounded-3xl border border-rose-400/20 bg-white/5 p-8 text-center shadow-2xl backdrop-blur">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-400/10 text-rose-300"><ShieldX className="h-7 w-7" /></span>
          <h1 className="mt-5 text-2xl font-bold">Accès responsable non autorisé</h1>
          <p className="mt-3 text-sm leading-7 text-slate-300">Ce compte étudiant n’est associé à aucun club. Connectez-vous avec le compte du responsable.</p>
          <button type="button" onClick={signOut} className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950">Changer de compte</button>
        </div>
      </div>
    );
  }

  return <Outlet context={access} />;
}
