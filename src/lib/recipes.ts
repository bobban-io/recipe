import yaml from "js-yaml";
import { z } from "zod";

/**
 * An ingredient is either an absolute amount (`grams`) or a baker's percentage
 * (`percent`) relative to the total flour weight. Flours are flagged so they can
 * form the percentage base.
 */
const ingredientSchema = z
  .object({
    name: z.string(),
    grams: z.number().optional(),
    percent: z.number().optional(),
    flour: z.boolean().optional(),
    note: z.string().optional(),
  })
  .refine((ingredient) => ingredient.grams != null || ingredient.percent != null, {
    message: "Ingredient must define either `grams` or `percent`",
  });

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
    ingredients: z.array(ingredientSchema).min(1),
  })
  .transform((frontmatter) => ({
    ...frontmatter,
    yieldUnitPlural: frontmatter.yieldUnitPlural ?? frontmatter.yieldUnit,
  }));

export type Ingredient = z.infer<typeof ingredientSchema>;
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
