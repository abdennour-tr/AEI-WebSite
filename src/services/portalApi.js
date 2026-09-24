import { supabase } from "@/lib/supabase";
import { studentProjectsApi } from "@/services/projectsApi";
import clubs from "@/data/Clubs";

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
    const payload = { [foreignKey]: recordId, user_id: user.id };
    const { data, error } = await client()
      .from(table)
      .insert(payload)
      .select()
      .single();

    if (error && error.code !== "23505") throw error;

    const saved = data ||
      (await unwrap(
        client()
          .from(table)
          .select("*")
          .eq(foreignKey, recordId)
          .eq("user_id", user.id)
          .maybeSingle()
      ));
    window.dispatchEvent(new CustomEvent("aei:favorites-changed"));
    return saved;
  }

  await unwrap(
    client()
      .from(table)
      .delete()
      .eq(foreignKey, recordId)
      .eq("user_id", user.id)
  );
  window.dispatchEvent(new CustomEvent("aei:favorites-changed"));
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

const mapProduct = (row) => ({
  ...row,
  titre: row.title,
  prix: row.price,
  img: row.image_urls?.[0] || "",
  image: row.image_urls?.[0] || "",
  categorie: row.category,
  etat: row.item_condition,
  ville: row.city,
  date: formatDate(row.created_at),
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
    ).then((rows) =>
      rows
        .filter((row) => row.course)
        .map((row) => ({
          ...mapCourse(row.course),
          favoriteCreatedAt: row.created_at,
        }))
    ),
  setFavorite: (courseId, favorite) =>
    setFavorite("course_favorites", "course_id", courseId, favorite),
  create: (payload) => createRecord("courses", payload),
  update: (id, payload) => updateRecord("courses", id, payload),
  remove: (id) => deleteRecord("courses", id),
};

export const housingApi = {
  list: async () => {
    const [rows, favoriteIds] = await Promise.all([
      unwrap(
        client()
          .from("housing_listings")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false })
      ),
      listFavoriteIds("housing_favorites", "housing_id").catch(() => []),
    ]);
    const favorites = new Set(favoriteIds);
    return rows.map((row) => ({
      ...mapHousing(row),
      isFavorite: favorites.has(row.id),
    }));
  },
  listFavorites: async () =>
    unwrap(
      client()
        .from("housing_favorites")
        .select("created_at, housing:housing_listings(*)")
        .order("created_at", { ascending: false })
    ).then((rows) =>
      rows
        .filter((row) => row.housing)
        .map((row) => ({
          ...mapHousing(row.housing),
          favoriteCreatedAt: row.created_at,
        }))
    ),
  setFavorite: (housingId, favorite) =>
    setFavorite("housing_favorites", "housing_id", housingId, favorite),
  listMine: async () =>
    (await listOwned("housing_listings", "owner_id")).map(mapHousing),
  create: async (payload) => mapHousing(await createRecord("housing_listings", payload)),
  update: async (id, payload) =>
    mapHousing(await updateRecord("housing_listings", id, payload)),
  remove: (id) => deleteRecord("housing_listings", id),
};

export const marketplaceApi = {
  list: async () => {
    const [rows, favoriteIds] = await Promise.all([
      unwrap(
        client()
          .from("marketplace_products")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false })
      ),
      listFavoriteIds("marketplace_product_favorites", "product_id").catch(() => []),
    ]);
    const favorites = new Set(favoriteIds);
    return rows.map((row) => ({
      ...mapProduct(row),
      isFavorite: favorites.has(row.id),
    }));
  },
  listFavorites: async () =>
    unwrap(
      client()
        .from("marketplace_product_favorites")
        .select("created_at, product:marketplace_products(*)")
        .order("created_at", { ascending: false })
    ).then((rows) =>
      rows
        .filter((row) => row.product)
        .map((row) => ({
          ...mapProduct(row.product),
          favoriteCreatedAt: row.created_at,
        }))
    ),
  setFavorite: (productId, favorite) =>
    setFavorite(
      "marketplace_product_favorites",
      "product_id",
      productId,
      favorite
    ),
  listMine: () => listOwned("marketplace_products", "seller_id"),
  create: async (payload) => mapProduct(await createRecord("marketplace_products", payload)),
  update: async (id, payload) => mapProduct(await updateRecord("marketplace_products", id, payload)),
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
  listFavorites: async () =>
    unwrap(
      client()
        .from("opportunity_favorites")
        .select("created_at, opportunity:opportunities(*)")
        .order("created_at", { ascending: false })
    ).then((rows) =>
      rows
        .filter((row) => row.opportunity)
        .map((row) => ({
          ...row.opportunity,
          titre: row.opportunity.title,
          entreprise: row.opportunity.company,
          lieu: row.opportunity.city || "À distance",
          duree: row.opportunity.duration || "À confirmer",
          favoriteCreatedAt: row.created_at,
        }))
    ),
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
  list: async () => {
    const [rows, profiles] = await Promise.all([
      listPublished("student_projects"),
      unwrap(client().from("public_profiles").select("user_id,display_name")),
    ]);
    const names = new Map(
      profiles.map((profile) => [profile.user_id, profile.display_name])
    );
    return rows.map((row) => ({
      ...row,
      desc: row.description,
      tech: row.tech_stack?.join(" / ") || "",
      updated: formatDate(row.updated_at),
      author: names.get(row.owner_id) || "Étudiant ENIAD",
    }));
  },
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
  listFavorites: async () =>
    unwrap(
      client()
        .from("advertisement_favorites")
        .select("created_at, advertisement:advertisements(*)")
        .order("created_at", { ascending: false })
    ).then((rows) =>
      rows
        .filter((row) => row.advertisement)
        .map((row) => ({
          ...row.advertisement,
          titre: row.advertisement.title,
          image: row.advertisement.image_url,
          url: row.advertisement.target_url,
          favoriteCreatedAt: row.created_at,
        }))
    ),
  setFavorite: (advertisementId, favorite) =>
    setFavorite(
      "advertisement_favorites",
      "advertisement_id",
      advertisementId,
      favorite
    ),
};

export const clubFavoritesApi = {
  listIds: () => listFavoriteIds("club_favorites", "club_id"),
  listFavorites: async () => {
    const rows = await unwrap(
      client()
        .from("club_favorites")
        .select("club_id,created_at")
        .order("created_at", { ascending: false })
    );
    const clubMap = new Map(clubs.map((club) => [club.id, club]));
    return rows
      .filter((row) => clubMap.has(row.club_id))
      .map((row) => ({
        ...clubMap.get(row.club_id),
        favoriteCreatedAt: row.created_at,
      }));
  },
  setFavorite: (clubId, favorite) =>
    setFavorite("club_favorites", "club_id", clubId, favorite),
};

export const favoritesApi = {
  list: async () => {
    const [courses, clubsList, projects, advertisements, products, housing] =
      await Promise.all([
      coursesApi.listFavorites(),
      clubFavoritesApi.listFavorites().catch(() => []),
      studentProjectsApi.listFavorites().catch(() => []),
      advertisementsApi.listFavorites(),
      marketplaceApi.listFavorites().catch(() => []),
      housingApi.listFavorites().catch(() => []),
    ]);

    return [
      ...courses.map((item) => ({ ...item, favoriteType: "course" })),
      ...clubsList.map((item) => ({ ...item, favoriteType: "club" })),
      ...projects.map((item) => ({ ...item, favoriteType: "project" })),
      ...advertisements.map((item) => ({
        ...item,
        favoriteType: "advertisement",
      })),
      ...products.map((item) => ({ ...item, favoriteType: "product" })),
      ...housing.map((item) => ({ ...item, favoriteType: "housing" })),
    ].sort(
      (first, second) =>
        new Date(second.favoriteCreatedAt || 0) -
        new Date(first.favoriteCreatedAt || 0)
    );
  },
  remove: (item) => {
    if (item.favoriteType === "course") {
      return coursesApi.setFavorite(item.id, false);
    }
    if (item.favoriteType === "club") {
      return clubFavoritesApi.setFavorite(item.id, false);
    }
    if (item.favoriteType === "project") {
      return studentProjectsApi.setFavorite(item.id, false);
    }
    if (item.favoriteType === "product") {
      return marketplaceApi.setFavorite(item.id, false);
    }
    if (item.favoriteType === "housing") {
      return housingApi.setFavorite(item.id, false);
    }
    return advertisementsApi.setFavorite(item.id, false);
  },
  listUpdates: () =>
    unwrap(
      client()
        .from("notifications")
        .select("*")
        .like("link", "/favori%")
        .order("created_at", { ascending: false })
        .limit(8)
    ),
  markUpdateRead: (id) =>
    updateRecord("notifications", id, { read_at: new Date().toISOString() }),
  subscribe: async (onChange) => {
    const {
      data: { user },
      error,
    } = await client().auth.getUser();
    if (error) throw error;
    if (!user) return () => undefined;

    const channel = client().channel(`universal-favorites-${user.id}`);
    [
      "course_favorites",
      "project_favorites",
      "advertisement_favorites",
      "club_favorites",
      "marketplace_product_favorites",
      "housing_favorites",
      "notifications",
    ].forEach((table) => {
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter: `user_id=eq.${user.id}`,
        },
        onChange
      );
    });
    channel.subscribe();
    return () => client().removeChannel(channel);
  },
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
  subscribe: async (onChange) => {
    const {
      data: { user },
      error,
    } = await client().auth.getUser();
    if (error) throw error;
    if (!user) return () => undefined;
    const channel = client()
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        onChange
      );
    channel.subscribe();
    return () => client().removeChannel(channel);
  },
};

const normalizeClubApplications = (value) =>
  Array.isArray(value)
    ? value.filter(
        (application) =>
          application &&
          typeof application.club_id === "string" &&
          ["submitted", "accepted", "refused"].includes(application.status)
      )
    : [];

const isMissingClubApplicationsTable = (error) =>
  ["42P01", "PGRST205"].includes(error?.code);

async function listClubApplicationsFromAccount() {
  const {
    data: { user },
    error,
  } = await client().auth.getUser();
  if (error) throw error;
  return normalizeClubApplications(user?.user_metadata?.club_applications);
}

export const clubApplicationsApi = {
  listMine: async () => {
    const { data, error } = await client()
      .from("club_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) return data;
    if (!isMissingClubApplicationsTable(error)) throw error;
    return listClubApplicationsFromAccount();
  },
  submit: async ({ clubId, preferredPole, availability, motivation }) => {
    const {
      data: { user },
      error: userError,
    } = await client().auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("Vous devez être connecté pour rejoindre un club.");

    const payload = {
      club_id: clubId,
      applicant_id: user.id,
      preferred_pole: preferredPole,
      availability,
      motivation: motivation.trim(),
    };

    const { data: storedApplication, error: insertError } = await client()
      .from("club_applications")
      .insert(payload)
      .select()
      .single();

    if (!insertError) return storedApplication;

    if (insertError.code === "23505") {
      const { data: existingApplication, error: existingError } = await client()
        .from("club_applications")
        .select("*")
        .eq("club_id", clubId)
        .eq("applicant_id", user.id)
        .single();
      if (existingError) throw existingError;
      return existingApplication;
    }

    if (!isMissingClubApplicationsTable(insertError)) throw insertError;

    const applications = normalizeClubApplications(
      user.user_metadata?.club_applications
    );
    const existing = applications.find(
      (application) => application.club_id === clubId
    );
    if (existing) return existing;

    const application = {
      id: `${clubId}-${Date.now()}`,
      ...payload,
      status: "submitted",
      submitted_at: new Date().toISOString(),
    };

    const { data, error } = await client().auth.updateUser({
      data: {
        ...user.user_metadata,
        club_applications: [...applications, application],
      },
    });
    if (error) throw error;

    return {
      ...application,
      user: data.user,
    };
  },
};
