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
import { LogOut, Menu, ShieldCheck, X } from "lucide-react";
import Footer from "../components/Footer";
import { useAuth } from "@/hooks/useAuth";
import GlobalSearch from "@/components/GlobalSearch";
import NotificationCenter from "@/components/NotificationCenter";

function ScrollToTopDiv() {
  const { pathname, hash } = useLocation();
  const containerRef = useRef(null);

  useEffect(() => {
    if (hash) {
      window.requestAnimationFrame(() => {
        document.getElementById(hash.slice(1))?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
      return;
    }

    containerRef.current?.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [pathname, hash]);

  return containerRef;
}

export default function MainNavigation({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const scrollRef = ScrollToTopDiv();
  const { user, profile: accountProfile, signOut } = useAuth();
  const displayName =
    accountProfile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Étudiant AEI";

  const menuItems = [
    { name: "Découvrir les clubs", image: communautes, to: "/clubs" },
    {
      name: "Mes annonces de colocation",
      image: colocation,
      to: "/mes-annonces",
    },
    { name: "Mes favoris", image: favoris, to: "/favori" },
    { name: "Mes projets déposés", image: gestion, to: "/mes-projets" },
    { name: "Évènements / Agenda", image: evenement, to: "/evenements" },
    { name: "Stages & Opportunités", image: stage, to: "/stages-opportunites" },
    { name: "Forum / Communauté", image: communautes, to: "/forum-communaute" },
    { name: "Publicités", image: publicite, to: "/publicites" },
    { name: "Chatbot IA", image: chat, to: "/chatbot" },
    ...(["admin", "moderator"].includes(accountProfile?.role)
      ? [{ name: "Administration", icon: ShieldCheck, to: "/admin" }]
      : []),
  ];

  const topLinks = [
    { name: "Tableau de bord", to: "/" },
    { name: "Clubs", to: "/clubs" },
    { name: "Projets", to: "/projets" },
    { name: "Cours", to: "/cours" },
    { name: "Colocation", to: "/colocation" },
    { name: "Marketplace", to: "/marketplace" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 border-r border-slate-200 bg-white p-5 shadow-xl transform transition-transform duration-300 ease-in-out z-50
    ${
      sidebarOpen ? "translate-x-0" : "-translate-x-full"
    } md:translate-x-0 md:static md:inset-auto
    flex flex-col h-full overflow-y-auto`}
      >
        {/* Close button (mobile) */}
        <div className="flex justify-end md:hidden mb-4">
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Fermer le menu"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={24} />
          </button>
        </div>

        {/* Profil utilisateur */}
        <Link
          to={"/profile"}
          onClick={() => setSidebarOpen(false)}
          className="mb-7 block rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:border-sky-200 hover:bg-sky-50/60"
        >
          <div className="flex items-center gap-3">
            <img
              src={profile}
              alt="Profile"
              className="h-12 w-12 rounded-xl object-cover ring-2 ring-white"
            />
            <div className="min-w-0">
              <h4 className="truncate text-sm font-bold text-slate-900">
                {displayName}
              </h4>
              <span className="mt-0.5 block text-[11px] font-bold uppercase tracking-wider text-sky-700">
                {accountProfile?.role === "admin" ? "Administrateur" : "Espace étudiant"}
              </span>
            </div>
          </div>
        </Link>

        {/* Top links (mobile / tablette) */}
        <ul className="mb-6 space-y-1 border-b border-slate-200 pb-6 xl:hidden">
          {topLinks.map((link, index) => (
            <li
              key={index}
              className={`rounded-xl transition ${
                location.pathname === link.to
                  ? "bg-sky-50 text-sky-800"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <Link
                to={link.to}
                onClick={() => setSidebarOpen(false)}
                className="block px-3 py-2.5 text-sm font-semibold"
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Menu principal */}
        <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Vie étudiante
        </p>
        <ul className="space-y-1">
          {menuItems.map((item, index) => (
            <li
              key={index}
              className={`rounded-xl transition ${
                location.pathname === item.to
                  ? "bg-sky-50 text-sky-800"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <Link
                to={item.to}
                className="flex items-center gap-3 px-3 py-2.5"
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon ? <item.icon className="h-5 w-5 text-sky-700" /> : <img src={item.image} alt="" className="h-5 w-5 opacity-80" />}
                <span className="text-sm font-semibold">
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
        <header className="z-30 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-3 text-slate-900 sm:px-4 md:px-6">
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Ouvrir le menu"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            >
              <Menu size={24} />
            </button>
          </div>

          {/* Navigation desktop */}
          <nav className="hidden shrink-0 items-center gap-0 text-sm font-semibold xl:flex 2xl:gap-1">
            {topLinks.map((link, index) => (
              <Link
                key={index}
                to={link.to}
                className={`rounded-lg px-2 py-2 transition-colors 2xl:px-3 ${
                  location.pathname === link.to
                    ? "bg-sky-50 text-sky-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex min-w-0 items-center gap-2 2xl:ml-2">
            <GlobalSearch />
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <NotificationCenter />
            <button
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
              onClick={async () => {
                await signOut();
              }}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Déconnexion</span>
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
