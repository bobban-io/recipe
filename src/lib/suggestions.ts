import type { BuyItem, Shortfall } from "~/lib/buyList";
import type { IngredientCatalog } from "~/lib/catalog";
import { recipeNeeds, type IngredientNeed } from "~/lib/needs";
import type { Recipe } from "~/lib/recipe";

/** An ingredient you have, by its catalog name, with an amount in its entry unit if you gave one. */
export type OnHandIngredient = { ingredient: string; amount?: number };

/** The category filter: true for a recipe that passes. */
export type RecipeFilter = (recipe: Recipe) => boolean;

/** How much of each ingredient is needed, keyed by ingredient name. `recipeNeeds` gives one recipe's. */
export type Needs = ReadonlyMap<string, IngredientNeed>;

/** Needs compared with the on-hand ingredients. */
export type NeedsMatch = {
  /** The on-hand ingredients the needs include, optional ones too, in the order you added them. */
  used: string[];
  /** Needed ingredients that aren't on hand and aren't optional, each with its whole need. */
  missing: BuyItem[];
  /** On-hand ingredients with an amount under a need that isn't optional. They still count as used. */
  shortfalls: Shortfall[];
  /** Optional ingredients that aren't on hand. They're never missing. */
  optionalNotOnHand: string[];
};

/** A recipe that passes the filter and uses at least one on-hand ingredient. */
export type Suggestion = NeedsMatch & {
  recipe: Recipe;
  /** The recipe's needs at its default yield, without staples. */
  needs: Needs;
  /**
   * The most whole yield units your amounts cover, over the on-hand ingredients with an amount that
   * aren't optional in the recipe. Null when there's no such ingredient. Missing ingredients don't
   * limit it.
   */
  largestYield: number | null;
  /** Nothing is missing, and there's no largest yield or it's at least 1. */
  canMakeNow: boolean;
};

/** Amounts this close compare as equal: 2 Ägg against 4 for 12 muffins covers 6, not 5. */
const EPSILON = 1e-9;

/**
 * Compare needs with the on-hand ingredients. Works on any needs map: one recipe's from
 * `recipeNeeds`, or two recipes' added together for a combo. An optional need is never missing and
 * never a shortfall.
 */
export function matchNeeds(needs: Needs, onHand: readonly OnHandIngredient[]): NeedsMatch {
  const have = onHandAmounts(onHand);
  const match: NeedsMatch = {
    used: [...have.keys()].filter((ingredient) => needs.has(ingredient)),
    missing: [],
    shortfalls: [],
    optionalNotOnHand: [],
  };

  for (const { ingredient, unit, amount: need, optional } of needs.values()) {
    if (!have.has(ingredient)) {
      if (optional) match.optionalNotOnHand.push(ingredient);
      else match.missing.push({ ingredient, unit, amount: need });
      continue;
    }
    const amount = have.get(ingredient);
    if (amount != null && !optional && amount + EPSILON < need) {
      match.shortfalls.push({ ingredient, unit, amount: need - amount, have: amount });
    }
  }
  return match;
}

/**
 * The recipes that pass `filter` and use at least one on-hand ingredient, ranked: can make now
 * first, then most on-hand ingredients used, then fewest missing, then title in Swedish order.
 * Amounts are compared with each recipe's needs at its default yield.
 */
export function suggest(
  recipes: readonly Recipe[],
  catalog: IngredientCatalog,
  onHand: readonly OnHandIngredient[],
  filter: RecipeFilter,
): Suggestion[] {
  const suggestions: Suggestion[] = [];
  for (const recipe of recipes) {
    if (!filter(recipe)) continue;
    const needs = recipeNeeds(recipe, catalog);
    const match = matchNeeds(needs, onHand);
    if (match.used.length === 0) continue;

    const largestYield = largestYieldFor(needs, onHand, recipe.defaultYield);
    const canMakeNow = match.missing.length === 0 && (largestYield == null || largestYield >= 1);
    suggestions.push({ ...match, recipe, needs, largestYield, canMakeNow });
  }
  return suggestions.sort((a, b) => compareRanking(a, b) || a.recipe.title.localeCompare(b.recipe.title, "sv"));
}

/** What `compareRanking` reads: a suggestion, or a combo. */
export type Rankable = { canMakeNow: boolean; used: readonly unknown[]; missing: readonly unknown[] };

/**
 * The ranking keys suggestions and combos share, as a sort comparator: can make now first, then
 * most on-hand ingredients used, then fewest missing. Suggestions break a tie by title.
 */
export function compareRanking(a: Rankable, b: Rankable): number {
  return (
    Number(b.canMakeNow) - Number(a.canMakeNow) || b.used.length - a.used.length || a.missing.length - b.missing.length
  );
}

/** Each on-hand ingredient's amount, undefined when none was given, in the order added. */
function onHandAmounts(onHand: readonly OnHandIngredient[]): Map<string, number | undefined> {
  return new Map(onHand.map(({ ingredient, amount }) => [ingredient, amount]));
}

function largestYieldFor(needs: Needs, onHand: readonly OnHandIngredient[], defaultYield: number): number | null {
  const have = onHandAmounts(onHand);
  let largest: number | null = null;
  for (const need of needs.values()) {
    const amount = have.get(need.ingredient);
    if (amount == null || need.optional) continue;
    const units = Math.floor(amount / (need.amount / defaultYield) + EPSILON);
    largest = largest == null ? units : Math.min(largest, units);
  }
  return largest;
}
