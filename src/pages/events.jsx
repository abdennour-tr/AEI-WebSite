import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import QRCode from "qrcode";
import {
  AlarmClock,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  Grid3X3,
  List,
  LoaderCircle,
  MapPin,
  QrCode,
  SlidersHorizontal,
  Sparkles,
  TicketCheck,
  Users,
  X,
} from "lucide-react";
import fallbackEvents from "@/data/Events";
import { usePortalCollection } from "@/hooks/usePortalCollection";
import {
  agendaApi,
  attendanceQrUrl,
  formatAgendaEvent,
  googleCalendarUrl,
} from "@/services/agendaApi";

const fallbackAgenda = fallbackEvents.map(formatAgendaEvent);

const categoryStyles = {
  Conférence: "bg-violet-100 text-violet-800",
  Atelier: "bg-cyan-100 text-cyan-800",
  Compétition: "bg-amber-100 text-amber-800",
  Hackathon: "bg-rose-100 text-rose-800",
  Club: "bg-emerald-100 text-emerald-800",
};

const reminderOptions = [
  { value: 60, label: "1 heure avant" },
  { value: 1440, label: "1 jour avant" },
  { value: 10080, label: "1 semaine avant" },
];

async function loadAgenda() {
  try {
    const rows = await agendaApi.list();
    return rows.length ? rows : fallbackAgenda;
  } catch {
    return fallbackAgenda;
  }
}

function sameDay(first, second) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function CalendarView({ events, month, onMonthChange, onSelect }) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const leading = (firstDay.getDay() + 6) % 7;
  const cells = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: lastDay.getDate() }, (_, index) => index + 1),
  ];
  while (cells.length % 7) cells.push(null);

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Vue mensuelle</p>
          <h2 className="mt-1 text-2xl font-black capitalize text-slate-950">
            {new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(month)}
          </h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50" aria-label="Mois précédent"><ChevronLeft className="h-5 w-5" /></button>
          <button onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50" aria-label="Mois suivant"><ChevronRight className="h-5 w-5" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 px-2 py-3 text-center text-xs font-black uppercase tracking-wide text-slate-400 sm:px-4">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, index) => {
          const date = day ? new Date(month.getFullYear(), month.getMonth(), day) : null;
          const dayEvents = date ? events.filter((event) => sameDay(new Date(event.starts_at), date)) : [];
          const today = date && sameDay(date, new Date());
          return (
            <div key={`${day || "empty"}-${index}`} className="min-h-20 border-b border-r border-slate-100 p-1.5 sm:min-h-28 sm:p-2.5">
              {day && <><span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${today ? "bg-indigo-600 text-white" : "text-slate-600"}`}>{day}</span><div className="mt-1 space-y-1">{dayEvents.slice(0, 2).map((event) => <button key={event.event_key} onClick={() => onSelect(event)} className="block w-full truncate rounded-md bg-indigo-50 px-1.5 py-1 text-left text-[10px] font-bold text-indigo-700 hover:bg-indigo-100 sm:text-xs">{event.title}</button>)}{dayEvents.length > 2 && <span className="block pl-1 text-[10px] font-bold text-slate-400">+{dayEvents.length - 2}</span>}</div></>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function EventsAndAgendaPage() {
  const { data: events, loading, setData } = usePortalCollection(loadAgenda, fallbackAgenda);
  const [period, setPeriod] = useState("all");
  const [club, setClub] = useState("Tous");
  const [category, setCategory] = useState("Toutes");
  const [view, setView] = useState("list");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [month, setMonth] = useState(() => {
    const reference = fallbackAgenda[0] ? new Date(fallbackAgenda[0].starts_at) : new Date();
    return new Date(reference.getFullYear(), reference.getMonth(), 1);
  });
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [reminderMinutes, setReminderMinutes] = useState(1440);
  const [qrDataUrl, setQrDataUrl] = useState("");

  const filters = useMemo(
    () => ({
      clubs: ["Tous", ...new Set(events.map((event) => event.organizer).filter(Boolean))].sort(),
      categories: ["Toutes", ...new Set(events.map((event) => event.category).filter(Boolean))].sort(),
    }),
    [events]
  );

  const filteredEvents = useMemo(() => {
    const now = new Date();
    const end = new Date(now);
    if (period === "today") end.setHours(23, 59, 59, 999);
    if (period === "week") end.setDate(now.getDate() + 7);
    if (period === "month") end.setDate(now.getDate() + 30);
    return events.filter((event) => {
      const start = new Date(event.starts_at);
      const dateMatches = period === "all" || (start >= now && start <= end);
      return dateMatches && (club === "Tous" || event.organizer === club) && (category === "Toutes" || event.category === category);
    });
  }, [category, club, events, period]);

  const nextEvent = events.find((event) => new Date(event.starts_at) >= new Date()) || events[0];
  const registeredEvents = events.filter((event) => event.is_registered);

  useEffect(() => {
    if (!selectedEvent?.qr_token) {
      setQrDataUrl("");
      return;
    }
    QRCode.toDataURL(attendanceQrUrl(selectedEvent), {
      width: 320,
      margin: 2,
      color: { dark: "#0f172a", light: "#ffffff" },
      errorCorrectionLevel: "H",
    }).then(setQrDataUrl).catch(() => setQrDataUrl(""));
  }, [selectedEvent?.qr_token]);

  const syncEvent = (updated) => {
    setData((items) => items.map((item) => (item.event_key === updated.event_key ? updated : item)));
    setSelectedEvent(updated);
  };

  const register = async () => {
    if (!selectedEvent || selectedEvent.source === "demo") {
      setActionError("Activez le module Agenda dans Supabase pour ouvrir les inscriptions.");
      return;
    }
    setSaving(true);
    setActionError("");
    try {
      const result = await agendaApi.register(selectedEvent, reminderMinutes);
      syncEvent({
        ...selectedEvent,
        is_registered: true,
        registration_status: "registered",
        reminder_enabled: true,
        reminder_minutes: reminderMinutes,
        qr_token: result.qr_token,
        registered_count: selectedEvent.registered_count + 1,
        remaining_slots: selectedEvent.remaining_slots == null ? null : Math.max(0, selectedEvent.remaining_slots - 1),
      });
    } catch (registerError) {
      setActionError(registerError.message === "Event is full" ? "Cet événement est complet." : registerError.message || "L’inscription n’a pas pu être enregistrée.");
    } finally {
      setSaving(false);
    }
  };

  const cancelRegistration = async () => {
    setSaving(true);
    setActionError("");
    try {
      await agendaApi.cancel(selectedEvent);
      syncEvent({
        ...selectedEvent,
        is_registered: false,
        registration_status: "cancelled",
        reminder_enabled: false,
        qr_token: null,
        registered_count: Math.max(0, selectedEvent.registered_count - 1),
        remaining_slots: selectedEvent.remaining_slots == null ? null : selectedEvent.remaining_slots + 1,
      });
    } catch (cancelError) {
      setActionError(cancelError.message || "L’annulation n’a pas pu être enregistrée.");
    } finally {
      setSaving(false);
    }
  };

  const updateReminder = async (enabled, minutes = reminderMinutes) => {
    setReminderMinutes(minutes);
    if (!selectedEvent?.is_registered || selectedEvent.source === "demo") return;
    setSaving(true);
    setActionError("");
    try {
      await agendaApi.setReminder(selectedEvent, enabled, minutes);
      syncEvent({ ...selectedEvent, reminder_enabled: enabled, reminder_minutes: minutes });
    } catch (reminderError) {
      setActionError(reminderError.message || "Le rappel n’a pas pu être modifié.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-7 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#101529] text-white shadow-2xl shadow-slate-300/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_86%_10%,rgba(129,140,248,0.35),transparent_34%),radial-gradient(circle_at_18%_80%,rgba(45,212,191,0.18),transparent_28%)]" />
        <div className="relative grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_420px] lg:p-12">
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-indigo-300/20 bg-indigo-300/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-indigo-200"><Sparkles className="h-3.5 w-3.5" /> Agenda universitaire unifié</span>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">Tout ce qui anime le campus, dans un seul calendrier.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">Clubs, ateliers, conférences et compétitions : trouvez votre prochain rendez-vous et gardez votre billet toujours à portée de main.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"><p className="text-2xl font-black text-teal-300">{events.length}</p><p className="text-xs text-slate-400">événements publiés</p></div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"><p className="text-2xl font-black text-teal-300">{registeredEvents.length}</p><p className="text-xs text-slate-400">dans mon agenda</p></div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"><p className="text-2xl font-black text-teal-300">{filters.clubs.length - 1}</p><p className="text-xs text-slate-400">organisateurs</p></div>
            </div>
          </div>

          {nextEvent && (
            <button onClick={() => { setSelectedEvent(nextEvent); setReminderMinutes(nextEvent.reminder_minutes || 1440); }} className="group self-end rounded-[1.5rem] border border-white/10 bg-white/10 p-5 text-left backdrop-blur-xl transition hover:bg-white/15 sm:p-6">
              <div className="flex items-center justify-between"><span className="text-xs font-black uppercase tracking-[0.18em] text-teal-300">Prochain rendez-vous</span><ChevronRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1" /></div>
              <div className="mt-6 flex gap-4"><div className="flex h-18 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-white text-slate-950"><span className="text-2xl font-black leading-none">{nextEvent.dayNumber}</span><span className="mt-1 text-[10px] font-black text-indigo-600">{nextEvent.monthShort}</span></div><div><h2 className="text-xl font-black leading-tight">{nextEvent.title}</h2><p className="mt-2 flex items-center gap-1.5 text-sm text-slate-300"><Clock3 className="h-4 w-4" /> {nextEvent.timeLabel}</p><p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400"><MapPin className="h-4 w-4" /> {nextEvent.location}</p></div></div>
            </button>
          )}
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/40">
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-[1fr_1fr_1fr_auto]">
          <label><span className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-400">Date</span><select className="portal-select" value={period} onChange={(event) => setPeriod(event.target.value)}><option value="all">Toutes les dates</option><option value="today">Aujourd’hui</option><option value="week">7 prochains jours</option><option value="month">30 prochains jours</option></select></label>
          <label><span className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-400">Club / organisateur</span><select className="portal-select" value={club} onChange={(event) => setClub(event.target.value)}>{filters.clubs.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-400">Catégorie</span><select className="portal-select" value={category} onChange={(event) => setCategory(event.target.value)}>{filters.categories.map((item) => <option key={item}>{item}</option>)}</select></label>
          <div className="flex items-end gap-1 rounded-xl bg-slate-100 p-1"><button onClick={() => setView("list")} className={`rounded-lg p-2.5 transition ${view === "list" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"}`} aria-label="Vue liste"><List className="h-5 w-5" /></button><button onClick={() => setView("calendar")} className={`rounded-lg p-2.5 transition ${view === "calendar" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"}`} aria-label="Vue calendrier"><Grid3X3 className="h-5 w-5" /></button></div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-500"><SlidersHorizontal className="h-4 w-4" /> {filteredEvents.length} résultat{filteredEvents.length !== 1 ? "s" : ""}</div>
      </section>

      {loading && <div className="portal-empty flex items-center justify-center gap-2"><LoaderCircle className="h-5 w-5 animate-spin" /> Synchronisation de l’agenda…</div>}

      {!loading && view === "calendar" && <CalendarView events={filteredEvents} month={month} onMonthChange={setMonth} onSelect={(event) => { setSelectedEvent(event); setReminderMinutes(event.reminder_minutes || 1440); }} />}

      {!loading && view === "list" && filteredEvents.length > 0 && (
        <section className="space-y-4">
          {filteredEvents.map((event, index) => {
            const progress = event.capacity ? Math.min(100, (event.registered_count / event.capacity) * 100) : 0;
            return (
              <Motion.article key={event.event_key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.04, 0.24) }} className="group grid gap-5 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-xl hover:shadow-slate-200/50 md:grid-cols-[86px_minmax(0,1fr)_220px] md:items-center sm:p-6">
                <div className="flex h-20 w-20 flex-col items-center justify-center rounded-2xl bg-[#101529] text-white"><span className="text-3xl font-black leading-none">{event.dayNumber}</span><span className="mt-1 text-xs font-black tracking-wider text-teal-300">{event.monthShort}</span></div>
                <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-black ${categoryStyles[event.category] || "bg-slate-100 text-slate-700"}`}>{event.category}</span><span className="text-xs font-bold text-slate-400">{event.organizer}</span>{event.is_registered && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700"><Check className="h-3.5 w-3.5" /> Inscrit</span>}</div><h2 className="mt-3 text-xl font-black tracking-tight text-slate-950">{event.title}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{event.description}</p><div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500"><span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4 text-indigo-500" /> {event.dateLabel}, {event.timeLabel}</span><span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-indigo-500" /> {event.location}</span></div></div>
                <div className="md:border-l md:border-slate-100 md:pl-6"><div className="flex items-center justify-between text-xs font-bold"><span className="text-slate-500">Places</span><span className={event.remaining_slots === 0 ? "text-rose-600" : "text-slate-800"}>{event.remaining_slots == null ? "Accès libre" : `${event.remaining_slots} disponibles`}</span></div>{event.capacity && <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-teal-400" style={{ width: `${progress}%` }} /></div>}<button onClick={() => { setSelectedEvent(event); setReminderMinutes(event.reminder_minutes || 1440); setActionError(""); }} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-indigo-700">{event.is_registered ? <><QrCode className="h-4 w-4" /> Mon billet</> : <>Voir l’événement <ChevronRight className="h-4 w-4" /></>}</button></div>
              </Motion.article>
            );
          })}
        </section>
      )}

      {!loading && filteredEvents.length === 0 && <div className="portal-empty">Aucun événement ne correspond à ces filtres.</div>}

      <AnimatePresence>
        {selectedEvent && (
          <><Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedEvent(null)} className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm" /><Motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} className="fixed inset-y-0 right-0 z-50 w-full max-w-xl overflow-y-auto bg-white shadow-2xl"><div className="relative overflow-hidden bg-[#101529] p-6 text-white sm:p-8"><div className="absolute -right-14 -top-14 h-48 w-48 rounded-full bg-indigo-500/30 blur-3xl" /><button onClick={() => setSelectedEvent(null)} className="absolute right-5 top-5 rounded-xl bg-white/10 p-2 text-white hover:bg-white/15" aria-label="Fermer"><X className="h-5 w-5" /></button><div className="relative pr-12"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${categoryStyles[selectedEvent.category] || "bg-white/10 text-white"}`}>{selectedEvent.category}</span><h2 className="mt-5 text-3xl font-black tracking-tight">{selectedEvent.title}</h2><p className="mt-3 text-sm font-bold text-teal-300">{selectedEvent.organizer}</p></div></div><div className="space-y-6 p-6 sm:p-8"><div className="grid grid-cols-2 gap-3"><div className="rounded-2xl bg-slate-50 p-4"><CalendarDays className="h-5 w-5 text-indigo-600" /><p className="mt-3 text-sm font-black capitalize text-slate-900">{selectedEvent.dateLabel}</p><p className="mt-1 text-xs text-slate-500">{selectedEvent.timeLabel}</p></div><div className="rounded-2xl bg-slate-50 p-4"><MapPin className="h-5 w-5 text-indigo-600" /><p className="mt-3 text-sm font-black text-slate-900">{selectedEvent.location}</p><p className="mt-1 text-xs text-slate-500">Campus ENIAD</p></div></div><p className="text-sm leading-7 text-slate-600">{selectedEvent.description}</p><div className="rounded-2xl border border-slate-200 p-4"><div className="flex items-center justify-between"><span className="inline-flex items-center gap-2 text-sm font-black text-slate-900"><Users className="h-4 w-4 text-indigo-600" /> Inscriptions</span><span className="text-sm font-black text-indigo-700">{selectedEvent.registered_count}{selectedEvent.capacity ? ` / ${selectedEvent.capacity}` : ""}</span></div>{selectedEvent.capacity && <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-teal-400" style={{ width: `${Math.min(100, (selectedEvent.registered_count / selectedEvent.capacity) * 100)}%` }} /></div>}<p className="mt-2 text-xs text-slate-500">{selectedEvent.remaining_slots == null ? "Événement en accès libre" : selectedEvent.remaining_slots === 0 ? "Complet" : `${selectedEvent.remaining_slots} places encore disponibles`}</p></div>

                  {selectedEvent.is_registered ? (
                    <div className="space-y-4"><div className="rounded-[1.5rem] border-2 border-dashed border-indigo-200 bg-indigo-50/50 p-5 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><TicketCheck className="h-6 w-6" /></div><h3 className="mt-3 text-lg font-black text-slate-950">Votre inscription est confirmée</h3><p className="mt-1 text-xs text-slate-500">Présentez ce QR code à l’entrée de l’événement.</p>{qrDataUrl ? <img src={qrDataUrl} alt="QR code du billet" className="mx-auto mt-5 w-52 rounded-2xl bg-white p-3 shadow-sm" /> : <div className="mx-auto mt-5 flex h-52 w-52 items-center justify-center rounded-2xl bg-white"><LoaderCircle className="h-6 w-6 animate-spin text-indigo-600" /></div>}<p className="mt-3 font-mono text-[11px] text-slate-400">Billet personnel · non transférable</p></div><div className="rounded-2xl border border-slate-200 p-4"><div className="flex items-center justify-between gap-3"><span className="inline-flex items-center gap-2 text-sm font-black text-slate-900"><AlarmClock className="h-4 w-4 text-indigo-600" /> Rappel automatique</span><button onClick={() => updateReminder(!selectedEvent.reminder_enabled)} disabled={saving} className={`relative h-7 w-12 rounded-full transition ${selectedEvent.reminder_enabled ? "bg-indigo-600" : "bg-slate-200"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${selectedEvent.reminder_enabled ? "left-6" : "left-1"}`} /></button></div>{selectedEvent.reminder_enabled && <select value={reminderMinutes} onChange={(event) => updateReminder(true, Number(event.target.value))} className="portal-select mt-3">{reminderOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>}</div><button onClick={cancelRegistration} disabled={saving} className="w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-black text-rose-700 hover:bg-rose-100">Annuler mon inscription</button></div>
                  ) : (
                    <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white"><h3 className="text-lg font-black">Réserver ma place</h3><p className="mt-1 text-sm text-slate-400">Un billet QR personnel sera créé après l’inscription.</p><label className="mt-4 block text-xs font-bold text-slate-300">Me rappeler<select value={reminderMinutes} onChange={(event) => setReminderMinutes(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none">{reminderOptions.map((option) => <option key={option.value} value={option.value} className="text-slate-900">{option.label}</option>)}</select></label><button onClick={register} disabled={saving || selectedEvent.remaining_slots === 0} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-50">{saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <TicketCheck className="h-4 w-4" />} {selectedEvent.remaining_slots === 0 ? "Événement complet" : "Confirmer mon inscription"}</button></div>
                  )}

                  {actionError && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{actionError}</p>}
                  <a href={googleCalendarUrl(selectedEvent)} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"><CalendarDays className="h-4 w-4" /> Ajouter à Google Calendar <ExternalLink className="h-3.5 w-3.5" /></a>
                </div></Motion.div></>
        )}
      </AnimatePresence>
    </div>
  );
}
