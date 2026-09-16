import { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  X,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import fallbackEvents from "@/data/Events";
import PageHeader from "@/components/PageHeader";
import { usePortalCollection } from "@/hooks/usePortalCollection";
import { eventsApi } from "@/services/portalApi";

export default function EventsAndAgendaPage() {
  const { data: events } = usePortalCollection(eventsApi.list, fallbackEvents);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const eventsPerPage = 6; // nombre d'événements par page

  const totalPages = Math.ceil(events.length / eventsPerPage);
  const paginatedEvents = events.slice(
    (page - 1) * eventsPerPage,
    page * eventsPerPage
  );

  return (
    <div className="portal-page">
      <PageHeader
        icon={CalendarDays}
        eyebrow="Vie du campus"
        title="Évènements & Agenda"
        description="Retrouvez les prochains rendez-vous, ateliers et activités de la communauté AEI."
      >
        <button
          onClick={() => setCalendarOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-sky-800 transition hover:bg-sky-50"
        >
          <CalendarDays size={18} /> Ouvrir le calendrier
        </button>
      </PageHeader>

      {/* GRID DES ÉVÉNEMENTS */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {paginatedEvents.map((event, index) => (
          <Motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="portal-card p-6"
          >
            <span className="portal-badge">
              {event.tag}
            </span>
            <h2 className="mt-4 text-lg font-bold text-slate-950">
              {event.title}
            </h2>
            <div className="mt-3 space-y-2 text-slate-700">
              <p className="flex items-center gap-2 text-sm font-semibold text-sky-700">
                <CalendarDays size={16} /> {event.date}
              </p>
              <p className="flex items-center gap-2 text-sm text-slate-500">
                <MapPin size={16} /> {event.location}
              </p>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">{event.description}</p>
            <button className="portal-primary-button mt-5 w-full">
              Voir plus
            </button>
          </Motion.div>
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
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
              onClick={() => setCalendarOpen(false)}
            />
            <Motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className="fixed left-1/2 top-1/2 z-50 w-[94%] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-8"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-950">
                  Calendrier — Septembre 2026
                </h2>
                <button
                  onClick={() => setCalendarOpen(false)}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1.5 text-center text-sm font-medium text-slate-700 sm:gap-3">
                {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(
                  (day) => (
                    <div
                      key={day}
                      className="border-b pb-2 text-xs font-bold text-slate-500"
                    >
                      {day}
                    </div>
                  )
                )}
                {[...Array(31)].map((_, i) => (
                  <button
                    key={i}
                    className="aspect-square rounded-lg border border-slate-200 bg-white text-xs transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 sm:rounded-xl sm:text-sm"
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </Motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
