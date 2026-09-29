import { BrowserRouter as Router, Navigate, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import OnboardingGate from "./components/OnboardingGate";
import ProtectedRoute from "./components/ProtectedRoute";
import ClubAdminRoute from "./components/ClubAdminRoute";
import AdminRoute from "./components/AdminRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthModalProvider } from "./contexts/AuthModalProvider";

import HomePage from "./pages/home";
import StudentDashboardPage from "./pages/dashboard";
import CoursPage from "./pages/cours";
import FavoritePage from "./pages/favorite";
import ChatbotAIPage from "./pages/chatbot";
import MyAnnoncePage from "./pages/annonce";
import EventsPage from "./pages/events";
import EventConfirmationPage from "./pages/event-confirmation";
import ForumPage from "./pages/forum";
import StagePage from "./pages/stage";
import ProjetsPage from "./pages/my-projets";
import PublicitePage from "./pages/publs";
import ColocationPage from "./pages/colocation";
import MarketPlacePage from "./pages/marketplace";
import ProfilePage from "./pages/profile";
import ClubsPage from "./pages/clubs";
import ClubDetailsPage from "./pages/club-details";
import PublicProjectsPage from "./pages/projects";
import ProjectDetailsPage from "./pages/project-details";
import OnboardingPage from "./pages/onboarding";
import ClubAdminLoginPage from "./pages/club-admin-login";
import ClubAdminDashboardPage from "./pages/club-admin-dashboard";
import AdminDashboardPage from "./pages/admin-dashboard";
import AdminLoginPage from "./pages/admin-login";
import LegalPage from "./pages/legal";
import NotFoundPage from "./pages/not-found";
import ServiceUnavailablePage from "./pages/service-unavailable";
import ErrorBoundary from "./components/ErrorBoundary";

function StudentOnly({ children }) {
  return (
    <ProtectedRoute>
      <OnboardingGate>{children}</OnboardingGate>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AuthModalProvider>
          <Routes>
          <Route path="/connexion" element={<Navigate to="/" replace state={{ authModal: { destination: "/tableau-de-bord", reason: "Authentifiez-vous pour accéder à votre espace étudiant." } }} />} />
          <Route path="/club-admin/connexion" element={<ClubAdminLoginPage />} />
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route path="/confidentialite" element={<LegalPage type="privacy" />} />
          <Route path="/conditions-utilisation" element={<LegalPage type="terms" />} />
          <Route path="/regles-communaute" element={<LegalPage type="community" />} />
          <Route element={<ClubAdminRoute />}>
            <Route path="/club-admin" element={<ClubAdminDashboardPage />} />
          </Route>
          <Route element={<AdminRoute />}>
            <Route path="/admin/tableau-de-bord" element={<AdminDashboardPage />} />
          </Route>
          <Route
            path="/bienvenue"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />

          <Route element={<OnboardingGate><ErrorBoundary><Layout /></ErrorBoundary></OnboardingGate>}>
            <Route path="/" element={<HomePage />} />
            <Route path="/tableau-de-bord" element={<StudentOnly><StudentDashboardPage /></StudentOnly>} />
            <Route path="/clubs" element={<StudentOnly><ClubsPage /></StudentOnly>} />
            <Route path="/clubs/:clubId" element={<StudentOnly><ClubDetailsPage /></StudentOnly>} />
            <Route path="/projets" element={<StudentOnly><PublicProjectsPage /></StudentOnly>} />
            <Route path="/projets/:projectId" element={<StudentOnly><ProjectDetailsPage /></StudentOnly>} />
            <Route path="/cours" element={<StudentOnly><CoursPage /></StudentOnly>} />
            <Route path="/favori" element={<StudentOnly><FavoritePage /></StudentOnly>} />
            <Route path="/chatbot" element={<StudentOnly><ChatbotAIPage /></StudentOnly>} />
            <Route path="/mes-annonces" element={<StudentOnly><MyAnnoncePage /></StudentOnly>} />
            <Route path="/evenements" element={<StudentOnly><EventsPage /></StudentOnly>} />
            <Route path="/evenements/confirmation" element={<StudentOnly><EventConfirmationPage /></StudentOnly>} />
            <Route path="/forum-communaute" element={<StudentOnly><ForumPage /></StudentOnly>} />
            <Route path="/stages-opportunites" element={<StudentOnly><StagePage /></StudentOnly>} />
            <Route path="/mes-projets" element={<StudentOnly><ProjetsPage /></StudentOnly>} />
            <Route path="/publicites" element={<StudentOnly><PublicitePage /></StudentOnly>} />
            <Route path="/colocation" element={<StudentOnly><ColocationPage /></StudentOnly>} />
            <Route path="/marketplace" element={<StudentOnly><MarketPlacePage /></StudentOnly>} />
            <Route path="/profile" element={<StudentOnly><ProfilePage /></StudentOnly>} />
            <Route path="/indisponible" element={<StudentOnly><ServiceUnavailablePage embedded /></StudentOnly>} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          </Routes>
        </AuthModalProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
