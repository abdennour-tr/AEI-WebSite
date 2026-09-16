import { useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { AuthContext } from "@/contexts/auth-context";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) return undefined;

    let active = true;

    const loadInitialSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;

      if (error) {
        setSession(null);
        setLoading(false);
        return;
      }

      setSession(data.session);
      setLoading(false);
    };

    loadInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) setProfile(null);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase || !session?.user?.id) {
      return undefined;
    }

    let active = true;

    const loadProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, phone, bio, role, hide_email")
        .eq("id", session.user.id)
        .maybeSingle();

      if (active) setProfile(data ?? null);
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [session?.user?.id]);

  const value = useMemo(
    () => ({
      configured: isSupabaseConfigured,
      loading,
      session,
      user: session?.user ?? null,
      profile,
      async signIn(email, password) {
        if (!supabase) {
          return {
            error: new Error(
              "Supabase n’est pas encore configuré. Ajoutez les variables VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY."
            ),
          };
        }

        return supabase.auth.signInWithPassword({ email, password });
      },
      async signOut() {
        if (!supabase) return { error: null };
        return supabase.auth.signOut();
      },
      async refreshProfile() {
        if (!supabase || !session?.user?.id) return null;
        const { data } = await supabase
          .from("profiles")
          .select("id, full_name, phone, bio, role, hide_email")
          .eq("id", session.user.id)
          .maybeSingle();
        setProfile(data ?? null);
        return data ?? null;
      },
    }),
    [loading, profile, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
