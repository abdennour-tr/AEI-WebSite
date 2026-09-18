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
  return data;
}
