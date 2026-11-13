---
id: 6
title: Recipe combos
labels: [wayfinder:grilling]
status: closed
assignee: Robin Bertilsson (2026-11-13)
blocked-by: [3, 5]
---

## Question

What is a combo, and what makes a good one? Settle:

- how many recipes a combo holds;
- what it optimises: covering all my ingredients, fewest missing, not counting the same eggs
  twice across two recipes (amounts are optional, so that only applies to ingredients given an
  amount; see [Quantity-aware matching](05-quantity-aware-matching.md));
- whether its recipes have to fit together by category (a dinner plus a dessert, two weekday
  dinners);
- when combos show instead of, or alongside, single recipes.

## Resolution (2026-11-13)

**A combo is exactly two recipes**, suggested together because between them they use more of
your on-hand ingredients than any single recipe does. Each recipe has to bring at least one
on-hand ingredient the other doesn't use; otherwise the second adds nothing (Pad kra pow tagging
along with Kycklingsouvlaki for the garlic). Never three: the buy list for three dinners gets
long.

**Scoring.** The three ranking keys from [Suggestion matching and
ranking](04-suggestion-matching.md), applied to the pair as a whole:

- on-hand ingredients used: each counts once, even when both recipes use it;
- missing: an ingredient missing from both is bought once, with the amounts added;
- amounts: when both recipes use an ingredient you gave an amount for, their needs are added
  before comparing, so 2 Ägg against two recipes needing 2 each is a 2-egg shortfall. This is
  what keeps the same eggs from counting twice;
- yield: both recipes stay at their default yield. A combo has no largest yield; two recipes
  trading off against each other have no single answer;
- can make now: nothing missing and no shortfall.

**When combos show.** In a section of their own after the single suggestions, and only combos
that use more on-hand ingredients than the best single suggestion does. At most three. On sample
fridges:

| On hand                                                          | Best single                 | Best combo                                      |
| ---------------------------------------------------------------- | --------------------------- | ----------------------------------------------- |
| Kyckling, Citron, Vitlök                                         | Kycklingsouvlaki, uses all 3 | none shown                                     |
| Kyckling, Citron, Vitlök, Ägg, Smör, Grädde, Potatis, Ris, Lime  | Kycklingtonkatsu, uses 4    | Torsk med brynt smör + Kycklingtonkatsu, use 7  |
| Vetemjöl, Rågmjöl, Surdegsgrund, Smör, Ägg, Kakao, Socker        | Kladdkaksmuffins, uses 5    | Surdegsbröd + Kladdkaksmuffins, use all 7       |

**Categories.** No pairing rules: two dinners, a dinner and a bake, or a baking day all make
sense. The finder's category filter applies to both recipes, so huvudrätt + vardag gives two
weekday dinners.

**Handed on:**

- Finder prototype: how the combo section looks, and how a combo's combined buy list reads.

Term recorded in [CONTEXT.md](../../CONTEXT.md): combo.
