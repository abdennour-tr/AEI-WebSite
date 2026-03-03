import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import HomePage from "./pages/home";
import CoursPage from "./pages/cours";
import FavoritePage from "./pages/favorite";
import ChatbotAIPage from "./pages/chatbot";
import MyAnnoncePage from "./pages/annonce";
import EventsPage from "./pages/events";
import ForumPage from "./pages/forum";
import StagePage from "./pages/stage";
import ProjetsPage from "./pages/my-projets";
import PublicitePage from "./pages/publs";
import ColocationPage from "./pages/colocation";
import MarketPlacePage from "./pages/marketplace";
import ProfilePage from "./pages/profile";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cours" element={<CoursPage />} />
          <Route path="/favori" element={<FavoritePage />} />
          <Route path="/chatbot" element={<ChatbotAIPage />} />
          <Route path="/mes-annonces" element={<MyAnnoncePage />} />
          <Route path="/evenements" element={<EventsPage />} />
          <Route path="/forum-communaute" element={<ForumPage />} />
          <Route path="/stages-opportunites" element={<StagePage />} />
          <Route path="/mes-projets" element={<ProjetsPage />} />
          <Route path="/publicites" element={<PublicitePage />} />
          <Route path="/colocation" element={<ColocationPage />} />
          <Route path="/marketplace" element={<MarketPlacePage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
