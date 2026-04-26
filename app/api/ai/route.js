import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { sha256, normalizeQuery } from "@/lib/utils";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const GUEST_LIMIT = 5;

// System prompt following Gemini community guidelines
const SYSTEM_PROMPT = `তুমি Agro.com.bd-এর কৃষি সহকারী। তুমি বাংলাদেশের কৃষি, শাকসবজি, ফলমূল, ফসল, সার, বীজ, কীটনাশক, সেচ, কৃষি যন্ত্রপাতি এবং কৃষি ব্যবসা সম্পর্কে বাংলায় সাহায্য করো।

নিয়মাবলী:
- সবসময় বাংলায় উত্তর দাও (ইংরেজি শব্দ প্রয়োজনে ব্যবহার করা যাবে)
- সহজ, বোধগম্য ভাষায় কথা বলো
- কৃষি বিষয়ক প্রশ্নের বাইরে অন্য বিষয়ে উত্তর দেওয়া থেকে বিরত থাকো
- ক্ষতিকর, বেআইনি বা অনৈতিক পরামর্শ দেবে না
- বৈজ্ঞানিক তথ্য সঠিকভাবে উপস্থাপন করো
- স্থানীয় কৃষি পদ্ধতি ও বাংলাদেশের আবহাওয়া অনুযায়ী পরামর্শ দাও`;

async function callGemini(message, history = []) {
  const contents = [
    ...history.map(m => ({ role: m.role, parts: [{ text: m.content }] })),
    { role: "user", parts: [{ text: message }] },
  ];

  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
        candidateCount: 1,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
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
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "উত্তর পাওয়া যায়নি।";
}

export async function POST(request) {
  const { message, history = [] } = await request.json();
  if (!message?.trim()) return NextResponse.json({ error: "বার্তা খালি" }, { status: 400 });

  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const adminSupabase = createAdminClient();

  // Auth check
  const userSupabase = createServerSupabaseClient();
  const { data: { user } } = await userSupabase.auth.getUser();

  // Guest rate limit: 5 questions per IP
  if (!user) {
    const { data: rateData } = await adminSupabase
      .from("rate_limits")
      .select("count,window_start")
      .eq("identifier", `ai_guest_${ip}`)
      .eq("action", "ai_question")
      .single();

    const now = new Date();
    const windowStart = rateData?.window_start ? new Date(rateData.window_start) : null;
    const isNewWindow = !windowStart || (now - windowStart) > 24 * 60 * 60 * 1000;
    const currentCount = isNewWindow ? 0 : (rateData?.count || 0);

    if (currentCount >= GUEST_LIMIT) {
      return NextResponse.json({
        error: `অতিথি হিসেবে দিনে সর্বোচ্চ ${GUEST_LIMIT}টি প্রশ্ন করা যাবে। আরো জানতে লগইন করুন।`,
        limit_reached: true,
      }, { status: 429 });
    }

    // Upsert rate limit
    await adminSupabase.from("rate_limits").upsert({
      identifier: `ai_guest_${ip}`,
      action: "ai_question",
      count: isNewWindow ? 1 : currentCount + 1,
      window_start: isNewWindow ? now.toISOString() : (rateData?.window_start || now.toISOString()),
    }, { onConflict: "identifier,action" });
  }

  // Check cache
  const cacheKey = await sha256(normalizeQuery(message));
  const { data: cached } = await adminSupabase
    .from("ai_cache")
    .select("response")
    .eq("query_hash", cacheKey)
    .single();

  if (cached?.response) {
    return NextResponse.json({ reply: cached.response, cached: true });
  }

  // Call Gemini
  try {
    const reply = await callGemini(message, history.slice(-6)); // last 6 turns for context

    // Cache the response
    await adminSupabase.from("ai_cache").upsert({
      query_hash: cacheKey,
      query: message.slice(0, 500),
      response: reply,
    }, { onConflict: "query_hash" });

    // Log usage
    if (user) {
      await adminSupabase.from("usage_stats").insert({
        user_id: user.id,
        action: "ai_question",
        metadata: { message_length: message.length },
      }).catch(() => {});
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Gemini error:", err.message);
    return NextResponse.json({ error: "AI সেবা সাময়িকভাবে অনুপলব্ধ। পরে চেষ্টা করুন।" }, { status: 503 });
  }
}
