import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

const GEMINI_API_KEY    = process.env.GEMINI_API_KEY;
const GEMINI_MODEL      = process.env.GEMINI_MODEL || "gemini-2.5-flash-latest";
const GEMINI_URL        = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const GUEST_LIMIT       = 5;
const USER_DAILY_LIMIT  = 15;

// ── System prompts ────────────────────────────────────────────────────────────
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

// ── Gemini call ───────────────────────────────────────────────────────────────
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
      generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 1024, candidateCount: 1 },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH",       threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gemini error ${res.status}`);
  }
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return text || (lang === "en" ? "No response received." : "উত্তর পাওয়া যায়নি।");
}

// ── Rate limit helpers (matches actual table schema) ──────────────────────────
function todayStr() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

async function getRateLimit(adminSupabase, identifier, chat_type = "agro") {
  const { data } = await adminSupabase
    .from("rate_limits")
    .select("id, question_count_day, day_reset_at")
    .eq("identifier", identifier)
    .eq("chat_type", chat_type)
    .eq("platform", "web")
    .single();
  return data;
}

async function upsertRateLimit(adminSupabase, identifier, newCount, chat_type = "agro") {
  const dayReset = new Date();
  dayReset.setUTCHours(24, 0, 0, 0); // midnight UTC

  await adminSupabase.from("rate_limits").upsert({
    identifier,
    identifier_type: identifier.startsWith("guest_") ? "ip" : "user",
    chat_type,
    platform: "web",
    question_count_day: newCount,
    day_reset_at: dayReset.toISOString(),
  }, { onConflict: "identifier,chat_type,platform" });
}

// ── POST handler ──────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json();
    const { message, history = [], lang = "bn" } = body;
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

    const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim()
      || request.headers.get("x-real-ip")
      || "unknown";

    const adminSupabase = createAdminClient();

    // Get auth user (createServerSupabaseClient is async)
    const userSupabase = await createServerSupabaseClient();
    const { data: { user } } = await userSupabase.auth.getUser();

    // ── Rate limiting ──────────────────────────────────────────────────────
    const today = todayStr();

    if (!user) {
      // Guest: 5/day per IP
      const guestId = `guest_${ip}_${today}`;
      const existing = await getRateLimit(adminSupabase, guestId);

      // Check if reset needed (new day)
      const count = existing?.day_reset_at && new Date(existing.day_reset_at) > new Date()
        ? (existing.question_count_day || 0)
        : 0;

      if (count >= GUEST_LIMIT) {
        return NextResponse.json({
          error: language === "en"
            ? `Free limit reached (${GUEST_LIMIT} questions/day). Please log in for more.`
            : `অতিথি হিসেবে দিনে সর্বোচ্চ ${GUEST_LIMIT}টি প্রশ্ন করা যাবে। আরো জানতে লগইন করুন।`,
          limit_reached: true,
          limit_type: "guest",
        }, { status: 429 });
      }
      await upsertRateLimit(adminSupabase, guestId, count + 1);

    } else {
      // Logged-in: 15/day per user
      const userId = `user_${user.id}_${today}`;
      const existing = await getRateLimit(adminSupabase, userId);

      const count = existing?.day_reset_at && new Date(existing.day_reset_at) > new Date()
        ? (existing.question_count_day || 0)
        : 0;

      if (count >= USER_DAILY_LIMIT) {
        return NextResponse.json({
          error: language === "en"
            ? `Daily limit reached (${USER_DAILY_LIMIT} questions/day). Resets at midnight.`
            : `আজকের জন্য সর্বোচ্চ ${USER_DAILY_LIMIT}টি প্রশ্ন করা হয়েছে। আগামীকাল আবার চেষ্টা করুন।`,
          limit_reached: true,
          limit_type: "user",
        }, { status: 429 });
      }
      await upsertRateLimit(adminSupabase, userId, count + 1);
    }

    // ── Cache check ────────────────────────────────────────────────────────
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

    // ── Call Gemini ────────────────────────────────────────────────────────
    const reply = await callGemini(message, history.slice(-6), language);

    // Cache response (30 days)
    await adminSupabase.from("ai_cache").upsert({
      query_hash: cacheKey,
      query_text: message.slice(0, 500),
      response:   reply,
      chat_type:  `agro_${language}`,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }, { onConflict: "query_hash" }).catch(() => {});

    return NextResponse.json({ reply });

  } catch (err) {
    console.error("AI route error:", err.message);
    return NextResponse.json(
      { error: "AI সেবা সাময়িকভাবে অনুপলব্ধ। পরে চেষ্টা করুন।" },
      { status: 503 }
    );
  }
}
