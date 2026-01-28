import { CircularProgress } from "@mui/material";
import { ArrowRight, ExternalLink, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { streamChat } from "../services/geminiService";
import { ChatMessage } from "../types";

// Helper component to render Markdown-like text
const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  const renderContent = () => {
    // Split by new lines first
    return text.split("\n").map((line, lineIdx) => {
      if (line.trim() === "") return <br key={lineIdx} />;

      // Split by bold markers (**text**)
      const parts = line.split(/(\*\*.*?\*\*)/g);

      return (
        <p key={lineIdx} className="mb-1 last:mb-0">
          {parts.map((part, partIdx) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={partIdx} className="font-bold text-white">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return <span key={partIdx}>{part}</span>;
          })}
        </p>
      );
    });
  };

  return <>{renderContent()}</>;
};

interface ChatInterfaceProps {
  isOpen: boolean;
  onToggle: (isOpen: boolean) => void;
  pendingMessage?: string;
  onMessageProcessed?: () => void;
  enabled?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  isOpen,
  onToggle,
  pendingMessage,
  onMessageProcessed,
  enabled = true,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      text: "Bienvenido a Merlano. Soy tu asistente virtual. **¿En qué puedo ayudarte hoy?**",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === "Escape") {
        onToggle(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onToggle]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        chatRef.current &&
        !chatRef.current.contains(event.target as Node) &&
        isOpen
      ) {
        onToggle(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onToggle]);

  const processMessage = async (text: string) => {
    if (isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const tempId = (Date.now() + 1).toString();

    // Add a temporary loading message
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        role: "model",
        text: "",
        isThinking: true,
      },
    ]);

    await streamChat(
      messages,
      userMsg.text,
      (text) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId ? { ...msg, text, isThinking: false } : msg
          )
        );
      },
      (fullText, groundingUrls) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId
              ? { ...msg, text: fullText, isThinking: false, groundingUrls }
              : msg
          )
        );
        setIsLoading(false);
      }
    );
  };

  const handleSend = () => {
    if (!input.trim()) return;
    processMessage(input);
    setInput("");
  };

  useEffect(() => {
    if (pendingMessage) {
      processMessage(pendingMessage);
      if (onMessageProcessed) onMessageProcessed();
    }
  }, [pendingMessage]);

  return (
    <div className="fixed bottom-0 right-4 sm:right-8 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div
          ref={chatRef}
          className="mb-4 sm:mb-6 w-[calc(100vw-2rem)] sm:w-[400px] h-[60vh] sm:h-[550px] bg-black border border-zinc-800 shadow-2xl flex flex-col animate-fade-in overflow-hidden"
        >
          {/* Header */}
          <div className="bg-black p-4 flex justify-between items-center border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border border-zinc-700 overflow-hidden bg-zinc-950 p-1.5 flex items-center justify-center rounded-full">
                <img
                  src="https://i.ibb.co/dJgTzQQP/merlano-modified.png"
                  alt="Merlano Assistant"
                  className="w-full h-full object-contain filter grayscale"
                />
              </div>
              <div>
                <h3 className="font-light tracking-[0.2em] text-white text-xs uppercase">
                  Asistente Merlano
                </h3>
                <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5">
                  Gemini 3 Pro Intelligence
                </p>
              </div>
            </div>
            <button
              onClick={() => onToggle(false)}
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <X size={18} strokeWidth={1} />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-6 space-y-6 bg-black custom-scrollbar"
            data-lenis-prevent
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] p-4 text-sm font-light leading-relaxed border break-words ${
                    msg.role === "user"
                      ? "bg-white text-black border-white"
                      : "bg-zinc-950 text-zinc-300 border-zinc-800"
                  }`}
                >
                  {msg.isThinking && msg.text === "" ? (
                    <div className="flex space-x-1 items-center h-4">
                      <div className="w-1 h-1 bg-zinc-500 typing-dot"></div>
                      <div className="w-1 h-1 bg-zinc-500 typing-dot"></div>
                      <div className="w-1 h-1 bg-zinc-500 typing-dot"></div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">
                      {/* Use the formatter here */}
                      <FormattedText text={msg.text} />
                    </div>
                  )}
                </div>

                {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2 max-w-[85%]">
                    {msg.groundingUrls.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] uppercase tracking-wider text-zinc-500 border border-zinc-800 px-2 py-1 hover:border-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
                      >
                        <ExternalLink size={8} />
                        {new URL(url).hostname.replace("www.", "")}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 sm:p-4 bg-black border-t border-zinc-800">
            <div className="relative flex items-center gap-0">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Escribe tu consulta..."
                className="flex-1 bg-zinc-950 text-white text-sm font-light py-2 px-3 sm:py-3 sm:px-4 focus:outline-none focus:ring-1 focus:ring-white border border-zinc-800 placeholder-zinc-600"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className={`p-2 sm:p-3 border-y border-r border-zinc-800 h-full ${
                  isLoading || !input.trim()
                    ? "bg-zinc-900 text-zinc-600"
                    : "bg-white text-black hover:bg-zinc-200 border-white"
                } transition-all duration-200`}
              >
                {isLoading ? (
                  <CircularProgress size={18} sx={{ color: "inherit" }} />
                ) : (
                  <ArrowRight size={18} strokeWidth={1} />
                )}
              </button>
            </div>
            <div className="text-center mt-2">
              <p className="text-[9px] text-zinc-700 uppercase tracking-widest">
                IA Potenciada por ARISE
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && enabled && (
        <button
          onClick={() => onToggle(true)}
          className="bg-black w-16 h-16 flex items-center justify-center shadow-lg border border-zinc-700 hover:border-white transition-all duration-300 mb-6 overflow-hidden p-2.5 rounded-full"
        >
          <img
            src="https://i.ibb.co/dJgTzQQP/merlano-modified.png"
            alt="Chat"
            className="w-full h-full object-contain filter grayscale"
          />
        </button>
      )}
    </div>
  );
};

export default ChatInterface;
