import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LoadingSkeleton from "@/components/LoadingSkeleton";

export default function ProtectedRoute({ children }) {
  const { loading, profileLoading, session, profile } = useAuth();
  const location = useLocation();
  const isOnboardingPreview =
    import.meta.env.DEV &&
    location.pathname === "/bienvenue" &&
    new URLSearchParams(location.search).has("onboarding-preview");

  if (isOnboardingPreview) return children;

  if (loading || (session && profileLoading)) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-12 text-white sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 h-32 animate-pulse rounded-3xl bg-white/10" />
          <LoadingSkeleton cards={3} />
          <p className="mt-6 text-center text-sm font-semibold text-slate-400">
            Préparation de votre espace étudiant…
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/" replace state={{ authModal: { destination: `${location.pathname}${location.search}${location.hash}`, reason: "Vous devez vous authentifier pour accéder à cette page." } }} />;
  }

  if (profile && ["admin", "moderator"].includes(profile.role)) {
    return <Navigate to="/admin/tableau-de-bord" replace />;
  }

  if (
    session.user?.user_metadata?.account_type === "club_manager" ||
    profile?.is_club_manager
  ) {
    return <Navigate to="/club-admin" replace />;
  }

  if (!profile || profile.role !== "student") {
    return <Navigate to="/" replace />;
  }

  return children;
}
