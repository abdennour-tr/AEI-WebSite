const DEFAULT_ADMIN_EMAIL = "atrariabdennour642@gmail.com";

function json(data, status = 200) {
  return Response.json(data, { status, headers: { "cache-control": "no-store" } });
}

function bearerToken(request) {
  return (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function handleReportNotification(request, environment = {}) {
    if (request.method !== "POST") return json({ error: "Méthode non autorisée." }, 405);

    const env = {
      supabaseUrl: environment.SUPABASE_URL || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
      supabaseKey: environment.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      resendKey: environment.RESEND_API_KEY || process.env.RESEND_API_KEY,
      fromEmail: environment.REPORTS_FROM_EMAIL || process.env.REPORTS_FROM_EMAIL,
      adminEmail: environment.ADMIN_REPORT_EMAIL || process.env.ADMIN_REPORT_EMAIL || DEFAULT_ADMIN_EMAIL,
    };
    if (!env.supabaseUrl || !env.supabaseKey) return json({ error: "Configuration Supabase absente." }, 503);

    const token = bearerToken(request);
    if (!token) return json({ error: "Authentification requise." }, 401);

    const userResponse = await fetch(`${env.supabaseUrl}/auth/v1/user`, {
      headers: { apikey: env.supabaseKey, authorization: `Bearer ${token}` },
    });
    if (!userResponse.ok) return json({ error: "Session invalide." }, 401);
    const user = await userResponse.json();

    let reportId;
    try {
      reportId = String((await request.json()).reportId || "");
    } catch {
      return json({ error: "Requête invalide." }, 400);
    }
    if (!reportId) return json({ error: "Signalement manquant." }, 400);

    const reportResponse = await fetch(
      `${env.supabaseUrl}/rest/v1/content_reports?id=eq.${encodeURIComponent(reportId)}&reporter_id=eq.${encodeURIComponent(user.id)}&select=id,content_type,content_id,reason,details,created_at`,
      { headers: { apikey: env.supabaseKey, authorization: `Bearer ${token}`, accept: "application/json" } }
    );
    const reports = reportResponse.ok ? await reportResponse.json() : [];
    const report = reports[0];
    if (!report) return json({ error: "Signalement introuvable." }, 404);

    if (!env.resendKey || !env.fromEmail) {
      return json({ saved: true, emailed: false, reason: "email_not_configured" }, 202);
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${env.resendKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: env.fromEmail,
        to: [env.adminEmail],
        subject: `[AEI] Nouveau signalement — ${report.reason}`,
        html: `<h2>Nouveau signalement sur le portail AEI</h2><p><strong>Type :</strong> ${escapeHtml(report.content_type)}</p><p><strong>Contenu :</strong> ${escapeHtml(report.content_id)}</p><p><strong>Motif :</strong> ${escapeHtml(report.reason)}</p><p><strong>Détails :</strong> ${escapeHtml(report.details || "Aucun détail")}</p><p><strong>Utilisateur :</strong> ${escapeHtml(user.email || user.id)}</p><p>Consultez le tableau de bord administrateur pour traiter ce signalement.</p>`,
      }),
    });

    if (!emailResponse.ok) return json({ saved: true, emailed: false, error: "Envoi de l’e-mail impossible." }, 502);
    return json({ saved: true, emailed: true });
}

export default {
  fetch(request) {
    return handleReportNotification(request);
  },
};
