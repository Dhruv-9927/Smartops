import { NextResponse } from "next/server";
import { groq } from "@/lib/groq";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";
import { differenceInDays } from "date-fns";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  try {
    // Fetch overdue invoices
    const today = new Date().toISOString().split('T')[0];
    
    const { data: invoices, error } = await supabaseAdmin
      .from("invoices")
      .select("*")
      .eq("status", "pending")
      .lt("due_date", today)
      .lt("reminder_count", 3);

    if (error) throw error;
    if (!invoices || invoices.length === 0) {
      return NextResponse.json({ reminders_sent: 0, details: [] });
    }

    const details = [];
    let sentCount = 0;

    for (const invoice of invoices) {
      const daysOverdue = differenceInDays(new Date(), new Date(invoice.due_date));
      
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are a professional accounts assistant. Write a payment reminder email. Reminder 0 = gentle and friendly. Reminder 1 = firm but polite. Reminder 2 = urgent, mention legal action possibility. Respond ONLY in JSON: { "subject": "email subject", "body": "email body" }`
          },
          {
            role: "user",
            content: `Client: ${invoice.client_name}, Amount: ₹${invoice.amount}, Overdue by: ${daysOverdue} days, Reminder number: ${invoice.reminder_count}`
          }
        ],
        temperature: 0.4,
      });

      const aiDataText = completion.choices[0]?.message?.content || "{}";
      const aiData = JSON.parse(aiDataText);
      const { subject, body } = aiData;

      // Send Email
      if (process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL) {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL,
          to: invoice.client_email,
          subject: subject || `Payment Reminder - Overdue by ${daysOverdue} days`,
          text: body || `This is a reminder that your invoice for ₹${invoice.amount} is overdue.`,
        });
      }

      // Update Supabase
      await supabaseAdmin
        .from("invoices")
        .update({ 
          reminder_count: invoice.reminder_count + 1,
          last_reminder_at: new Date().toISOString()
        })
        .eq("id", invoice.id);

      // Log Activity
      await supabaseAdmin.from("activity_log").insert([
        {
          type: "invoice",
          label: `Reminder #${invoice.reminder_count + 1} sent — ${invoice.client_name} (₹${invoice.amount} overdue ${daysOverdue} days)`,
          badge: invoice.reminder_count === 2 ? "red" : invoice.reminder_count === 1 ? "yellow" : "gray"
        }
      ]);

      details.push({ id: invoice.id, client: invoice.client_name, reminder_count: invoice.reminder_count + 1 });
      sentCount++;
    }

    return NextResponse.json({ reminders_sent: sentCount, details });

  } catch (error) {
    console.error("Overdue check error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
