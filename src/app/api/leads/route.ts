import { NextResponse } from "next/server";
import { groq } from "@/lib/groq";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, company, budget, problem } = await req.json();

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a lead qualification assistant for a B2B SaaS. Score the lead as HOT (budget ₹50k+, clear pain), WARM (mid budget or vague problem), or COLD (low budget, unclear need). Respond ONLY with valid JSON: { "score": "HOT"|"WARM"|"COLD", "score_reason": "reason string", "email_subject": "subject string", "email_body": "body string" }`
        },
        {
          role: "user",
          content: `Name: ${name}, Company: ${company}, Budget: ${budget}, Problem: ${problem}`
        }
      ],
      temperature: 0.3,
    });

    const aiResponseText = completion.choices[0]?.message?.content || "{}";
    const aiData = JSON.parse(aiResponseText);
    const { score, score_reason, email_subject, email_body } = aiData;

    // Save lead to Supabase
    const { error: dbError } = await supabaseAdmin
      .from("leads")
      .insert([
        { name, company, budget, problem, email, score, score_reason }
      ]);

    if (dbError) throw dbError;

    // Log Activity
    await supabaseAdmin.from("activity_log").insert([
      {
        type: "lead",
        label: `New lead scored ${score} — ${company} (${budget} budget)`,
        badge: score === "HOT" ? "red" : score === "WARM" ? "yellow" : "gray"
      }
    ]);

    // Send email via Resend
    if (process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL) {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: email,
        subject: email_subject || "Following up on your inquiry",
        text: email_body || "Thanks for reaching out! We'll be in touch soon.",
      });
    } else {
      console.log("Skipping email send: RESEND_API_KEY or RESEND_FROM_EMAIL not set");
    }

    return NextResponse.json({ success: true, score });
  } catch (error) {
    console.error("Lead submission error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
