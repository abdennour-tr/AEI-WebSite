import { supabase } from "@/lib/supabase";

const client = () => {
  if (!supabase) throw new Error("Supabase n’est pas configuré.");
  return supabase;
};

const unwrap = async (request) => {
  const { data, error } = await request;
  if (error) throw error;
  return data;
};

const moderationSources = [
  { type: "club", label: "Club", table: "club_profiles", title: "name", date: "updated_at" },
  { type: "project", label: "Projet", table: "student_projects", title: "title", date: "updated_at" },
  { type: "housing", label: "Annonce", table: "housing_listings", title: "title", date: "updated_at" },
  { type: "product", label: "Produit", table: "marketplace_products", title: "title", date: "updated_at" },
  { type: "advertisement", label: "Publicité", table: "advertisements", title: "title", date: "updated_at" },
];

export const adminApi = {
  async listModerationQueue() {
    const groups = await Promise.all(
      moderationSources.map(async (source) => {
        const rows = await unwrap(client().from(source.table).select("*").eq("moderation_status", "pending").order(source.date, { ascending: true }));
        return rows.map((row) => ({ ...row, contentType: source.type, contentLabel: source.label, contentTitle: row[source.title] || "Sans titre" }));
      })
    );
    return groups.flat().sort((a, b) => new Date(a.updated_at || a.created_at) - new Date(b.updated_at || b.created_at));
  },
  listReports: () => unwrap(client().from("content_reports").select("*, reporter:public_profiles!content_reports_reporter_id_fkey(display_name)").order("created_at", { ascending: false }).limit(100)),
  subscribeReports(callback) {
    const channel = client()
      .channel("admin-content-reports")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "content_reports" },
        callback
      )
      .subscribe();
    return () => client().removeChannel(channel);
  },
  listAuditLog: () => unwrap(client().from("admin_audit_log").select("*, actor:public_profiles!admin_audit_log_actor_id_fkey(display_name)").order("created_at", { ascending: false }).limit(100)),
  listProfiles: () => unwrap(client().from("profiles").select("id,email,full_name,role,created_at").order("created_at", { ascending: false }).limit(200)),
  listDeletionRequests: () => unwrap(client().from("account_deletion_requests").select("*, profile:profiles!account_deletion_requests_user_id_fkey(email,full_name)").order("created_at", { ascending: false })),
  moderate: (contentType, contentId, decision, reason = "") => unwrap(client().rpc("moderate_content", { target_type: contentType, target_id: String(contentId), decision, decision_reason: reason })),
  reviewReport: (reportId, status, note = "") => unwrap(client().rpc("review_content_report", { report_id: reportId, next_status: status, decision_note: note })),
  setRole: (userId, role) => unwrap(client().rpc("set_portal_role", { target_user_id: userId, next_role: role })),
  reviewDeletionRequest: (requestId, status, note = "") => unwrap(client().rpc("review_account_deletion", { request_id: requestId, next_status: status, decision_note: note })),
};
