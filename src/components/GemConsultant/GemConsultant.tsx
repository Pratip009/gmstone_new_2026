"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Maximize2,
  Minimize2,
  Send,
  Mic,
  MicOff,
  ChevronLeft,
  ChevronRight,
  Award,
  Sparkles,
  AlertCircle,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface ProductCard {
  _id: string;
  name: string;
  category: string;
  shape: string;
  size: number;
  color: string;
  clarity: string;
  certification: string;
  price: number;
  images: string[];
  stock: number;
  score?: number;
}

interface ComparisonTable {
  attribute: string;
  valueA: string | number;
  valueB: string | number;
  winner: "A" | "B" | "tie";
}

interface ComparisonData {
  productA: ProductCard;
  productB: ProductCard;
  winner: "A" | "B" | "tie";
  reasoning: string;
  table: ComparisonTable[];
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: ProductCard[];
  comparison?: ComparisonData;
  isThinking?: boolean;
  isError?: boolean;
}

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */
const SUGGESTED = [
  "Show me round diamonds under $5,000",
  "Best GIA certified stones right now",
  "I need an engagement ring stone",
  "Compare oval vs cushion cut",
  "What's in stock under 1 carat?",
];

const SESSION_KEY = "gem_consultant_session_id";

function getSessionId(): string {
  if (typeof sessionStorage === "undefined") return crypto.randomUUID();
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/* ─────────────────────────────────────────────
   SSE line parser — handles partial chunks
───────────────────────────────────────────── */
function parseSSELine(line: string): Record<string, unknown> | null {
  if (!line.startsWith("data: ")) return null;
  try {
    return JSON.parse(line.slice(6));
  } catch {
    return null;
  }
}

/* ─────────────────────────────────────────────
   Subcomponents
───────────────────────────────────────────── */

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: "linear-gradient(135deg, #d4a853, #c8843a)" }}
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function GemCard({ product }: { product: ProductCard }) {
  const img = product.images?.[0];
  const certColors: Record<string, string> = {
    GIA: "bg-blue-50 text-blue-700 border-blue-200",
    AGS: "bg-purple-50 text-purple-700 border-purple-200",
    IGI: "bg-emerald-50 text-emerald-700 border-emerald-200",
    GCAL: "bg-rose-50 text-rose-700 border-rose-200",
  };
  const certClass = certColors[product.certification] ?? "bg-gray-50 text-gray-600 border-gray-200";

  return (
    <div
      className="flex-shrink-0 w-48 rounded-2xl overflow-hidden border border-stone-200/80 bg-white group cursor-pointer"
      style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)" }}
    >
      <div className="relative h-40 bg-gradient-to-br from-stone-50 to-amber-50/40 overflow-hidden">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl opacity-30">
            💎
          </div>
        )}
        {product.score !== undefined && (
          <div
            className="absolute top-2.5 right-2.5 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "linear-gradient(135deg, #d4a853, #b8732e)" }}
          >
            {product.score}%
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-3 space-y-2">
        <p className="text-stone-800 text-xs font-semibold leading-snug truncate">{product.name}</p>
        <div className="flex flex-wrap gap-1">
          <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-md font-medium">
            {product.size}ct
          </span>
          <span className="text-[10px] bg-stone-50 text-stone-600 border border-stone-200 px-1.5 py-0.5 rounded-md capitalize">
            {product.shape}
          </span>
          <span className="text-[10px] bg-stone-50 text-stone-600 border border-stone-200 px-1.5 py-0.5 rounded-md">
            {product.color} · {product.clarity}
          </span>
        </div>
        <div className="flex items-center justify-between pt-0.5">
          <span className="text-sm font-bold" style={{ color: "#b8732e" }}>
            ${product.price.toLocaleString()}
          </span>
          <span className={`flex items-center gap-0.5 text-[10px] border px-1.5 py-0.5 rounded-md font-medium ${certClass}`}>
            <Award size={9} />
            {product.certification}
          </span>
        </div>
      </div>
    </div>
  );
}

function ProductCarousel({ products }: { products: ProductCard[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "right" ? 200 : -200, behavior: "smooth" });
  };

  return (
    <div className="relative mt-3">
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white border border-stone-200 rounded-full flex items-center justify-center shadow-sm hover:border-amber-300 hover:text-amber-600 transition-colors"
      >
        <ChevronLeft size={13} />
      </button>
      <div
        ref={scrollRef}
        className="flex gap-2.5 overflow-x-auto px-7 py-1"
        style={{ scrollbarWidth: "none" }}
      >
        {products.map((p) => (
          <GemCard key={p._id} product={p} />
        ))}
      </div>
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white border border-stone-200 rounded-full flex items-center justify-center shadow-sm hover:border-amber-300 hover:text-amber-600 transition-colors"
      >
        <ChevronRight size={13} />
      </button>
    </div>
  );
}

function ComparisonView({ data }: { data: ComparisonData }) {
  return (
    <div className="mt-3 rounded-2xl overflow-hidden border border-stone-200 text-xs bg-white">
      <div className="grid grid-cols-3 bg-gradient-to-r from-stone-50 to-amber-50/30 text-[10px] uppercase tracking-wider font-semibold text-stone-400">
        <div className="p-2.5 border-r border-stone-100">Attribute</div>
        <div className="p-2.5 border-r border-stone-100 text-center truncate text-amber-700">
          {data.productA.name}
        </div>
        <div className="p-2.5 text-center truncate text-amber-700">{data.productB.name}</div>
      </div>
      {data.table.map((row, i) => (
        <div
          key={i}
          className="grid grid-cols-3 border-t border-stone-100 hover:bg-amber-50/30 transition-colors"
        >
          <div className="p-2.5 text-stone-500 border-r border-stone-100">{row.attribute}</div>
          <div
            className={`p-2.5 text-center border-r border-stone-100 font-medium ${
              row.winner === "A" ? "text-amber-700" : "text-stone-400"
            }`}
          >
            {String(row.valueA)}
          </div>
          <div
            className={`p-2.5 text-center font-medium ${
              row.winner === "B" ? "text-amber-700" : "text-stone-400"
            }`}
          >
            {String(row.valueB)}
          </div>
        </div>
      ))}
      <div className="p-3 bg-amber-50/50 border-t border-amber-100 text-amber-800/80 italic text-[11px] leading-relaxed">
        {data.reasoning}
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  if (msg.isThinking) {
    return (
      <div className="flex items-start gap-2.5">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #d4a853 0%, #9a6424 100%)" }}
        >
          <Sparkles size={13} />
        </div>
        <div
          className="rounded-2xl rounded-tl-sm px-4 py-2.5 border border-stone-200"
          style={{ background: "white" }}
        >
          <ThinkingDots />
        </div>
      </div>
    );
  }

  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[78%] text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed"
          style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)" }}
        >
          {msg.content}
        </div>
      </div>
    );
  }

  // Error state
  if (msg.isError) {
    return (
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 bg-red-400">
          <AlertCircle size={13} />
        </div>
        <div className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-red-600 leading-relaxed border border-red-100 bg-red-50">
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5"
        style={{ background: "linear-gradient(135deg, #d4a853 0%, #9a6424 100%)" }}
      >
        <Sparkles size={13} />
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-stone-700 leading-relaxed border border-stone-200 whitespace-pre-wrap"
          style={{ background: "white", fontFamily: "'Georgia', serif" }}
        >
          {msg.content}
        </div>
        {msg.products && msg.products.length > 0 && (
          <ProductCarousel products={msg.products} />
        )}
        {msg.comparison && <ComparisonView data={msg.comparison} />}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Animated FAB pulse ring
───────────────────────────────────────────── */
function PulseRing() {
  return (
    <>
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{ background: "rgba(212,168,83,0.3)" }}
        animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
      />
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{ background: "rgba(212,168,83,0.2)" }}
        animate={{ scale: [1, 1.9], opacity: [0.4, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
      />
    </>
  );
}

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
export default function GemConsultant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sessionId] = useState<string>(() => getSessionId());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [input]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
      };
      const thinkingMsg: ChatMessage = {
        id: "thinking",
        role: "assistant",
        content: "",
        isThinking: true,
      };

      setMessages((prev) => [...prev, userMsg, thinkingMsg]);
      setInput("");
      setIsLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, message: trimmed }),
        });

        if (!res.ok) {
          // Non-2xx before streaming started (e.g. 500 missing API key)
          let errMsg = "Something went wrong. Please try again.";
          try {
            const errBody = await res.json();
            if (errBody.error) errMsg = errBody.error;
          } catch { /* ignore */ }
          throw new Error(errMsg);
        }

        if (!res.body) {
          throw new Error("No response body received.");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let finalMsg: ChatMessage | null = null;

        // Helper to process a single SSE line
        const processLine = (line: string) => {
          const event = parseSSELine(line);
          if (!event) return;

          if (event.type === "response") {
            finalMsg = {
              id: crypto.randomUUID(),
              role: "assistant",
              content: (event.message as string) ?? "",
              products: event.products as ProductCard[] | undefined,
              comparison: event.comparison as ComparisonData | undefined,
            };
          } else if (event.type === "error") {
            finalMsg = {
              id: crypto.randomUUID(),
              role: "assistant",
              content: (event.message as string) ?? "An error occurred.",
              isError: true,
            };
          }
        };

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            // ── Flush remaining buffer on stream end ──
            if (buffer.trim()) {
              for (const line of buffer.split("\n")) {
                processLine(line.trim());
              }
            }
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          // Split on double-newline (SSE event boundary) for robustness
          const parts = buffer.split("\n\n");
          // Last part may be incomplete — keep it in buffer
          buffer = parts.pop() ?? "";

          for (const part of parts) {
            for (const line of part.split("\n")) {
              processLine(line.trim());
            }
          }
        }

        setMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== "thinking");
          if (finalMsg) return [...filtered, finalMsg];
          // Fallback if stream ended without a response event
          return [
            ...filtered,
            {
              id: crypto.randomUUID(),
              role: "assistant" as const,
              content: "I didn't receive a response. Please try again.",
              isError: true,
            },
          ];
        });
      } catch (err) {
        console.error("[GemConsultant]", err);
        const errMessage =
          err instanceof Error ? err.message : "Something went wrong. Please try again.";
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== "thinking");
          return [
            ...filtered,
            {
              id: crypto.randomUUID(),
              role: "assistant" as const,
              content: errMessage,
              isError: true,
            },
          ];
        });
      } finally {
        setIsLoading(false);
        textareaRef.current?.focus();
      }
    },
    [isLoading, sessionId]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const toggleVoice = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    const SR = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SR) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec: any = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput((prev: string) => prev + (prev ? " " : "") + transcript);
    };
    rec.onend = () => setIsListening(false);
    rec.start();
    recognitionRef.current = rec;
    setIsListening(true);
  };

  const panelClass = isFullscreen
    ? "fixed inset-0 z-[9999] flex flex-col"
    : "fixed bottom-24 right-5 z-[9999] w-[430px] max-w-[calc(100vw-2rem)] h-[620px] max-h-[calc(100vh-8rem)] flex flex-col rounded-3xl overflow-hidden";

  return (
    <>
      {/* FAB */}
      <div className="fixed bottom-5 right-5 z-[9998]">
        <motion.button
          onClick={() => setIsOpen((v) => !v)}
          className="relative w-14 h-14 rounded-full flex items-center justify-center text-white"
          style={{
            background: isOpen
              ? "linear-gradient(135deg, #1a1a1a, #2d2d2d)"
              : "linear-gradient(135deg, #d4a853 0%, #9a6424 100%)",
            boxShadow: "0 8px 32px rgba(180,120,40,0.35), 0 2px 8px rgba(0,0,0,0.15)",
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          aria-label="Open Gem Consultant"
        >
          {!isOpen && <PulseRing />}
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X size={20} />
              </motion.span>
            ) : (
              <motion.span
                key="gem"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center"
              >
                <Sparkles size={18} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* AI label tooltip when closed */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: 1.5, duration: 0.3 }}
              className="absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap bg-white border border-stone-200 text-stone-700 text-xs font-medium px-3 py-1.5 rounded-full pointer-events-none"
              style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
            >
              ✦ Ask Victoria
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="gem-panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            className={panelClass}
            style={{
              background: "#fafaf8",
              boxShadow: "0 32px 80px rgba(0,0,0,0.16), 0 4px 16px rgba(0,0,0,0.08)",
              border: "1px solid rgba(212,168,83,0.2)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-3.5 flex-shrink-0 border-b border-stone-100"
              style={{ background: "linear-gradient(135deg, #ffffff 0%, #fffdf5 100%)" }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                    style={{ background: "linear-gradient(135deg, #d4a853 0%, #9a6424 100%)" }}
                  >
                    <Sparkles size={15} />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
                </div>
                <div>
                  <p
                    className="text-sm font-semibold text-stone-800 leading-none"
                    style={{ fontFamily: "'Georgia', serif", letterSpacing: "0.01em" }}
                  >
                    Victoria
                  </p>
                  <p className="text-[10px] text-amber-600/80 uppercase tracking-[0.12em] mt-0.5 font-medium">
                    AI Gem Consultant
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className="hidden sm:flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border"
                  style={{
                    background: "linear-gradient(135deg, #f8f4ec, #fef9ee)",
                    borderColor: "rgba(212,168,83,0.3)",
                    color: "#9a6424",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  GPT-4o
                </div>
                <button
                  onClick={() => setIsFullscreen((v) => !v)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
              style={{ background: "#f8f7f4" }}
            >
              {/* Welcome state */}
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-4"
                >
                  <div
                    className="rounded-2xl p-4 border"
                    style={{
                      background: "linear-gradient(135deg, #ffffff 0%, #fffdf5 100%)",
                      borderColor: "rgba(212,168,83,0.2)",
                    }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, #d4a853, #9a6424)" }}
                      >
                        <Sparkles size={13} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
                          Victoria · AI Gem Consultant
                        </p>
                        <p
                          className="text-sm text-stone-700 leading-relaxed"
                          style={{ fontFamily: "'Georgia', serif" }}
                        >
                          Good day. I&apos;m Victoria — your personal gemologist at Alpha Imports.
                          Whether you seek the perfect engagement diamond, a rare coloured stone, or
                          simply need expert guidance on quality and value, I&apos;m at your service.
                        </p>
                      </div>
                    </div>
                    <p
                      className="text-xs text-stone-400 italic ml-11"
                      style={{ fontFamily: "'Georgia', serif" }}
                    >
                      Every recommendation is drawn from live inventory.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest font-medium px-1">
                      Try asking
                    </p>
                    {SUGGESTED.map((q, i) => (
                      <motion.button
                        key={q}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + i * 0.06 }}
                        onClick={() => sendMessage(q)}
                        disabled={isLoading}
                        className="flex items-center gap-2.5 w-full text-left text-xs text-stone-600 bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 hover:border-amber-300 hover:bg-amber-50/50 hover:text-amber-800 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0 group-hover:bg-amber-400 transition-colors"
                          style={{ background: "#d4a853" }}
                        />
                        {q}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: i === messages.length - 1 ? 0 : 0 }}
                >
                  <MessageBubble msg={msg} />
                </motion.div>
              ))}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div
              className="px-3.5 pb-3.5 pt-2.5 flex-shrink-0 border-t border-stone-100"
              style={{ background: "#ffffff" }}
            >
              <div
                className="flex items-end gap-2 rounded-2xl border px-3.5 py-2.5 transition-all focus-within:border-amber-300"
                style={{
                  background: "#fafaf8",
                  borderColor: "rgba(0,0,0,0.1)",
                }}
              >
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about gemstones, quality, pricing…"
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-sm text-stone-700 placeholder-stone-400 resize-none outline-none leading-relaxed disabled:opacity-50"
                  style={{
                    maxHeight: 120,
                    minHeight: 22,
                    fontFamily: "'Georgia', serif",
                  }}
                />
                <div className="flex items-center gap-1.5 flex-shrink-0 pb-0.5">
                  <motion.button
                    onClick={toggleVoice}
                    whileTap={{ scale: 0.9 }}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isListening
                        ? "text-amber-600 bg-amber-50"
                        : "text-stone-400 hover:text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                  </motion.button>
                  <motion.button
                    onClick={() => sendMessage(input)}
                    disabled={isLoading || !input.trim()}
                    whileTap={{ scale: 0.9 }}
                    className="p-1.5 rounded-lg text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: "linear-gradient(135deg, #d4a853, #9a6424)" }}
                  >
                    <Send size={15} />
                  </motion.button>
                </div>
              </div>
              <p className="text-[9px] text-stone-300 text-center mt-1.5 tracking-wide">
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}