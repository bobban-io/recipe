import { describe, expect, test } from "bun:test";
import { loadFixtures } from "../../test/recipeFolders";
import {
  defaultYieldCaption,
  inRunningText,
  matchStatus,
  nameList,
  suggestionStatus,
  toBuyNames,
  usesText,
  yieldLimitText,
} from "~/lib/finderText";
import { suggest, type OnHandIngredient, type Suggestion } from "~/lib/suggestions";

const { recipes, catalog } = loadFixtures();

function suggestionFor(onHand: OnHandIngredient[], title: string): Suggestion {
  const suggestion = suggest(recipes, catalog, onHand, () => true).find(
    (candidate) => candidate.recipe.title === title,
  );
  if (!suggestion) throw new Error(`${title} isn't a suggestion`);
  return suggestion;
}

function have(...ingredients: string[]): OnHandIngredient[] {
  return ingredients.map((ingredient) => ({ ingredient }));
}

const MUFFINS_WITHOUT_EGGS = have("Smör", "Socker", "Vetemjöl", "Kakao", "Vaniljsocker", "Florsocker", "Kaffe");

describe("names in running text", () => {
  test("a capital followed by a lowercase letter is lowercased", () => {
    expect(inRunningText("Kyckling")).toBe("kyckling");
    expect(inRunningText("Ägg")).toBe("ägg");
    expect(inRunningText("Crème fraiche")).toBe("crème fraiche");
  });

  test("HP-sås stays as it is", () => {
    expect(inRunningText("HP-sås")).toBe("HP-sås");
  });

  test("Swedish list format", () => {
    expect(nameList(["Kyckling", "Citron", "Vitlöksklyftor"])).toBe("kyckling, citron och vitlöksklyftor");
    expect(nameList(["HP-sås", "Färsk dill"])).toBe("HP-sås och färsk dill");
    expect(nameList(["Ägg"])).toBe("ägg");
  });

  test("Använder {n} av dina {m}, where m is the number of rows", () => {
    expect(usesText(["Kyckling", "Citron", "Vitlöksklyftor"], 4)).toBe(
      "Använder 3 av dina 4: kyckling, citron och vitlöksklyftor",
    );
  });
});

describe("statuses", () => {
  test("Du har allt: can make now at the default yield", () => {
    const bread = suggestionFor(have("Vetemjöl", "Rågmjöl", "Surdegsgrund"), "Surdegsbröd");
    expect(suggestionStatus(bread)).toEqual({ text: "Du har allt", tone: "ready" });

    const muffins = suggestionFor([{ ingredient: "Ägg", amount: 4 }, ...MUFFINS_WITHOUT_EGGS], "Kladdkaksmuffins");
    expect(muffins.largestYield).toBe(12);
    expect(suggestionStatus(muffins)).toEqual({ text: "Du har allt", tone: "ready" });
  });

  test("Du har allt för {n} av {default}: can make now at a smaller yield", () => {
    const muffins = suggestionFor([{ ingredient: "Ägg", amount: 2 }, ...MUFFINS_WITHOUT_EGGS], "Kladdkaksmuffins");
    expect(suggestionStatus(muffins)).toEqual({ text: "Du har allt för 6 av 12 muffins", tone: "ready" });
  });

  test("Saknar {n}: n missing ingredients", () => {
    const souvlaki = suggestionFor([{ ingredient: "Kyckling", amount: 400 }], "Kycklingsouvlaki");
    expect(suggestionStatus(souvlaki)).toEqual({ text: "Saknar 10", tone: "missing" });
  });

  test("Räcker inte: nothing missing, but the amounts don't cover one unit", () => {
    const bread = suggestionFor(
      [{ ingredient: "Vetemjöl", amount: 300 }, ...have("Rågmjöl", "Surdegsgrund")],
      "Surdegsbröd",
    );
    expect(suggestionStatus(bread)).toEqual({ text: "Räcker inte", tone: "short" });
  });

  test("a combo's status, which has no largest yield", () => {
    expect(matchStatus({ canMakeNow: true, missing: [] })).toEqual({ text: "Du har allt", tone: "ready" });
    expect(matchStatus({ canMakeNow: false, missing: [{}, {}] })).toEqual({ text: "Saknar 2", tone: "missing" });
    expect(matchStatus({ canMakeNow: false, missing: [] })).toEqual({ text: "Räcker inte", tone: "short" });
  });
});

describe("yieldLimitText", () => {
  test("can't make now, and the amounts cover part of the default yield", () => {
    const souvlaki = suggestionFor([{ ingredient: "Kyckling", amount: 400 }], "Kycklingsouvlaki");
    expect(yieldLimitText(souvlaki)).toBe("Det du har räcker till 2 av 6 portioner.");
  });

  test("at 0, it names one unit", () => {
    const bread = suggestionFor(
      [{ ingredient: "Vetemjöl", amount: 300 }, ...have("Rågmjöl", "Surdegsgrund")],
      "Surdegsbröd",
    );
    expect(yieldLimitText(bread)).toBe("Det du har räcker inte till 1 limpa.");
  });

  test("no line when you can make it now, when the amounts cover the default yield, or without amounts", () => {
    const muffins = suggestionFor([{ ingredient: "Ägg", amount: 2 }, ...MUFFINS_WITHOUT_EGGS], "Kladdkaksmuffins");
    expect(yieldLimitText(muffins)).toBeUndefined();
    const plenty = suggestionFor([{ ingredient: "Kyckling", amount: 1000 }], "Kycklingsouvlaki");
    expect(yieldLimitText(plenty)).toBeUndefined();
    expect(yieldLimitText(suggestionFor(have("Kyckling"), "Kycklingsouvlaki"))).toBeUndefined();
  });
});

describe("the buy list's text", () => {
  test("Att köpa names shortfalls first, as mer {name}, then the missing ingredients", () => {
    const souvlaki = suggestionFor([{ ingredient: "Kyckling", amount: 400 }], "Kycklingsouvlaki");
    expect(toBuyNames(souvlaki)).toBe(
      "mer kyckling, grekisk yoghurt, citron, vitlöksklyftor, rapsolja, torkad oregano, paprikapulver, " +
        "fryst pommes frites, olivolja, fetaost och tzatziki",
    );
  });

  test("the caption names the default yield, singular for one", () => {
    const bread = suggestionFor(have("Vetemjöl"), "Surdegsbröd");
    expect(defaultYieldCaption(bread.recipe)).toBe("Räknat på 1 limpa, som i receptet.");
    const souvlaki = suggestionFor(have("Kyckling"), "Kycklingsouvlaki");
    expect(defaultYieldCaption(souvlaki.recipe)).toBe("Räknat på 6 portioner, som i receptet.");
    const muffins = suggestionFor(have("Ägg"), "Kladdkaksmuffins");
    expect(defaultYieldCaption(muffins.recipe)).toBe("Räknat på 12 muffins, som i receptet.");
  });
});
