"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { cn, timeAgo } from "@/lib/utils";

const GUEST_LIMIT = 5;
const USER_LIMIT  = 15;
const STORAGE_KEY = "agro-ai-history";
const LANG_KEY    = "agro-ai-lang";

const QUICK_QUESTIONS = {
  bn: [
    "ধানে পোকা লাগলে কী করব?",
    "টমেটো চাষের সঠিক পদ্ধতি",
    "আলু গাছের পাতা হলুদ হচ্ছে কেন?",
    "শীতকালীন সবজি চাষের সময়সূচি",
    "সার প্রয়োগের নিয়মকানুন",
    "ড্রিপ সেচ পদ্ধতি কীভাবে কাজ করে?",
  ],
  en: [
    "How to deal with rice pests?",
    "How to grow tomatoes properly?",
    "Why are my potato leaves turning yellow?",
    "Winter vegetable farming schedule",
    "How to apply fertilizer correctly?",
    "How does drip irrigation work?",
  ],
};

const T = {
  bn: {
    title:         "Agro কৃষি সহকারী",
    subtitle:      "কৃষি বিশেষজ্ঞ • সবসময় পাশে আছি",
    placeholder:   "কৃষি বিষয়ে প্রশ্ন করুন...",
    placeholderOff:"লগইন করুন...",
    clearBtn:      "মুছুন",
    guestBanner:   (n) => `অতিথি: ${n}/${GUEST_LIMIT} প্রশ্ন ব্যবহার হয়েছে`,
    guestLimitMsg: `অতিথি সীমা শেষ (${GUEST_LIMIT}/দিন)। আরো প্রশ্নের জন্য লগইন করুন।`,
    userLimitMsg:  `আজকের সীমা শেষ (${USER_LIMIT}/দিন)। আগামীকাল আবার চেষ্টা করুন।`,
    loginLink:     "লগইন →",
    welcome:       "কৃষি AI সহকারী",
    welcomeSub:    "যেকোনো কৃষি প্রশ্ন করুন",
    disclaimer:    "AI পরামর্শ সম্পূরক — পেশাদার কৃষিবিদের সাথে পরামর্শ করুন",
    errGeneric:    "দুঃখিত, সাময়িক সমস্যা। আবার চেষ্টা করুন।",
    userBanner:    (n) => `আজ ${n}/${USER_LIMIT} প্রশ্ন করা হয়েছে`,
  },
  en: {
    title:         "Agro Farm Assistant",
    subtitle:      "Agricultural Expert • Always Here",
    placeholder:   "Ask any farming question...",
    placeholderOff:"Please log in...",
    clearBtn:      "Clear",
    guestBanner:   (n) => `Guest: ${n}/${GUEST_LIMIT} questions used today`,
    guestLimitMsg: `Guest limit reached (${GUEST_LIMIT}/day). Log in for more.`,
    userLimitMsg:  `Daily limit reached (${USER_LIMIT}/day). Try again tomorrow.`,
    loginLink:     "Log in →",
    welcome:       "Agro AI Assistant",
    welcomeSub:    "Ask any agriculture question",
    disclaimer:    "AI advice is supplementary — consult a professional agronomist",
    errGeneric:    "Sorry, temporary issue. Please try again.",
    userBanner:    (n) => `Today: ${n}/${USER_LIMIT} questions used`,
  },
};

export default function AIChatClient() {
  const [messages,     setMessages]     = useState([]);
  const [input,        setInput]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [user,         setUser]         = useState(null);
  const [assistant,    setAssistant]    = useState(null);
  const [lang,         setLang]         = useState("bn");
  const [guestCount,   setGuestCount]   = useState(0);
  const [userCount,    setUserCount]    = useState(0);
  const [limitReached, setLimitReached] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const t = T[lang];

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Load saved lang
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === "en" || saved === "bn") setLang(saved);
    } catch {}

    // Load chat history
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      setMessages(saved);
    } catch {}

    // Auth + assistant info
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (data?.user) {
        setUser(data.user);
        const { data: ai } = await supabase
          .from("ai_assistants")
          .select("display_name, assistant_number")
          .eq("user_id", data.user.id)
          .single();
        setAssistant(ai);
        // Fetch today's user count from server
        try {
          const r = await fetch("/api/ai/count");
          if (r.ok) { const d = await r.json(); setUserCount(d.count || 0); }
        } catch {}
      } else {
        // Guest count from localStorage
        try {
          const gc = parseInt(localStorage.getItem("agro-ai-guest-count") || "0");
          setGuestCount(gc);
          if (gc >= GUEST_LIMIT) setLimitReached(true);
        } catch {}
      }
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ── Lang toggle ────────────────────────────────────────────────────────────
  function toggleLang() {
    const next = lang === "bn" ? "en" : "bn";
    setLang(next);
    try { localStorage.setItem(LANG_KEY, next); } catch {}
  }

  // ── History helpers ────────────────────────────────────────────────────────
  function saveHistory(msgs) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-50))); } catch {}
  }
  function clearHistory() {
    setMessages([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }

  // ── Send message ───────────────────────────────────────────────────────────
  async function sendMessage(text) {
    const msg = (text || input).trim();
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
        body: JSON.stringify({ message: msg, history, lang }),
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

      if (!res.ok) throw new Error(data.error || t.errGeneric);

      const aiMsg = { role: "assistant", content: data.reply, timestamp: new Date().toISOString(), cached: data.cached };
      const updated = [...newMessages, aiMsg];
      setMessages(updated);
      saveHistory(updated);

      // Update counters
      if (!user) {
        const newCount = guestCount + 1;
        setGuestCount(newCount);
        try { localStorage.setItem("agro-ai-guest-count", String(newCount)); } catch {}
        if (newCount >= GUEST_LIMIT) setLimitReached(true);
      } else {
        const newCount = userCount + 1;
        setUserCount(newCount);
        if (newCount >= USER_LIMIT) setLimitReached(true);
      }
    } catch {
      const errMsg = { role: "assistant", content: t.errGeneric, timestamp: new Date().toISOString(), isError: true };
      const updated = [...newMessages, errMsg];
      setMessages(updated);
      saveHistory(updated);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  // ── Derived ────────────────────────────────────────────────────────────────
  const assistantName = assistant
    ? `Agro Assistant ${String(assistant.assistant_number || 1).padStart(3, "0")}`
    : t.title;

  const isAtLimit = limitReached;

  return (
    <div className="flex flex-col h-[calc(100vh-var(--bottom-nav-h,0px)-4rem)] lg:h-[calc(100vh-5rem)] max-h-[900px]">

      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-600 text-white px-4 py-3 flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">🌾</div>
          <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-300 border-2 border-green-700" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-sm truncate">{assistantName}</h1>
          <p className="text-[11px] text-green-200">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 text-xs font-bold bg-white/15 hover:bg-white/25 transition-colors rounded-lg px-2.5 py-1.5"
            title={lang === "bn" ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
          >
            <span className="text-base leading-none">{lang === "bn" ? "🇧🇩" : "🇬🇧"}</span>
            <span>{lang === "bn" ? "বাং" : "EN"}</span>
          </button>
          {messages.length > 0 && (
            <button onClick={clearHistory} className="text-xs text-green-200 hover:text-white transition-colors px-2.5 py-1.5 rounded-lg hover:bg-white/10">
              {t.clearBtn}
            </button>
          )}
        </div>
      </div>

      {/* Rate limit banners */}
      {!user && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-2 flex items-center justify-between gap-2">
          <p className="text-xs text-amber-700 dark:text-amber-400">
            {isAtLimit ? t.guestLimitMsg : t.guestBanner(guestCount)}
          </p>
          <Link href="/login" className="text-xs font-bold text-green-600 hover:underline flex-shrink-0">{t.loginLink}</Link>
        </div>
      )}
      {user && userCount > 0 && (
        <div className={cn(
          "border-b px-4 py-1.5 flex items-center justify-between gap-2",
          isAtLimit
            ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
            : "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900"
        )}>
          <p className={cn("text-xs", isAtLimit ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400")}>
            {isAtLimit ? t.userLimitMsg : t.userBanner(userCount)}
          </p>
          <div className="flex gap-0.5 flex-shrink-0">
            {Array.from({ length: USER_LIMIT }).map((_, i) => (
              <div key={i} className={cn("h-1.5 w-1.5 rounded-full", i < userCount ? "bg-green-500" : "bg-slate-200 dark:bg-slate-700")} />
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-8">
            <div className="h-20 w-20 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-5xl">🌾</div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">{t.welcome}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.welcomeSub}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full max-w-md">
              {QUICK_QUESTIONS[lang].map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  disabled={isAtLimit}
                  className="text-left text-xs rounded-xl border border-green-200 dark:border-green-800 bg-white dark:bg-slate-800 p-3 text-slate-700 dark:text-slate-300 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
              <div className="flex-shrink-0 h-8 w-8 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-base">🌾</div>
            )}
            <div className={cn(
              "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
              msg.role === "user"
                ? "bg-green-600 text-white rounded-tr-sm"
                : msg.isError
                ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm rounded-tl-sm"
            )}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p className={cn("text-[10px] mt-1.5 opacity-60", msg.role === "user" ? "text-right" : "")}>
                {timeAgo(msg.timestamp)}
                {msg.cached && " · cached"}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2 justify-start">
            <div className="flex-shrink-0 h-8 w-8 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-base">🌾</div>
            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-5">
                {[0, 150, 300].map(delay => (
                  <span key={delay} className="h-2 w-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                ))}
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
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder={isAtLimit ? t.placeholderOff : t.placeholder}
            disabled={isAtLimit}
            rows={1}
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none min-h-[44px] max-h-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
            onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading || isAtLimit}
            className="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white"
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
        <p className="text-[10px] text-center text-slate-400 mt-2">{t.disclaimer}</p>
      </div>
    </div>
  );
}
