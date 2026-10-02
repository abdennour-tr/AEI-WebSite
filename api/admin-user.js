function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function bearerToken(request) {
  return request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1] || "";
}

async function authenticatedAdmin(request, env) {
  const token = bearerToken(request);
  if (!token || !env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) return null;
  const userResponse = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: env.SUPABASE_ANON_KEY, authorization: `Bearer ${token}` },
  });
  if (!userResponse.ok) return null;
  const user = await userResponse.json();
  const profileResponse = await fetch(
    `${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}&select=id,role&limit=1`,
    { headers: { apikey: env.SUPABASE_ANON_KEY, authorization: `Bearer ${token}` } }
  );
  if (!profileResponse.ok) return null;
  const profiles = await profileResponse.json();
  return profiles[0]?.role === "admin" ? user : null;
}

export async function handleAdminUser(request, env) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204 });
  if (request.method !== "POST") return json({ error: "Méthode non autorisée." }, 405);
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return json({ error: "La suppression sécurisée des comptes n’est pas configurée." }, 503);
  }

  const administrator = await authenticatedAdmin(request, env);
  if (!administrator) return json({ error: "Accès administrateur requis." }, 403);

  try {
    const body = await request.json();
    const userId = String(body.userId || "").trim();
    const reason = String(body.reason || "").trim();
    if (!userId) return json({ error: "Utilisateur invalide." }, 400);
    if (reason.length < 3) return json({ error: "Le motif de suppression est obligatoire." }, 400);
    if (userId === administrator.id) return json({ error: "Vous ne pouvez pas supprimer votre propre compte administrateur." }, 409);

    const serviceHeaders = {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "content-type": "application/json",
    };
    const targetResponse = await fetch(
      `${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=id,email,full_name,role&limit=1`,
      { headers: serviceHeaders }
    );
    const targets = targetResponse.ok ? await targetResponse.json() : [];
    const target = targets[0];
    if (!target) return json({ error: "Compte introuvable." }, 404);

    if (target.role === "admin") {
      const adminsResponse = await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?role=eq.admin&select=id`, { headers: serviceHeaders });
      const admins = adminsResponse.ok ? await adminsResponse.json() : [];
      if (admins.length <= 1) return json({ error: "Le dernier compte administrateur ne peut pas être supprimé." }, 409);
    }

    const deleteResponse = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users/${encodeURIComponent(userId)}`, {
      method: "DELETE",
      headers: serviceHeaders,
    });
    if (!deleteResponse.ok) {
      const details = await deleteResponse.json().catch(() => ({}));
      return json({ error: details.message || details.msg || "Supabase n’a pas pu supprimer ce compte." }, deleteResponse.status);
    }

    await fetch(`${env.SUPABASE_URL}/rest/v1/admin_audit_log`, {
      method: "POST",
      headers: { ...serviceHeaders, prefer: "return=minimal" },
      body: JSON.stringify({
        actor_id: administrator.id,
        action: "user.deleted",
        target_type: "user",
        target_id: userId,
        details: { email: target.email, full_name: target.full_name, previous_role: target.role, reason },
      }),
    });

    return json({ success: true });
  } catch (error) {
    console.error("Admin user deletion error", error);
    return json({ error: "Le compte n’a pas pu être supprimé." }, 500);
  }
}

function environment() {
  return {
    SUPABASE_URL: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

export default {
  fetch(request) {
    return handleAdminUser(request, environment());
  },
};
