import { Badge, Card, Flex, Heading, Text } from "@radix-ui/themes";
import { Link } from "@tanstack/react-router";
import type { Recipe } from "~/lib/recipe";
import { yieldUnitFor } from "~/lib/scale";
import { CategoryBadge } from "~/ui/CategoryBadge";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Card asChild size="3" variant="surface">
      <Link to="/recipes/$slug" params={{ slug: recipe.slug }} style={{ textDecoration: "none" }}>
        <Flex direction="column" gap="2" align="start">
          <Heading size="5">{recipe.title}</Heading>
          <Text size="2" color="gray">
            {recipe.description}
          </Text>
          <Flex gap="2" wrap="wrap" mt="1">
            <Badge variant="soft" radius="full">
              Ger {recipe.defaultYield} {yieldUnitFor(recipe, recipe.defaultYield)}
            </Badge>
            <CategoryBadge recipe={recipe} />
          </Flex>
        </Flex>
      </Link>
    </Card>
  );
}
