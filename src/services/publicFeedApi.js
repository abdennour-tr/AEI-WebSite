import { supabase } from "@/lib/supabase";

function client() {
  if (!supabase) throw new Error("Supabase n’est pas configuré.");
  return supabase;
}

async function rows(query) {
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

function clubName(club) {
  return Array.isArray(club) ? club[0]?.name : club?.name;
}

export const publicFeedApi = {
  async list() {
    const [announcements, advertisements, events, clubEvents] = await Promise.all([
      rows(
        client()
          .from("club_announcements")
          .select("id,club_id,title,body,published_at,created_at,club:club_profiles(name)")
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(20)
      ),
      rows(
        client()
          .from("advertisements")
          .select("id,title,description,image_url,target_url,starts_at,created_at")
          .eq("status", "published")
          .eq("moderation_status", "approved")
          .order("starts_at", { ascending: false })
          .limit(12)
      ),
      rows(
        client()
          .from("events")
          .select("id,title,description,starts_at,location,cover_url,organizer_name,club_id,club:club_profiles(name)")
          .eq("status", "published")
          .order("starts_at", { ascending: false })
          .limit(16)
      ),
      rows(
        client()
          .from("club_events")
          .select("id,title,description,starts_at,location,club_id,club:club_profiles(name)")
          .eq("status", "published")
          .order("starts_at", { ascending: false })
          .limit(16)
      ),
    ]);

    return [
      ...announcements.map((item) => ({
        id: `announcement-${item.id}`,
        kind: "announcement",
        label: "Actualité du club",
        author: clubName(item.club) || "Club AEI",
        title: item.title,
        description: item.body,
        publishedAt: item.published_at || item.created_at,
        to: `/clubs/${item.club_id}`,
      })),
      ...advertisements.map((item) => ({
        id: `advertisement-${item.id}`,
        kind: "advertisement",
        label: "Bon plan partenaire",
        author: "AEI ENIADB",
        title: item.title,
        description: item.description,
        image: item.image_url,
        publishedAt: item.starts_at || item.created_at,
        externalUrl: item.target_url,
        to: "/publicites",
      })),
      ...events.map((item) => ({
        id: `event-${item.id}`,
        kind: "event",
        label: "Événement à venir",
        author: item.organizer_name || clubName(item.club) || "AEI ENIADB",
        title: item.title,
        description: item.description,
        image: item.cover_url,
        publishedAt: item.starts_at,
        location: item.location,
        to: "/evenements",
      })),
      ...clubEvents.map((item) => ({
        id: `club-event-${item.id}`,
        kind: "event",
        label: "Événement de club",
        author: clubName(item.club) || "Club AEI",
        title: item.title,
        description: item.description,
        publishedAt: item.starts_at,
        location: item.location,
        to: "/evenements",
      })),
    ].sort((left, right) => new Date(right.publishedAt) - new Date(left.publishedAt));
  },
};
