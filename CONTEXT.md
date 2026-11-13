# Bakr

A Swedish recipe site. Recipes scale by yield, and an ingredient finder suggests recipes from
what you have at home.

## Language

### Recipes

**Ingredient line**:
One line in a recipe's ingredients, with its own wording, an amount and an optional note. Every
ingredient line belongs to exactly one ingredient.
_Avoid_: ingredient (when you mean the line)

**Ingredient**:
Something you'd say you have at home, like kyckling or ägg. Two names are the same ingredient
when you'd swap one for the other in these recipes without a second thought.
_Avoid_: food, product, raw material

**Alias**:
A name that means an ingredient: the wording of an ingredient line ("Kycklingbröstfilé") or a
common name ("Fläskfilé").
_Avoid_: synonym, variant

**Ingredient catalog**:
The one list of every ingredient, with its aliases, its entry unit, and whether it's a staple.
_Avoid_: ingredient list (that's a recipe's own lines), pantry, vocabulary

**Yield**:
How much a recipe makes, counted in whole units of its own: portioner, limpor, muffins. Every
recipe has a default yield, and its amounts scale with the yield you choose.
_Avoid_: servings, batch size

### Categories

**Category**:
A fixed classification recipes are filtered by: dish type or occasion.
_Avoid_: tag, label

**Dish type**:
What kind of dish a recipe is: huvudrätt (lunch or dinner), bröd, bakverk or efterrätt. Every
recipe has exactly one.
_Avoid_: course, meal type, category (when you mean this one)

**Occasion**:
Whether a huvudrätt is everyday food (vardag) or a treat for the weekend (helg). Only huvudrätter
have one, and time alone doesn't make a dish helg.
_Avoid_: effort, difficulty, cooking time

### Ingredient finder

**On-hand ingredient**:
An ingredient you've told the finder you have at home, picked from the ingredient catalog,
optionally with an amount. Without an amount, you have enough for any recipe.
_Avoid_: pantry item, my ingredients

**Entry unit**:
The one unit the finder takes an on-hand ingredient's amount in: g, dl or st. Each ingredient has
its own, following how the recipes measure it.
_Avoid_: input unit, base unit

**Staple**:
An ingredient every kitchen has and no recipe uses enough of to run out: salt, svartpeppar and
vatten. It's always assumed on hand, so you never pick it and it's never missing.
_Avoid_: pantry item, basic, basvara

**Optional line**:
An ingredient line the dish works without, like Grönsaker in Kycklingsouvlaki or kokos sprinkled
on top. An ingredient is optional in a recipe only when every line using it there is optional.
_Avoid_: garnish, extra (a topping can still be required)

**Suggestion**:
A recipe the finder offers because it uses at least one of your on-hand ingredients.
_Avoid_: match, hit, result

**Missing ingredient**:
An ingredient a suggestion needs that you don't have: not on hand, not a staple, and not optional
in that recipe. Together they're what you'd still need to buy.
_Avoid_: shortfall (that's about not having enough)

**Shortfall**:
How much more of an on-hand ingredient a recipe needs at its default yield than the amount you
gave. Together with the missing ingredients, it's what you'd still need to buy.
_Avoid_: missing ingredient (that's one you don't have at all)

**Buy list**:
What you'd still need to buy for a suggestion or combo: its missing ingredients and its
shortfalls, with amounts for the default yield.
_Avoid_: shopping list, missing list

**Largest yield**:
The most whole units of a recipe your amounts cover. Missing ingredients don't limit it, since
you'd buy them anyway.
_Avoid_: max servings, capacity

**Combo**:
Two recipes suggested together because between them they use more of your on-hand ingredients
than any single recipe does. Each brings at least one on-hand ingredient the other doesn't use.
_Avoid_: meal, menu, meal plan
