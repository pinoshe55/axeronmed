import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { loadOverrides } from "@/lib/siteOverrides";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const emailConfig = body.emailConfig || loadOverrides().emailConfig;

    if (!emailConfig) {
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

    // Verify connection
    try {
      await transporter.verify();
    } catch (verifyError: any) {
      return NextResponse.json(
        {
          success: false,
          error: "SMTP bağlantı hatası",
          details: verifyError.message,
        },
        { status: 400 }
      );
    }

    // Send test email
    const testEmail = {
      from: `${emailConfig.fromName || "Axeron"} <${emailConfig.fromEmail}>`,
      to: emailConfig.fromEmail,
      subject: "Axeron Admin - Test E-postaı",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #4338ca; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 600;">AXERON MEDICAL</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Admin Panel Test</p>
    </div>

    <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #1f2937; margin-top: 0; font-size: 20px;">Test E-postası Başarılı</h2>

      <p style="color: #1f2937; line-height: 1.6; margin: 20px 0;">
        Bu test e-postası, SMTP ayarlarınızın düzgün çalıştığını göstermektedir.
      </p>

      <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0; font-family: 'Courier New', monospace; font-size: 12px; color: #6b7280;">
        <p style="margin: 5px 0;"><strong>SMTP Host:</strong> ${emailConfig.smtpHost}</p>
        <p style="margin: 5px 0;"><strong>SMTP Port:</strong> ${emailConfig.smtpPort}</p>
        <p style="margin: 5px 0;"><strong>From:</strong> ${emailConfig.fromEmail}</p>
        <p style="margin: 5px 0;"><strong>Gönderme Tarihi:</strong> ${new Date().toLocaleString("tr-TR")}</p>
      </div>

      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        Admin panelindeki mail ayarları başarıyla çalışıyor. Form başvuruları şimdi gönderilebilir.
      </p>
    </div>
  </div>
</body>
</html>
      `,
    };

    await transporter.sendMail(testEmail);

    return NextResponse.json(
      {
        success: true,
        message: "Test e-postası başarıyla gönderildi",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Email test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "E-posta gönderimi başarısız",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
