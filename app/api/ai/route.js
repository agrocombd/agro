import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL   = process.env.GEMINI_MODEL || "gemini-2.5-flash-latest";
const GEMINI_URL     = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const GUEST_LIMIT    = 5;
const USER_DAILY_LIMIT = 15;

// ── System prompts (bilingual) ──────────────────────────────────────────────
const SYSTEM_PROMPT_BN = `তুমি Agro.com.bd-এর কৃষি সহকারী। বাংলাদেশের কৃষি, শাকসবজি, ফলমূল, ফসল, সার, বীজ, কীটনাশক, সেচ, কৃষি যন্ত্রপাতি ও কৃষি ব্যবসা নিয়ে সাহায্য করো।

নিয়মাবলী:
- সবসময় বাংলায় উত্তর দাও (প্রয়োজনে ইংরেজি প্রযুক্তিগত শব্দ ব্যবহার করা যাবে)
- সহজ, বোধগম্য ও বন্ধুত্বপূর্ণ ভাষায় কথা বলো
- শুধুমাত্র কৃষি বিষয়ক প্রশ্নের উত্তর দাও — অন্য বিষয়ে বিনয়ের সাথে প্রত্যাখ্যান করো
- ক্ষতিকর, বেআইনি বা অনৈতিক পরামর্শ দেবে না
- বৈজ্ঞানিক তথ্য সঠিকভাবে উপস্থাপন করো
- বাংলাদেশের আবহাওয়া, মাটি ও স্থানীয় কৃষি পদ্ধতি অনুযায়ী পরামর্শ দাও
- সংক্ষিপ্ত ও কার্যকর উত্তর দাও`;

const SYSTEM_PROMPT_EN = `You are the agricultural assistant of Agro.com.bd. Help users with Bangladesh agriculture, vegetables, fruits, crops, fertilizers, seeds, pesticides, irrigation, farm equipment, and agribusiness.

Rules:
- Always respond in English
- Use simple, friendly and accessible language
- Only answer agriculture-related questions — politely decline others
- Never provide harmful, illegal or unethical advice
- Present scientific information accurately
- Give advice suited to Bangladesh's climate, soil and local farming methods
- Keep answers concise and practical`;

// ── Gemini API call ──────────────────────────────────────────────────────────
async function callGemini(message, history = [], lang = "bn") {
  const systemPrompt = lang === "en" ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_BN;
  const contents = [
    ...history.map(m => ({ role: m.role, parts: [{ text: m.content }] })),
    { role: "user", parts: [{ text: message }] },
  ];

  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
        candidateCount: 1,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH",       threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Gemini API error");
  }
  const data = await res.json();
  const text  = data.candidates?.[0]?.content?.parts?.[0]?.text;
  const fallback = lang === "en" ? "No response received." : "উত্তর পাওয়া যায়নি।";
  return text || fallback;
}

// ── Rate limit helpers ───────────────────────────────────────────────────────
function todayKey() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

async function getGuestCount(adminSupabase, ip) {
  const key = `guest_${ip}_${todayKey()}`;
  const { data } = await adminSupabase
    .from("rate_limits")
    .select("question_count_day")
    .eq("identifier", key)
    .single();
  return { key, count: data?.question_count_day || 0 };
}

async function incrementGuestCount(adminSupabase, key, current) {
  await adminSupabase.from("rate_limits").upsert(
    { identifier: key, identifier_type: "ip", question_count_day: current + 1,
      day_reset_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() },
    { onConflict: "identifier" }
  );
}

async function getUserCount(adminSupabase, userId) {
  const key = `user_${userId}_${todayKey()}`;
  const { data } = await adminSupabase
    .from("rate_limits")
    .select("question_count_day")
    .eq("identifier", key)
    .single();
  return { key, count: data?.question_count_day || 0 };
}

async function incrementUserCount(adminSupabase, key, current) {
  await adminSupabase.from("rate_limits").upsert(
    { identifier: key, identifier_type: "user", question_count_day: current + 1,
      day_reset_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() },
    { onConflict: "identifier" }
  );
}

// ── POST handler ─────────────────────────────────────────────────────────────
export async function POST(request) {
  const { message, history = [], lang = "bn" } = await request.json();
  const language = lang === "en" ? "en" : "bn";

  if (!message?.trim()) {
    return NextResponse.json(
      { error: language === "en" ? "Message is empty." : "বার্তা খালি।" },
      { status: 400 }
    );
  }

  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: language === "en" ? "AI service not configured." : "AI সেবা কনফিগার করা হয়নি।" },
      { status: 503 }
    );
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";

  const adminSupabase = createAdminClient();
  const userSupabase  = createServerSupabaseClient();
  const { data: { user } } = await userSupabase.auth.getUser();

  // ── Rate limiting ──────────────────────────────────────────────────────────
  if (!user) {
    // Guest: 5 questions per day per IP
    const { key, count } = await getGuestCount(adminSupabase, ip);
    if (count >= GUEST_LIMIT) {
      return NextResponse.json({
        error: language === "en"
          ? `Free limit reached (${GUEST_LIMIT} questions/day). Please log in for more.`
          : `অতিথি হিসেবে দিনে সর্বোচ্চ ${GUEST_LIMIT}টি প্রশ্ন করা যাবে। আরো জানতে লগইন করুন।`,
        limit_reached: true,
        limit_type: "guest",
      }, { status: 429 });
    }
    await incrementGuestCount(adminSupabase, key, count);
  } else {
    // Logged-in: 15 questions per day
    const { key, count } = await getUserCount(adminSupabase, user.id);
    if (count >= USER_DAILY_LIMIT) {
      return NextResponse.json({
        error: language === "en"
          ? `Daily limit reached (${USER_DAILY_LIMIT} questions/day). Resets at midnight.`
          : `আজকের জন্য সর্বোচ্চ ${USER_DAILY_LIMIT}টি প্রশ্ন করা হয়েছে। আগামীকাল আবার চেষ্টা করুন।`,
        limit_reached: true,
        limit_type: "user",
      }, { status: 429 });
    }
    await incrementUserCount(adminSupabase, key, count);
  }

  // ── Cache check (cache key includes language) ──────────────────────────────
  const cacheRaw = `${language}:${message.trim().toLowerCase().replace(/\s+/g, " ")}`;
  const cacheKey = Buffer.from(cacheRaw).toString("base64").slice(0, 64);

  const { data: cached } = await adminSupabase
    .from("ai_cache")
    .select("response")
    .eq("query_hash", cacheKey)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (cached?.response) {
    return NextResponse.json({ reply: cached.response, cached: true });
  }

  // ── Call Gemini ────────────────────────────────────────────────────────────
  try {
    const reply = await callGemini(message, history.slice(-6), language);

    // Cache response (30 day expiry)
    await adminSupabase.from("ai_cache").upsert({
      query_hash:  cacheKey,
      query_text:  message.slice(0, 500),
      response:    reply,
      chat_type:   `agro_${language}`,
      expires_at:  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }, { onConflict: "query_hash" });

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Gemini error:", err.message);
    return NextResponse.json({
      error: language === "en"
        ? "AI service temporarily unavailable. Please try again."
        : "AI সেবা সাময়িকভাবে অনুপলব্ধ। পরে চেষ্টা করুন।",
    }, { status: 503 });
  }
}
