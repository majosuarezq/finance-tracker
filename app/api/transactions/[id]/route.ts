import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, unauthorized, notFound, serverError, badRequest } from "@/lib/api-utils";
import { updateTransactionSchema } from "@/lib/schemas";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return unauthorized();

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: user.userId,
      },
      include: { category: true },
    });

    if (!transaction) return notFound("Transaction not found");
    return NextResponse.json(transaction);
  } catch (error) {
    console.error("GET /api/transactions/[id]:", error);
    return serverError("Failed to fetch transaction");
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return unauthorized();

    const body = await request.json();
    const parsed = updateTransactionSchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return badRequest(issue?.message || "Validation failed");
    }

    const transaction = await prisma.transaction.updateMany({
      where: {
        id,
        userId: user.userId,
      },
      data: {
        ...parsed.data,
        date: parsed.data.date ? new Date(parsed.data.date) : undefined,
      },
    });

    if (transaction.count === 0) return notFound("Transaction not found");

    const updated = await prisma.transaction.findUnique({
      where: { id },
      include: { category: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/transactions/[id]:", error);
    return serverError("Failed to update transaction");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return unauthorized();

    const transaction = await prisma.transaction.deleteMany({
      where: {
        id,
        userId: user.userId,
      },
    });

    if (transaction.count === 0) return notFound("Transaction not found");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/transactions/[id]:", error);
    return serverError("Failed to delete transaction");
  }
}
