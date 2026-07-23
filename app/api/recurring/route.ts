import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, badRequest, unauthorized, serverError } from "@/lib/api-utils";
import { createRecurringTransactionSchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return unauthorized();

    const recurring = await prisma.recurringTransaction.findMany({
      where: { userId: user.userId },
      orderBy: { nextDate: "asc" },
    });

    return NextResponse.json(recurring);
  } catch (error) {
    console.error("GET /api/recurring:", error);
    return serverError("Failed to fetch recurring transactions");
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return unauthorized();

    const body = await request.json();
    const parsed = createRecurringTransactionSchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return badRequest(issue?.message || "Validation failed");
    }

    const recurring = await prisma.recurringTransaction.create({
      data: {
        ...parsed.data,
        userId: user.userId,
        nextDate: new Date(parsed.data.nextDate),
      },
    });

    return NextResponse.json(recurring, { status: 201 });
  } catch (error) {
    console.error("POST /api/recurring:", error);
    return serverError("Failed to create recurring transaction");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return unauthorized();

    const body = await request.json();
    const { id, nextDate, lastProcessed } = body;

    if (!id) return badRequest("ID is required");

    const updated = await prisma.recurringTransaction.updateMany({
      where: { id, userId: user.userId },
      data: {
        nextDate: new Date(nextDate),
        lastProcessed: lastProcessed ? new Date(lastProcessed) : undefined,
      },
    });

    if (updated.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/recurring:", error);
    return serverError("Failed to update recurring transaction");
  }
}
