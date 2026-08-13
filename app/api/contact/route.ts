import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { escapeHtml, sanitizeHeaderValue } from "@/lib/html";

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json();
  if (!name || !email || !message) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
    });
    // name/email/message are visitor-supplied and go straight into an HTML
    // email body — escape them, or a submission could inject markup (fake
    // links/buttons, hidden text) into what Hiranya reads in her inbox.
    await transporter.sendMail({
      from: `"Anya by Hiranya Website" <${process.env.GMAIL_USER}>`,
      to: "Aanyabyhiranya@gmail.com",
      subject: `New Contact Message from ${sanitizeHeaderValue(String(name))}`,
      html: `<p><strong>Name:</strong> ${escapeHtml(String(name))}</p><p><strong>Email:</strong> ${escapeHtml(String(email))}</p><p><strong>Message:</strong><br/>${escapeHtml(String(message)).replace(/\n/g, "<br/>")}</p>`,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
