import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUpRight,
  Bot,
  CalendarDays,
  Check,
  Copy,
  Home,
  LoaderCircle,
  MessageCircleQuestion,
  Send,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { motion as Motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/hooks/useAuth";

const welcomeMessage = {
  id: "welcome",
  text: "Bonjour ! Je réponds uniquement à partir des informations du portail AEI ENIAD : clubs, cours, événements, marketplace, colocations, projets et opportunités. Que souhaitez-vous trouver ?",
  sender: "bot",
  links: [],
  createdAt: Date.now(),
};

const suggestions = [
  {
    icon: Users,
    label: "Quel club me conseilles-tu ?",
    prompt: "Quel club me conseilles-tu si je m’intéresse à l’intelligence artificielle ?",
  },
  {
    icon: MessageCircleQuestion,
    label: "Cours de CP1 disponibles",
    prompt: "Quels cours de CP1 sont disponibles avec leurs liens de téléchargement ?",
  },
  {
    icon: ShoppingBag,
    label: "Produits informatiques",
    prompt: "Quels produits informatiques sont disponibles dans la marketplace ?",
  },
  {
    icon: CalendarDays,
    label: "Événements à venir",
    prompt: "Quels sont les prochains événements affichés sur le portail ?",
  },
  {
    icon: Home,
    label: "Colocations abordables",
    prompt: "Quelles colocations coûtent moins de 900 DH par mois ?",
  },
];

function buildApiMessages(messages, nextQuestion) {
  return [
    ...messages
      .filter((message) => message.id !== "welcome" && !message.error)
      .map((message) => ({
        role: message.sender === "user" ? "user" : "assistant",
        content: message.text,
      })),
    { role: "user", content: nextQuestion },
  ];
}

function AssistantAnswer({ text }) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const blocks = [];
  let list = [];
  let ordered = false;

  const flushList = () => {
    if (!list.length) return;
    blocks.push({ type: ordered ? "ordered-list" : "list", items: list });
    list = [];
  };

  lines.forEach((line) => {
    const numberedMatch = line.match(/^\d+[.)]\s+(.+)$/);
    const bulletMatch = line.match(/^[•\-–]\s+(.+)$/);
    if (numberedMatch || bulletMatch) {
      const nextOrdered = Boolean(numberedMatch);
      if (list.length && ordered !== nextOrdered) flushList();
      ordered = nextOrdered;
      list.push((numberedMatch || bulletMatch)[1]);
      return;
    }
    flushList();
    blocks.push({
      type: line.endsWith(":") && line.length < 90 ? "heading" : "paragraph",
      text: line,
    });
  });
  flushList();

  return (
    <div className="space-y-3 text-[0.94rem] leading-7 text-slate-700">
      {blocks.map((block, index) => {
        if (block.type === "list" || block.type === "ordered-list") {
          const ListTag = block.type === "ordered-list" ? "ol" : "ul";
          return (
            <ListTag
              key={`${block.type}-${index}`}
              className={`space-y-2 pl-5 ${block.type === "ordered-list" ? "list-decimal" : "list-disc marker:text-sky-500"}`}
            >
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`} className="pl-1">{item}</li>
              ))}
            </ListTag>
          );
        }
        if (block.type === "heading") {
          return <p key={`${block.type}-${index}`} className="font-black text-slate-950">{block.text}</p>;
        }
        return <p key={`${block.type}-${index}`}>{block.text}</p>;
      })}
    </div>
  );
}

function formatMessageTime(value) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value || Date.now()));
}

export default function ChatbotPage() {
  const { session } = useAuth();
  const [messages, setMessages] = useState([welcomeMessage]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesContainerRef = useRef(null);
  const shouldFollowConversationRef = useRef(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState("");

  const scrollConversationToBottom = (behavior = "smooth") => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior });
    shouldFollowConversationRef.current = true;
    setShowScrollButton(false);
  };

  const handleConversationScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const isNearBottom = distanceFromBottom < 72;
    shouldFollowConversationRef.current = isNearBottom;
    setShowScrollButton(!isNearBottom);
  };

  useEffect(() => {
    if (shouldFollowConversationRef.current) {
      window.requestAnimationFrame(() => scrollConversationToBottom());
    } else {
      setShowScrollButton(true);
    }
  }, [messages, sending]);

  const handleSend = async (presetQuestion) => {
    const question = String(presetQuestion ?? input).trim();
    if (!question || sending) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      text: question,
      sender: "user",
      links: [],
      createdAt: Date.now(),
    };
    const apiMessages = buildApiMessages(messages, question);

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({ messages: apiMessages }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "L’assistant n’a pas pu répondre.");
      }

      setMessages((current) => [
        ...current,
        {
          id: `bot-${Date.now()}`,
          text: payload.answer,
          sender: "bot",
          links: payload.links || [],
          outside: payload.scope === "outside",
          createdAt: Date.now(),
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `error-${Date.now()}`,
          text: error.message || "L’assistant est momentanément indisponible.",
          sender: "bot",
          links: [],
          error: true,
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleSend();
  };

  const handleClearConversation = () => {
    if (sending) return;
    shouldFollowConversationRef.current = true;
    setShowScrollButton(false);
    setMessages([welcomeMessage]);
    setInput("");
  };

  const copyAnswer = async (message) => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopiedMessageId(message.id);
      window.setTimeout(() => setCopiedMessageId(""), 1800);
    } catch {
      setCopiedMessageId("");
    }
  };

  return (
    <div className="portal-page">
      <PageHeader
        icon={Bot}
        eyebrow="Assistant du portail"
        title="Assistant AEI"
        description="Trouvez rapidement un club, un cours, un événement, un produit ou une colocation à partir des données du site."
      />

      <section className="mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-950">Assistant AEI ENIAD</p>
                <p className="flex items-center gap-1.5 text-xs text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Connecté aux données du portail
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClearConversation}
              disabled={sending}
              className="portal-danger-button px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Effacer la conversation"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Effacer</span>
            </button>
          </div>

          <div className="relative">
            <div
              ref={messagesContainerRef}
              onScroll={handleConversationScroll}
              className="h-[540px] space-y-6 overflow-y-auto bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.08),_transparent_34%),linear-gradient(to_bottom,_#f8fafc,_#f1f5f9)] p-4 pb-20 overscroll-contain sm:p-6 sm:pb-20"
              aria-live="polite"
            >
              {messages.map((message) => {
                const isUser = message.sender === "user";
                return (
                  <Motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    {!isUser && (
                      <span className={`mt-6 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border shadow-sm ${message.error ? "border-rose-200 bg-rose-50 text-rose-700" : message.outside ? "border-amber-200 bg-amber-50 text-amber-700" : "border-sky-200 bg-white text-sky-700"}`}>
                        {message.error ? <AlertCircle className="h-4 w-4" /> : message.outside ? <ShieldAlert className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                      </span>
                    )}

                    <div className={`min-w-0 ${isUser ? "max-w-[88%] sm:max-w-[72%]" : "max-w-[calc(100%-3rem)] sm:max-w-[86%]"}`}>
                      <div className={`mb-1.5 flex items-center gap-2 px-1 text-[11px] font-semibold ${isUser ? "justify-end text-slate-400" : "text-slate-500"}`}>
                        <span>{isUser ? "Vous" : "Assistant AEI"}</span>
                        <span aria-hidden="true">•</span>
                        <time dateTime={new Date(message.createdAt || Date.now()).toISOString()}>{formatMessageTime(message.createdAt)}</time>
                      </div>

                      {isUser ? (
                        <div className="rounded-2xl rounded-tr-md bg-gradient-to-br from-sky-600 to-blue-700 px-4 py-3.5 text-sm font-medium leading-6 text-white shadow-md shadow-sky-900/10">
                          <p className="whitespace-pre-wrap">{message.text}</p>
                        </div>
                      ) : (
                        <article className={`overflow-hidden rounded-2xl rounded-tl-md border bg-white shadow-sm ${message.error ? "border-rose-200" : message.outside ? "border-amber-200" : "border-slate-200"}`}>
                          <div className={`flex items-center justify-between gap-3 border-b px-4 py-2.5 sm:px-5 ${message.error ? "border-rose-100 bg-rose-50/80" : message.outside ? "border-amber-100 bg-amber-50/80" : "border-slate-100 bg-slate-50/70"}`}>
                            <span className={`inline-flex items-center gap-2 text-xs font-bold ${message.error ? "text-rose-700" : message.outside ? "text-amber-800" : "text-emerald-700"}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${message.error ? "bg-rose-500" : message.outside ? "bg-amber-500" : "bg-emerald-500"}`} />
                              {message.error ? "Réponse indisponible" : message.outside ? "Demande hors périmètre" : "Réponse basée sur le portail"}
                            </span>
                            {!message.error && (
                              <button
                                type="button"
                                onClick={() => copyAnswer(message)}
                                className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-bold text-slate-500 transition hover:bg-white hover:text-sky-700"
                                aria-label="Copier la réponse"
                              >
                                {copiedMessageId === message.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                                <span className="hidden sm:inline">{copiedMessageId === message.id ? "Copié" : "Copier"}</span>
                              </button>
                            )}
                          </div>

                          <div className={`px-4 py-4 sm:px-5 ${message.error ? "text-rose-800" : message.outside ? "text-amber-950" : ""}`}>
                            {message.error || message.outside
                              ? <p className="whitespace-pre-wrap text-sm leading-7">{message.text}</p>
                              : <AssistantAnswer text={message.text} />}

                            {message.links?.length > 0 && (
                              <div className="mt-5 border-t border-slate-100 pt-4">
                                <p className="mb-2.5 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">Ressources utiles</p>
                                <div className="grid gap-2 sm:grid-cols-2">
                                  {message.links.map((link) => {
                                    const external = link.url.startsWith("http");
                                    return (
                                      <a
                                        key={`${message.id}-${link.url}`}
                                        href={link.url}
                                        target={external ? "_blank" : undefined}
                                        rel={external ? "noreferrer" : undefined}
                                        className="group flex items-center justify-between gap-3 rounded-xl border border-sky-100 bg-sky-50/70 px-3.5 py-3 text-sm font-bold text-sky-900 transition hover:border-sky-300 hover:bg-sky-100"
                                      >
                                        <span className="min-w-0 truncate">{link.label}</span>
                                        <ArrowUpRight className="h-4 w-4 shrink-0 text-sky-600 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                      </a>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </article>
                      )}
                    </div>
                  </Motion.div>
                );
              })}

              {sending && (
                <div className="flex items-start gap-3">
                  <span className="mt-6 flex h-9 w-9 items-center justify-center rounded-xl border border-sky-200 bg-white text-sky-700 shadow-sm"><Sparkles className="h-4 w-4" /></span>
                  <div>
                    <div className="mb-1.5 px-1 text-[11px] font-semibold text-slate-500">Assistant AEI • analyse en cours</div>
                    <div className="flex items-center gap-3 rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-500 shadow-sm">
                      <span className="flex gap-1" aria-hidden="true"><span className="h-2 w-2 animate-bounce rounded-full bg-sky-500 [animation-delay:-0.3s]" /><span className="h-2 w-2 animate-bounce rounded-full bg-sky-500 [animation-delay:-0.15s]" /><span className="h-2 w-2 animate-bounce rounded-full bg-sky-500" /></span>
                      Recherche dans les données du portail…
                    </div>
                  </div>
                </div>
              )}
            </div>

            {showScrollButton && (
              <button
                type="button"
                onClick={() => scrollConversationToBottom()}
                className="absolute bottom-4 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-lg transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
                aria-label="Revenir aux derniers messages"
              >
                <ArrowDown className="h-4 w-4" />
                Derniers messages
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 border-t border-slate-200 bg-white p-4 sm:flex-row sm:p-5"
          >
            <label htmlFor="assistant-question" className="sr-only">
              Votre question sur le portail AEI
            </label>
            <input
              id="assistant-question"
              type="text"
              placeholder="Ex. Quels clubs travaillent sur l’IA ?"
              className="portal-input flex-1"
              value={input}
              maxLength={1200}
              disabled={sending}
              onChange={(event) => setInput(event.target.value)}
            />
            <Button
              type="submit"
              disabled={!input.trim() || sending}
              className="portal-primary-button h-auto px-5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Envoyer
            </Button>
          </form>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
              Questions suggérées
            </p>
            <div className="mt-4 space-y-2">
              {suggestions.map((suggestion) => {
                const SuggestionIcon = suggestion.icon;
                return (
                  <button
                    key={suggestion.label}
                    type="button"
                    disabled={sending}
                    onClick={() => handleSend(suggestion.prompt)}
                    className="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-900 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <SuggestionIcon className="h-4 w-4 shrink-0 text-sky-600" />
                    {suggestion.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
            <p className="font-bold">Périmètre protégé</p>
            <p className="mt-1 text-amber-900/80">
              Les questions sans rapport avec le portail sont refusées. Les réponses
              s’appuient uniquement sur les informations disponibles dans le site.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
