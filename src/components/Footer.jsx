import React from "react";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../assets/AEI.png";

const pageLinks = [
  { label: "Accueil", to: "/" },
  { label: "Clubs de l’ENIAD", to: "/clubs" },
  { label: "Cours", to: "/cours" },
  { label: "Colocation", to: "/colocation" },
  { label: "Marketplace", to: "/marketplace" },
];

const resourceLinks = [
  { label: "Forum", to: "/forum-communaute" },
  { label: "Évènements", to: "/evenements" },
  { label: "Opportunités", to: "/stages-opportunites" },
  { label: "Assistant IA", to: "/chatbot" },
];

export default function Footer() {
  return (
    <footer className="bg-slate-950 py-14 text-white">
      <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row lg:justify-between gap-12">
        {/* Logo & description */}
        <div className="flex flex-col gap-4 lg:w-1/3">
          <img
            src={logo}
            alt="AEI Marketplace"
            className="w-32 rounded-md bg-white object-contain p-2 md:w-36"
          />
          <p className="max-w-sm text-sm leading-relaxed text-slate-400 md:text-base">
            Le portail qui aide chaque étudiant à trouver sa place dans les clubs,
            rencontrer sa communauté et s’intégrer pleinement à l’ENIAD.
          </p>
        </div>

        {/* Liens rapides */}
        <div className="flex flex-col sm:flex-row lg:w-1/3 gap-8 justify-between">
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
              Pages
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              {pageLinks.map((page) => (
                <li key={page.label}>
                  <Link to={page.to} className="transition hover:text-sky-300">
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
              Ressources
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              {resourceLinks.map((resource) => (
                <li key={resource.label}>
                  <Link to={resource.to} className="transition hover:text-sky-300">
                    {resource.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Réseaux sociaux */}
        <div className="flex flex-col lg:w-1/3 gap-4">
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-white">
            Suivez-nous
          </h3>
          <p className="text-sm text-slate-400">
            Retrouvez les actualités et les temps forts de la communauté.
          </p>
          <div className="flex gap-4 mt-2">
            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, index) => (
              <button
                key={index}
                type="button"
                aria-label="Réseau social AEI"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-400 transition hover:border-sky-400/50 hover:bg-sky-400/10 hover:text-sky-300"
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-2 border-t border-white/10 px-6 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>&copy; {new Date().getFullYear()} AEI. Tous droits réservés.</span>
        <span>Conçu pour la communauté étudiante AEI.</span>
      </div>
    </footer>
  );
}
