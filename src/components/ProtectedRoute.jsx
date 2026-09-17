import { LoaderCircle } from "lucide-react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

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
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-300">
          <LoaderCircle className="h-5 w-5 animate-spin text-sky-400" />
          Vérification de votre session…
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/connexion" replace state={{ from: location }} />;
  }

  return children;
}
