import type { Ingredient, Recipe } from "~/lib/recipes";

export type ScaledIngredient = { name: string; grams: number; note?: string };

/** Sum of the absolute gram weights of every ingredient flagged as flour. */
export function totalFlourGrams(ingredients: Ingredient[]): number {
  return ingredients
    .filter((ingredient) => ingredient.flour && ingredient.grams != null)
    .reduce((sum, ingredient) => sum + (ingredient.grams ?? 0), 0);
}

/** Grams for a single base yield: absolute amount, or percent of total flour. */
function baseGrams(ingredient: Ingredient, totalFlour: number): number {
  if (ingredient.grams != null) return ingredient.grams;
  if (ingredient.percent != null) return (ingredient.percent / 100) * totalFlour;
  return 0;
}

/** Round to whole grams, keeping one decimal for small (<10 g) amounts. */
export function roundGrams(value: number): number {
  return value < 10 ? Math.round(value * 10) / 10 : Math.round(value);
}

export function scaleIngredients(
  ingredients: Ingredient[],
  defaultYield: number,
  chosenYield: number,
): ScaledIngredient[] {
  const totalFlour = totalFlourGrams(ingredients);
  const factor = chosenYield / defaultYield;

  return ingredients.map((ingredient) => ({
    name: ingredient.name,
    note: ingredient.note,
    grams: roundGrams(baseGrams(ingredient, totalFlour) * factor),
  }));
}

/** The yield unit to show for a count ("1 limpa", "2 limpor"). */
export function yieldUnitFor(recipe: Pick<Recipe, "yieldUnit" | "yieldUnitPlural">, count: number): string {
  return count === 1 ? recipe.yieldUnit : recipe.yieldUnitPlural;
}
