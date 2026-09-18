import { supabase } from "@/lib/supabase";

const collections = [
  ["profil", "profiles", "id"],
  ["profil_public", "public_profiles", "user_id"],
  ["annonces_colocation", "housing_listings", "owner_id"],
  ["produits", "marketplace_products", "seller_id"],
  ["projets", "student_projects", "owner_id"],
  ["candidatures_clubs", "club_applications", "applicant_id"],
  ["cours_favoris", "course_favorites", "user_id"],
  ["candidatures_opportunites", "opportunity_applications", "applicant_id"],
  ["notifications", "notifications", "user_id"],
  ["conversations", "chat_conversations", "user_id"],
  ["signalements", "content_reports", "reporter_id"],
  ["demande_suppression", "account_deletion_requests", "user_id"],
];

export async function exportAccountData(user) {
  if (!supabase || !user?.id) throw new Error("Votre session a expiré.");
  const results = await Promise.allSettled(collections.map(([, table, column]) => supabase.from(table).select("*").eq(column, user.id)));
  const data = { exporte_le: new Date().toISOString(), compte: { id: user.id, email: user.email, cree_le: user.created_at } };
  results.forEach((result, index) => {
    const [label] = collections[index];
    data[label] = result.status === "fulfilled" && !result.value.error ? result.value.data : [];
  });
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `donnees-aei-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function requestAccountDeletion(reason) {
  if (!supabase) throw new Error("Supabase n’est pas configuré.");
  const { data, error } = await supabase.rpc("request_account_deletion", { request_reason: reason || null });
  if (error) throw error;
  return data;
}
