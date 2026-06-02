import { NextRequest, NextResponse } from "next/server";
import { loadOverrides, saveOverrides } from "@/lib/siteOverrides";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı ID gereklidir" },
        { status: 400 }
      );
    }

    // Load overrides
    const overrides = loadOverrides();
    const adminUsers = overrides.adminUsers || [];

    // Find and remove user
    const userIndex = adminUsers.findIndex((u) => u.id === id);
    if (userIndex < 0) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // Remove user
    adminUsers.splice(userIndex, 1);
    overrides.adminUsers = adminUsers;
    saveOverrides(overrides);

    return NextResponse.json(
      { success: true, message: "Kullanıcı silindi" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { success: false, error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
