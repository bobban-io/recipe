import { expect, test } from "bun:test";
import { ingredientFor, parseCatalog } from "~/lib/catalog";

const catalog = parseCatalog(
  ["Kyckling: { unit: g, aliases: [Kycklingfilé, Kycklingbröstfilé] }", "Salt: { staple: true }"].join("\n"),
).catalog!;

test("ingredientFor finds an ingredient by its name or an alias, and nothing else", () => {
  expect(ingredientFor(catalog, "Kyckling")?.name).toBe("Kyckling");
  expect(ingredientFor(catalog, "Kycklingbröstfilé")?.name).toBe("Kyckling");
  expect(ingredientFor(catalog, "kyckling")).toBeUndefined();
  expect(ingredientFor(catalog, "Kycklinglårfilé")).toBeUndefined();
});

test("a staple has no entry unit; every other ingredient has one", () => {
  expect(catalog.ingredients).toEqual([
    { name: "Kyckling", aliases: ["Kycklingfilé", "Kycklingbröstfilé"], staple: false, unit: "g" },
    { name: "Salt", aliases: [], staple: true },
  ]);
});
