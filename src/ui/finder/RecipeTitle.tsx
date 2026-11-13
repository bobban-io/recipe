import { Flex, Heading, Link, Text } from "@radix-ui/themes";
import { Link as RouterLink } from "@tanstack/react-router";
import type { Recipe } from "~/lib/recipe";
import { CategoryBadge } from "~/ui/CategoryBadge";

type Props = {
  recipe: Recipe;
  /** Shown before the title in gray, like the "+ " before a combo's second recipe. */
  prefix?: string;
};

/** A finder card's recipe title, linking to the recipe, with its category word on the right. */
export function RecipeTitle({ recipe, prefix }: Props) {
  return (
    <Flex justify="between" align="start" gap="3">
      <Heading as="h3" size="4">
        {prefix && (
          <Text color="gray" weight="regular">
            {prefix}
          </Text>
        )}
        <Link asChild color="gray" highContrast underline="hover">
          <RouterLink to="/recipes/$slug" params={{ slug: recipe.slug }}>
            {recipe.title}
          </RouterLink>
        </Link>
      </Heading>
      <CategoryBadge recipe={recipe} />
    </Flex>
  );
}
