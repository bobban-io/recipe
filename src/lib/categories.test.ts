import { describe, expect, test } from "bun:test";
import { loadFixtures } from "../../test/recipeFolders";
import { categoryWord, filtersToShow, passesFilter, type CategoryFilter } from "~/lib/categories";

const { recipes } = loadFixtures();

function titlesIn(filter: CategoryFilter): string[] {
  return recipes
    .filter(passesFilter(filter))
    .map((recipe) => recipe.title)
    .sort();
}

describe("the filter on the fixture recipes", () => {
  test("Vardagsmat gives the five vardag huvudrätter", () => {
    expect(titlesIn("vardagsmat")).toEqual(
      ["Pad kra pow", "Yakiniku", "Italiensk pastasallad", "Kycklingtonkatsu", "Peppargryta"].sort(),
    );
  });

  test("Helgmat gives the four helg huvudrätter", () => {
    expect(titlesIn("helgmat")).toEqual(
      ["Kycklingsouvlaki", "Torsk med brynt smör", "Öppen sparrislasagne", "Lángos"].sort(),
    );
  });

  test("Bröd and Bakverk give one recipe each", () => {
    expect(titlesIn("bröd")).toEqual(["Surdegsbröd"]);
    expect(titlesIn("bakverk")).toEqual(["Kladdkaksmuffins"]);
  });

  test("Alla gives every recipe, and every recipe is in exactly one other chip", () => {
    expect(titlesIn("alla")).toHaveLength(11);
    for (const recipe of recipes) {
      const chips = filtersToShow([recipe]).filter((filter) => filter !== "alla");
      expect(chips).toHaveLength(1);
    }
  });

  test("there's no Efterrätter chip", () => {
    expect(filtersToShow(recipes)).toEqual(["alla", "vardagsmat", "helgmat", "bröd", "bakverk"]);
  });
});

test("an efterrätt adds the Efterrätter chip last", () => {
  expect(filtersToShow([...recipes, { dishType: "efterrätt" }])).toEqual([
    "alla",
    "vardagsmat",
    "helgmat",
    "bröd",
    "bakverk",
    "efterrätter",
  ]);
  expect(filtersToShow([])).toEqual([]);
});

test("a card's category word is singular", () => {
  expect(categoryWord({ dishType: "huvudrätt", occasion: "vardag" })).toBe("Vardagsmat");
  expect(categoryWord({ dishType: "huvudrätt", occasion: "helg" })).toBe("Helgmat");
  expect(categoryWord({ dishType: "bröd" })).toBe("Bröd");
  expect(categoryWord({ dishType: "bakverk" })).toBe("Bakverk");
  expect(categoryWord({ dishType: "efterrätt" })).toBe("Efterrätt");
});
