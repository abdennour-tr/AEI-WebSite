import { useState } from "react";
import { CheckCircle2, Flag, LoaderCircle, X } from "lucide-react";
import { reportContent } from "@/services/moderationApi";

const reasons = ["Contenu trompeur", "Comportement inapproprié", "Spam ou publicité abusive", "Atteinte à la vie privée", "Autre motif"];

export default function ReportButton({ contentType, contentId, title, className = "portal-secondary-button" }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(reasons[0]);
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true); setMessage("");
    try {
      const result = await reportContent({ contentType, contentId, reason, details: details.trim() });
      setMessage(result.emailed
        ? "Signalement envoyé. L’administrateur a également été averti par e-mail."
        : "Signalement envoyé. Il apparaît maintenant dans le tableau de bord administrateur.");
      setDetails("");
    } catch (error) {
      setMessage(error.message || "Le signalement n’a pas pu être envoyé.");
    } finally { setLoading(false); }
  };

  return <>
    <button type="button" onClick={() => { setOpen(true); setMessage(""); }} className={className}><Flag className="h-4 w-4" /> Signaler</button>
    {open && <div className="portal-modal-backdrop" onMouseDown={() => !loading && setOpen(false)}>
      <section className="portal-modal max-w-lg" role="dialog" aria-modal="true" aria-labelledby="report-title" onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" onClick={() => setOpen(false)} className="absolute right-5 top-5 rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Fermer"><X className="h-5 w-5" /></button>
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700"><Flag className="h-5 w-5" /></span>
        <h2 id="report-title" className="mt-4 pr-10 text-2xl font-black text-slate-950">Signaler ce contenu</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">Votre signalement concernant « {title} » sera transmis uniquement aux modérateurs.</p>
        {message.startsWith("Signalement envoyé") ? <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm font-semibold text-emerald-800"><CheckCircle2 className="mb-3 h-6 w-6" />{message}<button type="button" onClick={() => setOpen(false)} className="portal-primary-button mt-5 w-full">Fermer</button></div> : <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-bold text-slate-700">Motif<select className="portal-select mt-2" value={reason} onChange={(event) => setReason(event.target.value)}>{reasons.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="block text-sm font-bold text-slate-700">Précisions facultatives<textarea className="portal-input mt-2 min-h-28 resize-y" maxLength={1200} value={details} onChange={(event) => setDetails(event.target.value)} placeholder="Décrivez brièvement le problème constaté…" /></label>
          {message && <p className="text-sm font-semibold text-rose-700">{message}</p>}
          <button type="submit" disabled={loading} className="portal-primary-button w-full">{loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Flag className="h-4 w-4" />} Envoyer le signalement</button>
        </form>}
      </section>
    </div>}
  </>;
}
