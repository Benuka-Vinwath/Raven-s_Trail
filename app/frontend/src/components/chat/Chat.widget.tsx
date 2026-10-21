import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, RotateCcw, Send, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ApiError, chatApi, type ChatMessage } from "../../lib/api";

const STORAGE_KEY = "ravenstrail_chat";

// the conversation survives a refresh for this browser tab only
function loadMessages(): ChatMessage[] {
  try {
    const saved: ChatMessage[] = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]");
    return saved.filter((m) => m.text);
  } catch {
    return [];
  }
}

const STARTERS = ["Easy hikes near Kandy", "Best trail for a sunrise", "Which hike is good for beginners?"];

// turn "[Ella Rock](/trails/ella-rock)" into a real router link; everything else stays plain text
function renderText(text: string) {
  return text.split(/(\[[^\]]+\]\(\/trails\/[a-z0-9-]+\))/g).map((part, i) => {
    const m = part.match(/^\[([^\]]+)\]\((\/trails\/[a-z0-9-]+)\)$/);
    return m ? (
      <Link key={i} to={m[2]} className="font-medium underline underline-offset-2">{m[1]}</Link>
    ) : (
      <span key={i}>{part}</span>
    );
  });
}

export default function ChatWidget() {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
  const [status, setStatus] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* private mode: the chat just won't survive a refresh */
    }
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  function newChat() {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setStatus("");
    setLoading(false);
  }

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || loading) return;
    const history: ChatMessage[] = [...messages, { role: "user", text: clean }];
    setMessages([...history, { role: "assistant", text: "" }]); // the empty reply fills in as text streams
    setInput("");
    setError(null);
    setStatus("");
    setLoading(true);
    const abort = new AbortController();
    abortRef.current = abort;
    try {
      await chatApi.stream(
        history.slice(-12), // only the recent turns
        token,
        {
          onText: (t) =>
            setMessages((prev) => {
              const copy = [...prev];
              const last = copy[copy.length - 1];
              copy[copy.length - 1] = { ...last, text: last.text + t };
              return copy;
            }),
          onStatus: setStatus,
        },
        abort.signal
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      // an answer that never started shouldn't leave an empty bubble behind
      setMessages((prev) => (prev[prev.length - 1]?.role === "assistant" && !prev[prev.length - 1].text ? prev.slice(0, -1) : prev));
      setStatus("");
      setLoading(false);
    }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-ink-900/10 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-pine-950 px-4 py-3 text-white">
            <span className="font-medium">Ask Raven</span>
            <div className="flex items-center gap-3">
              {messages.length > 0 && (
                <button onClick={newChat} aria-label="New chat" title="New chat"><RotateCcw size={16} /></button>
              )}
              <button onClick={() => setOpen(false)} aria-label="Close chat"><X size={18} /></button>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            {messages.length === 0 && (
              <div>
                <p className="text-ink-700">Hi! Ask me about trails, difficulty or seasons.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {STARTERS.map((s) => (
                    <button key={s} onClick={() => send(s)} className="rounded-full border border-ink-900/15 px-3 py-1 text-xs text-ink-700 hover:border-forest-500">{s}</button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (m.role === "assistant" && !m.text ? null : (
              <div key={i} className={m.role === "user" ? "text-right" : ""}>
                <p className={`inline-block max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-left ${m.role === "user" ? "bg-forest-600 text-white" : "bg-parchment-100 text-ink-900"}`}>
                  {m.role === "assistant" ? renderText(m.text) : m.text}
                </p>
              </div>
            )))}
            {loading && !messages[messages.length - 1]?.text && <p className="text-xs text-ink-700/60">{status || "Raven is thinking…"}</p>}
            {error && <p className="text-xs text-clay-700">{error}</p>}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2 border-t border-ink-900/10 p-3">
            <input value={input} onChange={(e) => setInput(e.target.value)} maxLength={1000} placeholder="Ask about a trail…"
              className="min-w-0 flex-1 rounded-xl border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-forest-500" />
            <button type="submit" disabled={loading} aria-label="Send" className="rounded-xl bg-forest-600 px-3 text-white disabled:opacity-50"><Send size={16} /></button>
          </form>
        </div>
      )}

      <button onClick={() => setOpen((o) => !o)} aria-label="Open chat"
        className="fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-forest-600 text-white shadow-xl transition-transform hover:scale-105">
        <MessageCircle size={24} />
      </button>
    </>
  );
}