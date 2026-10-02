import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function OnboardingGate({ children }) {
  const { user, profile, profileLoading } = useAuth();

  if (!user) return children;

  if (profileLoading) return null;

  if (profile && ["admin", "moderator"].includes(profile.role)) {
    return <Navigate to="/admin/tableau-de-bord" replace />;
  }

  if (
    user.user_metadata?.account_type === "club_manager" ||
    profile?.is_club_manager
  ) {
    return <Navigate to="/club-admin" replace />;
  }

  if (!profile || profile.role !== "student") {
    return <Navigate to="/" replace />;
  }

  if (!user?.user_metadata?.onboarding_completed) {
    return <Navigate to="/bienvenue" replace />;
  }

  return children;
}
