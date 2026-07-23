import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, badRequest, unauthorized, serverError } from "@/lib/api-utils";
import { createBudgetSchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return unauthorized();

    const budgets = await prisma.budget.findMany({
      where: { userId: user.userId },
      include: { category: true },
    });

    return NextResponse.json(budgets);
  } catch (error) {
    console.error("GET /api/budgets:", error);
    return serverError("Failed to fetch budgets");
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return unauthorized();

    const body = await request.json();
    const parsed = createBudgetSchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return badRequest(issue?.message || "Validation failed");
    }

    const budget = await prisma.budget.create({
      data: {
        ...parsed.data,
        userId: user.userId,
        startDate: new Date(parsed.data.startDate),
      },
      include: { category: true },
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error("POST /api/budgets:", error);
    return serverError("Failed to create budget");
  }
}
