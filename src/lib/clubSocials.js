export const clubSocialPlatforms = [
  { key: "instagram", label: "Instagram", placeholder: "https://www.instagram.com/votre-club" },
  { key: "facebook", label: "Facebook", placeholder: "https://www.facebook.com/votre-club" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://www.linkedin.com/company/votre-club" },
  { key: "youtube", label: "YouTube", placeholder: "https://www.youtube.com/@votre-club" },
  { key: "tiktok", label: "TikTok", placeholder: "https://www.tiktok.com/@votre-club" },
  { key: "website", label: "Site web", placeholder: "https://votre-club.ma" },
];

function inferPlatform(url) {
  const normalized = String(url || "").toLowerCase();
  if (normalized.includes("instagram.com")) return "instagram";
  if (normalized.includes("facebook.com") || normalized.includes("fb.com")) return "facebook";
  if (normalized.includes("linkedin.com")) return "linkedin";
  if (normalized.includes("youtube.com") || normalized.includes("youtu.be")) return "youtube";
  if (normalized.includes("tiktok.com")) return "tiktok";
  return "website";
}

export function createSocialLinksForm(profile = {}) {
  const values = Object.fromEntries(
    clubSocialPlatforms.map(({ key }) => [key, String(profile.social_links?.[key] || "")])
  );

  if (!Object.values(values).some(Boolean) && profile.contact_url) {
    values[inferPlatform(profile.contact_url)] = profile.contact_url;
  }

  return values;
}

export function cleanSocialLinks(values = {}) {
  return Object.fromEntries(
    clubSocialPlatforms
      .map(({ key }) => [key, String(values[key] || "").trim()])
      .filter(([, url]) => Boolean(url))
  );
}

export function listClubSocials(profile = {}, fallbackUrl = "") {
  const values = createSocialLinksForm({
    ...profile,
    contact_url: profile.contact_url || fallbackUrl,
  });

  return clubSocialPlatforms
    .map(({ key, label }) => ({ key, label, url: values[key] }))
    .filter((social) => Boolean(social.url));
}
