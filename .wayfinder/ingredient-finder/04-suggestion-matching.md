---
id: 4
title: Suggestion matching and ranking
labels: [wayfinder:grilling]
status: closed
assignee: Robin Bertilsson (2026-11-13)
blocked-by: [1]
---

## Question

Given the ingredients I have, which recipes are suggestions, and in what order? Settle:

- the threshold (uses at least one of mine?);
- the ranking (how many of mine it uses, how much of the recipe I already cover, how little is
  missing);
- which ingredients count as staples assumed to be in every kitchen (salt, pepper, oil, water?),
  and whether that list is fixed;
- what "missing" means for the missing-ingredients list, including whether an optional line
  counts ("Grönsaker, valfria" in Chicken souvlaki, garnish "att toppa med").

Ignore amounts here; Quantity-aware matching handles them.

## Resolution (2026-11-13)

**Threshold.** A recipe is a **suggestion** when it uses at least one of your on-hand ingredients.
There's no cap on how much may be missing; with 11 recipes the ranking does that job.

**Ranking.** Three keys, in order:

1. recipes you can make now (nothing missing) first;
2. then the most of your on-hand ingredients used (optional ones included);
3. then the fewest missing ingredients.

Every ingredient weighs the same. Each simpler rule put the wrong recipe first in a scenario run
against the 11 recipes:

| On hand                                                   | Fewest missing first    | Most of mine first | Share covered first | Chosen            |
| --------------------------------------------------------- | ----------------------- | ------------------ | ------------------- | ----------------- |
| Kyckling, Citron, Vitlök                                  | Öppen sparrislasagne ✗  | Kycklingsouvlaki   | Kycklingsouvlaki    | Kycklingsouvlaki  |
| …plus Vetemjöl                                            | Surdegsbröd ✗           | Kycklingsouvlaki   | Surdegsbröd ✗       | Kycklingsouvlaki  |
| Vetemjöl, Rågmjöl, Surdegsgrund, Smör, Ägg, Kakao, Socker | Surdegsbröd             | Kladdkaksmuffins ✗ | Surdegsbröd         | Surdegsbröd       |

Accepted limitation: with Kyckling, Citron and Vitlök on hand, Kycklingtonkatsu (uses Kyckling, 12
missing) ranks below Öppen sparrislasagne (uses Citron, 6 missing). Weighting a recipe's main
ingredients would fix it, at the cost of marking them in every recipe; not worth it at this size.

**Staples.** An ingredient is a **staple** when every kitchen has it and no recipe uses enough of
it to run out. That gives **Salt, Svartpeppar and Vatten**. The list is fixed and lives in the
ingredient catalog. Staples aren't offered in the picker and never count as used or missing.
Rapsolja fails the rule (900 g for frying in Lángos), as do Socker (4 dl in Kladdkaksmuffins),
Smör (300 g in Torsk med brynt smör) and Vetemjöl (480 g in Lángos); all stay pickable. No
per-visit staple list, since remembering what you have between visits is out of scope.

**Missing.** Missing is counted and listed per ingredient, not per line, under the catalog name:
Smör shows once though Kladdkaksmuffins uses it in both smet and glasyr. An ingredient line can
be marked **optional**. An optional ingredient counts as used when you have it and is never
missing. An ingredient is optional in a recipe only when every line using it there is optional.

Optional lines, settled with the user:

- Grönsaker in Kycklingsouvlaki ("valfria")
- Riven kokos in Kladdkaksmuffins (topping)
- Färsk dill in Lángos (garnish only; in Torsk med brynt smör it's part of the dish)

Not optional: Prosciutto in Italiensk pastasallad (the meat in the dish, despite "att toppa
med"). Basilikablad and Torkad oregano as toppings need no flag, since another line needs the same
ingredient. All "efter smak" lines are staples.

**Catalog change.** The oil ingredient is named **Rapsolja**, not Neutral olja; its aliases are
unchanged (Neutral olja, Olja, Rapsolja, Neutral olja till fritering). Recipe lines keep their
wording. Updated in [Ingredient identity](01-ingredient-identity.md).

**Handed on:**

- Authoring and migration: the frontmatter shape for marking a line optional, and how the
  catalog marks staples.
- Quantity-aware matching: staples have no amount to check, and whether a shortfall on an optional
  ingredient can count against a recipe.
- Finder prototype: how optional ingredients and recipes you can make now show in a result.

Terms recorded in [CONTEXT.md](../../CONTEXT.md): staple, optional line, suggestion, missing
ingredient.
