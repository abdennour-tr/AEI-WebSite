import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, LoaderCircle, QrCode } from "lucide-react";
import { agendaApi } from "@/services/agendaApi";

export default function EventConfirmationPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    const confirm = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Ce billet ne contient aucun identifiant de validation.");
        return;
      }
      try {
        await agendaApi.confirmAttendance(token);
        if (active) setStatus("success");
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage(
          error.message?.includes("access required")
            ? "Seul un responsable de l’événement peut confirmer cette présence."
            : error.message || "Ce billet est invalide ou a été annulé."
        );
      }
    };
    confirm();
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-4 py-10 sm:px-6">
      <section className="w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white text-center shadow-xl shadow-slate-200/60">
        <div className="bg-slate-950 px-6 py-8 text-white">
          <QrCode className="mx-auto h-8 w-8 text-teal-300" />
          <p className="mt-3 text-xs font-black uppercase tracking-[0.2em] text-teal-300">Contrôle d’accès AEI</p>
          <h1 className="mt-2 text-3xl font-black">Confirmation de présence</h1>
        </div>
        <div className="p-8 sm:p-12">
          {status === "loading" && (
            <div><LoaderCircle className="mx-auto h-12 w-12 animate-spin text-indigo-600" /><p className="mt-5 font-bold text-slate-700">Vérification sécurisée du billet…</p></div>
          )}
          {status === "success" && (
            <div><span className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700"><CheckCircle2 className="h-10 w-10" /></span><h2 className="mt-6 text-2xl font-black text-slate-950">Présence confirmée</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">Le billet est valide et la participation de l’étudiant a été enregistrée.</p></div>
          )}
          {status === "error" && (
            <div><span className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-100 text-rose-700"><AlertCircle className="h-10 w-10" /></span><h2 className="mt-6 text-2xl font-black text-slate-950">Validation impossible</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">{message}</p></div>
          )}
          {status !== "loading" && <Link to="/evenements" className="portal-primary-button mt-8">Retour à l’agenda</Link>}
        </div>
      </section>
    </div>
  );
}
