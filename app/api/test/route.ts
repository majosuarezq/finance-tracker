import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("auth-token");
  return NextResponse.json({
    hasCookie: !!token,
    cookie: token?.value ? "exists" : "missing",
  });
}
