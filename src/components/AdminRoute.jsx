import { LoaderCircle, ShieldX } from "lucide-react";
import { Link, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function AdminRoute() {
  const { loading, profileLoading, session, profile } = useAuth();
  if (loading || profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070b17] text-white">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-300">
          <LoaderCircle className="h-5 w-5 animate-spin text-cyan-400" />
          Vérification de vos droits d’administration…
        </div>
      </div>
    );
  }

  if (!session) return <Navigate to="/admin" replace />;

  if (!profile || !["admin", "moderator"].includes(profile.role)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070b17] p-5 text-white">
        <section className="w-full max-w-lg rounded-3xl border border-rose-400/20 bg-white/5 p-8 text-center shadow-2xl backdrop-blur">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-400/10 text-rose-300"><ShieldX className="h-7 w-7" /></span>
          <h1 className="mt-5 text-2xl font-bold">Accès administration refusé</h1>
          <p className="mt-3 text-sm leading-7 text-slate-300">Cet espace est réservé aux modérateurs et aux administrateurs autorisés.</p>
          <Link to="/admin" className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950">Retour à la connexion</Link>
        </section>
      </main>
    );
  }

  return <Outlet context={{ role: profile.role, profile }} />;
}
