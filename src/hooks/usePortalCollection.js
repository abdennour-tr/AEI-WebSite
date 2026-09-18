import { useCallback, useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase";

export function usePortalCollection(loader, fallbackData = []) {
  const [data, setData] = useState(
    isSupabaseConfigured ? [] : fallbackData
  );
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const rows = await loader();
        if (active) setData(rows ?? []);
      } catch (loadError) {
        if (active) setError(loadError);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [loader, reloadKey]);

  return {
    data,
    error,
    loading,
    setData,
    reload,
  };
}
