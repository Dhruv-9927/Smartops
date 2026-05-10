import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST() {
  try {
    const { error } = await supabaseAdmin
      .from("invoices")
      .update({ reminder_count: 0, last_reminder_at: null })
      .neq("status", "paid"); // just resetting all to 0 for demo purposes

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
