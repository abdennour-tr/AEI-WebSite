import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  X,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import events from "@/data/Events";

export default function EventsAndAgendaPage() {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const eventsPerPage = 6; // nombre d'événements par page

  const totalPages = Math.ceil(events.length / eventsPerPage);
  const paginatedEvents = events.slice(
    (page - 1) * eventsPerPage,
    page * eventsPerPage
  );

  return (
    <div className="space-y-8 lg:p-6 md:p-4 p-2">
      <header className="bg-linear-to-r from-sky-600 to-orange-500 text-white p-6 rounded-xl shadow-lg mb-10">
        <h1 className="text-3xl font-bold">Évènements & Agenda</h1>
        <p className="text-white/90 mt-1">
          Reste informé des prochains évènements et activités du campus.
        </p>

        <button
          onClick={() => setCalendarOpen(true)}
          className="mt-6 px-6 py-3 bg-white text-sky-700 font-semibold rounded-xl shadow hover:bg-gray-100 transition flex items-center gap-2"
        >
          <CalendarDays size={18} /> Ouvrir le calendrier
        </button>
      </header>

      {/* GRID DES ÉVÉNEMENTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {paginatedEvents.map((event, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white shadow-lg rounded-2xl p-4.5 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <span className="bg-linear-to-r from-blue-500 via-sky-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-semibold">
              {event.tag}
            </span>
            <h2 className="text-xl font-bold text-gray-900 mt-3">
              {event.title}
            </h2>
            <div className="mt-3 space-y-1 text-gray-700">
              <p className="flex items-center gap-2 text-sm text-sky-600 font-medium">
                <CalendarDays size={16} /> {event.date}
              </p>
              <p className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin size={16} /> {event.location}
              </p>
            </div>
            <p className="text-sm text-gray-700 mt-3">{event.description}</p>
            <button className="mt-5 w-full bg-linear-to-r from-sky-500 to-blue-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition">
              Voir plus
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

      {/* ===== MODAL Calendier ===== */}
      <AnimatePresence>
        {calendarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setCalendarOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className="fixed top-1/2 left-1/2 z-50 bg-white p-8 rounded-3xl shadow-2xl w-[90%] max-w-lg transform -translate-x-1/2 -translate-y-1/2 backdrop-blur-xl border border-gray-200"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-sky-700">
                  Calendrier — Décembre 2025
                </h2>
                <button
                  onClick={() => setCalendarOpen(false)}
                  className="text-gray-500 hover:text-gray-800 transition"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-3 text-center font-medium text-gray-700">
                {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(
                  (day) => (
                    <div
                      key={day}
                      className="pb-2 border-b font-semibold text-gray-700"
                    >
                      {day}
                    </div>
                  )
                )}
                {[...Array(31)].map((_, i) => (
                  <button
                    key={i}
                    className="p-3 rounded-xl text-sm bg-sky-50 hover:bg-sky-200 cursor-pointer transition border"
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
