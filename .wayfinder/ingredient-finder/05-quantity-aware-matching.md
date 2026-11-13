---
id: 5
title: Quantity-aware matching
labels: [wayfinder:grilling]
status: closed
assignee: Robin Bertilsson (2026-11-13)
blocked-by: [4]
---

## Question

How do the amounts I have count against a recipe? Settle:

- how amounts are entered (which units, and whether an amount is optional per ingredient);
- how they're compared with recipe amounts given in grams, baker's percent or
  `st/dl/msk/tsk/krm` when the units differ. Units can differ within one ingredient too
  (Potatis in `st` and grams, Rapsolja in `msk` and grams), so conversions are per
  ingredient. Staples (Salt, Svartpeppar, Vatten) are always on hand, so they need none;
- how yield scaling plays in: does a shortfall disqualify a recipe, demote it, or show the
  largest yield I can make (2 eggs → 6 kladdkaksmuffins instead of 12)? A demotion has to fit
  the ranking from [Suggestion matching and ranking](04-suggestion-matching.md);
- whether a shortfall on an optional ingredient counts at all, given that one you don't have is
  never missing.

## Resolution (2026-11-13)

**Entering amounts.** An amount is optional for each on-hand ingredient; with none, you have
enough for any recipe. Each ingredient takes its amount in one **entry unit** set in the
ingredient catalog: g, dl or st, never msk/tsk/krm. The entry unit follows the recipes: weight
lines make it g, volume lines dl, `st` lines st. 70 of the 76 non-staple ingredients use a single
kind of unit, so there's no choice to make for them. Staples take no amount.

**Comparing.** A recipe's need for an ingredient is the sum of all its lines in that recipe (Smör
200 g + 70 g in Kladdkaksmuffins), scaled to the yield and converted to the entry unit. Volumes
convert at fixed rates (1 dl = 100 ml, msk 15, tsk 5, krm 1). Baker's percent becomes grams
through the flour weight, as on the recipe page. The six ingredients whose lines mix weight with
volume or count carry one conversion factor each in the catalog; their entry units were settled
with the user:

| Ingredient     | Lines                                       | Entry unit | Factor    |
| -------------- | ------------------------------------------- | ---------- | --------- |
| Rapsolja       | msk; 900 g + 90 g in Lángos, 25 g in Kycklingsouvlaki | dl | g per dl |
| Olivolja       | msk; 25 g in Kycklingsouvlaki               | dl         | g per dl  |
| Smör           | g; 1 msk in Peppargryta                     | g          | g per dl  |
| Vetemjöl       | g in Surdegsbröd, Lángos; dl in Kladdkaksmuffins, Kycklingtonkatsu | g | g per dl |
| Potatis        | st; 90 g in Lángos                          | st         | g per st  |
| Torkad oregano | 1.5 msk; 2 g in Kycklingsouvlaki            | dl         | g per dl  |

The build fails when a line can't be converted to its ingredient's entry unit, as it does for an
unknown name. Potatis stays approximate: "20 små" and "12 medelstora" are both plain st.

**Not having enough.** A shortfall never disqualifies a recipe. Results are compared at the
recipe's **default yield**, chosen by the user over defaulting to the largest yield. Each
ingredient you have too little of goes on the buy list as a **shortfall**: only the difference
("600 g Kyckling"). When your amounts cover less than the default yield, the result also shows the
**largest yield**: the most whole yield units your amounts cover (the yield picker steps in
whole numbers from 1). Missing ingredients don't limit it, since you'd buy them anyway.

| On hand                                              | Result                                         |
| ---------------------------------------------------- | ---------------------------------------------- |
| 2 Ägg + everything else for Kladdkaksmuffins         | can make 6 now; buy 2 Ägg for 12               |
| 400 g Kyckling, for Kycklingsouvlaki (1000 g for 6)  | covers 2 of 6 portions; buy 600 g Kyckling     |
| 300 g Vetemjöl + everything else for Surdegsbröd     | can't make a loaf; buy 200 g Vetemjöl          |

**Ranking, sharpened.** "Can make now" in [Suggestion matching and
ranking](04-suggestion-matching.md) means nothing is missing and the largest yield is at least 1,
so the muffins with 2 eggs still come first. A shortfall isn't a missing ingredient: the
ingredient still counts as used, and it doesn't add to the missing count.

**Optional ingredients** never limit the largest yield and never show a shortfall; you use what
you have.

**Handed on:**

- Authoring and migration: the catalog gains an entry unit per ingredient and a conversion factor
  for the six above, with values to pick (roughly 60 g/dl for Vetemjöl, 90 g/dl for the oils and
  Smör, 100 g per Potatis).
- Recipe combos: amounts are optional, so counting the same eggs twice only matters for
  ingredients given an amount.
- Finder prototype: how shortfalls and the largest yield show, and how amounts are typed.

Terms recorded in [CONTEXT.md](../../CONTEXT.md): yield, shortfall, largest yield; on-hand
ingredient now mentions the optional amount.
