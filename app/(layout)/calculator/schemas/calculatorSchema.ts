import z from "zod";

export const calculatorSchema = z.object({
  flourGrams: z.coerce.number().min(1),
  hydrationLevel: z.coerce.number().min(50).max(100),
  saltLevel: z.coerce.number().min(1).max(5),
  ryeLevel: z.coerce.number().min(0).max(100),
  starterLevel: z.coerce.number().min(0).max(100),
  startDate: z.string(),
});
