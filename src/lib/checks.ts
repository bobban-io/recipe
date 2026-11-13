import { CATALOG_PATH, ingredientFor, parseCatalog, type IngredientCatalog } from "~/lib/catalog";
import { missingFactors } from "~/lib/needs";
import { formatProblems } from "~/lib/problems";
import { parseRecipe, type IngredientLine, type Recipe } from "~/lib/recipe";

/** Recipe files by file name ("yakiniku.md"), with their contents. */
export type RecipeFiles = Record<string, string>;

export type CheckedRecipes = {
  /** The recipes that parsed, sorted by title in Swedish order. */
  recipes: Recipe[];
  catalog?: IngredientCatalog;
  /** Every build problem, each line starting with its file name. Empty when everything builds. */
  problems: string[];
};

function measuredIn(line: IngredientLine): string {
  if (line.grams != null) return "g";
  if (line.percent != null) return "baker's percent";
  return line.unit ?? "";
}

/** The catalog checks on one recipe's lines: every name is in the catalog, and every line converts. */
function lineProblems(lines: IngredientLine[], catalog: IngredientCatalog, names: ReadonlySet<string>): string[] {
  const problems = new Set<string>();
  for (const line of lines) {
    if (!names.has(line.name)) {
      problems.add(
        `"${line.name}" isn't in the ingredient catalog. Add it to ${CATALOG_PATH} as an alias of an ingredient, or as a new one.`,
      );
      continue;
    }
    // Missing when the ingredient has problems of its own, which the catalog checks report.
    const ingredient = ingredientFor(catalog, line.name);
    if (!ingredient || ingredient.staple) continue;

    const missing = missingFactors(line, ingredient);
    if (missing.length > 0) {
      problems.add(
        `"${line.name}" is in ${measuredIn(line)}, but ${ingredient.name} is entered in ${ingredient.unit}. ` +
          `Give ${ingredient.name} ${missing.join(" and ")}.`,
      );
    }
  }
  return [...problems];
}

/**
 * Parse every recipe file and the catalog, and run the build checks. Collects every problem
 * instead of stopping at the first: recipes in file name order, then the catalog.
 */
export function checkRecipes(recipeFiles: RecipeFiles, catalogSource: string): CheckedRecipes {
  const { catalog, names, problems: catalogProblems } = parseCatalog(catalogSource);
  const recipes: Recipe[] = [];
  const problems: string[] = [];

  for (const fileName of Object.keys(recipeFiles).sort()) {
    const { recipe, lines, problems: recipeProblems } = parseRecipe(fileName, recipeFiles[fileName]);
    problems.push(...recipeProblems);
    if (catalog) problems.push(...lineProblems(lines, catalog, names).map((problem) => `${fileName}: ${problem}`));
    if (recipe) recipes.push(recipe);
  }
  problems.push(...catalogProblems);

  recipes.sort((a, b) => a.title.localeCompare(b.title, "sv"));
  return { recipes, catalog, problems };
}

/** `checkRecipes`, but throws one error listing every problem. The loader and tests use this. */
export function loadRecipes(
  recipeFiles: RecipeFiles,
  catalogSource: string,
): { recipes: Recipe[]; catalog: IngredientCatalog } {
  const { recipes, catalog, problems } = checkRecipes(recipeFiles, catalogSource);
  if (problems.length > 0 || !catalog) throw new Error(formatProblems(problems));
  return { recipes, catalog };
}
