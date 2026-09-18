import { useEffect, useRef, useState } from "react";
import { ArrowRight, Command, LoaderCircle, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { searchPortal } from "@/services/experienceApi";

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    window.setTimeout(() => inputRef.current?.focus(), 50);
    let active = true;
    setLoading(true);
    const timer = window.setTimeout(() => {
      searchPortal(query)
        .then((items) => active && setResults(items))
        .finally(() => active && setLoading(false));
    }, query ? 220 : 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [open, query]);

  const selectResult = (result) => {
    setOpen(false);
    setQuery("");
    navigate(result.to);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800 sm:w-64 lg:w-72"
        aria-label="Ouvrir la recherche globale"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="hidden truncate sm:block">Rechercher dans le portail…</span>
        <span className="ml-auto hidden items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] text-slate-400 md:inline-flex">
          <Command className="h-3 w-3" /> K
        </span>
      </button>

      {open && (
        <div className="portal-modal-backdrop items-start pt-[10vh]" onMouseDown={() => setOpen(false)}>
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl" role="dialog" aria-modal="true" aria-label="Recherche globale" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
              {loading ? <LoaderCircle className="h-5 w-5 animate-spin text-sky-600" /> : <Search className="h-5 w-5 text-slate-400" />}
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="Rechercher un club, un cours, un projet, un événement…"
              />
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900" aria-label="Fermer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-3">
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.to}-${index}`}
                  type="button"
                  onClick={() => selectResult(result)}
                  className="flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left transition hover:bg-sky-50"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Search className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold text-slate-900">{result.title}</span>
                    <span className="mt-0.5 block truncate text-sm text-slate-500">{result.subtitle}</span>
                  </span>
                  <span className="hidden rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500 sm:block">{result.type}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
                </button>
              ))}
              {!loading && results.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <p className="font-bold text-slate-800">Aucun résultat trouvé</p>
                  <p className="mt-2 text-sm text-slate-500">Essayez un nom de club, une technologie, un cours ou une ville.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
