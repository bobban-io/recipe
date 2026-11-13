import type { BuyItem, Shortfall } from "~/lib/buyList";
import type { IngredientNeed } from "~/lib/needs";
import { compareRanking, matchNeeds, type Needs, type OnHandIngredient, type Suggestion } from "~/lib/suggestions";

/**
 * Two suggestions made together, because between them they use more of your on-hand ingredients
 * than any single suggestion does. Both recipes stay at their default yields.
 */
export type Combo = {
  /** The two suggestions, the higher-ranked first. */
  pair: readonly [Suggestion, Suggestion];
  /** The on-hand ingredients either recipe uses, each once, in the order you added them. */
  used: string[];
  /** Ingredients the pair needs that aren't on hand, each once with both recipes' needs added. */
  missing: BuyItem[];
  /** On-hand ingredients with an amount under both recipes' needs added together. */
  shortfalls: Shortfall[];
  /** Nothing missing and no shortfall. A combo has no largest yield. */
  canMakeNow: boolean;
};

const MAX_COMBOS = 3;

/**
 * The pairs of suggestions that use more on-hand ingredients than the single suggestion that uses
 * the most, best three first. That also means each recipe brings an on-hand ingredient the other
 * doesn't use. `suggestions` are `suggest`'s, so both recipes in a pair pass the category filter.
 * Combos rank by the keys in `compareRanking`, and ties keep the singles' order. Within a pair, the
 * higher-ranked single comes first.
 */
export function suggestCombos(suggestions: readonly Suggestion[], onHand: readonly OnHandIngredient[]): Combo[] {
  const mostUsedBySingle = Math.max(0, ...suggestions.map((suggestion) => suggestion.used.length));
  return suggestions
    .flatMap((first, index) => suggestions.slice(index + 1).map((second) => combine(first, second, onHand)))
    .filter((combo) => combo.used.length > mostUsedBySingle)
    .sort(compareRanking)
    .slice(0, MAX_COMBOS);
}

function combine(first: Suggestion, second: Suggestion, onHand: readonly OnHandIngredient[]): Combo {
  const { used, missing, shortfalls } = matchNeeds(addNeeds(first.needs, second.needs), onHand);
  const canMakeNow = missing.length === 0 && shortfalls.length === 0;
  return { pair: [first, second], used, missing, shortfalls, canMakeNow };
}

/**
 * Two recipes' needs added together, in the order the first and then the second requires each
 * ingredient. A need that's optional in its recipe adds nothing: Färsk dill garnishing Lángos
 * leaves Torsk med brynt smör's 20 g as it is. An ingredient neither recipe requires stays in as
 * optional, so it still counts as used when you have it.
 */
function addNeeds(first: Needs, second: Needs): Needs {
  const needs = [...first.values(), ...second.values()];
  const summed = new Map<string, IngredientNeed>();
  for (const need of needs.filter((need) => !need.optional)) {
    const sum = summed.get(need.ingredient);
    if (sum) sum.amount += need.amount;
    else summed.set(need.ingredient, { ...need });
  }
  for (const need of needs.filter((need) => need.optional)) {
    if (!summed.has(need.ingredient)) summed.set(need.ingredient, need);
  }
  return summed;
}
