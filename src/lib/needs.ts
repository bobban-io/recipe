import { ingredientFor, type EntryUnit, type IngredientCatalog } from "~/lib/catalog";
import { ingredientLines, type IngredientLine, type Recipe } from "~/lib/recipe";
import { totalFlourGrams } from "~/lib/scale";

/** How a line is measured once its unit is set aside: a weight, a volume or a count. */
type Measure = "g" | "ml" | "st";

const ML: Record<"dl" | "msk" | "tsk" | "krm", number> = { dl: 100, msk: 15, tsk: 5, krm: 1 };

/** The entry unit each measure converts to without a factor. */
const SAME_MEASURE: Record<Measure, EntryUnit> = { g: "g", ml: "dl", st: "st" };

export type ConversionFactor = "gramsPerDl" | "gramsPerSt";

/** What converting a line needs to know about its ingredient. Any non-staple `Ingredient` fits. */
type ConvertsTo = { name: string; unit: EntryUnit; gramsPerDl?: number; gramsPerSt?: number };

function measureOf(line: IngredientLine): Measure {
  if (line.grams != null || line.percent != null) return "g";
  return line.unit === "st" ? "st" : "ml";
}

/** The line's amount in grams, ml or a count. `percent` is a share of the recipe's total flour. */
function measuredAmount(line: IngredientLine, totalFlour: number): number {
  if (line.grams != null) return line.grams;
  if (line.percent != null) return (line.percent / 100) * totalFlour;
  const amount = line.amount ?? 0;
  return line.unit == null || line.unit === "st" ? amount : amount * ML[line.unit];
}

/** The factors a line goes through on its way to `unit`, via grams. */
function factorsBetween(measure: Measure, unit: EntryUnit): ConversionFactor[] {
  if (SAME_MEASURE[measure] === unit) return [];
  const factors: ConversionFactor[] = [];
  if (measure !== "g") factors.push(measure === "ml" ? "gramsPerDl" : "gramsPerSt");
  if (unit !== "g") factors.push(unit === "dl" ? "gramsPerDl" : "gramsPerSt");
  return factors;
}

/** The factors the ingredient lacks to convert this line to its entry unit. Empty when it converts. */
export function missingFactors(line: IngredientLine, ingredient: ConvertsTo): ConversionFactor[] {
  return factorsBetween(measureOf(line), ingredient.unit).filter((factor) => ingredient[factor] == null);
}

function factor(ingredient: ConvertsTo, name: ConversionFactor): number {
  const value = ingredient[name];
  if (value == null) throw new Error(`${ingredient.name} has no ${name}`);
  return value;
}

/**
 * A line's amount in its ingredient's entry unit, at the recipe's default yield. A matching
 * measure converts directly (grams stay grams, ml / 100 is dl, a count stays a count); anything
 * else goes through grams with `gramsPerDl` or `gramsPerSt`. Staple lines are never converted.
 * `totalFlour` is the recipe's `totalFlourGrams`, for `percent` lines.
 */
export function lineInEntryUnit(line: IngredientLine, ingredient: ConvertsTo, totalFlour: number): number {
  const measure = measureOf(line);
  const amount = measuredAmount(line, totalFlour);
  if (SAME_MEASURE[measure] === ingredient.unit) return measure === "ml" ? amount / 100 : amount;

  const grams =
    measure === "g"
      ? amount
      : measure === "ml"
        ? (amount / 100) * factor(ingredient, "gramsPerDl")
        : amount * factor(ingredient, "gramsPerSt");
  if (ingredient.unit === "g") return grams;
  return ingredient.unit === "dl" ? grams / factor(ingredient, "gramsPerDl") : grams / factor(ingredient, "gramsPerSt");
}

/** A recipe's need for one ingredient: its lines converted to the entry unit and summed. */
export type IngredientNeed = {
  ingredient: string;
  unit: EntryUnit;
  /** At the recipe's default yield. */
  amount: number;
  /** True when every line using the ingredient in this recipe is optional. */
  optional: boolean;
};

/**
 * What a recipe needs of each ingredient at its default yield, keyed by ingredient name, in the
 * order the recipe first uses each. Staples are left out. Throws on a line the catalog doesn't know
 * or can't convert; `loadRecipes` fails the build on both, so loaded recipes never throw here.
 */
export function recipeNeeds(recipe: Recipe, catalog: IngredientCatalog): ReadonlyMap<string, IngredientNeed> {
  const lines = ingredientLines(recipe);
  const totalFlour = totalFlourGrams(lines);
  const needs = new Map<string, IngredientNeed>();

  for (const line of lines) {
    const ingredient = ingredientFor(catalog, line.name);
    if (!ingredient) throw new Error(`"${line.name}" in ${recipe.slug} isn't in the ingredient catalog`);
    if (ingredient.staple) continue;

    const amount = lineInEntryUnit(line, ingredient, totalFlour);
    const optional = line.optional === true;
    const need = needs.get(ingredient.name);
    if (need) {
      need.amount += amount;
      need.optional &&= optional;
    } else {
      needs.set(ingredient.name, { ingredient: ingredient.name, unit: ingredient.unit, amount, optional });
    }
  }
  return needs;
}
