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

async function withSignedCourseUrl(course) {
  if (!course.file_path) return { ...course, download_url: course.pdf_url || "" };
  const { data, error } = await client()
    .storage
    .from("course-files")
    .createSignedUrl(course.file_path, 60 * 60);
  if (error) return { ...course, download_url: course.pdf_url || "" };
  return { ...course, download_url: data.signedUrl };
}

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
        const rows = await unwrap(client().from(source.table).select("*").eq("moderation_status", "pending").order(source.date, { ascending: false }));
        return rows.map((row) => ({ ...row, contentType: source.type, contentLabel: source.label, contentTitle: row[source.title] || "Sans titre" }));
      })
    );
    return groups.flat().sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));
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
  async listCourses() {
    const rows = await unwrap(client().from("courses").select("*").order("updated_at", { ascending: false }));
    return Promise.all(rows.map(withSignedCourseUrl));
  },
  async uploadCourseFile(file) {
    if (!file || file.type !== "application/pdf") throw new Error("Sélectionnez un fichier PDF valide.");
    if (file.size > 25 * 1024 * 1024) throw new Error("Le PDF dépasse la limite de 25 Mo.");
    const { data: authData, error: authError } = await client().auth.getUser();
    if (authError || !authData.user) throw new Error("Session administrateur expirée.");
    const path = `${authData.user.id}/${crypto.randomUUID()}.pdf`;
    const { error } = await client().storage.from("course-files").upload(path, file, {
      contentType: "application/pdf",
      cacheControl: "3600",
      upsert: false,
    });
    if (error) throw error;
    return path;
  },
  removeCourseFile: async (path) => {
    if (!path) return;
    const { error } = await client().storage.from("course-files").remove([path]);
    if (error) throw error;
  },
  async generateCourseSummary(file, title) {
    const { data, error } = await client().auth.getSession();
    if (error || !data.session?.access_token) throw new Error("Session administrateur expirée.");
    const form = new FormData();
    form.append("file", file);
    form.append("title", title);
    const response = await fetch("/api/course-summary", {
      method: "POST",
      headers: { authorization: `Bearer ${data.session.access_token}` },
      body: form,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "Le résumé IA n’a pas pu être généré.");
    return payload.summary;
  },
  createCourse: (payload) => unwrap(client().from("courses").insert(payload).select().single()),
  updateCourse: (courseId, payload) => unwrap(client().from("courses").update(payload).eq("id", courseId).select().single()),
  async deleteCourse(course) {
    await unwrap(client().from("courses").delete().eq("id", course.id));
    if (course.file_path) {
      const { error } = await client().storage.from("course-files").remove([course.file_path]);
      if (error) throw error;
    }
  },
  listManagedContent: () => unwrap(client().rpc("get_admin_content")),
  moderate: (contentType, contentId, decision, reason = "") => unwrap(client().rpc("moderate_content", { target_type: contentType, target_id: String(contentId), decision, decision_reason: reason })),
  reviewReport: (reportId, status, note = "") => unwrap(client().rpc("review_content_report", { report_id: reportId, next_status: status, decision_note: note })),
  setRole: (userId, role) => unwrap(client().rpc("set_portal_role", { target_user_id: userId, next_role: role })),
  reviewDeletionRequest: (requestId, status, note = "") => unwrap(client().rpc("review_account_deletion", { request_id: requestId, next_status: status, decision_note: note })),
  deleteContent: (contentType, contentId, reason) => unwrap(client().rpc("admin_delete_content", { target_type: contentType, target_id: String(contentId), deletion_reason: reason })),
};
