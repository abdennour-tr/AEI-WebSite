import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LoadingSkeleton from "@/components/LoadingSkeleton";

export default function ProtectedRoute({ children }) {
  const { loading, session } = useAuth();
  const location = useLocation();
  const isOnboardingPreview =
    import.meta.env.DEV &&
    location.pathname === "/bienvenue" &&
    new URLSearchParams(location.search).has("onboarding-preview");

  if (isOnboardingPreview) return children;

  if (loading) {
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
    return <Navigate to="/connexion" replace state={{ from: location }} />;
  }

  return children;
}
