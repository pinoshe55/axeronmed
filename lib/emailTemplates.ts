/**
 * Email template generators for various user communications
 */

interface EmailTemplate {
  subject: string;
  html: string;
}

const brandColor = "#4338ca"; // accent color
const textColor = "#1f2937";
const bgColor = "#f9fafb";

/**
 * Welcome email for new admin users
 */
export function welcomeEmailTemplate(
  email: string,
  verificationLink: string,
  lang: "tr" | "en" = "tr"
): EmailTemplate {
  const isLang = {
    subject: lang === "tr" ? "Axeron Admin Davetiyesi" : "Axeron Admin Invitation",
    greeting: lang === "tr" ? "Hoş Geldiniz" : "Welcome",
    intro:
      lang === "tr"
        ? "Axeron Medical admin paneline davet edildiniz. Aşağıdaki düğmeyi tıklayarak parolanızı belirleyin."
        : "You have been invited to join Axeron Medical admin panel. Click the button below to set your password.",
    button: lang === "tr" ? "Parolayı Ayarla" : "Set Password",
    footer:
      lang === "tr"
        ? "Bu bağlantı 24 saat geçerlidir. Herhangi bir sorunuz varsa iletişime geçin."
        : "This link expires in 24 hours. If you have any questions, please contact us.",
  };

  return {
    subject: isLang.subject,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: ${bgColor};">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background-color: ${brandColor}; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 600;">AXERON MEDICAL</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Admin Panel</p>
    </div>

    <!-- Content -->
    <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
      <h2 style="color: ${textColor}; margin-top: 0; font-size: 20px;">${isLang.greeting}</h2>

      <p style="color: ${textColor}; line-height: 1.6; margin: 20px 0;">
        ${isLang.intro}
      </p>

      <div style="margin: 30px 0;">
        <a href="${verificationLink}" style="display: inline-block; background-color: ${brandColor}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
          ${isLang.button}
        </a>
      </div>

      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
        ${isLang.footer}
      </p>

      <p style="color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <strong>${email}</strong><br>
        ${lang === "tr" ? "Axeron Medical" : "Axeron Medical"}
      </p>
    </div>
  </div>
</body>
</html>
    `,
  };
}

/**
 * Password reset email
 */
export function passwordResetTemplate(
  resetLink: string,
  lang: "tr" | "en" = "tr"
): EmailTemplate {
  const isLang = {
    subject:
      lang === "tr" ? "Axeron Admin - Parola Sıfırlama" : "Axeron Admin - Password Reset",
    greeting: lang === "tr" ? "Parola Sıfırlama" : "Password Reset",
    intro:
      lang === "tr"
        ? "Parolanızı sıfırlamak için talep aldık. Aşağıdaki düğmeyi tıklayarak yeni bir parola belirleyin."
        : "We received a request to reset your password. Click the button below to set a new password.",
    button: lang === "tr" ? "Parolayı Sıfırla" : "Reset Password",
    footer:
      lang === "tr"
        ? "Bu bağlantı 24 saat geçerlidir. Bu talep siz yapmadıysanız göz ardı edin."
        : "This link expires in 24 hours. If you didn't request this, please ignore this email.",
  };

  return {
    subject: isLang.subject,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: ${bgColor};">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: ${brandColor}; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 600;">AXERON MEDICAL</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Admin Panel</p>
    </div>

    <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
      <h2 style="color: ${textColor}; margin-top: 0; font-size: 20px;">${isLang.greeting}</h2>

      <p style="color: ${textColor}; line-height: 1.6; margin: 20px 0;">
        ${isLang.intro}
      </p>

      <div style="margin: 30px 0;">
        <a href="${resetLink}" style="display: inline-block; background-color: ${brandColor}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
          ${isLang.button}
        </a>
      </div>

      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
        ${isLang.footer}
      </p>
    </div>
  </div>
</body>
</html>
    `,
  };
}

/**
 * Contact form submission confirmation (sent to user)
 */
export function contactConfirmationTemplate(
  submissionId: string,
  lang: "tr" | "en" = "tr"
): EmailTemplate {
  const isLang = {
    subject: lang === "tr" ? "Mesajınız alındı" : "We received your message",
    greeting: lang === "tr" ? "Teşekkür ederiz" : "Thank you",
    intro:
      lang === "tr"
        ? "İletişim formunuz başarıyla alındı. En kısa zamanda size geri dönüş yapacağız."
        : "We have received your message. We will get back to you as soon as possible.",
    referenceId: lang === "tr" ? "Başvuru No" : "Reference ID",
    footer:
      lang === "tr"
        ? "Axeron Medical olarak sizinle iletişim kurmaktan memnuniyet duyarız."
        : "Thank you for contacting Axeron Medical.",
  };

  return {
    subject: isLang.subject,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: ${bgColor};">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: ${brandColor}; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 600;">AXERON MEDICAL</h1>
    </div>

    <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
      <h2 style="color: ${textColor}; margin-top: 0; font-size: 20px;">${isLang.greeting}</h2>

      <p style="color: ${textColor}; line-height: 1.6; margin: 20px 0;">
        ${isLang.intro}
      </p>

      <div style="background-color: ${bgColor}; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          <strong>${isLang.referenceId}:</strong> #${submissionId}
        </p>
      </div>

      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
        ${isLang.footer}
      </p>
    </div>
  </div>
</body>
</html>
    `,
  };
}

/**
 * Contact form submission notification (sent to admin)
 */
export function contactFormNotificationTemplate(
  data: {
    company: string;
    person: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    submittedAt: string;
  },
  lang: "tr" | "en" = "tr"
): EmailTemplate {
  const isLang = {
    emailSubject: lang === "tr" ? "Yeni Form Başvurusu" : "New Contact Form Submission",
    newSubmission: lang === "tr" ? "Yeni Form Başvurusu" : "New Contact Form Submission",
    company: lang === "tr" ? "Şirket" : "Company",
    person: lang === "tr" ? "İsim" : "Name",
    email: lang === "tr" ? "E-posta" : "Email",
    phone: lang === "tr" ? "Telefon" : "Phone",
    subject: lang === "tr" ? "Konu" : "Subject",
    message: lang === "tr" ? "Mesaj" : "Message",
    submittedAt: lang === "tr" ? "Gönderilme Tarihi" : "Submitted",
  };

  return {
    subject: isLang.emailSubject,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: ${bgColor};">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: ${brandColor}; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 600;">${isLang.newSubmission}</h1>
    </div>

    <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">${isLang.company}:</td>
          <td style="padding: 10px 0; color: ${textColor};">${data.company}</td>
        </tr>
        <tr style="border-top: 1px solid #e5e7eb;">
          <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">${isLang.person}:</td>
          <td style="padding: 10px 0; color: ${textColor};">${data.person}</td>
        </tr>
        <tr style="border-top: 1px solid #e5e7eb;">
          <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">${isLang.email}:</td>
          <td style="padding: 10px 0; color: ${textColor};"><a href="mailto:${data.email}" style="color: ${brandColor};">${data.email}</a></td>
        </tr>
        <tr style="border-top: 1px solid #e5e7eb;">
          <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">${isLang.phone}:</td>
          <td style="padding: 10px 0; color: ${textColor};">${data.phone}</td>
        </tr>
        <tr style="border-top: 1px solid #e5e7eb;">
          <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">${isLang.subject}:</td>
          <td style="padding: 10px 0; color: ${textColor};">${data.subject}</td>
        </tr>
        <tr style="border-top: 1px solid #e5e7eb;">
          <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">${isLang.submittedAt}:</td>
          <td style="padding: 10px 0; color: ${textColor};">${data.submittedAt}</td>
        </tr>
      </table>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
        <h3 style="color: ${textColor}; margin: 0 0 10px 0;">${isLang.message}:</h3>
        <p style="color: ${textColor}; line-height: 1.6; white-space: pre-wrap; word-wrap: break-word; margin: 0;">
          ${data.message}
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `,
  };
}
