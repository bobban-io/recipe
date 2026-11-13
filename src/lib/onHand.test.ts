import { describe, expect, test } from "bun:test";
import { onHandIngredients, parseAmount } from "~/lib/onHand";

describe("parseAmount", () => {
  test("takes a comma or a dot", () => {
    expect(parseAmount("1,5")).toBe(1.5);
    expect(parseAmount("1.5")).toBe(1.5);
    expect(parseAmount("400")).toBe(400);
    expect(parseAmount(",5")).toBe(0.5);
  });

  test('"1," counts as 1 while you type', () => {
    expect(parseAmount("1,")).toBe(1);
    expect(parseAmount("1.")).toBe(1);
  });

  test("ignores surrounding spaces", () => {
    expect(parseAmount(" 2 ")).toBe(2);
  });

  test("anything that isn't a positive number is no amount", () => {
    for (const text of ["", " ", "0", "0,0", "-2", "abc", "1,2,3", "1 000", "1e3", "Infinity", ",", "2 dl"]) {
      expect(parseAmount(text)).toBeUndefined();
    }
  });
});

describe("onHandIngredients", () => {
  test("parses each row's amount text, and leaves out an amount that doesn't parse", () => {
    expect(
      onHandIngredients([
        { ingredient: "Kyckling", amountText: "400" },
        { ingredient: "Citron", amountText: "" },
        { ingredient: "Grädde", amountText: "2,5" },
        { ingredient: "Ägg", amountText: "0" },
      ]),
    ).toEqual([
      { ingredient: "Kyckling", amount: 400 },
      { ingredient: "Citron" },
      { ingredient: "Grädde", amount: 2.5 },
      { ingredient: "Ägg" },
    ]);
  });
});
