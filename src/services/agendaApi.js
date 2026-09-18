import { supabase } from "@/lib/supabase";

function client() {
  if (!supabase) throw new Error("Supabase n’est pas configuré.");
  return supabase;
}

async function unwrap(query) {
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export function formatAgendaEvent(event) {
  const start = new Date(event.starts_at);
  const end = event.ends_at ? new Date(event.ends_at) : null;
  return {
    ...event,
    id: event.event_id || event.id,
    dateLabel: new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(start),
    timeLabel: `${new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(start)}${end ? ` – ${new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(end)}` : ""}`,
    dayNumber: new Intl.DateTimeFormat("fr-FR", { day: "2-digit" }).format(start),
    monthShort: new Intl.DateTimeFormat("fr-FR", { month: "short" })
      .format(start)
      .replace(".", "")
      .toUpperCase(),
    registered_count: Number(event.registered_count || 0),
    remaining_slots:
      event.remaining_slots == null ? null : Number(event.remaining_slots),
  };
}

function compactUtcDate(value) {
  return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function googleCalendarUrl(event) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${compactUtcDate(event.starts_at)}/${compactUtcDate(
      event.ends_at || new Date(new Date(event.starts_at).getTime() + 60 * 60 * 1000)
    )}`,
    details: `${event.description || ""}\n\nOrganisé par ${event.organizer || "AEI ENIAD"}`,
    location: event.location || "ENIAD",
    ctz: "Africa/Casablanca",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function attendanceQrUrl(event) {
  if (!event.qr_token) return "";
  return `${window.location.origin}/evenements/confirmation?token=${encodeURIComponent(event.qr_token)}`;
}

export const agendaApi = {
  async list() {
    const rows = await unwrap(client().rpc("get_unified_agenda"));
    return (rows || []).map(formatAgendaEvent);
  },

  async register(event, reminderMinutes = 1440) {
    return unwrap(
      client().rpc("register_unified_event", {
        target_source: event.source,
        target_event_id: event.id,
        enable_reminder: true,
        reminder_before_minutes: reminderMinutes,
      })
    );
  },

  cancel(event) {
    return unwrap(
      client().rpc("cancel_unified_event_registration", {
        target_source: event.source,
        target_event_id: event.id,
      })
    );
  },

  setReminder(event, enabled, minutes) {
    return unwrap(
      client().rpc("set_unified_event_reminder", {
        target_source: event.source,
        target_event_id: event.id,
        enable_reminder: enabled,
        reminder_before_minutes: minutes,
      })
    );
  },

  confirmAttendance(token) {
    return unwrap(client().rpc("confirm_event_attendance", { ticket_token: token }));
  },
};
