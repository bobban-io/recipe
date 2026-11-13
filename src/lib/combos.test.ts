import { describe, expect, test } from "bun:test";
import { loadFixtures } from "../../test/recipeFolders";
import { passesFilter } from "~/lib/categories";
import { suggestCombos, type Combo } from "~/lib/combos";
import { suggest, type OnHandIngredient, type RecipeFilter } from "~/lib/suggestions";

const { recipes, catalog } = loadFixtures();

const everyRecipe: RecipeFilter = () => true;

/** On-hand ingredients without amounts. */
function have(...ingredients: string[]): OnHandIngredient[] {
  return ingredients.map((ingredient) => ({ ingredient }));
}

function combosFor(onHand: OnHandIngredient[], filter = everyRecipe): Combo[] {
  return suggestCombos(suggest(recipes, catalog, onHand, filter), onHand);
}

/** A filter only these recipes pass, to look at one pair. */
function only(...titles: string[]): RecipeFilter {
  return (recipe) => titles.includes(recipe.title);
}

/** The one combo these two recipes make. */
function comboOf(onHand: OnHandIngredient[], first: string, second: string): Combo {
  const [combo, ...rest] = combosFor(onHand, only(first, second));
  if (!combo || rest.length > 0) throw new Error(`${first} and ${second} aren't one combo`);
  return combo;
}

function titles(combo: Combo): string[] {
  return combo.pair.map((suggestion) => suggestion.recipe.title);
}

function names(items: { ingredient: string }[]): string[] {
  return items.map((item) => item.ingredient);
}

const DINNERS = have("Kyckling", "Citron", "Vitlöksklyftor", "Ägg", "Smör", "Grädde", "Potatis", "Ris", "Lime");
const BAKING_DAY = have("Vetemjöl", "Rågmjöl", "Surdegsgrund", "Smör", "Ägg", "Kakao", "Socker");

describe("the sample fridges", () => {
  test("Kyckling, Citron, Vitlöksklyftor: no combo, since Kycklingsouvlaki uses all three", () => {
    const onHand = have("Kyckling", "Citron", "Vitlöksklyftor");
    expect(suggest(recipes, catalog, onHand, everyRecipe)[0]).toMatchObject({
      recipe: { title: "Kycklingsouvlaki" },
      used: ["Kyckling", "Citron", "Vitlöksklyftor"],
    });
    expect(combosFor(onHand)).toEqual([]);
  });

  test("nine dinner ingredients: the best combo is Torsk med brynt smör and Kycklingtonkatsu, using 7", () => {
    const [best] = combosFor(DINNERS);
    expect(new Set(titles(best))).toEqual(new Set(["Torsk med brynt smör", "Kycklingtonkatsu"]));
    expect(best.used.length).toBe(7);
  });

  test("the baking day: the best combo is Surdegsbröd and Kladdkaksmuffins, using all 7", () => {
    const [best] = combosFor(BAKING_DAY);
    expect(new Set(titles(best))).toEqual(new Set(["Surdegsbröd", "Kladdkaksmuffins"]));
    expect(best.used).toEqual(names(BAKING_DAY));
  });
});

describe("the rules", () => {
  test("with an amount of Ägg and a pair that both need Ägg, the shortfall is the summed need minus what you have", () => {
    // Kladdkaksmuffins needs 4 Ägg and Kycklingtonkatsu 2.
    const onHand = [...have("Kyckling", "Kakao"), { ingredient: "Ägg", amount: 2 }];
    const combo = comboOf(onHand, "Kladdkaksmuffins", "Kycklingtonkatsu");
    expect(combo.shortfalls).toEqual([{ ingredient: "Ägg", unit: "st", amount: 4, have: 2 }]);
    expect(combo.used).toContain("Ägg");
    expect(names(combo.missing)).not.toContain("Ägg");
  });

  test("with Vardagsmat chosen, both recipes in every combo are vardag", () => {
    expect(titles(combosFor(DINNERS)[0])).toContain("Torsk med brynt smör"); // helg, without the filter

    const combos = combosFor(DINNERS, passesFilter("vardagsmat"));
    expect(combos.length).toBeGreaterThan(0);
    for (const { pair } of combos) {
      for (const { recipe } of pair) expect(recipe).toMatchObject({ dishType: "huvudrätt", occasion: "vardag" });
    }
  });

  test("a pair where one recipe uses only on-hand ingredients the other also uses never shows", () => {
    // Pad kra pow uses Vitlöksklyftor and Ris, and Yakiniku uses both and Lime too.
    expect(combosFor(DINNERS, only("Yakiniku", "Pad kra pow"))).toEqual([]);
    expect(titles(comboOf(DINNERS, "Yakiniku", "Torsk med brynt smör"))).toEqual(["Torsk med brynt smör", "Yakiniku"]);

    for (const onHand of [DINNERS, BAKING_DAY]) {
      for (const { pair } of combosFor(onHand)) {
        const [first, second] = pair;
        expect(first.used.some((ingredient) => !second.used.includes(ingredient))).toBe(true);
        expect(second.used.some((ingredient) => !first.used.includes(ingredient))).toBe(true);
      }
    }
  });
});

describe("combos", () => {
  test("a combo has to use more than the single that uses the most, not the top-ranked one", () => {
    // Surdegsbröd ranks first using 3, but Kladdkaksmuffins uses 5. Surdegsbröd and
    // Kycklingtonkatsu use 4 between them: more than the top-ranked single, not enough to show.
    const suggestions = suggest(recipes, catalog, BAKING_DAY, everyRecipe);
    expect(suggestions[0].recipe.title).toBe("Surdegsbröd");
    expect(Math.max(...suggestions.map((suggestion) => suggestion.used.length))).toBe(5);
    expect(comboOf(BAKING_DAY, "Surdegsbröd", "Kycklingtonkatsu").used.length).toBe(4);

    expect(combosFor(BAKING_DAY).map(titles)).toEqual([["Surdegsbröd", "Kladdkaksmuffins"]]);
  });

  test("combos rank by the first three keys, ties keep the singles' order, and at most three show", () => {
    // Both pairs with Kycklingtonkatsu use 7 and miss 16; Torsk med brynt smör ranks above
    // Peppargryta as a single. Within each pair the higher-ranked single comes first.
    const combos = combosFor(DINNERS);
    expect(combos.map(titles)).toEqual([
      ["Kycklingtonkatsu", "Torsk med brynt smör"],
      ["Kycklingtonkatsu", "Peppargryta"],
      ["Torsk med brynt smör", "Yakiniku"],
    ]);
    expect(combos.map((combo) => [combo.used.length, combo.missing.length])).toEqual([
      [7, 16],
      [7, 16],
      [6, 13],
    ]);
    // A fourth pair qualifies too, but doesn't show.
    expect(comboOf(DINNERS, "Kycklingtonkatsu", "Kycklingsouvlaki").used.length).toBe(6);
  });

  test("can make now means nothing missing and no shortfall, since a combo has no largest yield", () => {
    const everything = [...BAKING_DAY, ...have("Vaniljsocker", "Florsocker", "Kaffe")];
    expect(comboOf(everything, "Surdegsbröd", "Kladdkaksmuffins").canMakeNow).toBe(true);

    // 2 Ägg make 6 of 12 muffins, so the muffins alone can be made now, but the combo is short.
    const twoEggs = everything.map((item) => (item.ingredient === "Ägg" ? { ...item, amount: 2 } : item));
    const combo = comboOf(twoEggs, "Surdegsbröd", "Kladdkaksmuffins");
    const muffins = combo.pair.find((suggestion) => suggestion.recipe.title === "Kladdkaksmuffins");
    expect(muffins).toMatchObject({ canMakeNow: true, largestYield: 6 });
    expect(combo.missing).toEqual([]);
    expect(combo.shortfalls).toEqual([{ ingredient: "Ägg", unit: "st", amount: 2, have: 2 }]);
    expect(combo.canMakeNow).toBe(false);
  });

  test("an ingredient both recipes need and you don't have is missing once, with the amounts added", () => {
    // Kladdkaksmuffins needs 270 g Smör and Torsk med brynt smör 300 g.
    const combo = comboOf(have("Kakao", "Citron"), "Kladdkaksmuffins", "Torsk med brynt smör");
    expect(combo.missing.filter((item) => item.ingredient === "Smör")).toEqual([
      { ingredient: "Smör", unit: "g", amount: 570 },
    ]);
  });

  test("an optional need adds nothing: Färsk dill garnishing Lángos leaves Torsk med brynt smör's 20 g", () => {
    const without = comboOf(have("Gräddfil", "Citron"), "Lángos", "Torsk med brynt smör");
    expect(without.missing.filter((item) => item.ingredient === "Färsk dill")).toEqual([
      { ingredient: "Färsk dill", unit: "g", amount: 20 },
    ]);

    const withDill = comboOf(
      [...have("Gräddfil", "Citron"), { ingredient: "Färsk dill", amount: 20 }],
      "Lángos",
      "Torsk med brynt smör",
    );
    expect(withDill.used).toContain("Färsk dill");
    expect(withDill.shortfalls).toEqual([]);
  });

  test("an ingredient no recipe in the pair requires counts as used when you have it, and is never missing", () => {
    const withIt = comboOf(
      [{ ingredient: "Grönsaker", amount: 1 }, ...have("Kakao")],
      "Kycklingsouvlaki",
      "Kladdkaksmuffins",
    );
    expect(withIt.used).toEqual(["Grönsaker", "Kakao"]);
    expect(withIt.shortfalls).toEqual([]);

    const without = comboOf(have("Kyckling", "Kakao"), "Kycklingsouvlaki", "Kladdkaksmuffins");
    expect(names(without.missing)).not.toContain("Grönsaker");
    expect(names(without.missing)).not.toContain("Riven kokos");
  });
});
