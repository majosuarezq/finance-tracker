import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, unauthorized, serverError } from "@/lib/api-utils";

function getDateRange(period: string) {
  const now = new Date();
  const start = new Date();

  if (period === "WEEK") {
    start.setDate(now.getDate() - now.getDay());
  } else if (period === "MONTH") {
    start.setDate(1);
  } else if (period === "YEAR") {
    start.setMonth(0, 1);
  }

  start.setHours(0, 0, 0, 0);
  return { start, end: now };
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return unauthorized();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "MONTH";

    const { start, end } = getDateRange(period);

    const [transactions, budgets, categories] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          userId: user.userId,
          date: { gte: start, lte: end },
        },
        include: { category: true },
      }),
      prisma.budget.findMany({
        where: { userId: user.userId },
        include: { category: true },
      }),
      prisma.category.findMany({
        where: { OR: [{ userId: user.userId }, { userId: null }] },
      }),
    ]);

    const income = transactions
      .filter((t: any) => t.type === "INCOME")
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const expenses = transactions
      .filter((t: any) => t.type === "EXPENSE")
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const balance = income - expenses;

    const categoryBreakdown = categories.map((cat: any) => {
      const spent = transactions
        .filter((t: any) => t.categoryId === cat.id && t.type === "EXPENSE")
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      const budget = budgets.find((b: any) => b.categoryId === cat.id);

      return {
        categoryId: cat.id,
        name: cat.name,
        spent,
        budget: budget?.amount || 0,
        budgetPeriod: budget?.period,
        isExceeded: budget ? spent > budget.amount : false,
      };
    });

    return NextResponse.json({
      period,
      dateRange: { start, end },
      balance,
      income,
      expenses,
      transactionCount: transactions.length,
      categoryBreakdown,
      alerts: categoryBreakdown.filter((c: any) => c.isExceeded),
    });
  } catch (error) {
    console.error("GET /api/dashboard:", error);
    return serverError("Failed to fetch dashboard data");
  }
}
