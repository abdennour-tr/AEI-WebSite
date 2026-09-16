import { useState, useRef } from "react";
import { Bot, Send, Sparkles, Trash2 } from "lucide-react";
import { motion as Motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Bonjour ! Je suis votre assistant IA. Comment puis-je vous aider aujourd'hui ?",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    scrollToBottom();

    setTimeout(() => {
      const botReply = {
        id: Date.now() + 1,
        text: `Résumé IA généré pour : "${userMessage.text}"`,
        sender: "bot",
      };
      setMessages((prev) => [...prev, botReply]);
      scrollToBottom();
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const handleClearConversation = () => {
    setMessages([]);
  };

  return (
    <div className="portal-page">
      <PageHeader
        icon={Bot}
        eyebrow="Assistant AEI"
        title="Chatbot étudiant"
        description="Posez une question sur vos cours ou la vie du campus et obtenez une réponse instantanée."
      />

      <section className="mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-950">Assistant AEI</p>
              <p className="text-xs text-emerald-600">Disponible maintenant</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClearConversation}
            className="portal-danger-button px-3 py-2"
            aria-label="Effacer la conversation"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Effacer</span>
          </button>
        </div>

        <div className="h-[460px] space-y-4 overflow-y-auto bg-slate-50/70 p-4 sm:p-6">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center text-slate-500">
              <Bot className="mb-3 h-9 w-9 text-sky-600" />
              <p className="font-semibold text-slate-700">La conversation est vide.</p>
              <p className="mt-1 text-sm">Écrivez votre première question ci-dessous.</p>
            </div>
          )}
          {messages.map((msg) => (
            <Motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-md ${
                  msg.sender === "user"
                    ? "rounded-br-md bg-sky-600 text-white"
                    : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
                }`}
              >
                {msg.text}
              </div>
            </Motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 bg-white p-4 sm:flex-row sm:p-5">
          <input
            type="text"
            placeholder="Écrivez votre message…"
            className="portal-input flex-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <Button
            onClick={handleSend}
            className="portal-primary-button h-auto px-5"
          >
            <Send className="h-4 w-4" /> Envoyer
          </Button>
        </div>
      </section>
    </div>
  );
}
