import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  export const dynamic = 'force-dynamic'; // Prevent caching
  try {
    // 1. Leads stats
    const { data: leads } = await supabaseAdmin.from("leads").select("score");
    const total_leads = leads?.length || 0;
    const hot_leads = leads?.filter(l => l.score === "HOT").length || 0;
    const warm_leads = leads?.filter(l => l.score === "WARM").length || 0;
    const cold_leads = leads?.filter(l => l.score === "COLD").length || 0;

    // 2. Tickets stats
    const { data: tickets } = await supabaseAdmin.from("tickets").select("urgency, status");
    const total_tickets = tickets?.length || 0;
    const critical_tickets = tickets?.filter(t => t.urgency === "CRITICAL").length || 0;
    const auto_resolved_tickets = tickets?.filter(t => t.status === "auto_resolved").length || 0;

    // 3. Invoices stats
    const today = new Date().toISOString().split('T')[0];
    const { data: invoices } = await supabaseAdmin.from("invoices").select("status, due_date, reminder_count");
    const total_invoices = invoices?.length || 0;
    const overdue_invoices = invoices?.filter(i => i.status === "pending" && i.due_date < today).length || 0;
    const reminders_sent = invoices?.reduce((sum, i) => sum + (i.reminder_count || 0), 0) || 0;

    // 4. Activity feed
    const { data: recent_activity } = await supabaseAdmin
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8);

    return NextResponse.json({
      total_leads,
      hot_leads,
      warm_leads,
      cold_leads,
      total_tickets,
      critical_tickets,
      auto_resolved_tickets,
      total_invoices,
      overdue_invoices,
      reminders_sent,
      recent_activity: recent_activity || []
    });

  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
