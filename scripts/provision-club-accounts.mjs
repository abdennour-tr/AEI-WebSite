import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Définissez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local."
  );
}

const accounts = [
  ["innoverse_aei@enaid.ump.ma", "innoverse", "InnoVerse"],
  ["nurlai_aei@enaid.ump.ma", "nurlai", "NurlAI"],
  ["riot_aei@enaid.ump.ma", "riot", "RIoT ENIADB"],
  ["secora_aei@enaid.ump.ma", "secora", "SECORA Club"],
  ["techrise_aei@enaid.ump.ma", "techrise", "TechRise"],
  ["enactus_aei@enaid.ump.ma", "enactus", "Enactus ENIAD Berkane"],
  ["alataa_aei@enaid.ump.ma", "al-ataa", "Club Al Ataa"],
  ["aei_eniadb@enaid.ump.ma", "aei-eniadb", "AEI ENIADB"],
];

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const createdCredentials = [];

const { error: schemaError } = await supabase
  .from("club_board_members")
  .select("id", { head: true, count: "exact" });
if (schemaError) {
  throw new Error(
    "La migration supabase/16_club_accounts_board_and_events.sql doit être exécutée avant le provisionnement. " +
      schemaError.message
  );
}

const { data: configuredClubs, error: clubsError } = await supabase
  .from("club_profiles")
  .select("id")
  .in("id", accounts.map(([, clubId]) => clubId));
if (clubsError) throw clubsError;
if ((configuredClubs || []).length !== accounts.length) {
  throw new Error("Les huit profils Clubs ne sont pas encore présents. Réexécutez la migration 16.");
}

async function findUser(email) {
  let page = 1;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const match = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (match) return match;
    if (data.users.length < 200) return null;
    page += 1;
  }
}

for (const [email, clubId, clubName] of accounts) {
  let user = await findUser(email);
  if (!user) {
    const initialPassword = `${randomBytes(15).toString("base64url")}Aa1!`;
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: initialPassword,
      email_confirm: true,
      user_metadata: { full_name: clubName, account_type: "club_manager" },
    });
    if (error) throw error;
    user = data.user;
    createdCredentials.push({ email, password: initialPassword });
    console.log(`Créé : ${email}`);
  } else {
    console.log(`Déjà présent : ${email}`);
  }

  const { error: managerError } = await supabase.from("club_managers").upsert(
    { user_id: user.id, club_id: clubId, manager_role: "president", active: true },
    { onConflict: "user_id,club_id" }
  );
  if (managerError) throw managerError;
}

console.log("Les huit comptes responsables sont prêts.");
if (createdCredentials.length) {
  console.log("\nIdentifiants temporaires créés — à transmettre séparément puis à remplacer :");
  console.table(createdCredentials);
}
