import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function OnboardingGate({ children }) {
  const { user } = useAuth();

  if (!user?.user_metadata?.onboarding_completed) {
    return <Navigate to="/bienvenue" replace />;
  }

  return children;
}
