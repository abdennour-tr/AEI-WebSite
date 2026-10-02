import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const requestedEmails = process.argv.slice(2).map((email) => email.trim().toLowerCase());

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Configuration Supabase administrateur manquante dans .env.local.");
}

if (!requestedEmails.length) {
  throw new Error("Ajoutez au moins une adresse académique après le nom du script.");
}

for (const email of requestedEmails) {
  if (!/^[^@\s]+@ump\.ac\.ma$/i.test(email)) {
    throw new Error(`Adresse académique invalide : ${email}`);
  }
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function findUser(email) {
  let page = 1;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const user = data.users.find((item) => item.email?.toLowerCase() === email);
    if (user || data.users.length < 200) return user || null;
    page += 1;
  }
}

const createdCredentials = [];

for (const email of [...new Set(requestedEmails)]) {
  let user = await findUser(email);

  if (user) {
    const [{ data: profile, error: profileError }, { data: manager, error: managerError }] =
      await Promise.all([
        supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
        supabase
          .from("club_managers")
          .select("club_id")
          .eq("user_id", user.id)
          .eq("active", true)
          .limit(1)
          .maybeSingle(),
      ]);

    if (profileError || managerError) throw profileError || managerError;
    if (manager || profile?.role !== "student") {
      throw new Error(`${email} existe déjà avec un accès non étudiant.`);
    }

    console.log(`Compte étudiant déjà présent : ${email}`);
    continue;
  }

  const temporaryPassword = `${randomBytes(15).toString("base64url")}Aa1!`;
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: { account_type: "student" },
  });
  if (error) throw error;
  user = data.user;

  const { error: roleError } = await supabase
    .from("profiles")
    .update({ role: "student", updated_at: new Date().toISOString() })
    .eq("id", user.id);
  if (roleError) throw roleError;

  createdCredentials.push({ email, password: temporaryPassword });
  console.log(`Compte étudiant créé : ${email}`);
}

if (createdCredentials.length) {
  console.log("\nIdentifiants temporaires — à transmettre séparément puis à remplacer :");
  console.table(createdCredentials);
}
