import yaml from "js-yaml";
import type { z } from "zod";

/** The error the loader throws: every build problem, one per line. */
export function formatProblems(problems: string[]): string {
  return ["Recipes don't build:", ...problems.map((problem) => `  ${problem}`)].join("\n");
}

/** ["a", "b", "c"] → "a, b or c". */
export function orList(items: readonly string[]): string {
  return items.length > 1 ? `${items.slice(0, -1).join(", ")} or ${items[items.length - 1]}` : (items[0] ?? "");
}

/** One "path: message" line per zod issue, its path starting with `basePath`. */
export function zodIssueMessages(issues: readonly z.core.$ZodIssue[], basePath: PropertyKey[] = []): string[] {
  return issues.map((issue) => {
    const path = [...basePath, ...issue.path];
    return path.length > 0 ? `${path.map(String).join(".")}: ${issue.message}` : issue.message;
  });
}

/** A YAML error on one line. `firstLine` is the file line the YAML starts on. */
export function yamlErrorMessage(error: unknown, firstLine: number): string {
  if (error instanceof yaml.YAMLException) {
    return error.mark ? `YAML error on line ${firstLine + error.mark.line}: ${error.reason}` : `YAML error: ${error.reason}`;
  }
  return `YAML error: ${String(error)}`;
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isOneOf<T extends string>(values: readonly T[], value: unknown): value is T {
  return (values as readonly unknown[]).includes(value);
}
