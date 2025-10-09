import z from "zod";

export type RecipeSchema = z.infer<typeof recipeSchema>;

export const recipeSchema = z.object({
  starter: z.coerce.number(),
  wheat: z.coerce.number(),
  water: z.coerce.number(),
  salt: z.coerce.number(),
  rye: z.coerce.number(),
  startDate: z.coerce.date(),
});
