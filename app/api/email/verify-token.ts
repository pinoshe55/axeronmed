import { NextRequest, NextResponse } from "next/server";
import { loadOverrides, saveOverrides } from "@/lib/siteOverrides";
import { validateToken, isTokenExpired, hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { token, email, newPassword } = await request.json();

    if (!token || !email) {
      return NextResponse.json(
        { success: false, error: "Token ve e-posta gereklidir" },
        { status: 400 }
      );
    }

    // Load overrides and find token
    const overrides = loadOverrides();
    const verificationTokens = overrides.verificationTokens || [];

    const tokenRecord = verificationTokens.find(
      (t) =>
        t.email.toLowerCase() === email.toLowerCase() && !t.used
    );

    if (!tokenRecord) {
      return NextResponse.json(
        { success: false, error: "Token bulunamadı veya zaten kullanılmış" },
        { status: 404 }
      );
    }

    // Check expiration
    if (isTokenExpired(tokenRecord.expiresAt)) {
      // Mark as used to prevent further attempts
      tokenRecord.used = true;
      saveOverrides(overrides);
      return NextResponse.json(
        { success: false, error: "Token süresi dolmuş" },
        { status: 400 }
      );
    }

    // Validate token
    if (!validateToken(token, tokenRecord.token)) {
      return NextResponse.json(
        { success: false, error: "Geçersiz token" },
        { status: 401 }
      );
    }

    // If password is provided, update it
    if (newPassword) {
      if (newPassword.length < 8) {
        return NextResponse.json(
          { success: false, error: "Parola en az 8 karakter olmalıdır" },
          { status: 400 }
        );
      }

      // Hash new password
      const passwordHash = await hashPassword(newPassword);

      // Update user if exists
      const adminUsers = overrides.adminUsers || [];
      const userIndex = adminUsers.findIndex(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      if (userIndex >= 0) {
        adminUsers[userIndex].passwordHash = passwordHash;
        adminUsers[userIndex].verifiedAt = Date.now();
        overrides.adminUsers = adminUsers;
      }

      // Mark token as used
      tokenRecord.used = true;
      saveOverrides(overrides);

      return NextResponse.json(
        { success: true, message: "Parola başarıyla ayarlandı" },
        { status: 200 }
      );
    }

    // Just validate token without password change
    return NextResponse.json(
      { success: true, message: "Token geçerli" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Verify token error:", error);
    return NextResponse.json(
      { success: false, error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
