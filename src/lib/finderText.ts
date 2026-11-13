import type { BuyItem, Shortfall } from "~/lib/buyList";
import type { Recipe } from "~/lib/recipe";
import { yieldUnitFor } from "~/lib/scale";
import type { Suggestion } from "~/lib/suggestions";

// The finder's Swedish text that depends on a suggestion or a combo. The fixed copy stays in the
// components.

const listFormat = new Intl.ListFormat("sv", { type: "conjunction" });

/**
 * A name as it reads mid-sentence. The first letter is lowercased when a capital is followed by a
 * lowercase letter, so "Färsk dill" becomes "färsk dill" and "HP-sås" stays as it is.
 */
export function inRunningText(name: string): string {
  return /^\p{Lu}\p{Ll}/u.test(name) ? name.charAt(0).toLocaleLowerCase("sv") + name.slice(1) : name;
}

/** Names in running text, in Swedish list format: "kyckling, citron och vitlöksklyftor". */
export function nameList(names: readonly string[]): string {
  return listFormat.format(names.map(inRunningText));
}

/** What a status badge says. The tone sets its color: ready is green, missing gray, short orange. */
export type Status = { text: string; tone: "ready" | "missing" | "short" };

/**
 * A suggestion's or a combo's status: "Du har allt" when you can make it now, "Saknar {n}" with n
 * missing ingredients, and otherwise "Räcker inte", since nothing is missing but your amounts fall
 * short.
 */
export function matchStatus({ canMakeNow, missing }: { canMakeNow: boolean; missing: readonly unknown[] }): Status {
  if (canMakeNow) return { text: "Du har allt", tone: "ready" };
  if (missing.length > 0) return { text: `Saknar ${missing.length}`, tone: "missing" };
  return { text: "Räcker inte", tone: "short" };
}

/** A suggestion's status. When you can make it now, but less than the recipe makes, it says how much. */
export function suggestionStatus(suggestion: Suggestion): Status {
  const { recipe, largestYield, canMakeNow } = suggestion;
  if (canMakeNow && largestYield != null && largestYield < recipe.defaultYield) {
    return {
      text: `Du har allt för ${largestYield} av ${recipe.defaultYield} ${recipe.yieldUnitPlural}`,
      tone: "ready",
    };
  }
  return matchStatus(suggestion);
}

/**
 * The line under a suggestion you can't make now when your amounts cover less than the recipe
 * makes: "Det du har räcker till 2 av 6 portioner.", or "Det du har räcker inte till 1 limpa.".
 * Undefined otherwise.
 */
export function yieldLimitText({ recipe, largestYield, canMakeNow }: Suggestion): string | undefined {
  if (canMakeNow || largestYield == null || largestYield >= recipe.defaultYield) return undefined;
  if (largestYield === 0) return `Det du har räcker inte till 1 ${recipe.yieldUnit}.`;
  return `Det du har räcker till ${largestYield} av ${recipe.defaultYield} ${recipe.yieldUnitPlural}.`;
}

/** "Använder 3 av dina 4: kyckling, citron och vitlöksklyftor", where 4 is the number of on-hand rows. */
export function usesText(used: readonly string[], onHandCount: number): string {
  return `Använder ${used.length} av dina ${onHandCount}: ${nameList(used)}`;
}

/** What a suggestion or a combo still needs to buy. */
type ToBuy = { shortfalls: readonly Shortfall[]; missing: readonly BuyItem[] };

/** The names after "Att köpa:", shortfalls first: "mer kyckling, grekisk yoghurt och citron". */
export function toBuyNames({ shortfalls, missing }: ToBuy): string {
  return nameList([
    ...shortfalls.map(({ ingredient }) => `mer ${inRunningText(ingredient)}`),
    ...missing.map(({ ingredient }) => ingredient),
  ]);
}

/** A suggestion's buy-list caption: "Räknat på 6 portioner, som i receptet." */
export function defaultYieldCaption(recipe: Pick<Recipe, "defaultYield" | "yieldUnit" | "yieldUnitPlural">): string {
  return `Räknat på ${recipe.defaultYield} ${yieldUnitFor(recipe, recipe.defaultYield)}, som i receptet.`;
}
