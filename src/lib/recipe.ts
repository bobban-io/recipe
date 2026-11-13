import yaml from "js-yaml";
import { z } from "zod";
import { isOneOf, isPlainObject, orList, yamlErrorMessage, zodIssueMessages } from "~/lib/problems";

/** Kitchen units for ingredient lines that aren't weighed. */
export const UNITS = ["st", "dl", "msk", "tsk", "krm"] as const;
export type Unit = (typeof UNITS)[number];

export const DISH_TYPES = ["huvudrätt", "bröd", "bakverk", "efterrätt"] as const;
export type DishType = (typeof DISH_TYPES)[number];

/** Only a huvudrätt has an occasion. */
export const OCCASIONS = ["vardag", "helg"] as const;
export type Occasion = (typeof OCCASIONS)[number];

/**
 * An ingredient line is measured in exactly one way: a weight (`grams`), a baker's percentage
 * (`percent`) of the total flour weight, or an `amount` of a kitchen `unit` (e.g. 4 st, 3 dl).
 * Flours are flagged so they can form the percentage base. `optional` only matters to the finder.
 */
const ingredientLineSchema = z
  .object({
    name: z.string(),
    grams: z.number().optional(),
    percent: z.number().optional(),
    amount: z.number().positive().optional(),
    unit: z.enum(UNITS).optional(),
    flour: z.boolean().optional(),
    optional: z.boolean().optional(),
    note: z.string().optional(),
  })
  .refine((line) => (line.amount == null) === (line.unit == null), {
    message: "`amount` and `unit` must be given together",
  })
  .refine((line) => [line.grams, line.percent, line.amount].filter((v) => v != null).length === 1, {
    message: "Ingredient must define exactly one of `grams`, `percent` or `amount` + `unit`",
  });

export type IngredientLine = z.infer<typeof ingredientLineSchema>;
/** A group of ingredient lines; `title` is shown as "Ingredienser (smet)". */
export type IngredientSection = { title?: string; ingredients: IngredientLine[] };

const flatIngredientsSchema = z
  .array(ingredientLineSchema)
  .min(1)
  .transform((ingredients): IngredientSection[] => [{ ingredients }]);

const sectionedIngredientsSchema = z
  .array(z.object({ section: z.string(), items: z.array(ingredientLineSchema).min(1) }))
  .min(1)
  .transform((sections): IngredientSection[] =>
    sections.map(({ section, items }) => ({ title: section, ingredients: items })),
  );

/**
 * A flat list (one untitled section) or named sections: `- { section: smet, items: [...] }`. The
 * shape is picked from the input rather than with `z.union`, so a bad line is reported against
 * the shape the recipe uses instead of against both.
 */
const ingredientsSchema = z.unknown().transform((value, ctx): IngredientSection[] => {
  const sectioned = Array.isArray(value) && value.some((item) => isPlainObject(item) && "section" in item);
  const result = (sectioned ? sectionedIngredientsSchema : flatIngredientsSchema).safeParse(value);
  if (result.success) return result.data;
  for (const issue of result.error.issues) ctx.addIssue({ ...issue });
  return z.NEVER;
});

/** `dishType` and `occasion` aren't here: `readCategories` checks them, with messages that say what to use. */
const frontmatterSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    /** The unit the recipe is measured in, e.g. "limpa" or "portion". */
    yieldUnit: z.string(),
    /** Plural of `yieldUnit`, e.g. "limpor". Omit when it doesn't change ("muffins"). */
    yieldUnitPlural: z.string().optional(),
    /** How many `yieldUnit`s the listed amounts produce. */
    defaultYield: z.number().positive().default(1),
    ingredients: ingredientsSchema,
  })
  .transform(({ ingredients, ...frontmatter }) => ({
    ...frontmatter,
    yieldUnitPlural: frontmatter.yieldUnitPlural ?? frontmatter.yieldUnit,
    ingredientSections: ingredients,
  }));

export type RecipeFrontmatter = z.output<typeof frontmatterSchema>;
/** A huvudrätt has an occasion, and nothing else does. */
export type RecipeCategories =
  { dishType: "huvudrätt"; occasion: Occasion } | { dishType: Exclude<DishType, "huvudrätt">; occasion?: undefined };
export type Recipe = RecipeFrontmatter & RecipeCategories & { slug: string; body: string };

/** Every ingredient line of a recipe, across its sections. */
export function ingredientLines(recipe: Pick<Recipe, "ingredientSections">): IngredientLine[] {
  return recipe.ingredientSections.flatMap((section) => section.ingredients);
}

function readCategories(data: Record<string, unknown>): { categories?: RecipeCategories; problems: string[] } {
  const { dishType, occasion } = data;
  if (dishType == null) return { problems: [`dishType is missing. Use ${orList(DISH_TYPES)}.`] };
  if (!isOneOf(DISH_TYPES, dishType)) {
    return { problems: [`dishType ${JSON.stringify(dishType)} is unknown. Use ${orList(DISH_TYPES)}.`] };
  }
  if (dishType !== "huvudrätt") {
    if (occasion != null) return { problems: [`only a huvudrätt has an occasion; this is ${dishType}.`] };
    return { categories: { dishType }, problems: [] };
  }
  if (occasion == null) return { problems: [`a huvudrätt needs an occasion: ${orList(OCCASIONS)}.`] };
  if (!isOneOf(OCCASIONS, occasion)) {
    return { problems: [`occasion ${JSON.stringify(occasion)} is unknown. Use ${orList(OCCASIONS)}.`] };
  }
  return { categories: { dishType, occasion }, problems: [] };
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export type ParsedRecipe = {
  /** Missing when the file has problems. */
  recipe?: Recipe;
  /**
   * The recipe's ingredient lines whenever the frontmatter's shape is valid, even if the categories
   * aren't, so the catalog checks still run on them.
   */
  lines: IngredientLine[];
  /** Each problem line starts with the file name. */
  problems: string[];
};

/**
 * Parse one recipe file ("yakiniku.md"). Doesn't look at the ingredient catalog; `checkRecipes`
 * does that.
 */
export function parseRecipe(fileName: string, source: string): ParsedRecipe {
  const fail = (messages: string[], lines: IngredientLine[] = []) => ({
    lines,
    problems: messages.map((message) => `${fileName}: ${message}`),
  });

  const match = source.match(FRONTMATTER_RE);
  if (!match) return fail(["the YAML frontmatter is missing. Start the file with it, between two --- lines."]);

  let data: unknown;
  try {
    data = yaml.load(match[1]);
  } catch (error) {
    // The frontmatter starts on line 2, after the opening ---.
    return fail([yamlErrorMessage(error, 2)]);
  }

  const frontmatter = frontmatterSchema.safeParse(data);
  const { categories, problems } = isPlainObject(data) ? readCategories(data) : { categories: undefined, problems: [] };
  if (!frontmatter.success) return fail([...zodIssueMessages(frontmatter.error.issues), ...problems]);

  const lines = ingredientLines(frontmatter.data);
  if (!categories) return fail(problems, lines);

  const slug = fileName.replace(/\.md$/, "");
  return { recipe: { ...frontmatter.data, ...categories, slug, body: match[2].trim() }, lines, problems: [] };
}
