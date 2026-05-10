import { NextResponse } from "next/server";
import { groq } from "@/lib/groq";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { customer_name, customer_email, subject, message } = await req.json();

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a support triage assistant. Classify the ticket as: CRITICAL (payment issues, system down, data loss), NORMAL (bugs, feature questions), or LOW (general enquiries, how-to questions). For NORMAL and LOW write a helpful reply. Respond ONLY in JSON: { "urgency": "CRITICAL"|"NORMAL"|"LOW", "ai_response": "response string", "internal_note": "note string" }`
        },
        {
          role: "user",
          content: `Subject: ${subject}\nMessage: ${message}`
        }
      ],
      temperature: 0.2,
    });

    const aiDataText = completion.choices[0]?.message?.content || "{}";
    const aiData = JSON.parse(aiDataText);
    const { urgency, ai_response } = aiData;

    const status = (urgency === "LOW" || urgency === "NORMAL") ? "auto_resolved" : "needs_human";

    // Save ticket
    const { error: dbError } = await supabaseAdmin
      .from("tickets")
      .insert([
        { customer_name, customer_email, subject, message, urgency, ai_response, status }
      ]);

    if (dbError) throw dbError;

    // Log Activity
    await supabaseAdmin.from("activity_log").insert([
      {
        type: "ticket",
        label: `Ticket ${status === "auto_resolved" ? "auto-resolved" : "flagged"} — ${subject}`,
        badge: urgency === "CRITICAL" ? "red" : urgency === "NORMAL" ? "yellow" : "gray"
      }
    ]);

    if (status === "auto_resolved" && process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL) {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: customer_email,
        subject: `Re: ${subject}`,
        text: ai_response || "We have received your ticket and it has been resolved.",
      });
    }

    return NextResponse.json({ success: true, urgency });
  } catch (error) {
    console.error("Ticket submission error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
