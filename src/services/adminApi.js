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

const optionalRows = async (request) => {
  try {
    return (await unwrap(request)) || [];
  } catch (error) {
    if (["42P01", "42703", "PGRST204", "PGRST205"].includes(error?.code)) return [];
    throw error;
  }
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

const contentSources = [
  { type: "project", label: "Projet étudiant", table: "student_projects", title: "title", description: "description", author: "owner_id" },
  { type: "housing", label: "Colocation", table: "housing_listings", title: "title", description: "description", author: "owner_id" },
  { type: "product", label: "Marketplace", table: "marketplace_products", title: "title", description: "description", author: "seller_id" },
  { type: "event", label: "Événement AEI", table: "events", title: "title", description: "description", author: "created_by" },
  { type: "club_event", label: "Événement de club", table: "club_events", title: "title", description: "description", author: "created_by" },
  { type: "advertisement", label: "Publicité", table: "advertisements", title: "title", description: "description", author: "created_by" },
  { type: "forum", label: "Discussion", table: "forum_topics", title: "title", description: "body", author: "author_id" },
  { type: "course", label: "Cours", table: "courses", title: "title", description: "description", author: "created_by" },
  { type: "opportunity", label: "Opportunité", table: "opportunities", title: "title", description: "description", author: "created_by" },
  { type: "club_announcement", label: "Publication de club", table: "club_announcements", title: "title", description: "body", author: "created_by" },
];

const clubProfileSource = { type: "club", label: "Club", table: "club_profiles", title: "name", description: "description" };
const moderationTypes = new Set(["project", "housing", "product", "advertisement"]);
const reportExtraSources = [
  clubProfileSource,
  { type: "comment", label: "Commentaire", table: "project_comments", title: "body", description: "body", author: "author_id" },
];

const compact = (values) => [...new Set(values.flat().filter(Boolean))];
const detail = (label, value) => value !== null && value !== undefined && String(value).trim()
  ? { label, value: String(value) }
  : null;

function contentPresentation(type, row) {
  switch (type) {
    case "project":
      return {
        images: compact([row.cover_url, row.screenshot_urls || []]),
        details: compact([detail("Filière", row.field_of_study), detail("Année", row.academic_year), detail("Avancement", row.project_stage), detail("Technologies", row.tech_stack?.join(", "))]),
        links: compact([row.repository_url && { label: "Dépôt Git", url: row.repository_url }, row.demo_url && { label: "Démonstration", url: row.demo_url }, row.documentation_url && { label: "Documentation", url: row.documentation_url }]),
      };
    case "housing":
      return {
        images: compact([row.image_urls || []]),
        details: compact([detail("Ville", row.city), detail("Type", row.property_type), detail("Loyer mensuel", row.monthly_price != null ? `${row.monthly_price} DH` : null), detail("Disponible dès", row.available_from)]),
        contactPhone: row.contact_phone || "",
      };
    case "product":
      return {
        images: compact([row.image_urls || []]),
        details: compact([detail("Catégorie", row.category), detail("Ville", row.city), detail("État", row.item_condition), detail("Prix", row.price != null ? `${row.price} DH` : null)]),
        contactPhone: row.contact_phone || "",
      };
    case "event":
      return {
        images: compact([row.cover_url]),
        details: compact([detail("Organisateur", row.organizer_name), detail("Catégorie", row.tag), detail("Lieu", row.location), detail("Début", row.starts_at), detail("Capacité", row.capacity)]),
      };
    case "club_event":
      return { details: compact([detail("Club", row.club_id), detail("Type", row.event_type), detail("Lieu", row.location), detail("Début", row.starts_at), detail("Capacité", row.capacity)]) };
    case "advertisement":
      return { images: compact([row.image_url]), links: compact([row.target_url && { label: "Lien de la publicité", url: row.target_url }]), details: compact([detail("Début", row.starts_at), detail("Fin", row.ends_at)]) };
    case "forum":
      return { details: compact([detail("Thème", row.tag)]) };
    case "course":
      return { details: compact([detail("Niveau", row.level), detail("Catégorie", row.category), detail("Résumé IA", row.summary_status === "ready" ? "Disponible" : "Non généré")]) };
    case "opportunity":
      return { links: compact([row.application_url && { label: "Lien de candidature", url: row.application_url }]), details: compact([detail("Entreprise", row.company), detail("Ville", row.city), detail("Durée", row.duration), detail("Date limite", row.deadline)]) };
    case "club_announcement":
      return { images: compact([row.image_urls || []]), details: compact([detail("Club", row.club_id), detail("Type", row.content_type === "event_recap" ? "Événement passé" : "Annonce"), detail("Date", row.event_date), detail("Lieu", row.event_location)]) };
    case "club":
      return { images: compact([row.logo_url]), details: compact([detail("Catégorie", row.category), detail("Recrutement", row.recruitment_label)]) };
    case "comment":
      return { details: compact([detail("Projet", row.project_id)]) };
    default:
      return {};
  }
}

async function loadProfiles(authorIds) {
  const ids = [...new Set(authorIds.filter(Boolean))];
  if (!ids.length) return new Map();
  try {
    const profiles = await unwrap(client().from("profiles").select("id,email,full_name,role").in("id", ids));
    return new Map(profiles.map((profile) => [profile.id, profile]));
  } catch {
    const profiles = await optionalRows(client().from("public_profiles").select("user_id,display_name,avatar_url").in("user_id", ids));
    return new Map(profiles.map((profile) => [profile.user_id, { id: profile.user_id, full_name: profile.display_name, email: "", avatar_url: profile.avatar_url }]));
  }
}

async function loadContentRecords(sources) {
  const grouped = await Promise.all(sources.map(async (source) => ({
    source,
    rows: await optionalRows(client().from(source.table).select("*").order("created_at", { ascending: false }).limit(250)),
  })));
  const authorIds = grouped.flatMap(({ source, rows }) => source.author ? rows.map((row) => row[source.author]) : []);
  const profiles = await loadProfiles(authorIds);
  return grouped.flatMap(({ source, rows }) => rows.map((row) => {
    const authorId = source.author ? row[source.author] : null;
    const presentation = contentPresentation(source.type, row);
    return {
      ...row,
      content_type: source.type,
      content_id: String(row.id),
      content_title: row[source.title] || "Sans titre",
      content_status: row.status || "active",
      moderation_state: row.moderation_status || null,
      created_on: row.created_at || row.updated_at,
      description: row[source.description] || "",
      author_id: authorId,
      author: authorId ? profiles.get(authorId) || null : null,
      images: presentation.images || [],
      details: presentation.details || [],
      links: presentation.links || [],
      contact_phone: presentation.contactPhone || row.contact_phone || "",
      contentType: source.type,
      contentLabel: source.label,
      contentTitle: row[source.title] || "Sans titre",
    };
  })).sort((a, b) => new Date(b.updated_at || b.created_on) - new Date(a.updated_at || a.created_on));
}

export const adminApi = {
  async listModerationQueue() {
    const records = await loadContentRecords([clubProfileSource, ...contentSources.filter((source) => moderationTypes.has(source.type))]);
    return records.filter((record) => record.moderation_state === "pending");
  },
  async listReports() {
    const [reports, content] = await Promise.all([
      unwrap(client().from("content_reports").select("*").order("created_at", { ascending: false }).limit(100)),
      loadContentRecords([...contentSources, ...reportExtraSources]),
    ]);
    const profiles = await loadProfiles(reports.map((report) => report.reporter_id));
    const contentByKey = new Map(content.map((item) => [`${item.content_type}:${item.content_id}`, item]));
    return reports.map((report) => ({
      ...report,
      reporter: profiles.get(report.reporter_id) || null,
      content: contentByKey.get(`${report.content_type}:${report.content_id}`) || null,
    }));
  },
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
  async generateCourseSummary(filePath, title) {
    const { data, error } = await client().auth.getSession();
    if (error || !data.session?.access_token) throw new Error("Session administrateur expirée.");
    const response = await fetch("/api/course-summary", {
      method: "POST",
      headers: { authorization: `Bearer ${data.session.access_token}`, "content-type": "application/json" },
      body: JSON.stringify({ filePath, title }),
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
  listManagedContent: () => loadContentRecords(contentSources),
  moderate: (contentType, contentId, decision, reason = "") => unwrap(client().rpc("moderate_content", { target_type: contentType, target_id: String(contentId), decision, decision_reason: reason })),
  reviewReport: (reportId, status, note = "") => unwrap(client().rpc("review_content_report", { report_id: reportId, next_status: status, decision_note: note })),
  setRole: (userId, role) => unwrap(client().rpc("set_portal_role", { target_user_id: userId, next_role: role })),
  async deleteUser(userId, reason) {
    const { data, error } = await client().auth.getSession();
    if (error || !data.session?.access_token) throw new Error("Session administrateur expirée.");
    const response = await fetch("/api/admin-user", {
      method: "POST",
      headers: { authorization: `Bearer ${data.session.access_token}`, "content-type": "application/json" },
      body: JSON.stringify({ userId, reason }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "Le compte n’a pas pu être supprimé.");
    return payload;
  },
  reviewDeletionRequest: (requestId, status, note = "") => unwrap(client().rpc("review_account_deletion", { request_id: requestId, next_status: status, decision_note: note })),
  deleteContent: (contentType, contentId, reason) => unwrap(client().rpc("admin_delete_content", { target_type: contentType, target_id: String(contentId), deletion_reason: reason })),
};
