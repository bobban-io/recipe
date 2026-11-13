---
id: 2
title: "Prior art: ingredient-based recipe finders"
labels: [wayfinder:research]
status: closed
assignee: research subagent (2026-11-13)
blocked-by: []
---

## Question

How do existing "what can I cook with what I have" tools handle:

- normalizing ingredient names (synonyms, plurals, hierarchies, open ingredient taxonomies,
  Swedish ones in particular);
- staples assumed to be in every kitchen;
- matching and ranking (any vs all of my ingredients, count used vs fraction of the recipe
  covered vs fewest missing);
- quantity-aware matching;
- suggesting sets of recipes that between them use up what you have?

Facts to inform Ingredient identity, Suggestion matching and ranking, Quantity-aware matching
and Recipe combos.

## Resolution (2026-11-13)

Findings, with sources: `docs/research/ingredient-finder-prior-art.md` on branch
`research/ingredient-finder-prior-art` (commit `00c3f03`, not merged). To read it:
`git show research/ingredient-finder-prior-art:docs/research/ingredient-finder-prior-art.md`.

The facts the open tickets lean on:

- **Identity.** Tools have users pick from a fixed ingredient list (Supercook, MyFridgeFood)
  instead of matching free text. Self-hosted apps store a canonical food with aliases (Mealie)
  or a food tree (Tandoor). Letting a parent match its children is risky: Open Food Facts files
  potato flour under potato, so Tandoor makes it opt-in per food. There's no open Swedish
  cooking-ingredient vocabulary with a hierarchy, only fragments (Livsmedelsverket CC BY 4.0,
  Open Food Facts, Mealie's 580 Swedish seed foods under AGPL).
- **Staples.** Everyone special-cases them: a pantry flag (Spoonacular `ignorePantry`), foods
  marked always available (Mealie, Tandoor), or per-ingredient "don't check" (Grocy). Flour
  sometimes counts as a staple.
- **Ranking.** Two common orders: most of my ingredients used, or fewest missing (Spoonacular
  offers both; Mealie sorts by fewest missing and caps it at 5). Supercook only shows what you
  can make now, plus a "missing one ingredient" filter. For recipes with few ingredients,
  counting what's missing beats percent overlap.
- **Quantities.** Only Grocy compares amounts. It scales by servings and converts units with
  per-product conversions the user sets up. No tool reports the largest batch you can make.
- **Combos.** No consumer tool documents how it picks a set of recipes. The only documented
  method is an optimisation paper (van Rooijen et al. 2024, read as abstract only).
