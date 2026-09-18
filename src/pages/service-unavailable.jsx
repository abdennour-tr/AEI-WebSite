import { RefreshCw, WifiOff } from "lucide-react";
import { Link } from "react-router-dom";

export default function ServiceUnavailablePage({ embedded = false }) {
  return (
    <div className={`${embedded ? "min-h-[70vh]" : "min-h-screen"} flex items-center justify-center bg-slate-50 p-4`}>
      <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-xl sm:p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-700"><WifiOff className="h-7 w-7" /></span>
        <h1 className="mt-6 text-2xl font-bold text-slate-950">Le service est momentanément indisponible</h1>
        <p className="mt-3 text-base leading-7 text-slate-600">Vos données sont conservées. Vérifiez votre connexion puis réessayez dans quelques instants.</p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={() => window.location.reload()} className="portal-primary-button"><RefreshCw className="h-4 w-4" /> Réessayer</button>
          <Link to="/" className="portal-secondary-button">Retour au tableau de bord</Link>
        </div>
      </section>
    </div>
  );
}
