---
id: 3
title: Recipe categories
labels: [wayfinder:grilling]
status: closed
assignee: Robin Bertilsson (2026-11-13)
blocked-by: []
---

## Question

What categories does a recipe carry? Settle the axes (what kind of dish: a meal, bread, baked
goods or dessert; when you'd cook it: weekday vs weekend/indulgent; anything else worth having),
the values on each axis, whether a recipe can take more than one value per axis, and whether the
fields are required. Finish by classifying the 11 existing recipes to test the scheme against
real data.

## Resolution (2026-11-13)

**Two categories, one value each.**

- **Dish type**, on every recipe: `huvudrätt`, `bröd`, `bakverk` or `efterrätt`. A huvudrätt is
  lunch or dinner (the name was `middag` until lunch came in). Bakverk covers sweet baking.
  Efterrätt has no recipes yet; the list only shows types that have some.
- **Occasion**, only on huvudrätter: `vardag` or `helg`. Helg means it feels like a treat. Time
  alone doesn't make a dish helg: one that takes an hour but is everyday food stays vardag. A
  vardag dish works on a weekend too, so filtering on helg shows the treats, not everything.
  Bread, baking and desserts get no occasion: every bake is a treat, so the axis tells them
  apart from nothing.

**One value per axis**, so Recipe combos can pair dishes by type (a huvudrätt plus an efterrätt).
**Required**: a recipe with no dish type, or a huvudrätt with no occasion, fails the build, the
same way an unknown ingredient name does, so a missing field can't quietly drop a recipe from the
filters. A value outside the fixed lists fails too.

**No other axes.** Cuisine is too scattered (7 cuisines across 11 recipes) and diet too thin (one
vegetarian dish) to filter on, and the ingredient finder already answers "something with
chicken".

**The 11 recipes:**

| Recipe                | Dish type | Occasion | Why                                          |
| --------------------- | --------- | -------- | -------------------------------------------- |
| Pad kra pow           | huvudrätt | vardag   | "middag på en kvart"                         |
| Yakiniku              | huvudrätt | vardag   |                                              |
| Italiensk pastasallad | huvudrätt | vardag   |                                              |
| Kycklingtonkatsu      | huvudrätt | vardag   |                                              |
| Peppargryta           | huvudrätt | vardag   | about an hour, but everyday food             |
| Kycklingsouvlaki      | huvudrätt | helg     | taverna-style, with fries, feta and tzatziki |
| Torsk med brynt smör  | huvudrätt | helg     | 300 g butter                                 |
| Öppen sparrislasagne  | huvudrätt | helg     | burrata and brown butter                     |
| Lángos                | huvudrätt | helg     | settled with the user                        |
| Surdegsbröd           | bröd      | –        |                                              |
| Kladdkaksmuffins      | bakverk   | –        |                                              |

Peppargryta and Kycklingsouvlaki are applications of the treat rule rather than case-by-case
calls with the user, so they're the first to revisit.

**Handed on:**

- Authoring and migration: the frontmatter shape for dish type and occasion.
- Finder prototype: how the two filters combine in the finder and the recipe list (picking helg
  implies huvudrätt, since nothing else has an occasion).

Terms recorded in [CONTEXT.md](../../CONTEXT.md): category, dish type, occasion.
