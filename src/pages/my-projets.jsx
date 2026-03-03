import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import projets from "@/data/my-projects";

export default function ProjetsPage() {
  const [page, setPage] = useState(1);
  const projetsPerPage = 6;

  const totalPages = Math.ceil(projets.length / projetsPerPage);
  const paginated = projets.slice(
    (page - 1) * projetsPerPage,
    page * projetsPerPage
  );

  return (
    <div className="space-y-8 lg:p-6 md:p-4 p-2">
      <header className="bg-linear-to-r from-sky-600 to-orange-500 text-white p-6 rounded-xl shadow-lg mb-10">
        <h1 className="text-3xl font-bold">Mes Projets Déposés</h1>
        <p className="text-white/90 mt-1">
          Vos projets techniques, IA, mobiles et applications publiés sur votre
          espace étudiant.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {paginated.map((p, index) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-3xl shadow-xl bg-white border hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 p-6 relative"
          >
            <div
              className={`h-2 w-full rounded-xl mb-4 bg-linear-to-r ${p.color}`}
            ></div>

            <h2 className="text-xl font-bold text-gray-800 mb-2">{p.title}</h2>

            <p className="text-gray-600 text-sm mb-4">{p.desc}</p>

            <span className="text-xs bg-gray-100 px-3 py-1 rounded-full font-medium text-gray-700">
              {p.tech}
            </span>

            <p className="text-xs text-gray-500 mt-3">🕒 {p.updated}</p>

            <button className="mt-5 w-full bg-linear-to-r from-sky-500 to-blue-600 text-white py-2 rounded-xl font-semibold hover:opacity-90 transition">
              Voir le projet
            </button>
          </motion.div>
        ))}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-8 items-center">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i}
              variant={page === i + 1 ? "default" : "outline"}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight />
          </Button>
        </div>
      )}

      <div className="flex justify-end mt-10">
        <button className="bg-linear-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-2xl font-semibold hover:opacity-90 transition shadow-lg">
          Ajouter un nouveau projet
        </button>
      </div>
    </div>
  );
}
