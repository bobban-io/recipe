---
title: Ingredient finder and recipe categories
labels: [wayfinder:map]
status: closed
created: 2026-11-13
---

## Destination

A build-ready spec for two linked features. The **ingredient finder**: enter what you have at
home (with amounts) and get recipes, and combos of recipes, that use it, plus what you'd still
need to buy. **Recipe categories** (what kind of dish; weekday or weekend) filter both the
finder and the main recipe list. Reached when no decision is left open before building.

Reached: [the build spec](spec.md).

## Notes

- **Domain**: a static (prerendered, no server) Swedish recipe site. 11 recipes as markdown with
  YAML frontmatter in `src/recipes/`. Ingredient lines are free-text names measured in grams,
  baker's percent, or `st/dl/msk/tsk/krm`, scaled by yield (`src/lib/recipes.ts`,
  `src/lib/scale.ts`). Free-text search already exists (`src/lib/search.ts`).
- **Skills**: `domain-modeling` on every grilling ticket. Start `CONTEXT.md` when the first term
  resolves; this map introduces several (on-hand ingredient, staple, combo, category). The
  `grilling` skill isn't installed, so grill conversationally. Use `frontend-design` for the
  prototype and `unslop` for anything written.
- **Preferences**: keep interrogation light. Bring a recommended answer to each question and
  only ask what the user has to decide. Adding a recipe must stay "drop a .md file". UI copy is
  Swedish.
- **Tracker**: local markdown; conventions in [.wayfinder/README.md](../README.md).

## Decisions so far

<!-- one line per closed ticket: [title](NN-slug.md): gist -->

- [Prior art: ingredient-based recipe finders](02-prior-art.md): tools pick from a fixed
  ingredient list, special-case staples, and rank by most used or fewest missing; only Grocy
  checks quantities, and nobody documents combo selection.
- [Ingredient identity](01-ingredient-identity.md): a flat ingredient catalog maps line names
  (aliases) to ingredients by a "swap without thinking" rule; the build fails on unknown names,
  and you pick on-hand ingredients from the catalog.
- [Recipe categories](03-recipe-categories.md): every recipe has one dish type (huvudrätt,
  bröd, bakverk, efterrätt); huvudrätter also have an occasion, vardag or helg, where helg means
  a treat. Both are required, and the 11 recipes are classified.
- [Suggestion matching and ranking](04-suggestion-matching.md): a suggestion uses at least one
  of yours; rank by can-make-now, then most of yours used, then fewest missing. Salt,
  Svartpeppar and Vatten are fixed staples, optional lines are never missing, and the oil
  ingredient is renamed Rapsolja.
- [Quantity-aware matching](05-quantity-aware-matching.md): amounts are optional, in one entry
  unit per ingredient (g, dl or st, six with a conversion factor); compared at the default
  yield, short ingredients go on the buy list as the difference, and the largest yield you can
  make shows when it's lower.
- [Recipe combos](06-recipe-combos.md): two recipes that together use more of yours than any
  single one, each bringing something; scored as a pair with amounts added, shown in their own
  section (top 3) only when they beat the best single; the category filter applies to both.
- [Finder prototype](07-finder-prototype.md): a "Vad har du hemma?" tab on the home page; picks
  become rows with an optional amount; each suggestion shows a status, what it uses and a
  copyable buy list; combos follow under "Två recept tillsammans"; one row of category chips
  (Vardagsmat, Helgmat, Bröd, Bakverk) filters both tabs.
- [Catalog and frontmatter format](08-catalog-and-frontmatter-format.md): `src/recipes/ingredients.yaml`
  holds one line per ingredient (entry unit, aliases, staple, grams per dl or st); recipes gain
  `dishType`, `occasion` and `optional: true` on lines; the build reports every problem at once,
  by file. Vitlök is renamed Vitlöksklyftor.
- [Spec handoff](09-spec-handoff.md): one [build spec](spec.md) next to the map, built in five
  slices (catalog and checks, category filter, matching engine, finder tab, combos), each checked
  by `bun test` against a frozen copy of the recipes and the sample fridges.

## Not yet specified

Nothing left in the fog. The way to the destination is clear.

## Out of scope

- **Remembering on-hand ingredients between visits.** Ruled out while charting: you enter what
  you have each time.
