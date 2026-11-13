import { describe, expect, test } from "bun:test";
import { FIXTURES_FOLDER, readRecipeFolder, RECIPES_FOLDER } from "../../test/recipeFolders";
import { checkRecipes, loadRecipes } from "~/lib/checks";

const CATALOG = [
  "Potatis: { unit: st, aliases: [Kokt potatis] }",
  "Salt: { staple: true }",
  "Vetemjöl: { unit: g, gramsPerDl: 60 }",
  "Ägg: { unit: st }",
].join("\n");

const VARDAG = "dishType: huvudrätt\noccasion: vardag";

/** A minimal recipe file with these categories (frontmatter lines) and this `ingredients` YAML. */
function recipeWithIngredients(categories: string, ingredients: string): string {
  return [
    "---",
    "title: Test",
    "description: Ett testrecept.",
    categories,
    "yieldUnit: portion",
    "defaultYield: 2",
    "ingredients:",
    ingredients,
    "---",
    "",
    "Gör så här.",
  ].join("\n");
}

/** A minimal recipe file with these categories and a flat list of ingredient lines. */
function recipe(categories: string, lines = ["{ name: Ägg, amount: 2, unit: st }"]): string {
  return recipeWithIngredients(categories, lines.map((line) => `  - ${line}`).join("\n"));
}

function problems(recipeFiles: Record<string, string>, catalog = CATALOG): string[] {
  return checkRecipes(recipeFiles, catalog).problems;
}

describe("the real recipes", () => {
  test("build without problems", () => {
    const { recipeFiles, catalogSource } = readRecipeFolder(RECIPES_FOLDER);
    expect(checkRecipes(recipeFiles, catalogSource).problems).toEqual([]);
  });

  test("the fixtures build without problems, with 79 ingredients of which 3 are staples", () => {
    const { recipeFiles, catalogSource } = readRecipeFolder(FIXTURES_FOLDER);
    const { recipes, catalog, problems } = checkRecipes(recipeFiles, catalogSource);
    expect(problems).toEqual([]);
    expect(recipes).toHaveLength(11);
    expect(catalog?.ingredients).toHaveLength(79);
    expect(catalog?.ingredients.filter((ingredient) => ingredient.staple).map(({ name }) => name)).toEqual([
      "Salt",
      "Svartpeppar",
      "Vatten",
    ]);
  });
});

describe("recipe checks", () => {
  test("a valid recipe has no problems and gets its categories", () => {
    const { recipes, problems } = checkRecipes({ "test.md": recipe(VARDAG) }, CATALOG);
    expect(problems).toEqual([]);
    expect(recipes[0]).toMatchObject({ slug: "test", dishType: "huvudrätt", occasion: "vardag" });
  });

  test("a line name that isn't in the catalog", () => {
    expect(problems({ "yakiniku.md": recipe(VARDAG, ["{ name: Kycklinglårfilé, grams: 400 }"]) })).toEqual([
      'yakiniku.md: "Kycklinglårfilé" isn\'t in the ingredient catalog. Add it to src/recipes/ingredients.yaml as an alias of an ingredient, or as a new one.',
    ]);
  });

  test("three unknown names give three lines", () => {
    const lines = ["{ name: Mjölk, amount: 3, unit: dl }", "{ name: Ost, grams: 100 }", "{ name: Skinka, grams: 50 }"];
    expect(problems({ "test.md": recipe(VARDAG, lines) })).toHaveLength(3);
  });

  test("a line that can't convert to its ingredient's entry unit", () => {
    expect(problems({ "langos.md": recipe(VARDAG, ["{ name: Kokt potatis, grams: 90 }"]) })).toEqual([
      'langos.md: "Kokt potatis" is in g, but Potatis is entered in st. Give Potatis gramsPerSt.',
    ]);
  });

  test("a volume line for a counted ingredient needs both factors", () => {
    expect(problems({ "test.md": recipe(VARDAG, ["{ name: Ägg, amount: 1, unit: dl }"]) })).toEqual([
      'test.md: "Ägg" is in dl, but Ägg is entered in st. Give Ägg gramsPerDl and gramsPerSt.',
    ]);
  });

  test("a baker's percent line converts like a weight", () => {
    const lines = ["{ name: Vetemjöl, grams: 500, flour: true }", "{ name: Ägg, percent: 10 }"];
    expect(problems({ "test.md": recipe(VARDAG, lines) })).toEqual([
      'test.md: "Ägg" is in baker\'s percent, but Ägg is entered in st. Give Ägg gramsPerSt.',
    ]);
  });

  test("a line converts through the ingredient's factor", () => {
    expect(problems({ "test.md": recipe(VARDAG, ["{ name: Vetemjöl, amount: 3, unit: dl }"]) })).toEqual([]);
  });

  test("staple lines are never converted", () => {
    const lines = ["{ name: Salt, amount: 1, unit: krm }", "{ name: Salt, grams: 6 }", "{ name: Salt, percent: 2 }"];
    expect(problems({ "test.md": recipe(VARDAG, lines) })).toEqual([]);
  });

  test("a missing dishType", () => {
    expect(problems({ "sourdough.md": recipe("") })).toEqual([
      "sourdough.md: dishType is missing. Use huvudrätt, bröd, bakverk or efterrätt.",
    ]);
  });

  test("an unknown dishType", () => {
    expect(problems({ "test.md": recipe("dishType: middag") })).toEqual([
      'test.md: dishType "middag" is unknown. Use huvudrätt, bröd, bakverk or efterrätt.',
    ]);
  });

  test("a huvudrätt without an occasion", () => {
    expect(problems({ "yakiniku.md": recipe("dishType: huvudrätt") })).toEqual([
      "yakiniku.md: a huvudrätt needs an occasion: vardag or helg.",
    ]);
  });

  test("a huvudrätt with an unknown occasion", () => {
    expect(problems({ "test.md": recipe("dishType: huvudrätt\noccasion: fest") })).toEqual([
      'test.md: occasion "fest" is unknown. Use vardag or helg.',
    ]);
  });

  test("an occasion on anything but a huvudrätt", () => {
    expect(problems({ "kladdkaksmuffins.md": recipe("dishType: bakverk\noccasion: helg") })).toEqual([
      "kladdkaksmuffins.md: only a huvudrätt has an occasion; this is bakverk.",
    ]);
  });

  test("schema errors in several files are all listed, against the ingredients shape each uses", () => {
    const sectioned = [
      "  - section: smet",
      "    items:",
      "      - { name: Ägg, amount: 2, unit: st }",
      "      - { name: Vetemjöl, grams: 100, amount: 1, unit: dl }",
    ].join("\n");
    expect(
      problems({
        "a.md": recipe(VARDAG).replace("title: Test\n", ""),
        "b.md": recipe(VARDAG, ["{ name: Ägg, amount: 2 }"]),
        "c.md": recipeWithIngredients(VARDAG, sectioned),
      }),
    ).toEqual([
      "a.md: title: Invalid input: expected string, received undefined",
      "b.md: ingredients.0: `amount` and `unit` must be given together",
      "c.md: ingredients.0.items.1: Ingredient must define exactly one of `grams`, `percent` or `amount` + `unit`",
    ]);
  });

  test("a file without frontmatter, and a YAML error with its line", () => {
    expect(
      problems({
        "a.md": "Bara text.",
        "b.md": recipe(VARDAG).replace("title: Test", "title: Test\ntitle: Igen"),
      }),
    ).toEqual([
      "a.md: the YAML frontmatter is missing. Start the file with it, between two --- lines.",
      "b.md: YAML error on line 3: duplicated mapping key",
    ]);
  });
});

describe("catalog checks", () => {
  const ok = { "test.md": recipe(VARDAG) };

  test("a name listed as an alias of two ingredients", () => {
    const catalog = "Olivolja: { unit: dl, aliases: [Olja] }\nRapsolja: { unit: dl, aliases: [Olja] }\nÄgg: { unit: st }";
    expect(problems(ok, catalog)).toEqual(['ingredients.yaml: "Olja" is listed under both Olivolja and Rapsolja.']);
  });

  test("an ingredient's name listed as another's alias", () => {
    const catalog = "Olivolja: { unit: dl }\nRapsolja: { unit: dl, aliases: [Olivolja] }\nÄgg: { unit: st }";
    expect(problems(ok, catalog)).toEqual(['ingredients.yaml: "Olivolja" is listed under both Olivolja and Rapsolja.']);
  });

  test("a missing unit", () => {
    expect(problems({}, "Ägg: { aliases: [Hönsägg] }")).toEqual(["ingredients.yaml: Ägg needs a unit: g, dl or st."]);
  });

  test("an unknown unit", () => {
    expect(problems({}, "Ägg: { unit: kg }")).toEqual([
      'ingredients.yaml: Ägg has an unknown unit "kg". Use g, dl or st.',
    ]);
  });

  test("a staple with a unit", () => {
    expect(problems({}, "Salt: { staple: true, unit: g }")).toEqual([
      "ingredients.yaml: Salt is a staple, so it takes no unit.",
    ]);
  });

  test("a duplicate ingredient name fails as a YAML error", () => {
    expect(problems({}, "Ägg: { unit: st }\nÄgg: { unit: g }")).toEqual([
      "ingredients.yaml: YAML error on line 2: duplicated mapping key",
    ]);
  });

  test("a misspelled field", () => {
    expect(problems({}, "Potatis: { unit: st, gramPerSt: 100 }")).toEqual([
      'ingredients.yaml: Potatis: Unrecognized key: "gramPerSt"',
    ]);
  });

  test("an ingredient with problems doesn't also make its lines unknown", () => {
    const lines = ["{ name: Hönsägg, amount: 2, unit: st }"];
    expect(problems({ "test.md": recipe(VARDAG, lines) }, "Ägg: { unit: kg, aliases: [Hönsägg] }")).toEqual([
      'ingredients.yaml: Ägg has an unknown unit "kg". Use g, dl or st.',
    ]);
  });

  test("unused ingredients and aliases pass", () => {
    expect(problems(ok, `${CATALOG}\nMjölk: { unit: dl, aliases: [Standardmjölk] }`)).toEqual([]);
  });
});

test("loadRecipes throws one error listing every problem", () => {
  const files = {
    "sourdough.md": recipe(""),
    "yakiniku.md": recipe("dishType: huvudrätt", ["{ name: Kycklinglårfilé, grams: 400 }"]),
  };
  expect(() => loadRecipes(files, `${CATALOG}\nOlivolja: { unit: dl, aliases: [Salt] }`)).toThrow(
    [
      "Recipes don't build:",
      "  sourdough.md: dishType is missing. Use huvudrätt, bröd, bakverk or efterrätt.",
      "  yakiniku.md: a huvudrätt needs an occasion: vardag or helg.",
      '  yakiniku.md: "Kycklinglårfilé" isn\'t in the ingredient catalog. Add it to src/recipes/ingredients.yaml as an alias of an ingredient, or as a new one.',
      "  ingredients.yaml: \"Salt\" is listed under both Salt and Olivolja.",
    ].join("\n"),
  );
});
