---
id: 1
title: Ingredient identity
labels: [wayfinder:grilling]
status: closed
assignee: Robin Bertilsson (2026-11-13)
blocked-by: [2]
---

## Question

If I say I have "kyckling", which recipe ingredient lines does that cover? Decide what an
ingredient *is* for matching: a canonical ingredient written on each recipe line, an alias
list, a parent/child hierarchy ("kyckling" covers "kycklingfilé"), or plain text matching. Then
decide what the user picks from when entering what they have.

The current names show the problem: "Kycklingfilé" vs "Kycklingbröstfilé", "Vitlöksklyfta" vs
"Vitlöksklyftor", "Potatis" / "Fast potatis" / "Kokt potatis", and six oils ("Neutral olja",
"Rapsolja", "Olivolja", "Extra jungfru olivolja", "Olja", "Neutral olja till fritering"). There
are prepared items too ("Tzatziki", "Raw slaw"). Milk, from the original example, isn't in any
recipe.

## Resolution (2026-11-13)

**An ingredient is something you'd say you have at home.** Ingredients form a flat list with no
hierarchy. Each ingredient line in a recipe belongs to exactly one ingredient: the line keeps its
own wording, amount and note, and matching only looks at the ingredient. Having "kyckling" covers
Kycklingfilé and Kycklingbröstfilé because both are aliases of the ingredient Kyckling, not
because of a parent/child link.

**Ingredient catalog.** One central file lists every ingredient with its aliases: the
ingredient-line names that mean it, plus common names where useful (Fläskfilé). Recipe
frontmatter doesn't change. The build fails on a line name the catalog doesn't know, so a recipe
using known names is still one dropped `.md` file, and one with a new name needs that name added
to the catalog first. Chosen over an `ingredient:` field on each line, which lets duplicates into
the picker unnoticed. The catalog is also where per-ingredient facts go (staple status, unit
conversions) once later tickets settle them.

**Entering what you have.** You pick from the catalog with type-ahead. Search covers aliases and
ignores diacritics, like the existing recipe search. No free text. Only ingredients some recipe
uses are offered, so "mjölk" finds nothing.

**Granularity rule.** Two names are one ingredient when you'd swap one for the other in these
recipes without a second thought. A merge works both ways: having either name counts for every
recipe that uses the other. Something prepared while cooking is the raw ingredient (Kokt potatis
→ Potatis, Kokt kaffe → Kaffe). Something bought ready-made is its own ingredient (Tzatziki, Raw
slaw, Fryst pommes frites, Surdegsgrund). An "eller X" in a line's note is advice for the cook
and doesn't affect matching unless X is made an alias.

Rejected: plain text matching ("ost" hits Ostronsås, "soja" lumps söt soja in with japansk soja)
and a hierarchy (the prior-art research found parent-covers-child misfires, and ~70 names don't
need one).

**Settled with the user, case by case:**

| Ingredient   | Aliases                                                     |
| ------------ | ----------------------------------------------------------- |
| Kyckling     | Kycklingfilé, Kycklingbröstfilé                             |
| Vitlöksklyftor | Vitlöksklyfta, Vitlöksklyftor                               |
| Potatis      | Potatis, Fast potatis, Kokt potatis                         |
| Rapsolja     | Neutral olja, Olja, Rapsolja, Neutral olja till fritering   |
| Olivolja     | Olivolja, Extra jungfru olivolja                            |
| Ris          | Jasminris, Basmatiris                                       |
| Salt         | Salt, Flingsalt                                             |
| Socker       | Strösocker                                                  |
| Vetemjöl     | Vetemjöl                                                    |
| Fläskfilé    | Fläskytterfilé, Fläskfilé                                   |

Rapsolja was first named Neutral olja; renamed in
[Suggestion matching and ranking](04-suggestion-matching.md). Vitlöksklyftor was first named
Vitlök; renamed in [Catalog and frontmatter format](08-catalog-and-frontmatter-format.md).

Kept apart: Japansk soja and Ljus soja (Japanese and Chinese soy differ), along with Söt soja
and Collorit; Thaibasilika and Basilikablad; Piri piri and Röd chili (different heat, counted in
`st`); Minimozzarella, ordinary mozzarella and Burrata; Florsocker and Vaniljsocker; Panko and
Ströbröd; Pasta and Färska lasagneplattor; Citron and Lime; Rödlök and Salladslök.

**Recipe edits made along the way** (uncommitted, at the user's request):

- Peppargryta: 2 st Sockerbitar → ½ msk Strösocker (a cube is about 3 g, so two are about 6 g),
  and the method says "strösockret".
- Lángos: Vetemjöl special → Vetemjöl, so all recipes share one flour.

**Handed on:**

- Suggestion matching and ranking: whether an optional line ("Grönsaker, valfria", garnish "att
  toppa med") counts as missing. Otherwise Grönsaker is an ingredient like any other.
- Quantity-aware matching: one ingredient can be measured in different units across lines
  (Potatis in `st` and grams; Rapsolja in `msk` and grams; Salt in `krm`, `tsk`, `msk`, grams
  and baker's percent), so conversions are per ingredient.
- Authoring and migration: the catalog's format and location, and mapping the remaining names.

Terms recorded in [CONTEXT.md](../../CONTEXT.md): ingredient, ingredient line, alias, ingredient
catalog, on-hand ingredient.
