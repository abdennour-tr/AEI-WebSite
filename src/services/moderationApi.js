import { supabase } from "@/lib/supabase";

export async function reportContent({ contentType, contentId, reason, details }) {
  if (!supabase) throw new Error("Supabase n’est pas configuré.");
  const { data, error } = await supabase.rpc("report_content", {
    target_type: contentType,
    target_id: String(contentId),
    report_reason: reason,
    report_details: details || null,
  });
  if (error) throw error;

  const { data: sessionData } = await supabase.auth.getSession();
  let emailed = false;
  if (sessionData.session?.access_token) {
    try {
      const response = await fetch("/api/report-notification", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({ reportId: data }),
      });
      const result = await response.json().catch(() => ({}));
      emailed = response.ok && Boolean(result.emailed);
    } catch {
      // Le signalement reste enregistré dans Supabase même si l'e-mail échoue.
    }
  }

  return { id: data, emailed };
}
