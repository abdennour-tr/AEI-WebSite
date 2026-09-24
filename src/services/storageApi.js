import { supabase } from "@/lib/supabase";

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function getClient() {
  if (!supabase) throw new Error("Supabase n’est pas configuré.");
  return supabase;
}

function extensionFor(file) {
  const fromName = file.name?.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "webp"].includes(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }
  return file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
}

export function validateImageFiles(files, maxFiles = 6) {
  const selected = Array.from(files || []);
  if (selected.length > maxFiles) {
    throw new Error(`Vous pouvez sélectionner jusqu’à ${maxFiles} image${maxFiles > 1 ? "s" : ""}.`);
  }
  for (const file of selected) {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      throw new Error("Formats acceptés : JPG, PNG et WebP.");
    }
    if (file.size > MAX_IMAGE_SIZE) {
      throw new Error(`L’image « ${file.name} » dépasse 8 Mo.`);
    }
  }
  return selected;
}

export async function uploadPublicImages(bucket, files) {
  const selected = validateImageFiles(files);
  if (!selected.length) return [];

  const storage = getClient().storage;
  const { data, error: userError } = await getClient().auth.getUser();
  if (userError) throw userError;
  if (!data.user) throw new Error("Votre session a expiré. Reconnectez-vous.");

  const uploadedPaths = [];
  try {
    const urls = [];
    for (const file of selected) {
      const path = `${data.user.id}/${crypto.randomUUID()}.${extensionFor(file)}`;
      const { error } = await storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });
      if (error) throw error;
      uploadedPaths.push(path);
      urls.push(storage.from(bucket).getPublicUrl(path).data.publicUrl);
    }
    return urls;
  } catch (error) {
    if (uploadedPaths.length) {
      await storage.from(bucket).remove(uploadedPaths).catch(() => undefined);
    }
    throw new Error(error.message || "Le téléversement des images a échoué.");
  }
}
