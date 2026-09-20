import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  Bot,
  CalendarDays,
  Home,
  LoaderCircle,
  MessageCircleQuestion,
  Send,
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

export default function ChatbotPage() {
  const { session } = useAuth();
  const [messages, setMessages] = useState([welcomeMessage]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesContainerRef = useRef(null);
  const shouldFollowConversationRef = useRef(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

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
              className="h-[500px] space-y-4 overflow-y-auto bg-slate-50/70 p-4 pb-20 overscroll-contain sm:p-6 sm:pb-20"
              aria-live="polite"
            >
              {messages.map((message) => (
              <Motion.div
                key={message.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-[78%] ${
                    message.sender === "user"
                      ? "rounded-br-md bg-sky-600 text-white"
                      : message.error
                        ? "rounded-bl-md border border-rose-200 bg-rose-50 text-rose-800"
                        : message.outside
                          ? "rounded-bl-md border border-amber-200 bg-amber-50 text-amber-950"
                          : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  {message.links?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-200/80 pt-3">
                      {message.links.map((link) => (
                        <a
                          key={`${message.id}-${link.url}`}
                          href={link.url}
                          target={link.url.startsWith("http") ? "_blank" : undefined}
                          rel={link.url.startsWith("http") ? "noreferrer" : undefined}
                          className="inline-flex items-center rounded-lg bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-800 transition hover:bg-sky-100"
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </Motion.div>
              ))}

              {sending && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                    <LoaderCircle className="h-4 w-4 animate-spin text-sky-600" />
                    Recherche dans le portail…
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
