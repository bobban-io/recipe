import type { Occasion, RecipeCategories } from "~/lib/recipe";

/** The category filter's chips, in the order they show. */
export const CATEGORY_FILTERS = ["alla", "vardagsmat", "helgmat", "bröd", "bakverk", "efterrätter"] as const;
export type CategoryFilter = (typeof CATEGORY_FILTERS)[number];

/** Every chip but Alla is a category, and every recipe is in exactly one. */
type Category = Exclude<CategoryFilter, "alla">;

const LABELS: Record<CategoryFilter, string> = {
  alla: "Alla",
  vardagsmat: "Vardagsmat",
  helgmat: "Helgmat",
  bröd: "Bröd",
  bakverk: "Bakverk",
  efterrätter: "Efterrätter",
};

/** Singular, since a card names one recipe's category. */
const WORDS: Record<Category, string> = {
  vardagsmat: "Vardagsmat",
  helgmat: "Helgmat",
  bröd: "Bröd",
  bakverk: "Bakverk",
  efterrätter: "Efterrätt",
};

const BY_OCCASION: Record<Occasion, Category> = { vardag: "vardagsmat", helg: "helgmat" };

function categoryOf(recipe: RecipeCategories): Category {
  switch (recipe.dishType) {
    case "huvudrätt":
      return BY_OCCASION[recipe.occasion];
    case "bröd":
      return "bröd";
    case "bakverk":
      return "bakverk";
    case "efterrätt":
      return "efterrätter";
  }
}

/** A chip's text: "Vardagsmat", "Efterrätter". */
export function filterLabel(filter: CategoryFilter): string {
  return LABELS[filter];
}

/** The recipes a chip lets through, as a predicate for `recipes.filter`. Alla lets every recipe through. */
export function passesFilter(filter: CategoryFilter): (recipe: RecipeCategories) => boolean {
  return (recipe) => filter === "alla" || categoryOf(recipe) === filter;
}

/** The chips worth showing for these recipes: those some recipe passes, in order. */
export function filtersToShow(recipes: readonly RecipeCategories[]): CategoryFilter[] {
  return CATEGORY_FILTERS.filter((filter) => recipes.some(passesFilter(filter)));
}

/** The word a card shows for a recipe's category: "Helgmat", "Efterrätt". */
export function categoryWord(recipe: RecipeCategories): string {
  return WORDS[categoryOf(recipe)];
}
