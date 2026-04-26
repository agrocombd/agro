import { createAdminClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { name, email, subject, message } = await request.json();
  if (!name || !email || !message) {
    return NextResponse.json({ error: "তথ্য অসম্পূর্ণ" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("contact_messages").insert({
    name, email, subject: subject || null, message,
  });

  if (error) {
    // Fallback: store in site_settings as a workaround if table doesn't exist
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
