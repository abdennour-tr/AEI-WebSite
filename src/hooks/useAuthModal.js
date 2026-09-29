import { useContext } from "react";
import { AuthModalContext } from "@/contexts/auth-modal-context";

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) throw new Error("useAuthModal doit être utilisé dans AuthModalProvider.");
  return context;
}
