import { z } from "zod";

export const createTransactionSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  type: z.enum(["INCOME", "EXPENSE"]),
  categoryId: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  date: z.string().datetime().or(z.coerce.date()),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const createBudgetSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  period: z.enum(["WEEK", "MONTH", "YEAR"]),
  categoryId: z.string().min(1, "Category is required"),
  startDate: z.string().datetime().or(z.coerce.date()),
});

export const createRecurringTransactionSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  type: z.enum(["INCOME", "EXPENSE"]),
  categoryId: z.string().min(1, "Category is required"),
  frequency: z.enum(["WEEKLY", "MONTHLY", "YEARLY"]),
  description: z.string().optional(),
  nextDate: z.string().datetime().or(z.coerce.date()),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["INCOME", "EXPENSE"]),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type CreateRecurringTransactionInput = z.infer<typeof createRecurringTransactionSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
