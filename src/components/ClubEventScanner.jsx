import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  CameraOff,
  CheckCircle2,
  ImageUp,
  LoaderCircle,
  QrCode,
  RefreshCw,
  SearchCheck,
  ShieldAlert,
  UserCheck,
  Users,
} from "lucide-react";
import { clubAdminApi } from "@/services/clubAdminApi";

function eventKey(event) {
  return `${event.source}:${event.id}`;
}

function extractToken(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    return url.searchParams.get("token") || "";
  } catch {
    const queryToken = raw.match(/[?&]token=([0-9a-f-]{36})/i)?.[1];
    if (queryToken) return queryToken;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(raw) ? raw : "";
  }
}

function displayDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function ClubEventScanner({ events, onAttendanceChange }) {
  const readerId = useMemo(() => `club-qr-reader-${Math.random().toString(36).slice(2)}`, []);
  const scannerRef = useRef(null);
  const runningRef = useRef(false);
  const processingRef = useRef(false);
  const [selectedKey, setSelectedKey] = useState(() => events[0] ? eventKey(events[0]) : "");
  const [manualValue, setManualValue] = useState("");
  const [registrations, setRegistrations] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [cameraRunning, setCameraRunning] = useState(false);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const selectedEvent = events.find((event) => eventKey(event) === selectedKey) || events[0] || null;

  useEffect(() => {
    if (!selectedEvent && events[0]) setSelectedKey(eventKey(events[0]));
  }, [events, selectedEvent]);

  const stopCamera = useCallback(async () => {
    if (scannerRef.current && runningRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {
        // La caméra peut déjà avoir été arrêtée par le navigateur.
      }
    }
    runningRef.current = false;
    setCameraRunning(false);
  }, []);

  const ensureScanner = async () => {
    if (!scannerRef.current) {
      const { Html5Qrcode } = await import("html5-qrcode");
      scannerRef.current = new Html5Qrcode(readerId);
    }
    return scannerRef.current;
  };

  const loadRegistrations = useCallback(async () => {
    if (!selectedEvent) {
      setRegistrations([]);
      return;
    }
    setLoadingList(true);
    try {
      setRegistrations(await clubAdminApi.listEventAttendance(selectedEvent));
    } catch (loadError) {
      setError(loadError.message || "La liste des inscriptions n’a pas pu être chargée.");
    } finally {
      setLoadingList(false);
    }
  }, [selectedEvent]);

  useEffect(() => {
    setResult(null);
    setError("");
    stopCamera();
    loadRegistrations();
  }, [loadRegistrations, stopCamera]);

  useEffect(() => () => {
    if (scannerRef.current && runningRef.current) scannerRef.current.stop().catch(() => {});
  }, []);

  const validateCode = useCallback(async (decodedValue) => {
    if (!selectedEvent || processingRef.current) return;
    const token = extractToken(decodedValue);
    if (!token) {
      setResult(null);
      setError("Ce code QR ne contient pas un billet AEI valide.");
      return;
    }

    processingRef.current = true;
    setChecking(true);
    setError("");
    setResult(null);
    await stopCamera();
    try {
      const response = await clubAdminApi.checkInEvent(selectedEvent, token);
      setResult(response);
      if (response.valid) {
        await loadRegistrations();
        onAttendanceChange?.();
      }
    } catch (checkError) {
      setError(checkError.message || "La vérification du billet a échoué.");
    } finally {
      processingRef.current = false;
      setChecking(false);
    }
  }, [loadRegistrations, onAttendanceChange, selectedEvent, stopCamera]);

  const startCamera = async () => {
    if (!selectedEvent) return;
    setError("");
    setResult(null);
    try {
      const scanner = await ensureScanner();
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1 },
        (decodedText) => validateCode(decodedText),
        () => {}
      );
      runningRef.current = true;
      setCameraRunning(true);
    } catch {
      setError("Impossible d’ouvrir la caméra. Autorisez son accès ou importez une photo du QR code.");
    }
  };

  const scanImage = async (file) => {
    if (!file || !selectedEvent) return;
    setError("");
    setResult(null);
    await stopCamera();
    try {
      const scanner = await ensureScanner();
      const decodedText = await scanner.scanFile(file, true);
      await validateCode(decodedText);
    } catch {
      setError("Aucun code QR lisible n’a été détecté dans cette image.");
    }
  };

  const registeredCount = registrations.filter((item) => item.status === "registered").length;
  const attendedCount = registrations.filter((item) => item.attended).length;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-[#080d1b] p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div><span className="inline-flex items-center gap-2 rounded-full bg-emerald-300/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-emerald-200"><SearchCheck className="h-4 w-4" /> Contrôle d’accès</span><h2 className="mt-5 text-3xl font-black tracking-tight">Scanner les billets sans confondre les événements.</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">Sélectionnez d’abord l’événement. Un billet lié à un autre événement sera automatiquement refusé.</p></div>
          <label><span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-400">Événement contrôlé</span><select value={selectedEvent ? eventKey(selectedEvent) : ""} onChange={(event) => setSelectedKey(event.target.value)} className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold text-white outline-none"><option value="" className="text-slate-900">Choisir un événement</option>{events.map((event) => <option key={eventKey(event)} value={eventKey(event)} className="text-slate-900">{event.title} - {displayDate(event.starts_at)}</option>)}</select></label>
        </div>
      </section>

      {!selectedEvent ? <div className="portal-empty">Créez ou rattachez un événement avant d’utiliser le contrôle QR.</div> : (
        <div className="grid gap-6 xl:grid-cols-[minmax(20rem,0.78fr)_minmax(0,1.22fr)]">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Scanner</p><h3 className="mt-1 text-2xl font-black text-slate-950">Billet étudiant</h3><p className="mt-2 text-sm leading-6 text-slate-500">Caméra, image depuis la galerie ou identifiant manuel.</p></div><QrCode className="h-8 w-8 text-emerald-600" /></div>
            <div id={readerId} className="mt-6 min-h-10 overflow-hidden rounded-2xl bg-slate-950" />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={cameraRunning ? stopCamera : startCamera} disabled={checking} className="portal-primary-button justify-center">{cameraRunning ? <><CameraOff className="h-4 w-4" /> Arrêter</> : <><Camera className="h-4 w-4" /> Ouvrir la caméra</>}</button>
              <label className="portal-secondary-button cursor-pointer justify-center"><ImageUp className="h-4 w-4" /> Importer une image<input type="file" accept="image/*" capture="environment" className="hidden" onChange={(event) => { scanImage(event.target.files?.[0]); event.target.value = ""; }} /></label>
            </div>
            <div className="mt-4 flex gap-2"><input value={manualValue} onChange={(event) => setManualValue(event.target.value)} className="portal-input min-w-0" placeholder="Coller l’URL ou l’identifiant du billet" /><button type="button" onClick={() => validateCode(manualValue)} disabled={checking || !manualValue.trim()} className="portal-secondary-button shrink-0 !px-4" aria-label="Vérifier le billet">{checking ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <SearchCheck className="h-4 w-4" />}</button></div>

            {error && <div className="mt-5 flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" /><span>{error}</span></div>}
            {result && !result.valid && <div className="mt-5 flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" /><div><strong className="block">Billet refusé</strong><span className="mt-1 block">Cet étudiant n’est pas inscrit à l’événement sélectionné ou son inscription a été annulée.</span></div></div>}
            {result?.valid && <div className={`mt-5 rounded-2xl border p-5 ${result.status === "already_checked_in" ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}><div className="flex items-start gap-3"><CheckCircle2 className={`mt-0.5 h-6 w-6 shrink-0 ${result.status === "already_checked_in" ? "text-amber-600" : "text-emerald-600"}`} /><div><strong className="text-slate-950">{result.status === "already_checked_in" ? "Présence déjà validée" : "Présence confirmée"}</strong><p className="mt-1 text-lg font-black text-slate-950">{result.full_name}</p><p className="mt-1 text-sm text-slate-600">{[result.level, result.specialty].filter(Boolean).join(" - ") || result.email}</p><p className="mt-2 text-xs text-slate-500">{result.event_title}</p></div></div></div>}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Suivi en direct</p><h3 className="mt-1 text-2xl font-black text-slate-950">Liste des inscrits</h3><p className="mt-2 text-sm text-slate-500">{registeredCount} inscription{registeredCount !== 1 ? "s" : ""} - {attendedCount} présence{attendedCount !== 1 ? "s" : ""} confirmée{attendedCount !== 1 ? "s" : ""}</p></div><button type="button" onClick={loadRegistrations} className="portal-secondary-button !py-2"><RefreshCw className={`h-4 w-4 ${loadingList ? "animate-spin" : ""}`} /> Actualiser</button></div>
            <div className="mt-6 space-y-3">
              {registrations.map((registration) => <article key={registration.user_id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${registration.attended ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{registration.attended ? <UserCheck className="h-5 w-5" /> : <Users className="h-5 w-5" />}</span><div className="min-w-0 flex-1"><h4 className="truncate font-black text-slate-950">{registration.full_name}</h4><p className="mt-1 truncate text-xs text-slate-500">{[registration.level, registration.specialty].filter(Boolean).join(" - ") || registration.email}</p></div><div className="sm:text-right"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${registration.attended ? "bg-emerald-100 text-emerald-700" : registration.status === "registered" ? "bg-cyan-50 text-cyan-700" : "bg-rose-50 text-rose-700"}`}>{registration.attended ? "Présent" : registration.status === "registered" ? "Inscrit" : "Annulé"}</span><p className="mt-1 text-[11px] text-slate-400">{registration.attended ? displayDate(registration.checked_in_at) : displayDate(registration.registered_at)}</p></div></article>)}
              {!loadingList && registrations.length === 0 && <div className="portal-empty !py-10">Aucune inscription pour cet événement.</div>}
              {loadingList && <div className="flex justify-center py-10"><LoaderCircle className="h-6 w-6 animate-spin text-cyan-600" /></div>}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
