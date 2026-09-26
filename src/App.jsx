import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import OnboardingGate from "./components/OnboardingGate";
import ProtectedRoute from "./components/ProtectedRoute";
import ClubAdminRoute from "./components/ClubAdminRoute";
import AdminRoute from "./components/AdminRoute";
import { AuthProvider } from "./contexts/AuthContext";

import HomePage from "./pages/home";
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
import ConnexionPage from "./pages/connexion";
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

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/connexion" element={<ConnexionPage />} />
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

          <Route
            element={
              <ProtectedRoute>
                <OnboardingGate>
                  <ErrorBoundary>
                    <Layout />
                  </ErrorBoundary>
                </OnboardingGate>
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/clubs" element={<ClubsPage />} />
            <Route path="/clubs/:clubId" element={<ClubDetailsPage />} />
            <Route path="/projets" element={<PublicProjectsPage />} />
            <Route path="/projets/:projectId" element={<ProjectDetailsPage />} />
            <Route path="/cours" element={<CoursPage />} />
            <Route path="/favori" element={<FavoritePage />} />
            <Route path="/chatbot" element={<ChatbotAIPage />} />
            <Route path="/mes-annonces" element={<MyAnnoncePage />} />
            <Route path="/evenements" element={<EventsPage />} />
            <Route path="/evenements/confirmation" element={<EventConfirmationPage />} />
            <Route path="/forum-communaute" element={<ForumPage />} />
            <Route path="/stages-opportunites" element={<StagePage />} />
            <Route path="/mes-projets" element={<ProjetsPage />} />
            <Route path="/publicites" element={<PublicitePage />} />
            <Route path="/colocation" element={<ColocationPage />} />
            <Route path="/marketplace" element={<MarketPlacePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/indisponible" element={<ServiceUnavailablePage embedded />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
