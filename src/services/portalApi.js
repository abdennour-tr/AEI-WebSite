import { supabase } from "@/lib/supabase";

function client() {
  if (!supabase) {
    throw new Error("Supabase n’est pas configuré.");
  }
  return supabase;
}

async function unwrap(query) {
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function listPublished(table, orderColumn = "created_at", ascending = false) {
  return unwrap(
    client()
      .from(table)
      .select("*")
      .eq("status", "published")
      .order(orderColumn, { ascending })
  );
}

async function listOwned(table, ownerColumn) {
  const {
    data: { user },
    error,
  } = await client().auth.getUser();
  if (error) throw error;
  if (!user) return [];

  return unwrap(
    client()
      .from(table)
      .select("*")
      .eq(ownerColumn, user.id)
      .order("created_at", { ascending: false })
  );
}

async function createRecord(table, payload) {
  return unwrap(client().from(table).insert(payload).select().single());
}

async function updateRecord(table, id, payload) {
  return unwrap(client().from(table).update(payload).eq("id", id).select().single());
}

async function deleteRecord(table, id) {
  await unwrap(client().from(table).delete().eq("id", id));
}

async function setFavorite(table, foreignKey, recordId, favorite) {
  const {
    data: { user },
    error: userError,
  } = await client().auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error("Vous devez être connecté pour enregistrer un favori.");

  if (favorite) {
    return unwrap(
      client()
        .from(table)
        .upsert(
          { [foreignKey]: recordId, user_id: user.id },
          { onConflict: `user_id,${foreignKey}` }
        )
        .select()
        .single()
    );
  }

  await unwrap(
    client()
      .from(table)
      .delete()
      .eq(foreignKey, recordId)
      .eq("user_id", user.id)
  );
  return null;
}

async function listFavoriteIds(table, foreignKey) {
  const rows = await unwrap(client().from(table).select(foreignKey));
  return rows.map((row) => row[foreignKey]);
}

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(
        new Date(value)
      )
    : "Date à confirmer";

const daysAgo = (value) => {
  if (!value) return 0;
  const difference = Date.now() - new Date(value).getTime();
  return Math.max(0, Math.floor(difference / 86400000));
};

const mapCourse = (row) => ({
  ...row,
  titre: row.title,
  niveau: row.level,
  categorie: row.category,
  pdf: row.pdf_url,
});

const mapHousing = (row) => ({
  ...row,
  titre: row.title,
  nom: "Membre AEI",
  avatar: "",
  cover: row.image_urls?.[0] || "",
  image: row.image_urls?.[0] || "",
  ville: row.city,
  prix: row.monthly_price,
  desc: row.description,
  type: row.property_type,
  posted: daysAgo(row.created_at),
});

export const coursesApi = {
  list: async () => {
    const [rows, favoriteIds] = await Promise.all([
      listPublished("courses", "title", true),
      listFavoriteIds("course_favorites", "course_id"),
    ]);
    const favorites = new Set(favoriteIds);
    return rows.map((row) => ({
      ...mapCourse(row),
      isFavorite: favorites.has(row.id),
    }));
  },
  listFavorites: async () =>
    unwrap(
      client()
        .from("course_favorites")
        .select("created_at, course:courses(*)")
        .order("created_at", { ascending: false })
    ).then((rows) => rows.map((row) => mapCourse(row.course))),
  setFavorite: (courseId, favorite) =>
    setFavorite("course_favorites", "course_id", courseId, favorite),
  create: (payload) => createRecord("courses", payload),
  update: (id, payload) => updateRecord("courses", id, payload),
  remove: (id) => deleteRecord("courses", id),
};

export const housingApi = {
  list: async () =>
    unwrap(
      client()
        .from("housing_listings")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
    ).then((rows) => rows.map(mapHousing)),
  listMine: async () =>
    (await listOwned("housing_listings", "owner_id")).map(mapHousing),
  create: async (payload) => mapHousing(await createRecord("housing_listings", payload)),
  update: async (id, payload) =>
    mapHousing(await updateRecord("housing_listings", id, payload)),
  remove: (id) => deleteRecord("housing_listings", id),
};

export const marketplaceApi = {
  list: async () =>
    unwrap(
      client()
        .from("marketplace_products")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
    ).then((rows) =>
      rows.map((row) => ({
        ...row,
        titre: row.title,
        prix: row.price,
        img: row.image_urls?.[0] || "",
        categorie: row.category,
        etat: row.item_condition,
        ville: row.city,
        date: formatDate(row.created_at),
      }))
    ),
  listMine: () => listOwned("marketplace_products", "seller_id"),
  create: (payload) => createRecord("marketplace_products", payload),
  update: (id, payload) => updateRecord("marketplace_products", id, payload),
  remove: (id) => deleteRecord("marketplace_products", id),
};

export const eventsApi = {
  list: async () =>
    (await listPublished("events", "starts_at", true)).map((row) => ({
      ...row,
      date: formatDate(row.starts_at),
      location: row.location,
    })),
  register: (eventId) =>
    createRecord("event_registrations", { event_id: eventId }),
  cancelRegistration: async (eventId) => {
    await unwrap(client().from("event_registrations").delete().eq("event_id", eventId));
  },
  create: (payload) => createRecord("events", payload),
  update: (id, payload) => updateRecord("events", id, payload),
  remove: (id) => deleteRecord("events", id),
};

export const opportunitiesApi = {
  list: async () => {
    const [rows, favoriteIds] = await Promise.all([
      listPublished("opportunities", "deadline", true),
      listFavoriteIds("opportunity_favorites", "opportunity_id"),
    ]);
    const favorites = new Set(favoriteIds);
    return rows.map((row) => ({
      ...row,
      titre: row.title,
      entreprise: row.company,
      lieu: row.city || "À distance",
      duree: row.duration || "À confirmer",
      isFavorite: favorites.has(row.id),
    }));
  },
  listFavoriteIds: () =>
    listFavoriteIds("opportunity_favorites", "opportunity_id"),
  setFavorite: (opportunityId, favorite) =>
    setFavorite(
      "opportunity_favorites",
      "opportunity_id",
      opportunityId,
      favorite
    ),
  apply: (payload) => createRecord("opportunity_applications", payload),
  create: (payload) => createRecord("opportunities", payload),
  update: (id, payload) => updateRecord("opportunities", id, payload),
  remove: (id) => deleteRecord("opportunities", id),
};

export const projectsApi = {
  list: async () =>
    (await listPublished("student_projects")).map((row) => ({
      ...row,
      desc: row.description,
      tech: row.tech_stack?.join(" / ") || "",
      updated: formatDate(row.updated_at),
    })),
  listMine: async () =>
    (await listOwned("student_projects", "owner_id")).map((row) => ({
      ...row,
      desc: row.description,
      tech: row.tech_stack?.join(" / ") || "",
      updated: formatDate(row.updated_at),
    })),
  create: async (payload) => {
    const row = await createRecord("student_projects", payload);
    return {
      ...row,
      desc: row.description,
      tech: row.tech_stack?.join(" / ") || "",
      updated: formatDate(row.updated_at),
    };
  },
  update: async (id, payload) => {
    const row = await updateRecord("student_projects", id, payload);
    return {
      ...row,
      desc: row.description,
      tech: row.tech_stack?.join(" / ") || "",
      updated: formatDate(row.updated_at),
    };
  },
  remove: (id) => deleteRecord("student_projects", id),
};

export const forumApi = {
  listTopics: async () => {
    const [topics, replies, likes, profiles, userResult] = await Promise.all([
      listPublished("forum_topics"),
      unwrap(client().from("forum_replies").select("topic_id")),
      unwrap(client().from("forum_likes").select("topic_id,user_id")),
      unwrap(client().from("public_profiles").select("user_id,display_name")),
      client().auth.getUser(),
    ]);
    const userId = userResult.data.user?.id;
    const names = new Map(profiles.map((profile) => [profile.user_id, profile.display_name]));

    return topics.map((row) => ({
      ...row,
      author: names.get(row.author_id) || "Membre AEI",
      replies: replies.filter((reply) => reply.topic_id === row.id).length,
      likes: likes.filter((like) => like.topic_id === row.id).length,
      isLiked: likes.some(
        (like) => like.topic_id === row.id && like.user_id === userId
      ),
      date: formatDate(row.created_at),
    }));
  },
  listReplies: (topicId) =>
    unwrap(
      client()
        .from("forum_replies")
        .select("*")
        .eq("topic_id", topicId)
        .eq("status", "published")
        .order("created_at", { ascending: true })
    ),
  createTopic: (payload) => createRecord("forum_topics", payload),
  createReply: (payload) => createRecord("forum_replies", payload),
  setLike: (topicId, liked) =>
    setFavorite("forum_likes", "topic_id", topicId, liked),
};

export const advertisementsApi = {
  list: async () => {
    const [rows, favoriteIds] = await Promise.all([
      listPublished("advertisements", "starts_at", false),
      listFavoriteIds("advertisement_favorites", "advertisement_id"),
    ]);
    const favorites = new Set(favoriteIds);
    return rows.map((row) => ({
      ...row,
      titre: row.title,
      image: row.image_url,
      url: row.target_url,
      isFavorite: favorites.has(row.id),
    }));
  },
  listFavoriteIds: () =>
    listFavoriteIds("advertisement_favorites", "advertisement_id"),
  setFavorite: (advertisementId, favorite) =>
    setFavorite(
      "advertisement_favorites",
      "advertisement_id",
      advertisementId,
      favorite
    ),
};

export const chatApi = {
  listConversations: () => listOwned("chat_conversations", "user_id"),
  createConversation: (title) =>
    createRecord("chat_conversations", { title }),
  listMessages: (conversationId) =>
    unwrap(
      client()
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
    ),
  addUserMessage: (conversationId, content) =>
    createRecord("chat_messages", {
      conversation_id: conversationId,
      sender: "user",
      content,
    }),
};

export const notificationsApi = {
  list: () =>
    unwrap(
      client()
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
    ),
  markRead: (id) =>
    updateRecord("notifications", id, { read_at: new Date().toISOString() }),
};
