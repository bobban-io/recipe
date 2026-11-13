---
id: 9
title: Spec handoff
labels: [wayfinder:grilling]
status: closed
assignee: Robin Bertilsson (2026-11-13)
blocked-by: [8]
---

## Question

How does the finished spec reach whoever builds it? Settle:

- whether the build works from the closed tickets as they stand, or from one spec document
  assembled from them, and where that document lives;
- how the build is sliced into pieces small enough for one agent session each, and in what order
  (for example the catalog and frontmatter with their build checks first, then matching, then the
  finder UI and the category filter, then combos);
- what each slice is checked against: the sample fridges in
  [Suggestion matching and ranking](04-suggestion-matching.md),
  [Quantity-aware matching](05-quantity-aware-matching.md) and
  [Recipe combos](06-recipe-combos.md), and the [Finder prototype](07-finder-prototype.md).

## Resolution (2026-11-13)

**One spec document.** The build works from [the build spec](spec.md), not from the tickets. The
tickets still carry values that later tickets replaced (Neutral olja, Vitlök, 10 g/dl for oregano,
"Huvudrätt · Vardag" on cards), so the spec states only the final rules and links back to the
tickets for the reasoning. Where they differ, the spec is right. It lives next to the map.
`.wayfinder/` and `CONTEXT.md` are committed, because a build agent working in a worktree can't
see uncommitted files.

**Five slices**, one agent session each, in this order. Each lands on `main` and leaves the site
working, since every push to `main` deploys to recipe.bobban.io.

1. Catalog, frontmatter and build checks, with the two uncommitted recipe edits and the test
   setup. Visitors see no change.
2. Category filter on the recipe list. It doesn't depend on matching, so it ships early.
3. Matching engine, with no UI.
4. Finder tab.
5. Combos, the engine and the UI together. The finder works without them, so they come last.

**Checks.** Tests run with `bun test`, set up in slice 1. `@types/bun` is added as a dev
dependency so typecheck accepts `bun:test` imports, and the deploy workflow runs the tests before
the build. The sample fridges become tests against a frozen copy of the 11 recipes and the catalog
in `test/fixtures/`, taken at the end of slice 1. Against the live recipes, a new recipe could
change a fridge's ranking, and adding a recipe has to stay "drop a .md file". Because the loader
uses `import.meta.glob`, which only works under Vite, parsing, the build checks and the engine are
pure functions that take their data as arguments. Slice 4 is checked by entering the same fridges
in the app and in the prototype. Every slice passes typecheck, lint, tests and build.

**Filled in while writing the spec**, not settled in an earlier ticket:

- The selected tab is stored with the finder's rows and the filter, so going back from a recipe
  returns to the finder. The prototype keeps the tab in component state and returns to Alla recept.
- A recipe card names an efterrätt "Efterrätt", while the chip reads "Efterrätter".

No new terms for [CONTEXT.md](../../CONTEXT.md).
