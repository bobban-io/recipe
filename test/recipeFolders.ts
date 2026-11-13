import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { CATALOG_FILE } from "~/lib/catalog";
import { loadRecipes, type RecipeFiles } from "~/lib/checks";

/** The recipes as they are now. Tests of today's recipes only: they change whenever a recipe does. */
export const RECIPES_FOLDER = join(import.meta.dir, "../src/recipes");

/**
 * A frozen copy of the 11 recipes and the catalog from when the ingredient finder was built. Tests
 * of the finder's rules run against these, so adding a recipe never breaks a test. Change the copy
 * only when the file format changes, never to follow new recipes.
 */
export const FIXTURES_FOLDER = join(import.meta.dir, "fixtures");

/** A folder's recipe files and catalog, as the loader in `src/lib/recipes.ts` reads them. */
export function readRecipeFolder(folder: string): { recipeFiles: RecipeFiles; catalogSource: string } {
  const recipeFiles = Object.fromEntries(
    readdirSync(folder)
      .filter((fileName) => fileName.endsWith(".md"))
      .map((fileName) => [fileName, readFileSync(join(folder, fileName), "utf8")]),
  );
  return { recipeFiles, catalogSource: readFileSync(join(folder, CATALOG_FILE), "utf8") };
}

/** The fixture recipes and catalog, loaded and checked as the build does. */
export function loadFixtures() {
  const { recipeFiles, catalogSource } = readRecipeFolder(FIXTURES_FOLDER);
  return loadRecipes(recipeFiles, catalogSource);
}
