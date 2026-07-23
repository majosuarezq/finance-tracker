import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: "Salary", type: "INCOME" },
    { name: "Freelance", type: "INCOME" },
    { name: "Investment", type: "INCOME" },
    { name: "Food", type: "EXPENSE" },
    { name: "Transport", type: "EXPENSE" },
    { name: "Rent", type: "EXPENSE" },
    { name: "Subscriptions", type: "EXPENSE" },
    { name: "Entertainment", type: "EXPENSE" },
    { name: "Utilities", type: "EXPENSE" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { userId_name: { userId: null as any, name: cat.name } },
      update: {},
      create: {
        name: cat.name,
        type: cat.type as any,
        userId: null,
      },
    });
  }

  console.log("Seeding completed");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
