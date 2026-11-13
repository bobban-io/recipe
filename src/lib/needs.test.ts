import { describe, expect, test } from "bun:test";
import { loadFixtures } from "../../test/recipeFolders";
import { loadRecipes } from "~/lib/checks";
import { missingFactors, recipeNeeds, type IngredientNeed } from "~/lib/needs";

const { recipes, catalog } = loadFixtures();

function needsOf(slug: string): ReadonlyMap<string, IngredientNeed> {
  const recipe = recipes.find((candidate) => candidate.slug === slug);
  if (!recipe) throw new Error(`No fixture recipe ${slug}`);
  return recipeNeeds(recipe, catalog);
}

function amountOf(slug: string, ingredient: string): number | undefined {
  return needsOf(slug).get(ingredient)?.amount;
}

describe("recipeNeeds on the fixtures", () => {
  test("every recipe's lines convert", () => {
    for (const recipe of recipes) expect(() => recipeNeeds(recipe, catalog)).not.toThrow();
  });

  test("sums an ingredient's lines: Smör in Kladdkaksmuffins is 200 g + 70 g", () => {
    expect(needsOf("kladdkaksmuffins").get("Smör")).toEqual({
      ingredient: "Smör",
      unit: "g",
      amount: 270,
      optional: false,
    });
  });

  test("a line's name finds its ingredient through an alias", () => {
    expect(amountOf("chicken-souvlaki", "Kyckling")).toBe(1000);
    expect(amountOf("tonkatsu", "Ris")).toBe(2);
  });

  test("a volume converts to dl", () => {
    expect(amountOf("peppargryta", "Socker")).toBeCloseTo(0.075); // ½ msk Strösocker
    expect(amountOf("kladdkaksmuffins", "Kakao")).toBeCloseTo(1.45); // 1 dl + 3 msk
  });

  test("a count stays a count", () => {
    expect(amountOf("torsk-med-brynt-smor", "Potatis")).toBe(20);
    expect(amountOf("pad-kra-pow", "Vitlöksklyftor")).toBe(6);
  });

  test("a volume converts to grams with gramsPerDl", () => {
    expect(amountOf("kladdkaksmuffins", "Vetemjöl")).toBeCloseTo(180); // 3 dl at 60 g/dl
    expect(amountOf("peppargryta", "Smör")).toBeCloseTo(63.5); // 50 g + 1 msk at 90 g/dl
  });

  test("a weight converts to dl with gramsPerDl", () => {
    expect(amountOf("langos", "Rapsolja")).toBeCloseTo(11); // 900 g + 90 g at 90 g/dl
    expect(amountOf("chicken-souvlaki", "Torkad oregano")).toBeCloseTo(0.325); // 1½ msk + 2 g at 20 g/dl
  });

  test("a weight converts to st with gramsPerSt", () => {
    expect(amountOf("langos", "Potatis")).toBeCloseTo(0.9); // 90 g Kokt potatis at 100 g/st
  });

  test("baker's percent is a share of the recipe's total flour", () => {
    expect(amountOf("sourdough", "Surdegsgrund")).toBeCloseTo(110); // 20 % of 500 g + 50 g
  });

  test("staples are left out", () => {
    for (const recipe of recipes) {
      const needs = recipeNeeds(recipe, catalog);
      for (const staple of ["Salt", "Svartpeppar", "Vatten"]) expect(needs.has(staple)).toBe(false);
    }
  });

  test("only the three optional lines make an ingredient optional", () => {
    const optional = recipes.flatMap((recipe) =>
      [...recipeNeeds(recipe, catalog).values()]
        .filter((need) => need.optional)
        .map((need) => `${recipe.slug}: ${need.ingredient}`),
    );
    expect(optional.sort()).toEqual([
      "chicken-souvlaki: Grönsaker",
      "kladdkaksmuffins: Riven kokos",
      "langos: Färsk dill",
    ]);
    expect(needsOf("torsk-med-brynt-smor").get("Färsk dill")?.optional).toBe(false);
  });

  test("the needs follow the order the recipe first uses each ingredient", () => {
    expect([...needsOf("sourdough").keys()]).toEqual(["Vetemjöl", "Rågmjöl", "Surdegsgrund"]);
  });
});

describe("conversion rules", () => {
  const catalogSource = [
    "Grädde: { unit: dl }",
    "Kokos: { unit: dl, gramsPerDl: 40, gramsPerSt: 400 }",
    "Ägg: { unit: st, gramsPerDl: 100, gramsPerSt: 50 }",
  ].join("\n");

  function load(lines: string[]) {
    const recipe = [
      "---",
      "title: Test",
      "description: Ett testrecept.",
      "dishType: efterrätt",
      "yieldUnit: portion",
      "defaultYield: 2",
      "ingredients:",
      ...lines.map((line) => `  - ${line}`),
      "---",
    ].join("\n");
    const loaded = loadRecipes({ "test.md": recipe }, catalogSource);
    return recipeNeeds(loaded.recipes[0], loaded.catalog);
  }

  test("an ingredient is optional only when every line using it is", () => {
    const needs = load([
      "{ name: Grädde, amount: 2, unit: dl }",
      "{ name: Grädde, amount: 1, unit: dl, optional: true }",
      "{ name: Kokos, amount: 1, unit: dl, optional: true }",
    ]);
    expect(needs.get("Grädde")).toMatchObject({ amount: 3, optional: false });
    expect(needs.get("Kokos")).toMatchObject({ amount: 1, optional: true });
  });

  test("a count converts to dl, and a volume to st, through grams with both factors", () => {
    const needs = load(["{ name: Kokos, amount: 1, unit: st }", "{ name: Ägg, amount: 1, unit: dl }"]);
    expect(needs.get("Kokos")?.amount).toBeCloseTo(10); // 400 g at 40 g/dl
    expect(needs.get("Ägg")?.amount).toBeCloseTo(2); // 100 g at 50 g/st
  });

  test("missingFactors lists what an ingredient lacks for a line", () => {
    const line = { name: "Ägg", amount: 1, unit: "dl" as const };
    expect(missingFactors(line, { name: "Ägg", unit: "st" })).toEqual(["gramsPerDl", "gramsPerSt"]);
    expect(missingFactors(line, { name: "Ägg", unit: "st", gramsPerSt: 50 })).toEqual(["gramsPerDl"]);
    expect(missingFactors(line, { name: "Ägg", unit: "dl" })).toEqual([]);
  });
});
