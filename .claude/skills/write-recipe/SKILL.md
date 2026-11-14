---
name: write-recipe
description: Add a recipe to src/recipes/ or change an existing one, written in the same Swedish voice as the other recipes, then push it straight to main to deploy. Use when the user asks to add, write, import, translate, adapt or fix a recipe (recept), or pastes or links one from another site.
---

# Write a recipe

A recipe is one markdown file in `src/recipes/`. Its YAML frontmatter holds the data the site
scales and filters by, and its body holds the method. The build picks up a new file by itself.

AGENTS.md ("Recipes" and "Ingredient catalog") has the format rules, and the build enforces them.
This skill adds what the build can't check: how each field shows up on the site, how the existing
recipes are phrased, and how to ship.

## Workflow

1. Get a source. If the user gives only a dish name, ask for their recipe or a link, since the
   amounts should come from a recipe someone has cooked.
2. Read two existing recipes close to the new one before writing: same `dishType`, similar
   structure. Good references are `tonkatsu.md` and `yakiniku.md` (a main with a sauce and a
   side), `chicken-souvlaki.md` (a main as a flat list), `kladdkaksmuffins.md` (a bake with two
   parts) and `sourdough.md` (a bread in baker's percentages).
3. Write the file, following the field reference and the voice rules below. Translate a recipe
   from another site and rewrite it in this voice. Don't copy its sentences, intro or tips.
4. Map every ingredient line to the catalog.
5. Run the checks and the review list.
6. Commit and push to main.

When changing a recipe, change only what was asked, then re-read the notes and the method so they
still agree with the new amounts or ingredients.

## File name

The file name without `.md` is the slug in the URL, `recipe.bobban.io/recipes/<slug>`. Use the
Swedish dish name in lowercase kebab-case, with å and ä as `a` and ö as `o`:
`torsk-med-brynt-smor`, `langos`. Shorten a long title to the dish's core name (`sparrislasagne`
for Öppen sparrislasagne, `tonkatsu` for Kycklingtonkatsu).

Never rename an existing file. That breaks every link to it.

## Frontmatter fields

Write the fields in this order. Every recipe sets all of them, except `occasion` (huvudrätt only)
and `yieldUnitPlural` (only when the plural differs).

| Field | Values | Where the site uses it |
| --- | --- | --- |
| `title` | The dish name | Heading on the recipe page, the home card and the finder's cards. The home list sorts by it in Swedish order. Search matches it. |
| `description` | One sentence | Under the title on the home card and the recipe page. Search matches it. |
| `dishType` | `huvudrätt`, `bröd`, `bakverk`, `efterrätt` | The category chips and the badge on the card. |
| `occasion` | `vardag`, `helg` | Splits huvudrätter into the Vardagsmat and Helgmat chips. Required on a huvudrätt. Any other dish type with an occasion fails the build. |
| `yieldUnit` | Singular: `portion`, `limpa`, `muffins` | Shown when the count is 1: "Ger 1 limpa", "Det du har räcker inte till 1 portion." |
| `yieldUnitPlural` | `portioner`, `limpor` | "Hur många portioner?" above the ingredients, "Ger 4 portioner" on the card, and the finder's yield lines. Falls back to `yieldUnit`. |
| `defaultYield` | A whole number | The yield the listed amounts make. The yield selector starts here, the card shows it, and the finder compares on-hand amounts at this yield. |
| `ingredients` | A flat list, or named sections | The ingredient lists on the recipe page, scaled to the chosen yield. Search matches the line names. The finder reads every line. |

The markdown body below the frontmatter is the method. The recipe page renders it under a
divider, after the ingredients.

How to pick the values:

- `dishType` is `huvudrätt` for lunch or dinner (Lángos counts), `bröd` for bread, `bakverk` for
  sweet bakes like muffins and buns, and `efterrätt` for dessert.
- `occasion` is `helg` for a treat: pricey ingredients (torskrygg, burrata, sparris), deep-frying,
  or food for guests. Everything else is `vardag`. A long cooking time alone stays `vardag`, like
  Peppargryta's hour in the oven. Say which one you picked in your summary.
- `yieldUnit` is `portion` for a huvudrätt. A bake or bread counts its pieces: `limpa`, `muffins`,
  `lángos`. Leave out `yieldUnitPlural` when the plural is the same word (`muffins`, `lángos`).
- `defaultYield` is what the source makes. Keep the source's amounts and yield rather than
  rescaling them. Mains here make 2 to 6 portions, most of them 4.

## Ingredient lines

Write each line as a one-line YAML mapping, with the keys in this order: `name`, the measure,
`flour`, `optional`, `note`.

```yaml
ingredients:
  - { name: Kycklingbröstfilé, grams: 1000, note: skuren i munsbitar }
  - { name: Vitlöksklyftor, amount: 3, unit: st, note: rivna }
  - { name: Grönsaker, grams: 300, optional: true, note: "valfria, skivade – t.ex. tomat, gurka och rödlök" }
```

| Key | What it does |
| --- | --- |
| `name` | Shown as written. Must be a name or alias in the ingredient catalog. |
| `grams` | A weight. Scales, and shows as "200 g", rounded to whole grams (one decimal under 10 g). |
| `percent` | A baker's percentage of the total weight of the `flour: true` lines. Bread only. |
| `amount` + `unit` | A count or volume. `unit` is `st`, `dl`, `msk`, `tsk` or `krm`. Scales, shows rounded to quarters ("1½ dl"), and steps down to a smaller spoon when tiny. |
| `flour: true` | Marks a flour line, measured in `grams`, as part of the base for `percent` lines. |
| `optional: true` | The dish works without this line. Only the ingredient finder reads it, so it never lists the line as something to buy. The recipe page doesn't show it. |
| `note` | Shown in grey after the name: "Vitlöksklyftor — rivna". It doesn't scale. |

Each line has exactly one measure: `grams`, `percent`, or `amount` with `unit`.

### Picking the measure

Measure the way you would in the kitchen:

- `grams` for meat, fish, cheese, butter, pasta, vegetables sold by weight, ready-made products
  (Fryst pommes frites, Tzatziki), fresh herbs (Färsk dill 5 g) and everything in a dough.
- `st` for things you count: Ägg, Vitlöksklyftor, Citron, Lime, Rödlök, Potatis, Burrata,
  Basilikablad, Färska lasagneplattor, Grönsaksbuljongtärningar.
- `dl` for what you pour or scoop: Grädde, Crème fraiche, Strösocker, Kakao, Jasminris, Panko,
  Oliver, and the flour in a bake.
- `msk`, `tsk` and `krm` for spices, sauces, a splash of oil, and small amounts of butter.
- A bread weighs everything: the flours in `grams` with `flour: true`, and water, levain and salt
  as `percent` (see `sourdough.md`).

Write `amount` in quarter steps (0.25, 0.5, 0.75, 1.25), since the page rounds to quarters anyway.
Write `grams` as whole numbers.

### Naming a line

- Capitalize only the first word: `Grekisk yoghurt`, `Färska lasagneplattor`.
- Name the product you'd buy, specific enough to shop for: `Fryst pommes frites`,
  `Svart stenbitsrom`, `Japansk soja`, `Söt soja`, `Raw slaw`.
- Use the form a Swedish shopping list would. `Potatis`, `Citron` and `Burrata` stay singular at
  any count. `Vitlöksklyftor`, `Körsbärstomater` and `Basilikablad` are plural, and
  `Vitlöksklyfta` is singular when the recipe needs one.
- Prefer a name the catalog already has. Peppargryta switched from sugar cubes to Strösocker, and
  Lángos to plain Vetemjöl, so the catalog didn't need an ingredient only one recipe used.
- List salt and pepper with an amount, adding the note `efter smak` when it's to taste.
- When the recipe uses an ingredient twice for different things, give it two lines, each with a
  note saying which: `till marinaden` and `till pommesen`, or `till kokvattnet` and `efter smak`.
- Order the lines roughly the way the method uses them, with toppings and garnish last.

### Notes

A note is a few lowercase words with no final period. It says one or more of these, joined by a
comma:

- How the ingredient is prepared, as a participle that agrees with the name: `rivna` for
  Vitlöksklyftor, `riven` for Vitlöksklyfta, `finhackad`, `halverade`, `tärnad`,
  `skuren i munsbitar`.
- Which kind or size: `fast och medelstor`, `små`, `i olja`, `10 %`, `ljummet`.
- What it's for, when that isn't obvious: `till stekning`, `till marinaden`, `att toppa med`.
- A swap: `eller fläskfilé`, `t.ex. ketjap manis`, `kort, t.ex. fusilli eller penne`.
- `efter smak`.

Keep quantities out of notes, since they don't scale: `rivna`, not `ca 4 dl`.

Quote a note that contains a comma or a colon: `note: "finhackad, till såsen"`. Unquoted, a colon
fails the build, but a comma passes every check and silently cuts the note short:
`note: grovhackad, eller vanlig basilika` shows as just "grovhackad".

An optional line's note has to tell the reader it's optional, since the page doesn't show the
flag: `valfria, skivade`, `till garnering`, `att toppa med`. Only flag what the dish works
without, like garnish or a side of vegetables.

### Sections

Use sections when the dish has parts made separately, such as a dough and a glaze, or a main with
a sauce and a side. Keep a flat list for a dish made as one thing (Pad kra pow, Lángos,
Kycklingsouvlaki).

```yaml
ingredients:
  - section: smet
    items:
      - { name: Smör, grams: 200 }
  - section: glasyr
    items:
      - { name: Smör, grams: 70 }
```

A section name is a short lowercase noun for the part: `smet`, `glasyr`, `röra`, `sås`, `gryta`,
`kålsallad`, `potatis`, `fisk`. The main part can take the dish's own name (`tonkatsu`,
`yakiniku`). The page heads each one "Ingredienser (sås)". Put the sections in the order the
method makes them.

## Voice

Everything a reader sees is in Swedish, casual, and talks to the reader as "du". No English, no
emoji, no intro story.

### Title

- The dish name in sentence case: `Torsk med brynt smör`, `Italiensk pastasallad`, `Pad kra pow`.
- A foreign dish keeps its name and accents (`Lángos`, `Yakiniku`), or puts a Swedish protein in
  front of it (`Kycklingsouvlaki`, `Kycklingtonkatsu`).
- Name the dish, not its sides. It's `Peppargryta`, and the hasselbackspotatis goes in the
  description. "Kycklingsouvlaki med oregano, pommes och tzatziki" was shortened to
  `Kycklingsouvlaki` for this reason.

### Description

One sentence of about 15 to 25 words, ending with a period. Most follow this shape:

> [adjective for texture or character] [origin, if foreign] [the dish] [med/i/på the key
> flavours] – [what it's served with, or a short casual aside].

- "Frasig, pankopanerad kyckling på japanskt vis – med jasminris, krispig kålsallad med chili och
  lime och en söt och syrlig tonkatsusås."
- "Snabb thailändsk wok med köttfärs, massor av vitlök, piri piri och thaibasilika i en salt-söt
  sås – middag på en kvart."
- "Kladdiga chokladmuffins med kaffedoftande chokladglasyr och kokos – typ kladdkaka möter
  kärleksmums."
- "Öppen lasagne med stekt sparris, krämig burrata och nötigt brynt smör – toppad med rostade
  pinjenötter och citronzest."

It opens with an adjective like Krämig, Frasig, Saftig, Kladdiga, Snabb or Klassiska. It names
three or four key ingredients in lowercase, joined with "och" and no comma before it. A spaced en
dash ` – ` separates the second half, which starts with `med …` for the sides, `toppad med …`, or
a short line like "middag på en kvart". No amounts. Mention time only when it's the selling
point. Search matches these words, so name the main ingredients.

### Method

```markdown
## Gör så här

1. **Koka riset** enligt anvisningen på förpackningen.

2. **Gör marinaden.** Skala och riv vitlöken och ingefäran och rör ihop med soja, honung
   och sambal oelek i en skål.

3. **Servera** yakinikun med ris och vitkålssallad.
```

- The body starts with `## Gör så här`. Nothing comes before it, and it's the only heading.
- The steps are a numbered list with a blank line between them. Wrap lines at about 90
  characters and indent continuation lines with three spaces. Most recipes have 5 to 8 steps.
- Each step opens with a bold imperative that names it. Either a full phrase with the period
  inside the bold, followed by the detail (`**Gör smeten.**`, `**Stek köttet.**`), or a phrase
  the sentence continues (`**Koka pastan** enligt anvisningen på förpackningen.`,
  `**Gör kålsalladen** medan köttet drar.`, `**Mata surdegen** – ca 5 timmar innan …`).
- The first step starts whatever takes longest or comes first: `**Sätt på ugnen** på 175 °C
  (över- och undervärme).`, `**Koka riset** …`, `**Salta fisken.**`. The last step serves:
  `**Servera.**`, `**Servera** grytan med hasselbackspotatisen.` or `**Toppa och servera.**`.
- Components get `Gör …`: `Gör marinaden`, `Gör smeten`, `Gör glasyren`, `Gör kålsalladen`,
  `Gör såsen i samma panna`.
- Say what can happen at the same time: `medan pastan kokar`, `Koka under tiden …`.
- Pair a time with a cue to look for: `tills de är gyllene och genomstekta, 8–10 minuter`,
  `kanterna ska vara fasta men mitten fortfarande lite dallrig`,
  `Gå efter termometern hellre än klockan.`
- Explain a tip's reason in plain words, often after a spaced en dash: `– den bränns lätt`,
  `lägger du i ett helt kilo färs kallnar pannan och färsen kokar i stället för att få stekyta`.
- A short casual line fits at the end: `Ett stekt ägg på toppen är aldrig fel.`,
  `Skippa prosciutton om du vill ha den vegetarisk.`, `… men det behövs inte.`
- Refer to ingredients in lowercase, in the definite form, with the short name: `smöret`,
  `pankon`, `soja` for Japansk soja, `honung` for Flytande honung.
- Never repeat an amount from the list, since the list scales and the method doesn't. Refer to
  parts of it instead: `hälften av det smälta smöret`, `resten av smöret`,
  `saften från en halv lime`.
- Store-bought parts get `enligt anvisningen på förpackningen`.
- Typography: `ca 18 minuter` (no period after ca), `t.ex.`, ranges with an unspaced en dash
  (`8–10 minuter`, `170–180 °C`), a space before `°C`, the oven mode as `(över- och undervärme)`
  or `varmluft`, and a spaced en dash ` – ` for asides. Never `--` or `—`.
- Link a technique video as `[den här videon](https://…)`.

## Ingredient catalog

Every line's `name` must be in `src/recipes/ingredients.yaml`, as an ingredient's name or one of
its aliases. For each name that isn't there yet:

1. If you'd swap it with an existing ingredient without a second thought, add it to that entry's
   `aliases`. Something prepared while cooking is the raw ingredient, so `Kokt potatis` is
   Potatis.
2. Otherwise add a new line in Swedish alphabetical order (å, ä and ö come after z), like
   `Sparris: { unit: g }`. The `unit` follows how the lines measure it: `grams` makes it `g`,
   `dl`, `msk`, `tsk` and `krm` make it `dl`, and `st` makes it `st`. Something bought ready-made,
   like Tzatziki, is its own ingredient.
3. If one ingredient's lines now mix weight, volume and count, the build names the factor it
   needs. Add a realistic `gramsPerDl` or `gramsPerSt` (Smör has 90 g per dl, Potatis 100 g per
   st).

Leave the staples (Salt, Svartpeppar, Vatten) and `test/fixtures/` alone.

## Checks

```sh
bun test
bun run build
```

`bun test` includes "the real recipes > build without problems", which runs the build's checks
on `src/recipes/` and lists every problem with its file name. `bun run build` prerenders every
page and fails on the same problems. Fix and re-run until both pass.

Then compare the recipe with your two reference recipes and check that:

- every ingredient the method uses is in the list, and every line is used in the method
- neither the notes nor the method contain an amount that should scale
- `occasion` is set on a huvudrätt and nowhere else
- `yieldUnitPlural` is set when the plural differs from `yieldUnit`
- the description is one sentence in the shape above

## Ship

The site deploys from main through `.github/workflows/deploy.yml`, which runs the tests, builds
and publishes to GitHub Pages. Push recipe work straight to main without asking, as long as the
commit touches only:

- `src/recipes/*.md`, the new or changed recipes
- `src/recipes/ingredients.yaml`, the catalog entries those recipes need

If anything else would go in the commit (code, AGENTS.md, test fixtures), or the change deletes or
renames a recipe, stop and ask the user first.

1. Check `git status`. Be on main and up to date: `git pull --rebase origin main`.
2. Stage the recipe files by path, and nothing else:
   `git add src/recipes/<slug>.md src/recipes/ingredients.yaml`.
3. Commit in the repo's style, in English:
   - A new recipe: `feat: add Kladdkaksmuffins recipe`. Several at once:
     `feat: add seven new recipes`, with the titles in the body.
   - A change: a `fix:` subject that names the change and the recipe, with a body saying why.
     For example `fix: bump Lángos flour to 480 g`, with a body like "420 g made the dough too
     wet; 480 g gives a more workable consistency."
   - End the message with the attribution line the session asks for.
4. `git push origin main`.
5. Watch the deploy until it finishes:

   ```sh
   gh run watch "$(gh run list --workflow deploy.yml --commit "$(git rev-parse HEAD)" --limit 1 --json databaseId -q '.[0].databaseId')" --exit-status
   ```

   If the run hasn't registered yet, wait a few seconds and run it again. If it fails, read
   `gh run view <id> --log-failed`, fix the recipe, and push again.

Finish with a short summary: the recipe's URL (`https://recipe.bobban.io/recipes/<slug>`), the
judgment calls you made (`occasion`, a new catalog ingredient versus an alias), the commit, and
whether the deploy went green.
