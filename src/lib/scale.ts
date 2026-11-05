import type { Ingredient, IngredientSection, Recipe, Unit } from "~/lib/recipes";

export type ScaledIngredient = { name: string; amount: number; unit: "g" | Unit; note?: string };
export type ScaledSection = { title?: string; ingredients: ScaledIngredient[] };

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

/** Round kitchen-unit amounts to the nearest quarter (at least ¼), so they read like "1½ dl". */
export function roundToQuarter(value: number): number {
  return Math.max(0.25, Math.round(value * 4) / 4);
}

/** Volume units in millilitres, largest first. */
const VOLUME_ML: [Unit, number][] = [
  ["dl", 100],
  ["msk", 15],
  ["tsk", 5],
  ["krm", 1],
];

/**
 * Scale a kitchen-unit amount. Volumes that would drop below ¼ step down to a
 * smaller measure instead of being rounded up (1/12 of 1 dl → ½ msk, not ¼ dl).
 */
function scaleUnitAmount(amount: number, unit: Unit, factor: number): { amount: number; unit: Unit } {
  let value = amount * factor;
  let index = VOLUME_ML.findIndex(([volumeUnit]) => volumeUnit === unit);
  if (index === -1) return { amount: roundToQuarter(value), unit };

  while (value < 0.25 && index < VOLUME_ML.length - 1) {
    value = (value * VOLUME_ML[index][1]) / VOLUME_ML[index + 1][1];
    index += 1;
  }
  return { amount: roundToQuarter(value), unit: VOLUME_ML[index][0] };
}

function scaleIngredient(ingredient: Ingredient, totalFlour: number, factor: number): ScaledIngredient {
  const { name, note } = ingredient;
  if (ingredient.amount != null && ingredient.unit != null) {
    return { name, note, ...scaleUnitAmount(ingredient.amount, ingredient.unit, factor) };
  }
  return { name, note, unit: "g", amount: roundGrams(baseGrams(ingredient, totalFlour) * factor) };
}

/** Scale every section; baker's percentages use the flour from all sections combined. */
export function scaleSections(
  sections: IngredientSection[],
  defaultYield: number,
  chosenYield: number,
): ScaledSection[] {
  const totalFlour = totalFlourGrams(sections.flatMap((section) => section.ingredients));
  const factor = chosenYield / defaultYield;

  return sections.map(({ title, ingredients }) => ({
    title,
    ingredients: ingredients.map((ingredient) => scaleIngredient(ingredient, totalFlour, factor)),
  }));
}

/** The yield unit to show for a count ("1 limpa", "2 limpor"). */
export function yieldUnitFor(recipe: Pick<Recipe, "yieldUnit" | "yieldUnitPlural">, count: number): string {
  return count === 1 ? recipe.yieldUnit : recipe.yieldUnitPlural;
}
