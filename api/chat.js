import { handleChatRequest } from "../server/worker.js";

function getServerEnvironment() {
  return {
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    GROQ_MODEL: process.env.GROQ_MODEL,
    SUPABASE_URL: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    SUPABASE_ANON_KEY:
      process.env.SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  };
}

export default {
  fetch(request) {
    return handleChatRequest(request, getServerEnvironment());
  },
};
