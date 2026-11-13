# Build spec for the ingredient finder and recipe categories

This is what to build, in five slices of one agent session each. It's assembled from the closed
tickets of the [Ingredient finder and recipe categories](map.md) map and states only the final
rules. The tickets hold the reasoning and the alternatives that lost; where a ticket and this spec
differ, this spec is right. Terms such as ingredient line, staple, shortfall and combo mean what
[CONTEXT.md](../../CONTEXT.md) says.

## Every slice

- Build the slices in order, one per session. Each lands on `main` and leaves the site working,
  because every push to `main` deploys to recipe.bobban.io.
- A slice is done when `bun run typecheck`, `bun run lint`, `bun test` and `bun run build` pass,
  and the checks listed under it hold.
- UI copy is Swedish and given here word for word. Quotes inside UI text are ”…”, as in the
  existing search.
- Logic lives in pure functions that take their data as arguments. `import.meta.glob` and `?raw`
  imports only work under Vite, so they stay in the loader in `src/lib/recipes.ts`. Everything a
  test touches must run under `bun test` without Vite.
- The prototype is commit `1f512ab` on the branch `prototype/finder`, checked out at
  `.claude/worktrees/finder-prototype` (run `bun run dev` there). Compare your work with it, but
  don't build on its code. Its `src/prototype/catalog.ts` still says Vitlök and 10 g/dl for Torkad
  oregano, and its cards say "Huvudrätt · Vardag". This spec has the final values.
- Update AGENTS.md when a slice changes something it describes.

## Slice 1: catalog, frontmatter and build checks

Visitors see no change. Afterwards every ingredient line belongs to an ingredient in the catalog,
every recipe has its categories, and a broken recipe fails the build with every problem listed.

### Two recipe edits

Two edits from [Ingredient identity](01-ingredient-identity.md) are uncommitted in the main
checkout. Commit them in this slice. In a fresh worktree, make them again:

- `peppargryta.md`: the line `{ name: Sockerbitar, amount: 2, unit: st }` becomes
  `{ name: Strösocker, amount: 0.5, unit: msk }`, and "sockerbitarna" in step 6 becomes
  "strösockret".
- `langos.md`: the line name `Vetemjöl special` becomes `Vetemjöl`.

### The ingredient catalog

The catalog is `src/recipes/ingredients.yaml`. The loader only reads `*.md`, so it isn't taken for
a recipe. It has one flow-style line per ingredient, keyed by the ingredient's name and sorted in
Swedish alphabetical order. An entry has these fields:

- `unit`, the entry unit: `g`, `dl` or `st`. Every ingredient except a staple has one. Weight
  lines (grams or baker's percent) make it `g`, volume lines (dl, msk, tsk, krm) `dl`, and `st`
  lines `st`.
- `aliases`, the other names that mean the ingredient. A line with the ingredient's own name
  always matches, so the name isn't repeated here.
- `staple: true`, on Salt, Svartpeppar and Vatten only. Staples have no `unit`.
- `gramsPerDl` and `gramsPerSt`, for an ingredient whose lines mix weight, volume and count.

These are all the entries that carry more than a `unit`:

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

Every other line name is an ingredient of the same name with only a `unit`, set by the rule above.
That makes 79 ingredients, 3 of them staples. A different count means a name was merged or split
by mistake. [Ingredient identity](01-ingredient-identity.md) lists the names that stay apart
(Japansk soja and Ljus soja, Citron and Lime, Panko and Ströbröd, and more). An ingredient no
recipe uses is allowed.

An ingredient line belongs to the ingredient whose name or one of whose aliases equals the line's
`name` exactly.

### Recipe frontmatter

Recipes gain two fields after `description`:

- `dishType`: `huvudrätt`, `bröd`, `bakverk` or `efterrätt`. Required.
- `occasion`: `vardag` or `helg`. Required on a huvudrätt and not allowed on anything else.

| File                       | dishType  | occasion |
| -------------------------- | --------- | -------- |
| `pad-kra-pow.md`           | huvudrätt | vardag   |
| `yakiniku.md`              | huvudrätt | vardag   |
| `pastasallad.md`           | huvudrätt | vardag   |
| `tonkatsu.md`              | huvudrätt | vardag   |
| `peppargryta.md`           | huvudrätt | vardag   |
| `chicken-souvlaki.md`      | huvudrätt | helg     |
| `torsk-med-brynt-smor.md`  | huvudrätt | helg     |
| `sparrislasagne.md`        | huvudrätt | helg     |
| `langos.md`                | huvudrätt | helg     |
| `sourdough.md`             | bröd      |          |
| `kladdkaksmuffins.md`      | bakverk   |          |

An ingredient line can take `optional: true`. Three lines do: Grönsaker in `chicken-souvlaki.md`,
Riven kokos in `kladdkaksmuffins.md` and Färsk dill in `langos.md`. The flag only matters to the
finder. The recipe page doesn't change, and notes keep their wording ("valfria").

```yaml
dishType: huvudrätt
occasion: helg
# …
  - { name: Grönsaker, grams: 300, optional: true, note: "valfria, skivade – t.ex. tomat, gurka och rödlök" }
```

### Converting a line to its entry unit

The build check below needs this conversion, and slice 3 matches on it.

1. A line's measure: `grams` is grams. `percent` is grams of the recipe's total flour (the lines
   flagged `flour: true`, across all sections), as on the recipe page. `st` is a count. `dl`,
   `msk`, `tsk` and `krm` are 100, 15, 5 and 1 ml.
2. When the measure already matches the entry unit, grams stay grams, ml divided by 100 is dl, and
   a count stays a count.
3. Otherwise the conversion goes through grams: ml to grams and grams to dl use `gramsPerDl`, a
   count to grams and grams to `st` use `gramsPerSt`.
4. Staple lines are never converted.

A recipe's **need** for an ingredient is the sum of its converted lines in that recipe, at the
default yield. Smör in Kladdkaksmuffins is 200 g + 70 g.

### Build checks

The checks run in the loader, where recipes are parsed, so `bun run dev` and `bun run build` fail
alike. They collect every problem first and then throw one error listing them all, each naming its
file. The existing zod schema errors go in the same list instead of stopping at the first bad file.

Recipe checks:

- a line name that isn't in the catalog;
- a line that can't convert to its ingredient's entry unit;
- a missing or unknown `dishType`;
- a huvudrätt with a missing or unknown `occasion`;
- an `occasion` on anything but a huvudrätt.

Catalog checks:

- a name claimed by two ingredients, as two aliases or as one's name and another's alias;
- a missing or unknown `unit` on an ingredient that isn't a staple;
- a staple with a `unit`.

A duplicate ingredient name already fails as a YAML error. Unused ingredients and aliases pass.
The error reads like this:

```
Recipes don't build:
  yakiniku.md: "Kycklinglårfilé" isn't in the ingredient catalog. Add it to src/recipes/ingredients.yaml as an alias of an ingredient, or as a new one.
  langos.md: "Kokt potatis" is in g, but Potatis is entered in st. Give Potatis gramsPerSt.
  sourdough.md: dishType is missing. Use huvudrätt, bröd, bakverk or efterrätt.
  yakiniku.md: a huvudrätt needs an occasion: vardag or helg.
  kladdkaksmuffins.md: only a huvudrätt has an occasion; this is bakverk.
  ingredients.yaml: "Olja" is listed under both Rapsolja and Olivolja.
```

### Tests

- Set up `bun test`: a `"test": "bun test"` script, `@types/bun` as a dev dependency so `tsc`
  knows `bun:test`, and a "Run tests" step before "Build static site (SSG)" in
  `.github/workflows/deploy.yml`. Tests sit next to the code as `*.test.ts`.
- Each check has a test: a minimal bad recipe or catalog gives exactly the expected line. A
  recipe with three unknown names gives three lines.
- One test runs the checks on the real recipes and catalog and expects no problems.
- Freeze the fixtures. At the end of this slice, copy the 11 recipes and `ingredients.yaml` to
  `test/fixtures/`. Slices 3 and 5 test against this copy, so adding a recipe never breaks a test.
  Change the copy only when the file format changes, never to follow new recipes.

### AGENTS.md

- The Recipes section describes `dishType`, `occasion` and `optional`.
- A new "Ingredient catalog" section says that every line name must be in
  `src/recipes/ingredients.yaml`, as an ingredient or an alias. For a new name, add it to an
  existing ingredient's aliases if you'd swap the two without a second thought, otherwise add an
  ingredient. Something prepared while cooking is the raw ingredient (Kokt potatis is Potatis);
  something bought ready-made is its own (Tzatziki). `unit` follows how the recipes measure the
  ingredient, and one whose lines mix weight, volume and count needs `gramsPerDl` or
  `gramsPerSt`. The staples are fixed: Salt, Svartpeppar and Vatten.

### Done when

- The catalog has 79 ingredients and every line name in the 11 recipes belongs to one.
- `bun run build` passes on the real recipes, and each check has a passing test.
- The recipe pages look as before, apart from the two recipe edits.

## Slice 2: category filter on the recipe list

### What visitors see

- A row of single-choice chips under the search box on the home page: Alla, Vardagsmat, Helgmat,
  Bröd, Bakverk and Efterrätter. A chip only shows when some recipe passes it, so there's no
  Efterrätter chip today. Alla is chosen at first.
- Vardagsmat is a huvudrätt with occasion vardag, Helgmat a huvudrätt with occasion helg. Bröd,
  Bakverk and Efterrätter are the dish types.
- The chips and the free-text search narrow the list together.
- When nothing passes, the list says "Inga recept i den här kategorin.", or with a search query
  "Inga recept i den här kategorin matchar ”{query}”.". Under Alla, the existing "Inga recept
  matchar ”{query}”." stays.
- Each recipe card gets a second badge after "Ger N …" with its category word: Vardagsmat,
  Helgmat, Bröd, Bakverk or Efterrätt. It's singular here because it names one recipe's category.
- The chips are buttons with `aria-pressed`, in a group labelled "Kategori".

### State

The chosen chip lives in a module-level store read with `useSyncExternalStore`, not in the URL or
in localStorage. It survives opening a recipe and going back; a reload resets it to Alla. Slice 4
adds the tab and the on-hand ingredients to the same store.

### Done when

- A test runs the filter over the fixture recipes. Vardagsmat gives Pad kra pow, Yakiniku,
  Italiensk pastasallad, Kycklingtonkatsu and Peppargryta. Helgmat gives Kycklingsouvlaki, Torsk
  med brynt smör, Öppen sparrislasagne and Lángos. Bröd gives Surdegsbröd, Bakverk gives
  Kladdkaksmuffins, and there's no Efterrätter chip.
- In the app, choosing Helgmat, opening Lángos and going back shows Helgmat still chosen with four
  recipes.

## Slice 3: matching engine

No UI. Pure functions over the recipes, the catalog, the on-hand ingredients (each an ingredient
name with an optional amount in its entry unit) and the category filter.

### Suggestions

- Each recipe's needs come from slice 1, without staples. An ingredient is optional in a recipe
  only when every line using it there is optional.
- A recipe is a suggestion when it passes the filter and uses at least one on-hand ingredient. An
  optional one counts.
- **Used**: the on-hand ingredients the recipe needs, in the order you added them.
- **Missing**: ingredients the recipe needs that aren't on hand and aren't optional in it. Each is
  listed once, with its need at the default yield.
- **Optional, not on hand**: optional ingredients you don't have, listed apart. They're never
  missing.
- **Shortfall**: an on-hand ingredient with an amount that's less than the recipe's need at the
  default yield, unless it's optional there. It carries the difference and the amount you have.
  A shortfall isn't missing: the ingredient still counts as used and adds nothing to the missing
  count.
- **Largest yield**: over the on-hand ingredients that have an amount and aren't optional in the
  recipe, the smallest number of whole yield units the amount covers (amount divided by need per
  yield unit, rounded down). With no such ingredient there's no largest yield. Missing
  ingredients don't limit it. Compare with a small tolerance (the prototype uses 1e-9), so 2 Ägg
  against Kladdkaksmuffins' 4 for 12 gives 6 and not 5.
- **Can make now**: nothing is missing, and there's no largest yield or it's at least 1.

Suggestions rank by four keys in order:

1. can make now first;
2. most on-hand ingredients used;
3. fewest missing ingredients;
4. title, in Swedish alphabetical order.

### Buy list

A suggestion's buy list is its shortfalls, then its missing ingredients, with amounts in the entry
unit at the default yield. Amounts display like this, both on screen and when copied:

- g: rounded as on the recipe page (whole grams, one decimal under 10 g);
- st: to the nearest quarter;
- dl: in quarters of a dl from ½ dl up. A smaller amount steps down to msk from 15 ml, tsk from
  5 ml, and krm below that, each in quarters.

Use `formatAmount` from `src/utils/formatAmount.ts` and `roundGrams` and `roundToQuarter` from
`src/lib/scale.ts`. The copied text has one line per item, the amount then the ingredient name:
`600 g Kyckling`.

### Done when

The sample fridges pass as tests against `test/fixtures/`. Vitlöksklyftor is the ingredient the
tickets call Vitlök; the results are the same.

| On hand                                                           | Expected                                                                       |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Kyckling, Citron, Vitlöksklyftor                                  | Kycklingsouvlaki first. Kycklingtonkatsu ranks below Öppen sparrislasagne.     |
| Kyckling, Citron, Vitlöksklyftor, Vetemjöl                        | Kycklingsouvlaki first.                                                        |
| Vetemjöl, Rågmjöl, Surdegsgrund, Smör, Ägg, Kakao, Socker         | Surdegsbröd first, can make now.                                               |
| 2 Ägg, and everything else for Kladdkaksmuffins                   | Kladdkaksmuffins can make now, largest yield 6 of 12, shortfall 2 Ägg.         |
| 400 g Kyckling                                                    | Kycklingsouvlaki has largest yield 2 of 6 and a shortfall of 600 g Kyckling.   |
| 300 g Vetemjöl, and everything else for Surdegsbröd               | Surdegsbröd: nothing missing, largest yield 0, shortfall 200 g Vetemjöl.       |

The second sentence of the first row pins down a known limitation from
[Suggestion matching and ranking](04-suggestion-matching.md). If it changes, it should be on
purpose.

Rule tests:

- Salt is never used, never missing and never limits the yield.
- Without Smör, Kladdkaksmuffins lists Smör as missing once, with 270 g, though two lines use it.
- Without Grönsaker, Kycklingsouvlaki doesn't list it as missing but as optional and not on hand.
  With Grönsaker, it counts as used.
- An amount on an optional ingredient never limits the largest yield and never makes a shortfall.
- A recipe that fails the category filter is never a suggestion.
- The buy-list formatting: 0.3 dl shows as 2 msk, 0.05 dl as 1 tsk, 0.02 dl as 2 krm.

## Slice 4: finder tab

### The home page

- Under the "Recept" heading, a full-width switch reads "Alla recept" and "Vad har du hemma?".
- The line under the heading follows the tab. Alla recept keeps today's text. Vad har du hemma?
  reads "Lägg till det du har hemma, så föreslår vi recept som använder det."
- The Alla recept tab is the list from slice 2.
- The Vad har du hemma? tab shows the picker, the on-hand rows, the category chips and then the
  results. It's the same filter as on the list, so the choice holds when you switch tabs.

### Picking what you have

- A text field with a plus icon and the placeholder "Lägg till något du har hemma".
- Typing shows up to eight options: ingredients some recipe uses, without staples or ingredients
  already added. Matching ignores case and diacritics. Options whose name starts with the text
  come first, then those with an alias starting with it, then names containing it, then aliases
  containing it, alphabetically within each group. An alias match reads "Fläskfilé
  (Fläskytterfilé)".
- Arrow keys move through the options, Enter adds the highlighted one, Escape clears the field,
  and a click adds an option. Use the combobox pattern the prototype uses (`role="combobox"`,
  `aria-activedescendant`, a `listbox`).
- With no match: "Inget recept använder ”{query}”."

### The on-hand rows

- Each added ingredient is a row, in the order added: its name, an amount field with the
  placeholder "Mängd" and the entry unit inside the field on the right, and a remove button
  labelled "Ta bort {name}".
- The amount takes a comma or a dot. Anything that isn't a positive number counts as no amount,
  but the field keeps what you typed, so "1," survives while you type.
- Under the rows: "Mängden är valfri. Utan den räknar vi med att du har tillräckligt." and a
  "Börja om" button that removes every row.

### Results

- With no rows: "Börja med något du har, till exempel kyckling eller ägg."
- With rows but no suggestion that passes the filter: "Inget recept i den här kategorin använder
  det du har. Välj Alla för att se fler."
- Otherwise the heading "Förslag" and one card per suggestion, in ranking order.

A suggestion card shows, top to bottom:

1. The recipe title, linking to the recipe, with its category word on the right as on the recipe
   cards.
2. A status badge:
   - "Du har allt" (green): can make now, with no largest yield or one at least the default yield.
   - "Du har allt för {n} av {default} {yieldUnitPlural}" (green): can make now, at a smaller
     yield.
   - "Saknar {n}" (gray): n missing ingredients.
   - "Räcker inte" (orange): nothing missing, but your amounts don't cover one unit.
3. Next to the badge: "Använder {n} av dina {m}: {names}", where m is the number of rows.
4. When the recipe can't be made now and the largest yield is under the default, an orange line:
   "Det du har räcker till {n} av {default} {yieldUnitPlural}.", or at 0 "Det du har räcker inte
   till 1 {yieldUnit}.".
5. "Att köpa: {names}", shortfalls first as "mer {name}", then the missing ingredients. Hidden
   when there's nothing to buy.
6. A "Visa inköpslistan" button ("Dölj inköpslistan" when open) that shows the buy list:
   - the caption "Räknat på {default} {yieldUnit or yieldUnitPlural}, som i receptet.";
   - one line per item, the amount and then the name; a shortfall adds "du har {amount} {unit}",
     with up to two decimals and a decimal comma;
   - a "Kopiera listan" button that copies the list's text and reads "Listan kopierad" for two
     seconds.
7. "Valfritt: {names}" for optional ingredients you don't have.

Names in running text use Swedish list format ("kyckling, citron och vitlöksklyftor"). A name's
first letter is lowercased when a capital is followed by a lowercase letter, so HP-sås stays as it
is.

### State

The tab, the rows (with the amount text as typed) and the filter share the store from slice 2.
Going back from a recipe returns to the tab you left, with everything still there. A reload clears
it all. The prototype keeps the tab in component state, so it lands on Alla recept after going
back; don't copy that.

### Done when

- Each sample fridge from slice 3, entered in the app, gives the same suggestions, statuses and buy
  lists as the prototype with the same fridge (its Prototyp panel loads them). Expected
  differences: Vitlöksklyftor, the category words, and the oregano factor.
- "Kopiera listan" puts the expected lines on the clipboard.
- After adding rows and choosing Helgmat, opening a suggestion and going back shows the finder tab
  with the same rows and filter. A reload clears them.
- Typing "fläsk", pressing the down arrow and Enter adds Fläskfilé.

## Slice 5: combos

### Rules

- Candidates are pairs of suggestions, so both recipes pass the category filter.
- Each recipe has to use at least one on-hand ingredient the other doesn't.
- **Used**: the on-hand ingredients either recipe uses, each counted once.
- **Needs**: per ingredient, both recipes' needs at their default yields added together. An
  optional line adds nothing.
- **Missing**: needed ingredients not on hand, each listed once with the summed amount.
- **Shortfall**: an on-hand ingredient whose amount is less than the summed need. 2 Ägg against
  two recipes needing 2 each is a shortfall of 2 Ägg.
- A combo has no largest yield.
- **Can make now**: nothing missing and no shortfall.
- A combo shows only when it uses more on-hand ingredients than the single suggestion that uses
  the most. That's not always the top-ranked one: with the baking-day fridge, Surdegsbröd ranks
  first but combos have to beat Kladdkaksmuffins.
- Combos rank by the first three suggestion keys. Ties keep the order of the singles' ranking. At
  most three show. Within a pair, the higher-ranked single comes first.

### What visitors see

- After the suggestions, the heading "Två recept tillsammans" and the line "De här paren använder
  fler av dina ingredienser än något enskilt recept."
- A combo card lists both titles, each linking to its recipe with its category word on the right,
  and the second prefixed "+ ". Then a status badge ("Du har allt", "Saknar {n}" or "Räcker
  inte"), "Använder {n} av dina {m}: {names}", and one buy list as on a suggestion card, with the
  caption "Till båda recepten, räknat på mängderna i recepten. Det som båda använder är
  ihopslaget.". There's no Valfritt line.
- The section is hidden when no combo qualifies.

### Done when

Tests against `test/fixtures/`:

| On hand                                                                   | Expected                                                                  |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Kyckling, Citron, Vitlöksklyftor                                          | No combo. Kycklingsouvlaki uses all three.                                |
| Kyckling, Citron, Vitlöksklyftor, Ägg, Smör, Grädde, Potatis, Ris, Lime   | Best combo is Torsk med brynt smör and Kycklingtonkatsu, using 7.         |
| Vetemjöl, Rågmjöl, Surdegsgrund, Smör, Ägg, Kakao, Socker                 | Best combo is Surdegsbröd and Kladdkaksmuffins, using all 7.              |

Compare the pairs as sets, not in order. Rule tests:

- With an amount of Ägg and a pair that both need Ägg, the shortfall is the summed need minus what
  you have.
- With Vardagsmat chosen, both recipes in every combo are vardag.
- A pair where one recipe uses only on-hand ingredients the other also uses never shows.

In the app, the second fridge shows the combo section, and its buy list matches the prototype's.

## After the build

The map is done when slice 5 lands. The `prototype/finder` branch and its worktree can then be
deleted.
