import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { loadOverrides } from "@/lib/siteOverrides";
import {
  contactConfirmationTemplate,
  contactFormNotificationTemplate,
} from "@/lib/emailTemplates";
import { generateUserId } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company, person, email, phone, subject, message, lang = "tr" } =
      body;

    // Validation
    if (!company || !person || !email || !phone || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "Tüm alanlar gereklidir" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Geçersiz e-posta adresi" },
        { status: 400 }
      );
    }

    // Load email config (from body first, fallback to localStorage)
    const emailConfigFromBody = body.emailConfig;
    const overrides = loadOverrides();
    const emailConfig = emailConfigFromBody || overrides.emailConfig;

    if (!emailConfig || !emailConfig.recipientEmails?.length) {
      return NextResponse.json(
        { success: false, error: "Mail ayarları yapılandırılmamış" },
        { status: 400 }
      );
    }

    // Create SMTP transporter
    const transporter = nodemailer.createTransport({
      host: emailConfig.smtpHost,
      port: emailConfig.smtpPort,
      secure: emailConfig.smtpPort === 465,
      auth: {
        user: emailConfig.smtpUser,
        pass: emailConfig.smtpPassword,
      },
    });

    // Generate submission ID
    const submissionId = generateUserId().substring(0, 8).toUpperCase();
    const submittedAt = new Date().toLocaleString(
      lang === "tr" ? "tr-TR" : "en-US"
    );

    // Admin notification email
    const adminTemplate = contactFormNotificationTemplate(
      {
        company,
        person,
        email,
        phone,
        subject,
        message,
        submittedAt,
      },
      lang as "tr" | "en"
    );

    // User confirmation email
    const userTemplate = contactConfirmationTemplate(submissionId, lang as "tr" | "en");

    try {
      // Send admin notification
      await transporter.sendMail({
        from: `${emailConfig.fromName || "Axeron"} <${emailConfig.fromEmail}>`,
        to: emailConfig.recipientEmails.join(","),
        subject: adminTemplate.subject,
        html: adminTemplate.html,
      });

      // Send user confirmation
      await transporter.sendMail({
        from: `${emailConfig.fromName || "Axeron"} <${emailConfig.fromEmail}>`,
        to: email,
        subject: userTemplate.subject,
        html: userTemplate.html,
      });
    } catch (sendError: any) {
      console.error("Email send error:", sendError);
      return NextResponse.json(
        {
          success: false,
          error: "E-posta gönderilemedi",
          details: sendError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: lang === "tr" ? "Mesajınız gönderildi" : "Your message has been sent",
        submissionId,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Sunucu hatası",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
