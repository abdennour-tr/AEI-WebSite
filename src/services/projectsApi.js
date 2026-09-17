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
    likesCount: context.likes?.filter((item) => item.project_id === row.id).length || 0,
    commentsCount:
      context.comments?.filter((item) => item.project_id === row.id).length || 0,
    isLiked: context.likes?.some(
      (item) => item.project_id === row.id && item.user_id === context.userId
    ) || false,
    isFavorite: context.favorites?.some((item) => item.project_id === row.id) || false,
    joinRequestStatus:
      context.joinRequests?.find((item) => item.project_id === row.id)?.status || null,
  };
}

async function loadContext() {
  const user = await currentUser();
  const [profiles, likes, favorites, comments, joinRequests] = await Promise.all([
    safeRows(client().from("public_profiles").select("user_id,display_name,avatar_url")),
    safeRows(client().from("project_likes").select("project_id,user_id")),
    safeRows(client().from("project_favorites").select("project_id,user_id")),
    safeRows(client().from("project_comments").select("project_id")),
    safeRows(
      client()
        .from("project_join_requests")
        .select("project_id,status")
        .eq("requester_id", user.id)
    ),
  ]);

  return {
    userId: user.id,
    names: new Map(profiles.map((profile) => [profile.user_id, profile.display_name])),
    avatars: new Map(profiles.map((profile) => [profile.user_id, profile.avatar_url])),
    likes,
    favorites,
    comments,
    joinRequests,
  };
}

async function setRelation(table, projectId, active) {
  const user = await currentUser();
  if (active) {
    return unwrap(
      client()
        .from(table)
        .upsert(
          { project_id: projectId, user_id: user.id },
          { onConflict: "user_id,project_id" }
        )
        .select()
        .single()
    );
  }

  await unwrap(
    client().from(table).delete().eq("project_id", projectId).eq("user_id", user.id)
  );
  return null;
}

export const studentProjectsApi = {
  async list() {
    const [rows, context] = await Promise.all([
      unwrap(
        client()
          .from("student_projects")
          .select("*")
          .eq("status", "published")
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
    return setRelation("project_likes", projectId, liked);
  },

  setFavorite(projectId, favorite) {
    return setRelation("project_favorites", projectId, favorite);
  },

  async listFavorites() {
    const rows = await unwrap(
      client()
        .from("project_favorites")
        .select("created_at,project:student_projects(*)")
        .order("created_at", { ascending: false })
    );
    const context = await loadContext();
    return rows
      .filter((row) => row.project)
      .map((row) => ({
        ...normalizeProject(row.project, context),
        favoriteCreatedAt: row.created_at,
      }));
  },

  async listComments(projectId) {
    const comments = await unwrap(
      client()
        .from("project_comments")
        .select("*")
        .eq("project_id", projectId)
        .eq("status", "published")
        .order("created_at", { ascending: false })
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
    const user = await currentUser();
    return unwrap(
      client()
        .from("project_comments")
        .insert({ project_id: projectId, author_id: user.id, body: body.trim() })
        .select()
        .single()
    );
  },

  async requestToJoin(projectId, payload) {
    const user = await currentUser();
    return unwrap(
      client()
        .from("project_join_requests")
        .upsert(
          {
            project_id: projectId,
            requester_id: user.id,
            role_requested: payload.roleRequested || null,
            message: payload.message.trim(),
            status: "submitted",
          },
          { onConflict: "project_id,requester_id" }
        )
        .select()
        .single()
    );
  },
};
