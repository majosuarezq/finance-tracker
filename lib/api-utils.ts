import { NextRequest, NextResponse } from "next/server";
import { getAuthToken, verifyToken } from "./auth";
import { ZodError } from "zod";

export async function getAuthenticatedUser(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  if (!token) {
    return null;
  }
  return verifyToken(token);
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

export function notFound(error: string) {
  return NextResponse.json({ error }, { status: 404 });
}

export function serverError(error: string) {
  return NextResponse.json({ error }, { status: 500 });
}

export function zodError(error: ZodError) {
  const issue = error.issues[0];
  return badRequest(issue?.message || "Validation failed");
}
