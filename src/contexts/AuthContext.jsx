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
        .select("*")
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
      async completeOnboarding(preferences) {
        if (!supabase || !session?.user) {
          return { error: new Error("Votre session a expiré. Reconnectez-vous.") };
        }

        const fullName = preferences.fullName.trim();
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ full_name: fullName })
          .eq("id", session.user.id);

        if (profileError) return { error: profileError };

        const completedAt = new Date().toISOString();
        const { data, error } = await supabase.auth.updateUser({
          data: {
            ...session.user.user_metadata,
            full_name: fullName,
            onboarding_completed: true,
            onboarding_completed_at: completedAt,
            onboarding: {
              level: preferences.level,
              specialty: preferences.specialty,
              interests: preferences.interests,
              goals: preferences.goals,
              availability: preferences.availability,
            },
          },
        });

        if (error) return { error };

        if (data.user) {
          setSession((current) =>
            current ? { ...current, user: data.user } : current
          );
        }
        setProfile((current) =>
          current ? { ...current, full_name: fullName } : current
        );

        return { error: null, user: data.user };
      },
      async refreshProfile() {
        if (!supabase || !session?.user?.id) return null;
        const { data } = await supabase
          .from("profiles")
          .select("*")
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
