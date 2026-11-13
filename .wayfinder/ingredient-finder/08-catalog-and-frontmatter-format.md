---
id: 8
title: Catalog and frontmatter format
labels: [wayfinder:grilling]
status: closed
assignee: Robin Bertilsson (2026-11-13)
blocked-by: []
---

## Question

How is the decided data written down, so adding a recipe stays "drop a .md file"? Settle:

- the ingredient catalog's file format and location, and how an entry carries its aliases,
  staple status, entry unit and, for the six mixed ingredients, its conversion factor (with the
  values; see [Quantity-aware matching](05-quantity-aware-matching.md));
- the recipe frontmatter for dish type, occasion ([Recipe categories](03-recipe-categories.md))
  and optional lines ([Suggestion matching and ranking](04-suggestion-matching.md));
- what the build checks and how a failure reads: an unknown line name, a line that can't convert
  to its entry unit, a missing dish type, an occasion on something other than a huvudrätt;
- how AGENTS.md describes adding a recipe and adding an ingredient;
- whether any line names in the 11 recipes still need a merge decision beyond those settled in
  [Ingredient identity](01-ingredient-identity.md).

## Resolution (2026-11-13)

**The catalog file** is `src/recipes/ingredients.yaml`, next to the recipes. The recipe loader
only reads `*.md`, so it isn't taken for a recipe. One line per ingredient, keyed by its name and
sorted alphabetically:

- `unit`: the entry unit, `g`, `dl` or `st`. Required on every ingredient except the staples,
  which take none. It follows how the recipes measure the ingredient: weight lines (grams or
  baker's percent) make it g, volume lines dl, `st` lines st.
- `aliases`: the other names that mean it. A line with the ingredient's own name always matches,
  so the name isn't repeated. 10 of the 79 ingredients have aliases.
- `staple: true` on Salt, Svartpeppar and Vatten. Staple lines are never converted, so Salt's
  lines in krm, tsk, g and baker's percent need no factor.
- `gramsPerDl`, `gramsPerSt`: how a line converts to the entry unit when an ingredient's lines
  mix weight, volume and count. Every conversion goes through grams, so an ingredient measured in
  both dl and st would need both.

Every entry that carries more than a `unit`:

```yaml
Fläskfilé: { unit: g, aliases: [Fläskytterfilé] }
Kaffe: { unit: dl, aliases: [Kokt kaffe] }
Kyckling: { unit: g, aliases: [Kycklingfilé, Kycklingbröstfilé] }
Olivolja: { unit: dl, gramsPerDl: 90, aliases: [Extra jungfru olivolja] }
Potatis: { unit: st, gramsPerSt: 100, aliases: [Fast potatis, Kokt potatis] }
Rapsolja: { unit: dl, gramsPerDl: 90, aliases: [Neutral olja, Olja, Neutral olja till fritering] }
Ris: { unit: dl, aliases: [Jasminris, Basmatiris] }
Salt: { staple: true, aliases: [Flingsalt] }
Smör: { unit: g, gramsPerDl: 90 }
Socker: { unit: dl, aliases: [Strösocker] }
Svartpeppar: { staple: true }
Torkad oregano: { unit: dl, gramsPerDl: 20 }
Vatten: { staple: true }
Vetemjöl: { unit: g, gramsPerDl: 60 }
Vitlöksklyftor: { unit: st, aliases: [Vitlöksklyfta] }
```

The other 64 line names are each an ingredient of the same name with only a `unit`, set by the
rule above. Torkad oregano gets 20 g/dl rather than the prototype's 10: dried oregano leaves weigh
about 1 g per tsk. An ingredient no recipe uses is allowed; the picker hides it.

**Recipe frontmatter.** Two fields after `description`: `dishType` (`huvudrätt`, `bröd`,
`bakverk` or `efterrätt`) and, on a huvudrätt only, `occasion` (`vardag` or `helg`). English keys
and Swedish values, like the existing fields. The 11 recipes take the values classified in
[Recipe categories](03-recipe-categories.md). An ingredient line can take `optional: true`; three
do: Grönsaker in Kycklingsouvlaki, Riven kokos in Kladdkaksmuffins, Färsk dill in Lángos. The
flag only affects the finder. The recipe page doesn't change, and notes keep their wording
("valfria").

```yaml
dishType: huvudrätt
occasion: helg
# …
  - { name: Grönsaker, grams: 300, optional: true, note: "valfria, skivade – t.ex. tomat, gurka och rödlök" }
```

**Build checks.** They run where recipes are parsed, so `bun run dev` and `bun run build` fail
alike. Every problem is collected and reported at once, each naming its file, so a new recipe
with three unknown names fails once with all three:

```
Recipes don't build:
  yakiniku.md: "Kycklinglårfilé" isn't in the ingredient catalog. Add it to src/recipes/ingredients.yaml as an alias of an ingredient, or as a new one.
  langos.md: "Kokt potatis" is in g, but Potatis is entered in st. Give Potatis gramsPerSt.
  sourdough.md: dishType is missing. Use huvudrätt, bröd, bakverk or efterrätt.
  yakiniku.md: a huvudrätt needs an occasion: vardag or helg.
  kladdkaksmuffins.md: only a huvudrätt has an occasion; this is bakverk.
  ingredients.yaml: "Olja" is listed under both Rapsolja and Olivolja.
```

Recipe checks: an unknown line name; a line that can't convert to its ingredient's entry unit; a
missing or unknown `dishType`; a huvudrätt with a missing or unknown `occasion`; an `occasion` on
anything else. Catalog checks: a name claimed by two ingredients (as two aliases, or as one's name
and another's alias); a missing or unknown `unit` on an ingredient that isn't a staple; a staple
with a `unit`. A duplicate ingredient name already fails as a YAML error. Unused entries and
aliases pass.

**AGENTS.md.** The Recipes section adds `dishType`, `occasion` and `optional` to its description
of the frontmatter. A new "Ingredient catalog" section says:

- every ingredient line's name must be in `src/recipes/ingredients.yaml`, as an ingredient or an
  alias;
- for a new name, add it to an existing ingredient's aliases if you'd swap the two without a
  second thought, otherwise add an ingredient. Something prepared while cooking is the raw
  ingredient (Kokt potatis → Potatis); something bought ready-made is its own (Tzatziki);
- `unit` follows how the recipes measure the ingredient, and one whose lines mix weight, volume
  and count needs `gramsPerDl` or `gramsPerSt`;
- the staples are fixed: Salt, Svartpeppar, Vatten.

The wording is written with the build.

**Remaining line names.** All 89 checked against the catalog; no merges are left. Kokt kaffe →
Kaffe follows the prepared-while-cooking rule from [Ingredient identity](01-ingredient-identity.md).
Flytande honung keeps its name, settled with the user; search matches substrings, so "honung"
finds it.

**Rename.** Vitlök is now **Vitlöksklyftor**, settled with the user. It's counted in cloves, and
"6 st Vitlök" on a buy list reads as six heads. Typing "vitlök" still finds it. Chosen over a unit
label per ingredient ("6 klyftor"), a catalog field only one ingredient would use. Updated in
Ingredient identity; the sample fridges in earlier tickets still say Vitlök and give the same
results.

**Handed on:**

- [Spec handoff](09-spec-handoff.md): the uncommitted recipe edits from Ingredient identity
  (Strösocker in Peppargryta, Vetemjöl in Lángos) ship with the first slice. The prototype's
  `catalog.ts` uses 10 g/dl for oregano and the name Vitlök, so tests ported from it need both
  changed.

Terms recorded in [CONTEXT.md](../../CONTEXT.md): entry unit; ingredient catalog now says what an
entry holds.
