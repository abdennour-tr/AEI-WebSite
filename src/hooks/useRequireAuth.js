import { useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";

export function useRequireAuth() {
  const { session } = useAuth();
  const location = useLocation();
  const { openAuthModal } = useAuthModal();

  const requireAuth = useCallback(
    (reason = "Connectez-vous pour continuer cette action.") => {
      if (session) return true;
      openAuthModal({
        destination: `${location.pathname}${location.search}${location.hash}`,
        reason,
      });
      return false;
    },
    [location.hash, location.pathname, location.search, openAuthModal, session]
  );

  return { isAuthenticated: Boolean(session), requireAuth };
}
