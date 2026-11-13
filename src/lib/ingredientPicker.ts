import type { Ingredient, IngredientCatalog } from "~/lib/catalog";
import { recipeNeeds } from "~/lib/needs";
import type { Recipe } from "~/lib/recipe";
import { normalize } from "~/lib/search";

/** What the picker matches what you type against. */
export type PickableIngredient = Pick<Ingredient, "name" | "aliases">;

/** One of the picker's options. `alias` is set when the text matched an alias rather than the name. */
export type IngredientOption = { ingredient: string; alias?: string };

/** The most options the picker shows at once. */
export const MAX_OPTIONS = 8;

/** The ingredients you can pick: those some recipe uses, without staples, in Swedish alphabetical order. */
export function pickableIngredients(recipes: readonly Recipe[], catalog: IngredientCatalog): Ingredient[] {
  const used = new Set(recipes.flatMap((recipe) => [...recipeNeeds(recipe, catalog).keys()]));
  return catalog.ingredients
    .filter((ingredient) => used.has(ingredient.name))
    .sort((a, b) => a.name.localeCompare(b.name, "sv"));
}

/** How well an ingredient matches, best first: 0 when its name starts with the text, up to 3. */
type Match = { group: number; alias?: string };

function matchOf({ name, aliases }: PickableIngredient, text: string): Match | undefined {
  const normalizedName = normalize(name);
  const findAlias = (matches: (normalizedAlias: string) => boolean) =>
    aliases.find((alias) => matches(normalize(alias)));

  if (normalizedName.startsWith(text)) return { group: 0 };
  const startingAlias = findAlias((alias) => alias.startsWith(text));
  if (startingAlias) return { group: 1, alias: startingAlias };
  if (normalizedName.includes(text)) return { group: 2 };
  const containingAlias = findAlias((alias) => alias.includes(text));
  if (containingAlias) return { group: 3, alias: containingAlias };
  return undefined;
}

/**
 * The picker's options for what you typed, at most `MAX_OPTIONS`. Matching ignores case and
 * diacritics. Names that start with the text come first, then aliases that start with it, then
 * names that contain it, then aliases that contain it, alphabetically within each group. An
 * ingredient already added is left out.
 */
export function ingredientOptions(
  query: string,
  pickable: readonly PickableIngredient[],
  added: ReadonlySet<string>,
): IngredientOption[] {
  const text = normalize(query.trim());
  if (!text) return [];

  const matches: (Match & { ingredient: string })[] = [];
  for (const ingredient of pickable) {
    if (added.has(ingredient.name)) continue;
    const match = matchOf(ingredient, text);
    if (match) matches.push({ ...match, ingredient: ingredient.name });
  }
  return matches
    .sort((a, b) => a.group - b.group || a.ingredient.localeCompare(b.ingredient, "sv"))
    .slice(0, MAX_OPTIONS)
    .map(({ ingredient, alias }) => (alias ? { ingredient, alias } : { ingredient }));
}
