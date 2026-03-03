import { useState, useRef, useEffect } from "react";
import { Send, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

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
    <div className="space-y-8 lg:p-6 p-2">
      <header className="bg-linear-to-r from-sky-600 to-orange-500 text-white p-6 rounded-xl shadow-lg mb-10">
        <h1 className="text-2xl md:text-3xl font-bold">Chatbot IA Étudiant</h1>
        <p className="mt-2 md:mt-0 text-sm md:text-base opacity-90">
          Posez vos questions et obtenez un résumé intelligent instantané.
        </p>
      </header>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 mt-6 space-y-4 max-w-3xl h-[500px] mx-auto w-full bg-linear-to-r from-sky-200 to-orange-100 rounded-3xl shadow-inner">
        {messages.length === 0 && (
          <p className="text-gray-500 text-center text-lg mt-10">
            La conversation est vide. Commencez à poser vos questions !
          </p>
        )}
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs sm:max-w-md px-4 py-3 rounded-2xl shadow-lg wrap-break-word ${
                msg.sender === "user"
                  ? "bg-linear-to-br from-purple-500 via-pink-400 to-yellow-300 text-white border border-gray-300"
                  : "bg-white text-gray-800 border border-gray-200"
              }`}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="p-4 sm:p-6 mt-6 bg-white shadow-xl flex flex-col sm:flex-row items-center gap-3 max-w-3xl mx-auto w-full rounded-3xl">
        <input
          type="text"
          placeholder="Écrivez votre message ici..."
          className="flex-1 border border-gray-300 rounded-3xl px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-pink-400 transition w-full"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={handleSend}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-3xl flex items-center justify-center transition transform hover:scale-105 flex-1 sm:flex-none"
          >
            <Send size={24} />
          </Button>
          <Button
            onClick={handleClearConversation}
            className="bg-red-500 hover:bg-red-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-3xl flex items-center justify-center transition transform hover:scale-105 flex-1 sm:flex-none"
          >
            <Trash2 size={24} />
          </Button>
        </div>
      </div>
    </div>
  );
}
