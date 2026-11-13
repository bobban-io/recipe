import { describe, expect, test } from "bun:test";
import { loadFixtures } from "../../test/recipeFolders";
import { ingredientOptions, MAX_OPTIONS, pickableIngredients, type PickableIngredient } from "~/lib/ingredientPicker";

const { recipes, catalog } = loadFixtures();
const pickable = pickableIngredients(recipes, catalog);
const nothingAdded = new Set<string>();

function optionsFor(query: string, added: ReadonlySet<string> = nothingAdded) {
  return ingredientOptions(query, pickable, added);
}

describe("pickableIngredients", () => {
  test("every ingredient the fixture recipes use, without the three staples", () => {
    expect(pickable).toHaveLength(76);
    const names = pickable.map((ingredient) => ingredient.name);
    for (const staple of ["Salt", "Svartpeppar", "Vatten"]) expect(names).not.toContain(staple);
  });

  test("only ingredients some recipe uses", () => {
    const bread = recipes.filter((recipe) => recipe.title === "Surdegsbröd");
    expect(pickableIngredients(bread, catalog).map((ingredient) => ingredient.name)).toEqual([
      "Rågmjöl",
      "Surdegsgrund",
      "Vetemjöl",
    ]);
  });

  test("in Swedish alphabetical order", () => {
    const names = pickable.map((ingredient) => ingredient.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "sv")));
    expect(names.at(-1)).toBe("Ägg");
  });
});

describe("ingredientOptions", () => {
  test('"fläsk" offers Fläskfilé', () => {
    expect(optionsFor("fläsk")).toEqual([{ ingredient: "Fläskfilé" }]);
  });

  test("matching ignores case and diacritics", () => {
    expect(optionsFor("FLASK")).toEqual([{ ingredient: "Fläskfilé" }]);
    expect(optionsFor("agg")).toEqual([{ ingredient: "Ägg" }]);
    expect(optionsFor("creme")).toEqual([{ ingredient: "Crème fraiche" }]);
  });

  test("surrounding spaces are ignored, and empty text offers nothing", () => {
    expect(optionsFor("  fläsk ")).toEqual([{ ingredient: "Fläskfilé" }]);
    expect(optionsFor("")).toEqual([]);
    expect(optionsFor("   ")).toEqual([]);
  });

  test("an alias match names the alias", () => {
    expect(optionsFor("fläskytter")).toEqual([{ ingredient: "Fläskfilé", alias: "Fläskytterfilé" }]);
    expect(optionsFor("kok")).toEqual([
      { ingredient: "Kaffe", alias: "Kokt kaffe" },
      { ingredient: "Potatis", alias: "Kokt potatis" },
      { ingredient: "Riven kokos" },
    ]);
  });

  test("staples are never offered, by name or alias", () => {
    for (const query of ["salt", "flingsalt", "svartpeppar", "vatten"]) expect(optionsFor(query)).toEqual([]);
  });

  test("ingredients already added are left out", () => {
    expect(optionsFor("fläsk", new Set(["Fläskfilé"]))).toEqual([]);
    expect(optionsFor("kok", new Set(["Kaffe"])).map((option) => option.ingredient)).toEqual([
      "Potatis",
      "Riven kokos",
    ]);
  });

  test(`at most ${MAX_OPTIONS}`, () => {
    expect(optionsFor("a")).toHaveLength(MAX_OPTIONS);
  });

  test("names starting with the text, then aliases starting with it, then names and aliases containing it", () => {
    const cheeses: PickableIngredient[] = [
      { name: "Rostbiff", aliases: [] },
      { name: "Halloumi", aliases: ["Grillost"] },
      { name: "Ostronsås", aliases: [] },
      { name: "Mjukost", aliases: ["Ost i tub"] },
      { name: "Kvarg", aliases: ["Kesella", "Östgöta kvarg"] },
      { name: "Fetaost", aliases: [] },
      { name: "Burrata", aliases: ["Ostboll"] },
      { name: "Ost", aliases: [] },
      { name: "Ägg", aliases: [] },
    ];
    expect(ingredientOptions("OST", cheeses, nothingAdded)).toEqual([
      // Names starting with it.
      { ingredient: "Ost" },
      { ingredient: "Ostronsås" },
      // Aliases starting with it, before Mjukost's name that only contains it.
      { ingredient: "Burrata", alias: "Ostboll" },
      { ingredient: "Kvarg", alias: "Östgöta kvarg" },
      { ingredient: "Mjukost", alias: "Ost i tub" },
      // Names containing it.
      { ingredient: "Fetaost" },
      { ingredient: "Rostbiff" },
      // Aliases containing it.
      { ingredient: "Halloumi", alias: "Grillost" },
    ]);
  });

  test("the fixtures' oils: names first, then Rapsolja by its alias Olja, then names containing ol", () => {
    expect(optionsFor("ol")).toEqual([
      { ingredient: "Oliver" },
      { ingredient: "Olivolja" },
      { ingredient: "Rapsolja", alias: "Olja" },
      { ingredient: "Collorit" },
      { ingredient: "Rågmjöl" },
      { ingredient: "Soltorkade tomater" },
      { ingredient: "Vetemjöl" },
    ]);
  });
});
