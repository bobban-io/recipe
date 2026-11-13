# AGENTS.md

You're a senior full-stack engineer and you pay attention to details, whether that's pure frontend, backend or design work.
When you're uncertain, or the scope is unclear - ask questions, don't guess.

## Tooling

- Use `bun` for installing, running scripts, and executing binaries. Do not use `pnpm`, `npm`, or `yarn`.

## Stack

- **TanStack Start** (React) built with **Vite**, statically prerendered (SSG) — no server runtime.
- **Radix UI Themes** (dark) for UI, plus a little CSS in `src/styles.css`.
- File-based routing in `src/routes` (`__root.tsx`, `index.tsx`, `recipes/$slug.tsx`).
- Deployed to **GitHub Pages** at `recipe.bobban.io` via `.github/workflows/deploy.yml`
  (build output is `dist/client`; `public/CNAME` + `public/.nojekyll` ship with it).

Scripts: `bun run dev`, `bun run build`, `bun run preview`, `bun run typecheck`, `bun run lint`, `bun run test`.

## Recipes

Recipes are plain markdown files in `src/recipes/`, written in casual Swedish (the UI is Swedish too). **To add one, drop a new `.md` file there** —
it is picked up automatically (the home page and prerendering discover it). Every ingredient line's name must be in
the ingredient catalog (see below), so a recipe with a new name needs a catalog entry too. Structure:

- **YAML frontmatter** holds the scalable data: `title`, `description`, `dishType`, `occasion`,
  `yieldUnit` (e.g. `limpa` or `portion`), `yieldUnitPlural` (e.g. `limpor`; omit when the
  plural is the same, like `muffins`), `defaultYield`, and `ingredients`.
- `dishType` is `huvudrätt` for lunch or dinner, `bröd`, `bakverk` or `efterrätt`. A huvudrätt
  also takes `occasion`, `vardag` for everyday food or `helg` for a weekend treat. Nothing else
  takes an occasion. Cooking time alone doesn't make a dish helg.
- Each ingredient line is measured in exactly one way: a weight (`grams`), a baker's
  percentage (`percent`, relative to the total weight of the lines flagged
  `flour: true`), or an `amount` + `unit` (`st`, `dl`, `msk`, `tsk`, `krm`; shown
  rounded to quarters, e.g. `1½ dl`). Prefer the unit you'd naturally measure with —
  eggs in `st`, not grams.
- `ingredients` is either a flat list, or named sections when a recipe has distinct
  parts — `- { section: smet, items: [...] }` renders as "Ingredienser (smet)".
- Optional `note` shows after the name. It doesn't scale, so keep quantities out of it
  (`rivna`, not `ca 4 dl`).
- `optional: true` marks a line the dish works without, like a garnish or vegetables on the
  side: `{ name: Grönsaker, grams: 300, optional: true, note: "valfria, skivade" }`. Only the
  ingredient finder reads it. The recipe page doesn't show it, so the note is where readers
  learn a line is optional.
- The **markdown body** is the free-form method/steps, rendered with `react-markdown`.

Amounts scale linearly with the chosen yield. `src/lib/recipes.ts` is the loader and the only
module that uses Vite's `import.meta.glob` and `?raw` imports. It passes the raw files to
`loadRecipes`, which throws one error listing every problem, so `bun run dev` and
`bun run build` fail alike. The other modules in `src/lib` hold pure functions that take their
data as arguments, so `bun test` runs them without Vite:

- `recipe.ts` parses one recipe file (frontmatter via `js-yaml`, validated with `zod`) and
  holds the recipe types.
- `catalog.ts` parses the ingredient catalog. `ingredientFor` finds the ingredient a line
  belongs to.
- `needs.ts` converts lines to entry units. `recipeNeeds` gives a recipe's need for each
  ingredient at its default yield, without staples.
- `checks.ts` runs the build checks (`checkRecipes`) and loads checked recipes (`loadRecipes`).
- `scale.ts` scales amounts to the chosen yield.

Keep `import.meta.glob` and `?raw` in the loader. All of `src/lib` must stay browser-safe,
since it runs during prerender and client-side navigation.

## Ingredient catalog

`src/recipes/ingredients.yaml` lists every ingredient: something you'd say you have at home,
like Kyckling or Ägg. It has one line per ingredient, keyed by its name, in Swedish alphabetical
order:

```yaml
Potatis: { unit: st, gramsPerSt: 100, aliases: [Fast potatis, Kokt potatis] }
```

- Every ingredient line's name must be in the catalog, as an ingredient's name or one of its
  `aliases`. The build fails on a name it can't find.
- For a new name, add it to an existing ingredient's `aliases` if you'd swap the two without a
  second thought. Otherwise add a new ingredient. Something prepared while cooking is the raw
  ingredient, so Kokt potatis is Potatis. Something bought ready-made, like Tzatziki, is its own
  ingredient.
- `unit` is the entry unit, `g`, `dl` or `st`, and follows how the recipes measure the
  ingredient. Weight lines (`grams` or `percent`) make it `g`, volume lines (`dl`, `msk`, `tsk`,
  `krm`) make it `dl`, and `st` lines make it `st`.
- An ingredient whose lines mix weight, volume and count needs `gramsPerDl` or `gramsPerSt` to
  convert every line to its entry unit. The build error names the factor to add.
- The staples are fixed: Salt, Svartpeppar and Vatten. They have `staple: true` and no `unit`.

## Tests

`bun test` runs the `*.test.ts` files, which sit next to the code they test. CI runs them before
the build.

- Test through the pure modules in `src/lib`. A test can't import `src/lib/recipes.ts`, because
  it needs Vite.
- `test/fixtures/` is a frozen copy of the 11 recipes and the catalog from when the ingredient
  finder was built. Test the finder's rules against it with `loadFixtures()` from
  `test/recipeFolders.ts`, so adding a recipe never breaks a test. Change the copy only when the
  file format changes, never to follow new recipes.
