import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthModalContext } from "@/contexts/auth-modal-context";
import { useAuth } from "@/hooks/useAuth";
import StudentAuthModal from "@/components/StudentAuthModal";

export function AuthModalProvider({ children }) {
  const [localRequest, setLocalRequest] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { configured, signIn } = useAuth();
  const routeRequest = location.state?.authModal || null;
  const request = localRequest || routeRequest;

  const clearRouteRequest = () => {
    if (!routeRequest) return;
    const nextState = { ...(location.state || {}) };
    delete nextState.authModal;
    navigate(`${location.pathname}${location.search}${location.hash}`, {
      replace: true,
      state: Object.keys(nextState).length ? nextState : null,
    });
  };

  const closeAuthModal = () => {
    setLocalRequest(null);
    clearRouteRequest();
  };

  const openAuthModal = ({ destination, reason } = {}) => {
    setLocalRequest({
      destination: destination || `${location.pathname}${location.search}${location.hash}`,
      reason: reason || "Vous devez vous authentifier pour continuer.",
    });
  };

  const onAuthenticated = (user) => {
    const destination = request?.destination || "/tableau-de-bord";
    setLocalRequest(null);
    if (!user?.user_metadata?.onboarding_completed) {
      navigate("/bienvenue", { replace: true });
      return;
    }
    navigate(destination, { replace: true, state: null });
  };

  return (
    <AuthModalContext.Provider value={{ openAuthModal, closeAuthModal }}>
      {children}
      {request && <StudentAuthModal request={request} configured={configured} signIn={signIn} onClose={closeAuthModal} onAuthenticated={onAuthenticated} />}
    </AuthModalContext.Provider>
  );
}
