import { supabase } from "@/lib/supabase";

function client() {
  if (!supabase) throw new Error("Supabase n’est pas configuré.");
  return supabase;
}

async function unwrap(query) {
  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

async function optionalRows(query) {
  try {
    const { data } = await unwrap(query);
    return data || [];
  } catch (error) {
    if (["42P01", "42703", "PGRST204", "PGRST205"].includes(error?.code)) return [];
    throw error;
  }
}

async function currentUser() {
  const {
    data: { user },
    error,
  } = await client().auth.getUser();
  if (error) throw error;
  if (!user) throw new Error("Session responsable introuvable.");
  return user;
}

export const clubAdminApi = {
  async getAccess() {
    const user = await currentUser();
    const { data, error } = await client()
      .from("club_managers")
      .select("club_id, manager_role, active, club:club_profiles(*)")
      .eq("user_id", user.id)
      .eq("active", true)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async getDashboard(clubId) {
    const [clubEvents, agendaEvents, announcements, board, applications, members, views, registrations, attendance] =
      await Promise.all([
        unwrap(
          client()
            .from("club_events")
            .select("*")
            .eq("club_id", clubId)
            .order("starts_at", { ascending: true })
        ),
        optionalRows(
          client()
            .from("events")
            .select("*")
            .eq("club_id", clubId)
            .order("starts_at", { ascending: true })
        ),
        unwrap(
          client()
            .from("club_announcements")
            .select("*")
            .eq("club_id", clubId)
            .order("created_at", { ascending: false })
        ),
        optionalRows(
          client()
            .from("club_board_members")
            .select("*")
            .eq("club_id", clubId)
            .order("display_order", { ascending: true })
            .order("created_at", { ascending: true })
        ),
        unwrap(
          client()
            .from("club_applications")
            .select("*")
            .eq("club_id", clubId)
            .order("created_at", { ascending: false })
        ),
        unwrap(
          client()
            .from("club_memberships")
            .select("*", { count: "exact", head: true })
            .eq("club_id", clubId)
            .eq("status", "active")
        ),
        unwrap(
          client()
            .from("club_profile_views")
            .select("*", { count: "exact", head: true })
            .eq("club_id", clubId)
        ),
        unwrap(
          client()
            .from("club_event_registrations")
            .select("event:club_events!inner(club_id)", { count: "exact", head: true })
            .eq("event.club_id", clubId)
            .eq("status", "registered")
        ),
        unwrap(
          client()
            .from("club_event_registrations")
            .select("event:club_events!inner(club_id)", { count: "exact", head: true })
            .eq("event.club_id", clubId)
            .eq("attended", true)
        ),
      ]);

    const applicantIds = [...new Set(applications.data.map((item) => item.applicant_id))];
    let publicProfiles = [];
    if (applicantIds.length) {
      const { data } = await unwrap(
        client()
          .from("public_profiles")
          .select("user_id, display_name, avatar_url")
          .in("user_id", applicantIds)
      );
      publicProfiles = data;
    }
    const profileMap = new Map(
      publicProfiles.map((profile) => [profile.user_id, profile])
    );

    return {
      events: [
        ...clubEvents.data.map((event) => ({ ...event, source: "club" })),
        ...agendaEvents.map((event) => ({
          ...event,
          event_type: event.tag || "Événement",
          source: "agenda",
        })),
      ].sort((left, right) => new Date(left.starts_at) - new Date(right.starts_at)),
      announcements: announcements.data,
      board,
      applications: applications.data.map((application) => ({
        ...application,
        applicant: profileMap.get(application.applicant_id) || null,
      })),
      stats: {
        views: views.count || 0,
        applications: applications.data.length,
        registrations: registrations.count || 0,
        attendance: attendance.count || 0,
        members: members.count || 0,
      },
    };
  },

  async updateProfile(clubId, payload) {
    const { data } = await unwrap(
      client()
        .from("club_profiles")
        .update(payload)
        .eq("id", clubId)
        .select()
        .single()
    );
    return data;
  },

  async createEvent(clubId, payload) {
    const { data } = await unwrap(
      client()
        .from("club_events")
        .insert({ ...payload, club_id: clubId })
        .select()
        .single()
    );
    return data;
  },

  async updateEvent(event, payload) {
    const table = event.source === "agenda" ? "events" : "club_events";
    const normalizedPayload =
      table === "events"
        ? {
            title: payload.title,
            description: payload.description,
            tag: payload.event_type,
            location: payload.location,
            starts_at: payload.starts_at,
            capacity: payload.capacity,
            status: payload.status,
          }
        : payload;
    const { data } = await unwrap(
      client().from(table).update(normalizedPayload).eq("id", event.id).select().single()
    );
    return data;
  },

  async setEventStatus(event, status) {
    const table = event.source === "agenda" ? "events" : "club_events";
    const { data } = await unwrap(
      client()
        .from(table)
        .update({ status })
        .eq("id", event.id)
        .select()
        .single()
    );
    return data;
  },

  async removeEvent(event) {
    const table = event.source === "agenda" ? "events" : "club_events";
    await unwrap(client().from(table).delete().eq("id", event.id));
  },

  async createBoardMember(clubId, payload) {
    const { data } = await unwrap(
      client()
        .from("club_board_members")
        .insert({ ...payload, club_id: clubId })
        .select()
        .single()
    );
    return data;
  },

  async updateBoardMember(memberId, payload) {
    const { data } = await unwrap(
      client()
        .from("club_board_members")
        .update(payload)
        .eq("id", memberId)
        .select()
        .single()
    );
    return data;
  },

  async removeBoardMember(memberId) {
    await unwrap(client().from("club_board_members").delete().eq("id", memberId));
  },

  async createAnnouncement(clubId, payload) {
    const { data } = await unwrap(
      client()
        .from("club_announcements")
        .insert({
          ...payload,
          club_id: clubId,
          published_at: payload.status === "published" ? new Date().toISOString() : null,
        })
        .select()
        .single()
    );
    return data;
  },

  async setAnnouncementStatus(announcementId, status) {
    const { data } = await unwrap(
      client()
        .from("club_announcements")
        .update({
          status,
          published_at: status === "published" ? new Date().toISOString() : null,
        })
        .eq("id", announcementId)
        .select()
        .single()
    );
    return data;
  },

  async reviewApplication(applicationId, decision) {
    const { error } = await client().rpc("review_club_application", {
      application_id: applicationId,
      decision,
    });
    if (error) throw error;
  },

  async notifyMembers(clubId, title, body) {
    const { data, error } = await client().rpc("notify_club_members", {
      target_club_id: clubId,
      notification_title: title,
      notification_body: body,
    });
    if (error) throw error;
    return data || 0;
  },

  async getPublicContent(clubId) {
    const [profile, agendaEvents, clubEvents, announcements, board] = await Promise.all([
      unwrap(
        client()
          .from("club_profiles")
          .select("*")
          .eq("id", clubId)
          .eq("status", "active")
          .maybeSingle()
      ),
      optionalRows(
        client()
          .from("events")
          .select("*")
          .eq("club_id", clubId)
          .eq("status", "published")
          .gte("starts_at", new Date().toISOString())
          .order("starts_at", { ascending: true })
      ),
      unwrap(
        client()
          .from("club_events")
          .select("*")
          .eq("club_id", clubId)
          .eq("status", "published")
          .gte("starts_at", new Date().toISOString())
          .order("starts_at", { ascending: true })
      ),
      unwrap(
        client()
          .from("club_announcements")
          .select("*")
          .eq("club_id", clubId)
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(5)
      ),
      optionalRows(
        client()
          .from("club_board_members")
          .select("*")
          .eq("club_id", clubId)
          .eq("active", true)
          .order("display_order", { ascending: true })
      ),
    ]);
    return {
      profile: profile.data,
      events: [
        ...clubEvents.data,
        ...agendaEvents.map((event) => ({ ...event, event_type: event.tag || "Événement" })),
      ].sort((left, right) => new Date(left.starts_at) - new Date(right.starts_at)),
      announcements: announcements.data,
      board,
    };
  },

  async recordView(clubId) {
    const user = await currentUser();
    const { error } = await client().from("club_profile_views").insert({
      club_id: clubId,
      viewer_id: user.id,
    });
    if (error && !["42P01", "PGRST205"].includes(error.code)) throw error;
  },
};
