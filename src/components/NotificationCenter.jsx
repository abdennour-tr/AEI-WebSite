import { useEffect, useRef, useState } from "react";
import { Bell, BellRing, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { notificationsApi } from "@/services/portalApi";

const formatDate = (value) =>
  new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const load = () => notificationsApi.list().then(setItems).catch(() => setItems([]));

  useEffect(() => {
    let cleanup = () => undefined;
    let active = true;
    load();
    notificationsApi
      .subscribe(() => active && load())
      .then((unsubscribe) => {
        if (active) cleanup = unsubscribe;
        else unsubscribe();
      })
      .catch(() => undefined);
    const closeOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", closeOutside);
    return () => {
      active = false;
      cleanup();
      document.removeEventListener("mousedown", closeOutside);
    };
  }, []);

  const unread = items.filter((item) => !item.read_at).length;

  const openNotification = async (item) => {
    if (!item.read_at) {
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, read_at: new Date().toISOString() } : entry));
      notificationsApi.markRead(item.id).catch(() => undefined);
    }
    setOpen(false);
    if (item.link?.startsWith("/")) navigate(item.link);
  };

  const markAllRead = async () => {
    const unreadItems = items.filter((item) => !item.read_at);
    const readAt = new Date().toISOString();
    setItems((current) => current.map((item) => ({ ...item, read_at: item.read_at || readAt })));
    await Promise.allSettled(unreadItems.map((item) => notificationsApi.markRead(item.id)));
  };

  return (
    <div className="relative" ref={containerRef}>
      <button type="button" onClick={() => setOpen((current) => !current)} className="nav-icon-button relative" aria-label={`Notifications${unread ? `, ${unread} non lues` : ""}`}>
        <Bell className="h-5 w-5" />
        {unread > 0 && <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-rose-500 px-1 text-center text-[10px] font-bold leading-4 text-white">{Math.min(unread, 9)}</span>}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <h2 className="font-bold text-slate-900">Notifications</h2>
              <p className="text-xs text-slate-500">Actualisées en temps réel</p>
            </div>
            {unread > 0 && (
              <button type="button" onClick={markAllRead} className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-900">
                <CheckCheck className="h-4 w-4" /> Tout lire
              </button>
            )}
          </div>
          <div className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
            {items.slice(0, 10).map((item) => (
              <button key={item.id} type="button" onClick={() => openNotification(item)} className={`w-full px-4 py-3 text-left transition hover:bg-slate-50 ${item.read_at ? "bg-white" : "bg-sky-50/70"}`}>
                <div className="flex gap-3">
                  <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${item.read_at ? "bg-slate-100 text-slate-500" : "bg-sky-600 text-white"}`}>
                    {item.read_at ? <Bell className="h-4 w-4" /> : <BellRing className="h-4 w-4" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-slate-900">{item.title}</span>
                    {item.body && <span className="mt-1 block line-clamp-2 text-sm leading-5 text-slate-500">{item.body}</span>}
                    <span className="mt-1.5 block text-xs font-semibold text-slate-400">{formatDate(item.created_at)}</span>
                  </span>
                </div>
              </button>
            ))}
            {items.length === 0 && (
              <div className="px-5 py-10 text-center">
                <Bell className="mx-auto h-6 w-6 text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-600">Vous êtes à jour.</p>
                <p className="mt-1 text-xs text-slate-400">Les nouvelles activités apparaîtront ici.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
