import yaml from "js-yaml";
import { z } from "zod";
import { isOneOf, isPlainObject, orList, yamlErrorMessage, zodIssueMessages } from "~/lib/problems";

/** The catalog's file name, as build problems name it, and its path in the repo. */
export const CATALOG_FILE = "ingredients.yaml";
export const CATALOG_PATH = `src/recipes/${CATALOG_FILE}`;

/** The units the finder takes an on-hand ingredient's amount in. */
export const ENTRY_UNITS = ["g", "dl", "st"] as const;
export type EntryUnit = (typeof ENTRY_UNITS)[number];

/**
 * An ingredient in the catalog. A staple has no entry unit; every other ingredient has one.
 * `gramsPerDl` and `gramsPerSt` convert the lines measured some other way to the entry unit.
 */
export type Ingredient = {
  name: string;
  /** The other names that mean this ingredient. The name itself isn't repeated here. */
  aliases: string[];
  gramsPerDl?: number;
  gramsPerSt?: number;
} & ({ staple: true; unit?: undefined } | { staple: false; unit: EntryUnit });

export type IngredientCatalog = {
  /** Every ingredient, in the catalog file's order (Swedish alphabetical). */
  ingredients: Ingredient[];
  /** Each ingredient by its name and by each of its aliases. */
  byName: ReadonlyMap<string, Ingredient>;
};

/** The ingredient an ingredient line belongs to: the one whose name or alias equals the line's name. */
export function ingredientFor(catalog: IngredientCatalog, lineName: string): Ingredient | undefined {
  return catalog.byName.get(lineName);
}

const entrySchema = z.strictObject({
  // Checked by hand, for messages that say what to use.
  unit: z.unknown().optional(),
  staple: z.boolean().optional(),
  aliases: z.array(z.string()).optional(),
  gramsPerDl: z.number().positive().optional(),
  gramsPerSt: z.number().positive().optional(),
});

export type ParsedCatalog = {
  /** The ingredients without problems. Missing when the file isn't readable YAML. */
  catalog?: IngredientCatalog;
  /** Every name and alias in the file, including those of ingredients with problems. */
  names: ReadonlySet<string>;
  /** Each problem line starts with the catalog's file name. */
  problems: string[];
};

/** Parse `ingredients.yaml` and run the catalog checks. */
export function parseCatalog(source: string): ParsedCatalog {
  const problem = (message: string) => `${CATALOG_FILE}: ${message}`;

  let data: unknown;
  try {
    data = yaml.load(source);
  } catch (error) {
    return { names: new Set(), problems: [problem(yamlErrorMessage(error, 1))] };
  }
  if (!isPlainObject(data)) {
    return { names: new Set(), problems: [problem("list one ingredient per line, like `Ägg: { unit: st }`.")] };
  }

  const ingredients: Ingredient[] = [];
  const problems: string[] = [];
  const ownerOf = new Map<string, string>();

  for (const [name, value] of Object.entries(data)) {
    const entry = entrySchema.safeParse(value);
    // Read without the schema, so an entry with problems still claims its aliases and its lines
    // aren't also reported as missing from the catalog.
    const aliases =
      isPlainObject(value) && Array.isArray(value.aliases)
        ? value.aliases.filter((alias): alias is string => typeof alias === "string")
        : [];

    for (const claimed of new Set([name, ...aliases])) {
      const owner = ownerOf.get(claimed);
      if (owner == null) ownerOf.set(claimed, name);
      else problems.push(problem(`"${claimed}" is listed under both ${owner} and ${name}.`));
    }

    if (!entry.success) {
      problems.push(...zodIssueMessages(entry.error.issues, [name]).map(problem));
      continue;
    }

    const { unit, staple = false, gramsPerDl, gramsPerSt } = entry.data;
    const fields = { name, aliases, gramsPerDl, gramsPerSt };
    if (staple) {
      if (unit != null) problems.push(problem(`${name} is a staple, so it takes no unit.`));
      else ingredients.push({ ...fields, staple: true });
    } else if (unit == null) {
      problems.push(problem(`${name} needs a unit: ${orList(ENTRY_UNITS)}.`));
    } else if (!isOneOf(ENTRY_UNITS, unit)) {
      problems.push(problem(`${name} has an unknown unit ${JSON.stringify(unit)}. Use ${orList(ENTRY_UNITS)}.`));
    } else {
      ingredients.push({ ...fields, staple: false, unit });
    }
  }

  // A name claimed twice stays with its first owner, as reported above.
  const byName = new Map<string, Ingredient>();
  for (const ingredient of ingredients) {
    for (const claimed of [ingredient.name, ...ingredient.aliases]) {
      if (ownerOf.get(claimed) === ingredient.name) byName.set(claimed, ingredient);
    }
  }

  return { catalog: { ingredients, byName }, names: new Set(ownerOf.keys()), problems };
}
