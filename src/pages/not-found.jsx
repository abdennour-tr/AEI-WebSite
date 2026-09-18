import { ArrowLeft, Compass, Home } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="portal-page flex min-h-[70vh] items-center justify-center">
      <section className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white text-center shadow-xl">
        <div className="bg-slate-950 px-6 py-10 text-white">
          <Compass className="mx-auto h-10 w-10 text-sky-300" />
          <p className="mt-5 text-sm font-bold uppercase tracking-[0.2em] text-sky-300">Erreur 404</p>
          <h1 className="mt-2 text-3xl font-bold">Cette page n’existe pas</h1>
          <p className="mx-auto mt-3 max-w-lg text-base leading-7 text-slate-300">Le lien est peut-être ancien ou incomplet. Revenez au tableau de bord ou explorez les clubs.</p>
        </div>
        <div className="flex flex-col justify-center gap-3 p-6 sm:flex-row">
          <Link to="/" className="portal-primary-button"><Home className="h-4 w-4" /> Tableau de bord</Link>
          <Link to="/clubs" className="portal-secondary-button"><ArrowLeft className="h-4 w-4" /> Découvrir les clubs</Link>
        </div>
      </section>
    </div>
  );
}
