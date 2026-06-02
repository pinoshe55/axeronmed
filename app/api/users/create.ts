import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { loadOverrides, saveOverrides } from "@/lib/siteOverrides";
import { isValidEmail, generateUserId, generateVerificationToken, hashToken, getTokenExpirationTime } from "@/lib/auth";
import { welcomeEmailTemplate } from "@/lib/emailTemplates";

export async function POST(request: NextRequest) {
  try {
    const { email, lang = "tr" } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "E-posta adresi gereklidir" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Geçersiz e-posta adresi" },
        { status: 400 }
      );
    }

    // Load overrides
    const overrides = loadOverrides();
    const adminUsers = overrides.adminUsers || [];
    const emailConfig = overrides.emailConfig;

    if (!emailConfig) {
      return NextResponse.json(
        { success: false, error: "Mail ayarları yapılandırılmamış" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = adminUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Bu e-posta adresi zaten kayıtlı" },
        { status: 400 }
      );
    }

    // Generate verification token
    const plainToken = generateVerificationToken();
    const tokenHash = hashToken(plainToken);
    const expiresAt = getTokenExpirationTime(24);

    // Add verification token
    const verificationTokens = overrides.verificationTokens || [];
    verificationTokens.push({
      token: tokenHash,
      email,
      type: "email_verify",
      expiresAt,
      used: false,
    });

    // Create new user (unverified)
    const newUser = {
      id: generateUserId(),
      email,
      passwordHash: "", // Will be set after verification
      role: "admin" as const,
      createdAt: Date.now(),
      verifiedAt: null,
      lastLoginAt: null,
    };

    adminUsers.push(newUser);
    overrides.adminUsers = adminUsers;
    overrides.verificationTokens = verificationTokens;

    // Generate verification link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const verificationLink = `${baseUrl}/verify?token=${encodeURIComponent(plainToken)}&email=${encodeURIComponent(email)}`;

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

    // Send welcome email
    const emailTemplate = welcomeEmailTemplate(email, verificationLink, lang as "tr" | "en");

    try {
      await transporter.sendMail({
        from: `${emailConfig.fromName || "Axeron"} <${emailConfig.fromEmail}>`,
        to: email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });
    } catch (sendError: any) {
      // Remove user if email send fails
      overrides.adminUsers = adminUsers.filter((u) => u.id !== newUser.id);
      overrides.verificationTokens = verificationTokens.filter(
        (t) => t.email !== email
      );
      saveOverrides(overrides);

      console.error("Welcome email send error:", sendError);
      return NextResponse.json(
        {
          success: false,
          error: "E-posta gönderilemedi",
          details: sendError.message,
        },
        { status: 500 }
      );
    }

    // Save updated overrides
    saveOverrides(overrides);

    return NextResponse.json(
      {
        success: true,
        message: lang === "tr" ? "Davetiye gönderildi" : "Invitation sent",
        userId: newUser.id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { success: false, error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
