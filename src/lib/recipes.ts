import yaml from "js-yaml";
import { z } from "zod";

/** Kitchen units for ingredients that aren't weighed. */
export const UNITS = ["st", "dl", "msk", "tsk", "krm"] as const;
export type Unit = (typeof UNITS)[number];

/**
 * An ingredient is measured in exactly one way: a weight (`grams`), a baker's
 * percentage (`percent`) of the total flour weight, or an `amount` of a kitchen
 * `unit` (e.g. 4 st, 3 dl). Flours are flagged so they can form the percentage base.
 */
const ingredientSchema = z
  .object({
    name: z.string(),
    grams: z.number().optional(),
    percent: z.number().optional(),
    amount: z.number().positive().optional(),
    unit: z.enum(UNITS).optional(),
    flour: z.boolean().optional(),
    note: z.string().optional(),
  })
  .refine((ingredient) => (ingredient.amount == null) === (ingredient.unit == null), {
    message: "`amount` and `unit` must be given together",
  })
  .refine(
    (ingredient) => [ingredient.grams, ingredient.percent, ingredient.amount].filter((v) => v != null).length === 1,
    { message: "Ingredient must define exactly one of `grams`, `percent` or `amount` + `unit`" },
  );

export type Ingredient = z.infer<typeof ingredientSchema>;
/** A group of ingredients; `title` is shown as "Ingredienser (smet)". */
export type IngredientSection = { title?: string; ingredients: Ingredient[] };

/** A flat list (one untitled section) or named sections: `- { section: smet, items: [...] }`. */
const ingredientsSchema = z.union([
  z
    .array(ingredientSchema)
    .min(1)
    .transform((ingredients): IngredientSection[] => [{ ingredients }]),
  z
    .array(z.object({ section: z.string(), items: z.array(ingredientSchema).min(1) }))
    .min(1)
    .transform((sections): IngredientSection[] =>
      sections.map(({ section, items }) => ({ title: section, ingredients: items })),
    ),
]);

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
export type Recipe = RecipeFrontmatter & { slug: string; body: string };

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

function parseRecipe(slug: string, raw: string): Recipe {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) {
    throw new Error(`Recipe "${slug}" is missing YAML frontmatter`);
  }

  const data = yaml.load(match[1]);
  const frontmatter = frontmatterSchema.parse(data);

  return { ...frontmatter, slug, body: match[2].trim() };
}

// Markdown files are bundled as raw strings at build time and parsed once. Both
// `js-yaml` and the parsing here are browser-safe, so this works during static
// prerendering and during client-side navigation alike.
const modules = import.meta.glob("../recipes/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const recipes: Recipe[] = Object.entries(modules)
  .map(([path, raw]) => {
    const slug = path.split("/").pop()!.replace(/\.md$/, "");
    return parseRecipe(slug, raw);
  })
  .sort((a, b) => a.title.localeCompare(b.title, "sv"));

export function getAllRecipes(): Recipe[] {
  return recipes;
}

export function getRecipe(slug: string): Recipe | undefined {
  return recipes.find((recipe) => recipe.slug === slug);
}
