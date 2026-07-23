import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  await clearAuthCookie();
  return NextResponse.json({ message: "Logged out" }, { status: 200 });
}
