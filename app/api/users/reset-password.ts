import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { loadOverrides, saveOverrides } from "@/lib/siteOverrides";
import {
  generateVerificationToken,
  hashToken,
  getTokenExpirationTime,
} from "@/lib/auth";
import { passwordResetTemplate } from "@/lib/emailTemplates";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { sendReset = true, lang = "tr" } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı ID gereklidir" },
        { status: 400 }
      );
    }

    // Load overrides
    const overrides = loadOverrides();
    const adminUsers = overrides.adminUsers || [];
    const emailConfig = overrides.emailConfig;

    // Find user
    const user = adminUsers.find((u) => u.id === id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    if (sendReset && !emailConfig) {
      return NextResponse.json(
        { success: false, error: "Mail ayarları yapılandırılmamış" },
        { status: 400 }
      );
    }

    if (sendReset && emailConfig) {
      // Generate reset token
      const plainToken = generateVerificationToken();
      const tokenHash = hashToken(plainToken);
      const expiresAt = getTokenExpirationTime(24);

      // Add verification token
      const verificationTokens = overrides.verificationTokens || [];
      verificationTokens.push({
        token: tokenHash,
        email: user.email,
        type: "password_reset",
        expiresAt,
        used: false,
      });

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

      // Generate reset link
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const resetLink = `${baseUrl}/reset-password?token=${encodeURIComponent(plainToken)}&email=${encodeURIComponent(user.email)}`;

      // Send reset email
      const emailTemplate = passwordResetTemplate(resetLink, lang as "tr" | "en");

      try {
        await transporter.sendMail({
          from: `${emailConfig.fromName || "Axeron"} <${emailConfig.fromEmail}>`,
          to: user.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        });
      } catch (sendError: any) {
        console.error("Reset email send error:", sendError);
        return NextResponse.json(
          {
            success: false,
            error: "E-posta gönderilemedi",
            details: sendError.message,
          },
          { status: 500 }
        );
      }

      overrides.verificationTokens = verificationTokens;
      saveOverrides(overrides);
    }

    return NextResponse.json(
      {
        success: true,
        message: sendReset
          ? "Parola sıfırlama e-postası gönderildi"
          : "Parola sıfırlama başlatıldı",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
