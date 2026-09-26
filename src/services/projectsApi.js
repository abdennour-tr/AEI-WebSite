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

async function safeRows(query) {
  try {
    return (await unwrap(query)) || [];
  } catch {
    return [];
  }
}

async function currentUser() {
  const { data, error } = await client().auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("Votre session a expiré. Reconnectez-vous.");
  return data.user;
}

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(value))
    : "Date à confirmer";

function normalizeProject(row, context = {}) {
  const team = Array.isArray(row.team_members) ? row.team_members : [];
  const engagement = context.engagement?.get(row.id);
  return {
    ...row,
    desc: row.description,
    tech: row.tech_stack?.join(" / ") || "",
    updated: formatDate(row.updated_at),
    author: context.names?.get(row.owner_id) || row.author || "Étudiant ENIAD",
    authorAvatar: context.avatars?.get(row.owner_id) || "",
    team_members: team,
    screenshot_urls: row.screenshot_urls || [],
    collaborator_roles: row.collaborator_roles || [],
    likesCount: Number(engagement?.likes_count || 0),
    commentsCount: Number(engagement?.comments_count || 0),
    isLiked: Boolean(engagement?.is_liked),
    isFavorite: Boolean(engagement?.is_favorite),
    joinRequestStatus: engagement?.join_request_status || null,
  };
}

async function loadContext() {
  const user = await currentUser();
  const [profiles, engagementRows] = await Promise.all([
    safeRows(client().from("public_profiles").select("user_id,display_name,avatar_url")),
    safeRows(client().rpc("get_project_engagement")),
  ]);

  return {
    userId: user.id,
    names: new Map(profiles.map((profile) => [profile.user_id, profile.display_name])),
    avatars: new Map(profiles.map((profile) => [profile.user_id, profile.avatar_url])),
    engagement: new Map(engagementRows.map((row) => [row.project_id, row])),
  };
}

export const studentProjectsApi = {
  async list() {
    const [rows, context] = await Promise.all([
      unwrap(
        client()
          .from("student_projects")
          .select("*")
          .eq("status", "published")
          .eq("moderation_status", "approved")
          .order("created_at", { ascending: false })
      ),
      loadContext(),
    ]);
    return rows.map((row) => normalizeProject(row, context));
  },

  async listMine() {
    const user = await currentUser();
    const [rows, context] = await Promise.all([
      unwrap(
        client()
          .from("student_projects")
          .select("*")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false })
      ),
      loadContext(),
    ]);
    return rows.map((row) => normalizeProject(row, context));
  },

  async get(projectId) {
    const [row, context] = await Promise.all([
      unwrap(
        client()
          .from("student_projects")
          .select("*")
          .eq("id", projectId)
          .eq("moderation_status", "approved")
          .maybeSingle()
      ),
      loadContext(),
    ]);
    return row ? normalizeProject(row, context) : null;
  },

  async create(payload) {
    const user = await currentUser();
    const row = await unwrap(
      client()
        .from("student_projects")
        .insert({ ...payload, owner_id: user.id })
        .select()
        .single()
    );
    return normalizeProject(row);
  },

  async update(projectId, payload) {
    const row = await unwrap(
      client().from("student_projects").update(payload).eq("id", projectId).select().single()
    );
    return normalizeProject(row);
  },

  remove(projectId) {
    return unwrap(client().from("student_projects").delete().eq("id", projectId));
  },

  setLike(projectId, liked) {
    return unwrap(
      client().rpc("toggle_project_like", {
        target_project_id: projectId,
        should_like: liked,
      })
    );
  },

  async setFavorite(projectId, favorite) {
    const result = await unwrap(
      client().rpc("toggle_project_favorite", {
        target_project_id: projectId,
        should_favorite: favorite,
      })
    );
    window.dispatchEvent(new CustomEvent("aei:favorites-changed"));
    return result;
  },

  async listFavorites() {
    const favorites = await unwrap(client().rpc("get_project_favorites"));
    if (!favorites?.length) return [];
    const projects = await unwrap(
      client().from("student_projects").select("*").eq("moderation_status", "approved").in(
        "id",
        favorites.map((favorite) => favorite.project_id)
      )
    );
    const context = await loadContext();
    const favoriteDates = new Map(
      favorites.map((favorite) => [favorite.project_id, favorite.favorite_created_at])
    );
    return projects
      .map((project) => ({
        ...normalizeProject(project, context),
        favoriteCreatedAt: favoriteDates.get(project.id),
      }))
      .sort(
        (first, second) =>
          new Date(second.favoriteCreatedAt || 0) - new Date(first.favoriteCreatedAt || 0)
      );
  },

  async listComments(projectId) {
    const comments = await unwrap(
      client().rpc("get_project_comments", { target_project_id: projectId })
    );
    const profiles = await safeRows(
      client().from("public_profiles").select("user_id,display_name,avatar_url")
    );
    const profileMap = new Map(profiles.map((profile) => [profile.user_id, profile]));
    return comments.map((comment) => ({
      ...comment,
      author: profileMap.get(comment.author_id)?.display_name || "Membre AEI",
      avatarUrl: profileMap.get(comment.author_id)?.avatar_url || "",
      date: formatDate(comment.created_at),
    }));
  },

  async addComment(projectId, body) {
    return unwrap(
      client().rpc("add_project_comment", {
        target_project_id: projectId,
        comment_body: body.trim(),
      })
    );
  },

  async requestToJoin(projectId, payload) {
    return unwrap(
      client().rpc("request_to_join_project", {
        target_project_id: projectId,
        desired_role: payload.roleRequested || "",
        request_message: payload.message.trim(),
      })
    );
  },
};
