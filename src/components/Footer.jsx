import React from "react";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import logo from "../assets/AEI.png";

export default function Footer() {
  return (
    <footer className="bg-linear-to-r from-sky-500  to-orange-500 text-white py-14">
      <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row lg:justify-between gap-12">
        {/* Logo & description */}
        <div className="flex flex-col gap-4 lg:w-1/3">
          <img
            src={logo}
            alt="AEI Marketplace"
            className="w-36 md:w-40 lg:w-48 object-contain rounded-md  hover:scale-105 transition-transform duration-500"
          />
          <p className="text-gray-100 text-sm md:text-base leading-relaxed">
            Connectez, partagez et échangez entre étudiants de manière simple et
            sécurisée.{" "}
            <span className="font-semibold text-white">
              Votre plateforme étudiante professionnelle.
            </span>
          </p>
        </div>

        {/* Liens rapides */}
        <div className="flex flex-col sm:flex-row lg:w-1/3 gap-8 justify-between">
          <div>
            <h3 className="font-semibold mb-4 text-lg border-b border-white/30 pb-2">
              Pages
            </h3>
            <ul className="space-y-2 text-gray-100">
              {["Accueil", "Cours", "Colocation", "Marketplace"].map((page) => (
                <li
                  key={page}
                  className="hover:text-yellow-200 cursor-pointer transition-colors duration-300"
                >
                  {page}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-lg border-b border-white/30 pb-2">
              Ressources
            </h3>
            <ul className="space-y-2 text-gray-100">
              {["Forum", "Évènements", "Support", "Contact"].map((res) => (
                <li
                  key={res}
                  className="hover:text-yellow-200 cursor-pointer transition-colors duration-300"
                >
                  {res}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Réseaux sociaux */}
        <div className="flex flex-col lg:w-1/3 gap-4">
          <h3 className="font-semibold mb-2 text-lg">Suivez-nous</h3>
          <p className="text-gray-100 text-sm">
            Restez connecté sur nos réseaux :
          </p>
          <div className="flex gap-4 mt-2">
            <Facebook className="w-6 h-6 hover:text-sky-200 cursor-pointer transition-transform duration-300 hover:scale-125" />
            <Twitter className="w-6 h-6 hover:text-sky-200 cursor-pointer transition-transform duration-300 hover:scale-125" />
            <Instagram className="w-6 h-6 hover:text-pink-200 cursor-pointer transition-transform duration-300 hover:scale-125" />
            <Linkedin className="w-6 h-6 hover:text-blue-200 cursor-pointer transition-transform duration-300 hover:scale-125" />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/30 mt-12 pt-6 text-center text-gray-100 text-sm">
        &copy; {new Date().getFullYear()} AEI. Tous droits réservés.
        <div>
          Développé par :{" "}
          <span className="font-black text-amber-900">TRARI Abdenour</span>
        </div>
      </div>
    </footer>
  );
}
