import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

import profile from "../assets/profile.jpg";
import chat from "../assets/icons/chat-a-bulles.png";
import colocation from "../assets/icons/colocation.png";
import communautes from "../assets/icons/communautes.png";
import favoris from "../assets/icons/favoris.png";
import gestion from "../assets/icons/gestion-de-projet.png";
import publicite from "../assets/icons/la-publicite.png";
import stage from "../assets/icons/stage.png";
import evenement from "../assets/icons/un-evenement.png";
import { Menu, X } from "lucide-react";
import Footer from "../components/Footer";

function ScrollToTopDiv() {
  const { pathname } = useLocation();
  const containerRef = useRef(null);

  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [pathname]);

  return containerRef;
}

export default function MainNavigation({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const scrollRef = ScrollToTopDiv();

  const menuItems = [
    {
      name: "Mes annonces de colocation",
      image: colocation,
      to: "/mes-annonces",
    },
    { name: "Mes cours favoris", image: favoris, to: "/favori" },
    { name: "Mes projets déposés", image: gestion, to: "/mes-projets" },
    { name: "Évènements / Agenda", image: evenement, to: "/evenements" },
    { name: "Stages & Opportunités", image: stage, to: "/stages-opportunites" },
    { name: "Forum / Communauté", image: communautes, to: "/forum-communaute" },
    { name: "Publicités", image: publicite, to: "/publicites" },
    { name: "Chatbot IA", image: chat, to: "/chatbot" },
  ];

  const topLinks = [
    { name: "Accueil", to: "/" },
    { name: "Cours", to: "/cours" },
    { name: "Colocation", to: "/colocation" },
    { name: "Marketplace", to: "/marketplace" },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 bg-sky-100 w-72 p-6 shadow-lg transform transition-transform duration-300 ease-in-out z-50
    ${
      sidebarOpen ? "translate-x-0" : "-translate-x-full"
    } md:translate-x-0 md:static md:inset-auto
    flex flex-col h-full overflow-y-auto`}
      >
        {/* Close button (mobile) */}
        <div className="flex justify-end md:hidden mb-4">
          <button onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Profil utilisateur */}
        <Link to={"/profile"} onClick={() => setSidebarOpen(false)}>
          <div className="flex flex-col items-center mb-8">
            <img
              src={profile}
              alt="Profile"
              className="w-24 h-24 rounded-full border-2 border-sky-900 mb-2"
            />
            <h4 className="text-lg font-bold bg-linear-to-r from-blue-500 via-sky-600 to-teal-400 bg-clip-text text-transparent">
              Abdenour TRARI
            </h4>
            <span className="text-sky-500 text-sm">ÉTUDIANT</span>
          </div>
        </Link>

        {/* Top links (mobile / tablette) */}
        <ul className="space-y-2 md:hidden mb-6">
          {topLinks.map((link, index) => (
            <li
              key={index}
              className={`py-2 px-4 rounded-lg cursor-pointer transition ${
                location.pathname === link.to
                  ? "bg-sky-300"
                  : "hover:bg-sky-300"
              }`}
            >
              <Link to={link.to} onClick={() => setSidebarOpen(false)}>
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Menu principal */}
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li
              key={index}
              className={`py-2 px-4 rounded-lg cursor-pointer transition ${
                location.pathname === item.to
                  ? "bg-sky-300"
                  : "hover:bg-sky-300"
              }`}
            >
              <Link
                to={item.to}
                className="flex items-center space-x-3"
                onClick={() => setSidebarOpen(false)}
              >
                <img src={item.image} alt="" className="w-6 h-6" />
                <span className="text-gray-900 text-sm font-medium">
                  {item.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col ml-0 transition-all duration-300">
        {/* TOP NAVBAR */}
        <header className="bg-sky-900 text-white h-16 flex items-center justify-between px-4 md:px-6 shadow-md">
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
          </div>

          {/* Navigation desktop */}
          <nav className="hidden md:flex space-x-6 font-medium text-white">
            {topLinks.map((link, index) => (
              <Link
                key={index}
                to={link.to}
                className={`hover:text-sky-400 transition-colors ${
                  location.pathname === link.to ? "text-sky-500 font-bold" : ""
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Boutons connexion / inscription */}
          <div className="flex space-x-2">
            <button
              className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md transition"
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/";
              }}
            >
              Déconnexion
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="flex-1 overflow-y-auto" ref={scrollRef}>
          <div className="mb-10">{children}</div> <Footer />
        </div>
      </main>

      {/* Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
