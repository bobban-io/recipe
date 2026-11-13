import { describe, expect, test } from "bun:test";
import { loadFixtures } from "../../test/recipeFolders";
import type { IngredientNeed } from "~/lib/needs";
import {
  compareRanking,
  matchNeeds,
  suggest,
  type OnHandIngredient,
  type RecipeFilter,
  type Suggestion,
} from "~/lib/suggestions";

const { recipes, catalog } = loadFixtures();

const everyRecipe: RecipeFilter = () => true;

/** On-hand ingredients without amounts. */
function have(...ingredients: string[]): OnHandIngredient[] {
  return ingredients.map((ingredient) => ({ ingredient }));
}

function suggestFor(onHand: OnHandIngredient[], filter = everyRecipe): Suggestion[] {
  return suggest(recipes, catalog, onHand, filter);
}

function titles(suggestions: Suggestion[]): string[] {
  return suggestions.map((suggestion) => suggestion.recipe.title);
}

function suggestionFor(onHand: OnHandIngredient[], title: string): Suggestion {
  const suggestion = suggestFor(onHand).find((candidate) => candidate.recipe.title === title);
  if (!suggestion) throw new Error(`${title} isn't a suggestion`);
  return suggestion;
}

function names(items: { ingredient: string }[]): string[] {
  return items.map((item) => item.ingredient);
}

/** Everything Kladdkaksmuffins needs except Ägg and the optional Riven kokos. */
const MUFFINS_WITHOUT_EGGS = have("Smör", "Socker", "Vetemjöl", "Kakao", "Vaniljsocker", "Florsocker", "Kaffe");

describe("the sample fridges", () => {
  test("Kyckling, Citron, Vitlöksklyftor: Kycklingsouvlaki first, Kycklingtonkatsu below Öppen sparrislasagne", () => {
    const ranked = titles(suggestFor(have("Kyckling", "Citron", "Vitlöksklyftor")));
    expect(ranked[0]).toBe("Kycklingsouvlaki");
    // The accepted limitation from Suggestion matching and ranking: both use one on-hand
    // ingredient, and the lasagne misses fewer.
    expect(ranked.indexOf("Kycklingtonkatsu")).toBeGreaterThan(ranked.indexOf("Öppen sparrislasagne"));
  });

  test("Kyckling, Citron, Vitlöksklyftor, Vetemjöl: Kycklingsouvlaki first", () => {
    expect(titles(suggestFor(have("Kyckling", "Citron", "Vitlöksklyftor", "Vetemjöl")))[0]).toBe("Kycklingsouvlaki");
  });

  test("the baking day: Surdegsbröd first, can make now", () => {
    const [first, ...rest] = suggestFor(have("Vetemjöl", "Rågmjöl", "Surdegsgrund", "Smör", "Ägg", "Kakao", "Socker"));
    expect(first.recipe.title).toBe("Surdegsbröd");
    expect(first.canMakeNow).toBe(true);
    // Can make now outranks using more: Kladdkaksmuffins uses 5 to the bread's 3.
    const muffins = rest.find((suggestion) => suggestion.recipe.title === "Kladdkaksmuffins");
    expect(muffins?.used.length).toBe(5);
    expect(first.used.length).toBe(3);
  });

  test("2 Ägg and everything else for Kladdkaksmuffins: can make now, largest yield 6 of 12, shortfall 2 Ägg", () => {
    const muffins = suggestionFor([{ ingredient: "Ägg", amount: 2 }, ...MUFFINS_WITHOUT_EGGS], "Kladdkaksmuffins");
    expect(muffins.canMakeNow).toBe(true);
    expect(muffins.largestYield).toBe(6);
    expect(muffins.recipe.defaultYield).toBe(12);
    expect(muffins.missing).toEqual([]);
    expect(muffins.shortfalls).toEqual([{ ingredient: "Ägg", unit: "st", amount: 2, have: 2 }]);
  });

  test("400 g Kyckling: Kycklingsouvlaki has largest yield 2 of 6 and a shortfall of 600 g Kyckling", () => {
    const souvlaki = suggestionFor([{ ingredient: "Kyckling", amount: 400 }], "Kycklingsouvlaki");
    expect(souvlaki.largestYield).toBe(2);
    expect(souvlaki.recipe.defaultYield).toBe(6);
    expect(souvlaki.shortfalls).toEqual([{ ingredient: "Kyckling", unit: "g", amount: 600, have: 400 }]);
    // A shortfall still counts as used and isn't missing.
    expect(souvlaki.used).toEqual(["Kyckling"]);
    expect(names(souvlaki.missing)).not.toContain("Kyckling");
  });

  test("300 g Vetemjöl and everything else for Surdegsbröd: nothing missing, largest yield 0, shortfall 200 g", () => {
    const bread = suggestionFor(
      [{ ingredient: "Vetemjöl", amount: 300 }, ...have("Rågmjöl", "Surdegsgrund")],
      "Surdegsbröd",
    );
    expect(bread.missing).toEqual([]);
    expect(bread.largestYield).toBe(0);
    expect(bread.canMakeNow).toBe(false);
    expect(bread.shortfalls).toEqual([{ ingredient: "Vetemjöl", unit: "g", amount: 200, have: 300 }]);
  });
});

describe("the rules", () => {
  test("Salt is never used, never missing and never limits the yield", () => {
    expect(suggestFor([{ ingredient: "Salt", amount: 0.001 }])).toEqual([]);

    const suggestions = suggestFor([{ ingredient: "Salt", amount: 0.001 }, ...have("Kyckling")]);
    expect(suggestions.length).toBeGreaterThan(0);
    for (const suggestion of suggestions) {
      expect(suggestion.used).toEqual(["Kyckling"]);
      expect(suggestion.largestYield).toBeNull();
      expect(names(suggestion.missing)).not.toContain("Salt");
    }
    for (const suggestion of suggestFor(have("Kyckling", "Ägg", "Vetemjöl"))) {
      expect(names(suggestion.missing)).not.toContain("Salt");
    }
  });

  test("without Smör, Kladdkaksmuffins lists it as missing once, with 270 g", () => {
    const muffins = suggestionFor(have("Ägg"), "Kladdkaksmuffins");
    expect(muffins.missing.filter((item) => item.ingredient === "Smör")).toEqual([
      { ingredient: "Smör", unit: "g", amount: 270 },
    ]);
  });

  test("Grönsaker in Kycklingsouvlaki is optional: not missing without it, used with it", () => {
    const without = suggestionFor(have("Kyckling"), "Kycklingsouvlaki");
    expect(names(without.missing)).not.toContain("Grönsaker");
    expect(without.optionalNotOnHand).toEqual(["Grönsaker"]);

    const withIt = suggestionFor(have("Kyckling", "Grönsaker"), "Kycklingsouvlaki");
    expect(withIt.used).toEqual(["Kyckling", "Grönsaker"]);
    expect(withIt.optionalNotOnHand).toEqual([]);
  });

  test("an amount on an optional ingredient never limits the largest yield or makes a shortfall", () => {
    const onlyOptional = suggestionFor([{ ingredient: "Grönsaker", amount: 1 }], "Kycklingsouvlaki");
    expect(onlyOptional.largestYield).toBeNull();
    expect(onlyOptional.shortfalls).toEqual([]);

    const souvlaki = suggestionFor(
      [
        { ingredient: "Grönsaker", amount: 1 },
        { ingredient: "Kyckling", amount: 1000 },
      ],
      "Kycklingsouvlaki",
    );
    expect(souvlaki.largestYield).toBe(6);
    expect(souvlaki.shortfalls).toEqual([]);
  });

  test("a recipe that fails the category filter is never a suggestion", () => {
    const bread: RecipeFilter = (recipe) => recipe.dishType === "bröd";
    const onHand = have("Vetemjöl", "Ägg", "Smör", "Kyckling");
    expect(titles(suggestFor(onHand)).length).toBeGreaterThan(1);
    expect(titles(suggestFor(onHand, bread))).toEqual(["Surdegsbröd"]);
  });
});

describe("suggestions", () => {
  test("nothing on hand suggests nothing", () => {
    expect(suggestFor([])).toEqual([]);
  });

  test("used follows the order you added the ingredients", () => {
    expect(suggestionFor(have("Vitlöksklyftor", "Citron", "Kyckling"), "Kycklingsouvlaki").used).toEqual([
      "Vitlöksklyftor",
      "Citron",
      "Kyckling",
    ]);
  });

  test("missing lists each ingredient with its need at the default yield, in the recipe's order", () => {
    expect(suggestionFor(have("Vetemjöl"), "Surdegsbröd").missing).toEqual([
      { ingredient: "Rågmjöl", unit: "g", amount: 50 },
      { ingredient: "Surdegsgrund", unit: "g", amount: 110 },
    ]);
  });

  test("an amount that covers the need exactly is no shortfall", () => {
    const muffins = suggestionFor(
      [{ ingredient: "Kakao", amount: 1.45 }, { ingredient: "Ägg", amount: 4 }, ...MUFFINS_WITHOUT_EGGS],
      "Kladdkaksmuffins",
    );
    expect(muffins.shortfalls).toEqual([]);
    expect(muffins.largestYield).toBe(12);
  });

  test("the largest yield is the smallest over the ingredients with an amount", () => {
    const muffins = suggestionFor(
      [{ ingredient: "Ägg", amount: 3 }, { ingredient: "Smör", amount: 45 }, ...have("Kakao", "Socker")],
      "Kladdkaksmuffins",
    );
    expect(muffins.largestYield).toBe(2); // 45 g of 270 g covers 2 of 12; 3 Ägg would cover 9
    expect(names(muffins.shortfalls)).toEqual(["Smör", "Ägg"]); // in the order the recipe uses them
  });

  test("missing ingredients don't limit the largest yield, but they stop can make now", () => {
    const souvlaki = suggestionFor([{ ingredient: "Kyckling", amount: 1000 }], "Kycklingsouvlaki");
    expect(souvlaki.largestYield).toBe(6);
    expect(souvlaki.missing.length).toBeGreaterThan(0);
    expect(souvlaki.canMakeNow).toBe(false);
  });

  test("ties on the first three keys go by title", () => {
    // Pad kra pow and Yakiniku both use Ris and Vitlöksklyftor and miss 8.
    const ranked = titles(suggestFor(have("Ris", "Vitlöksklyftor", "Citron")));
    expect(ranked.indexOf("Pad kra pow")).toBeLessThan(ranked.indexOf("Yakiniku"));
  });
});

describe("matchNeeds", () => {
  const need = (ingredient: string, amount: number, optional = false): [string, IngredientNeed] => [
    ingredient,
    { ingredient, unit: "st", amount, optional },
  ];

  test("works on summed needs, as for a combo: 2 Ägg against 2 + 2 is a shortfall of 2", () => {
    const summed = new Map([need("Ägg", 4), need("Citron", 2)]);
    expect(matchNeeds(summed, [{ ingredient: "Ägg", amount: 2 }])).toEqual({
      used: ["Ägg"],
      missing: [{ ingredient: "Citron", unit: "st", amount: 2 }],
      shortfalls: [{ ingredient: "Ägg", unit: "st", amount: 2, have: 2 }],
      optionalNotOnHand: [],
    });
  });

  test("an optional need is used when on hand, and otherwise listed apart", () => {
    const needs = new Map([need("Ägg", 2), need("Kokos", 1, true), need("Lime", 1, true)]);
    expect(matchNeeds(needs, [{ ingredient: "Kokos", amount: 0.5 }])).toEqual({
      used: ["Kokos"],
      missing: [{ ingredient: "Ägg", unit: "st", amount: 2 }],
      shortfalls: [],
      optionalNotOnHand: ["Lime"],
    });
  });
});

describe("compareRanking", () => {
  const rank = (canMakeNow: boolean, used: number, missing: number) => ({
    canMakeNow,
    used: Array.from({ length: used }),
    missing: Array.from({ length: missing }),
  });

  test("can make now, then most used, then fewest missing", () => {
    expect(compareRanking(rank(true, 1, 0), rank(false, 5, 0))).toBeLessThan(0);
    expect(compareRanking(rank(false, 3, 9), rank(false, 2, 0))).toBeLessThan(0);
    expect(compareRanking(rank(false, 2, 3), rank(false, 2, 4))).toBeLessThan(0);
    expect(compareRanking(rank(false, 2, 3), rank(false, 2, 3))).toBe(0);
  });
});
