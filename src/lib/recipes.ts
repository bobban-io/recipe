import type { IngredientCatalog } from "~/lib/catalog";
import { loadRecipes } from "~/lib/checks";
import type { Recipe } from "~/lib/recipe";
import catalogSource from "../recipes/ingredients.yaml?raw";

// The loader: the only module that uses Vite's `import.meta.glob` and `?raw`, so everything else
// runs under `bun test`. Recipe files and the catalog are bundled as raw strings at build time and
// parsed once. The parsing is browser-safe, so this works during static prerendering and
// client-side navigation alike. A broken recipe or catalog throws here, which fails both
// `bun run dev` and `bun run build`.
const modules = import.meta.glob("../recipes/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const { recipes, catalog } = loadRecipes(
  Object.fromEntries(Object.entries(modules).map(([path, source]) => [path.split("/").pop()!, source])),
  catalogSource,
);

export function getAllRecipes(): Recipe[] {
  return recipes;
}

export function getRecipe(slug: string): Recipe | undefined {
  return recipes.find((recipe) => recipe.slug === slug);
}

export function getIngredientCatalog(): IngredientCatalog {
  return catalog;
}
