import { NextRequest, NextResponse } from "next/server";
import { loadOverrides } from "@/lib/siteOverrides";
import { verifyPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email ve şifre gereklidir" },
        { status: 400 }
      );
    }

    // Load admin users from localStorage (via client-side context)
    // For now, we'll return an error since this needs proper session handling
    // In production, admin data would come from a database or secure storage

    // TODO: This should be called from context or a secure backend
    const overrides = loadOverrides();
    const adminUsers = overrides.adminUsers || [];

    // Find user by email (case-insensitive)
    const user = adminUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Hatalı e-posta veya şifre" },
        { status: 401 }
      );
    }

    // Verify password
    const passwordValid = await verifyPassword(password, user.passwordHash);
    if (!passwordValid) {
      return NextResponse.json(
        { success: false, error: "Hatalı e-posta veya şifre" },
        { status: 401 }
      );
    }

    // Create response with user data (without password hash)
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );

    // Set session cookie (7 days)
    response.cookies.set("auth_session", JSON.stringify({ userId: user.id }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
