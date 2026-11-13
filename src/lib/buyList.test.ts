import { describe, expect, test } from "bun:test";
import { loadFixtures } from "../../test/recipeFolders";
import { buyList, buyListText, formatBuyAmount, formatOnHandAmount } from "~/lib/buyList";
import { suggest } from "~/lib/suggestions";

describe("formatBuyAmount", () => {
  test("small volumes step down: 0.3 dl is 2 msk, 0.05 dl 1 tsk, 0.02 dl 2 krm", () => {
    expect(formatBuyAmount(0.3, "dl")).toBe("2 msk");
    expect(formatBuyAmount(0.05, "dl")).toBe("1 tsk");
    expect(formatBuyAmount(0.02, "dl")).toBe("2 krm");
  });

  test("dl shows in quarters from ½ dl up", () => {
    expect(formatBuyAmount(0.5, "dl")).toBe("½ dl");
    expect(formatBuyAmount(1.45, "dl")).toBe("1½ dl");
    expect(formatBuyAmount(11, "dl")).toBe("11 dl");
  });

  test("each smaller measure takes over at its own size, in quarters", () => {
    expect(formatBuyAmount(0.49, "dl")).toBe("3¼ msk");
    expect(formatBuyAmount(0.15, "dl")).toBe("1 msk");
    expect(formatBuyAmount(0.14, "dl")).toBe("2¾ tsk");
    expect(formatBuyAmount(0.04, "dl")).toBe("4 krm");
    expect(formatBuyAmount(0.001, "dl")).toBe("¼ krm");
  });

  test("float error doesn't tip an amount under a threshold", () => {
    expect(formatBuyAmount(1.45 - 1.3, "dl")).toBe("1 msk");
  });

  test("grams round as on the recipe page", () => {
    expect(formatBuyAmount(600, "g")).toBe("600 g");
    expect(formatBuyAmount(199.6, "g")).toBe("200 g");
    expect(formatBuyAmount(2.54, "g")).toBe("2,5 g");
  });

  test("a count rounds to the nearest quarter", () => {
    expect(formatBuyAmount(2, "st")).toBe("2 st");
    expect(formatBuyAmount(0.9, "st")).toBe("1 st");
    expect(formatBuyAmount(1.3, "st")).toBe("1¼ st");
  });
});

describe("formatOnHandAmount", () => {
  test("up to two decimals, with a decimal comma", () => {
    expect(formatOnHandAmount(400, "g")).toBe("400 g");
    expect(formatOnHandAmount(1.5, "dl")).toBe("1,5 dl");
    expect(formatOnHandAmount(1 / 3, "st")).toBe("0,33 st");
  });
});

describe("buyListText", () => {
  test("one line per item, the amount then the name, shortfalls first", () => {
    const items = buyList({
      shortfalls: [{ ingredient: "Kyckling", unit: "g", amount: 600, have: 400 }],
      missing: [
        { ingredient: "Citron", unit: "st", amount: 1 },
        { ingredient: "Paprikapulver", unit: "dl", amount: 0.075 },
      ],
    });
    expect(buyListText(items)).toBe("600 g Kyckling\n1 st Citron\n1½ tsk Paprikapulver");
  });

  test("uses plain spaces, though Intl separates thousands with a no-break space", () => {
    expect(formatBuyAmount(1000, "g")).toBe("1\u00a0000 g");
    expect(buyListText([{ ingredient: "Kyckling", unit: "g", amount: 1000 }])).toBe("1 000 g Kyckling");
  });

  test("Kycklingsouvlaki with 400 g Kyckling: the shortfall, then every missing ingredient", () => {
    const { recipes, catalog } = loadFixtures();
    const souvlaki = suggest(recipes, catalog, [{ ingredient: "Kyckling", amount: 400 }], () => true).find(
      (suggestion) => suggestion.recipe.title === "Kycklingsouvlaki",
    );
    if (!souvlaki) throw new Error("Kycklingsouvlaki isn't a suggestion");
    expect(buyListText(buyList(souvlaki)).split("\n")).toEqual([
      "600 g Kyckling",
      "1½ dl Grekisk yoghurt",
      "1 st Citron",
      "3 st Vitlöksklyftor",
      "1 dl Rapsolja",
      "2¼ msk Torkad oregano",
      "1½ tsk Paprikapulver",
      "1 000 g Fryst pommes frites",
      "1¾ msk Olivolja",
      "200 g Fetaost",
      "500 g Tzatziki",
    ]);
  });
});
