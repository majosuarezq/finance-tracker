import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, badRequest, unauthorized, serverError } from "@/lib/api-utils";
import { createCategorySchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return unauthorized();

    const categories = await prisma.category.findMany({
      where: {
        OR: [{ userId: user.userId }, { userId: null }],
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET /api/categories:", error);
    return serverError("Failed to fetch categories");
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return unauthorized();

    const body = await request.json();
    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return badRequest(issue?.message || "Validation failed");
    }

    const category = await prisma.category.create({
      data: {
        ...parsed.data,
        userId: user.userId,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("POST /api/categories:", error);
    return serverError("Failed to create category");
  }
}
