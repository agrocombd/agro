"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { cn, timeAgo } from "@/lib/utils";

const QUICK_QUESTIONS = [
  "ধানে পোকা লাগলে কী করব?",
  "টমেটো চাষের সঠিক পদ্ধতি",
  "আলু গাছের পাতা হলুদ হচ্ছে কেন?",
  "শীতকালীন সবজি চাষের সময়সূচি",
  "সার প্রয়োগের নিয়মকানুন",
  "ড্রিপ সেচ পদ্ধতি কীভাবে কাজ করে?",
];

const STORAGE_KEY = "agro-ai-history";

export default function AIChatClient() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [assistant, setAssistant] = useState(null);
  const [guestCount, setGuestCount] = useState(0);
  const [limitReached, setLimitReached] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Load history from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      setMessages(saved);
    } catch {}

    // Auth check
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (data?.user) {
        setUser(data.user);
        // Fetch assistant info
        const { data: ai } = await supabase
          .from("ai_assistants")
          .select("name,assistant_number")
          .eq("user_id", data.user.id)
          .single();
        setAssistant(ai);
      }
    });

    // Load guest count
    try {
      const gc = parseInt(localStorage.getItem("agro-ai-guest-count") || "0");
      setGuestCount(gc);
      if (gc >= 5) setLimitReached(true);
    } catch {}
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function saveHistory(msgs) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-50)));
    } catch {}
  }

  async function sendMessage(text) {
    const msg = text || input.trim();
    if (!msg || loading || limitReached) return;

    const userMsg = { role: "user", content: msg, timestamp: new Date().toISOString() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    saveHistory(newMessages);
    setInput("");
    setLoading(true);

    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setLimitReached(true);
        const errMsg = { role: "assistant", content: data.error, timestamp: new Date().toISOString(), isError: true };
        const updated = [...newMessages, errMsg];
        setMessages(updated);
        saveHistory(updated);
        return;
      }

      if (!res.ok) throw new Error(data.error || "সমস্যা হয়েছে");

      const aiMsg = { role: "assistant", content: data.reply, timestamp: new Date().toISOString(), cached: data.cached };
      const updated = [...newMessages, aiMsg];
      setMessages(updated);
      saveHistory(updated);

      // Track guest count
      if (!user) {
        const newCount = guestCount + 1;
        setGuestCount(newCount);
        localStorage.setItem("agro-ai-guest-count", String(newCount));
        if (newCount >= 5) setLimitReached(true);
      }
    } catch (err) {
      const errMsg = { role: "assistant", content: "দুঃখিত, সাময়িক সমস্যা। আবার চেষ্টা করুন।", timestamp: new Date().toISOString(), isError: true };
      const updated = [...newMessages, errMsg];
      setMessages(updated);
      saveHistory(updated);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function clearHistory() {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  const assistantName = assistant
    ? `Agro Assistant ${String(assistant.assistant_number).padStart(3, "0")}`
    : "Agro কৃষি সহকারী";

  return (
    <div className="flex flex-col h-[calc(100vh-var(--bottom-nav-h)-4rem)] lg:h-[calc(100vh-5rem)] max-h-[900px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-600 text-white px-4 py-3 flex items-center gap-3">
        <div className="relative">
          <Image src="/ai-icon.png" alt="AI" width={40} height={40} className="rounded-xl" />
          <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-300 border-2 border-green-700" />
        </div>
        <div className="flex-1">
          <h1 className="font-bold text-sm">{assistantName}</h1>
          <p className="text-[11px] text-green-200">কৃষি বিশেষজ্ঞ • সবসময় পাশে আছি</p>
        </div>
        {messages.length > 0 && (
          <button onClick={clearHistory} className="text-xs text-green-200 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10">
            মুছুন
          </button>
        )}
      </div>

      {/* Guest limit banner */}
      {!user && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-2 flex items-center justify-between">
          <p className="text-xs text-amber-700 dark:text-amber-400">
            {limitReached
              ? "অতিথি সীমা শেষ। আরো প্রশ্নের জন্য লগইন করুন।"
              : `অতিথি: ${guestCount}/5 প্রশ্ন ব্যবহার হয়েছে`}
          </p>
          <Link href="/login" className="text-xs font-bold text-green-600 hover:underline">লগইন →</Link>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-8">
            <Image src="/ai-icon.png" alt="AI" width={80} height={80} className="rounded-2xl opacity-80" />
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">কৃষি AI সহকারী</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">যেকোনো কৃষি প্রশ্ন করুন</p>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full max-w-md">
              {QUICK_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="text-left text-xs rounded-xl border border-green-200 dark:border-green-800 bg-white dark:bg-slate-800 p-3 text-slate-700 dark:text-slate-300 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
            {msg.role === "assistant" && (
              <div className="flex-shrink-0 h-8 w-8 rounded-xl overflow-hidden">
                <Image src="/ai-icon.png" alt="AI" width={32} height={32} />
              </div>
            )}
            <div className={cn(
              "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
              msg.role === "user"
                ? "chat-bubble-user"
                : msg.isError
                ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                : "chat-bubble-ai"
            )}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p className={cn("text-[10px] mt-1 opacity-60", msg.role === "user" ? "text-right" : "")}>
                {timeAgo(msg.timestamp)}
                {msg.cached && " · cached"}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2 justify-start">
            <div className="flex-shrink-0 h-8 w-8 rounded-xl overflow-hidden">
              <Image src="/ai-icon.png" alt="AI" width={32} height={32} />
            </div>
            <div className="chat-bubble-ai rounded-2xl px-4 py-3">
              <div className="flex gap-1 items-center h-5">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 p-3">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
            }}
            placeholder={limitReached ? "লগইন করুন..." : "কৃষি বিষয়ে প্রশ্ন করুন..."}
            disabled={limitReached}
            rows={1}
            className="flex-1 input-base resize-none min-h-[44px] max-h-[120px] overflow-y-auto py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ height: "auto" }}
            onInput={e => {
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading || limitReached}
            className="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white"
            aria-label="পাঠান"
          >
            {loading ? (
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
              </svg>
            )}
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-2">
          AI পরামর্শ সম্পূরক — পেশাদার কৃষিবিদের সাথে পরামর্শ করুন
        </p>
      </div>
    </div>
  );
}
