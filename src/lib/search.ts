import type { Recipe } from "~/lib/recipes";

/** Lowercase and drop diacritics, so "langos" finds "Lángos" and "creme" finds "Crème". */
function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function searchableText(recipe: Recipe): string {
  const ingredientNames = recipe.ingredientSections.flatMap((section) => section.ingredients.map(({ name }) => name));
  return normalize([recipe.title, recipe.description, ...ingredientNames].join(" "));
}

/** Recipes whose title, description or ingredients contain every word of the query. */
export function searchRecipes(recipes: Recipe[], query: string): Recipe[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return recipes;

  return recipes.filter((recipe) => {
    const text = searchableText(recipe);
    return words.every((word) => text.includes(word));
  });
}
