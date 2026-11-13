import { Badge } from "@radix-ui/themes";
import { categoryWord } from "~/lib/categories";
import type { RecipeCategories } from "~/lib/recipe";

/** A recipe's category word, as recipe cards show it. */
export function CategoryBadge({ recipe }: { recipe: RecipeCategories }) {
  return (
    <Badge variant="soft" radius="full" color="gray">
      {categoryWord(recipe)}
    </Badge>
  );
}
