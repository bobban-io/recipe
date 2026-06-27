import { Badge, Card, Flex, Heading, Text } from "@radix-ui/themes";
import { Link } from "@tanstack/react-router";
import type { Recipe } from "~/lib/recipes";
import { pluralizeUnit } from "~/lib/scale";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Card asChild size="3" variant="surface">
      <Link to="/recipes/$slug" params={{ slug: recipe.slug }} style={{ textDecoration: "none" }}>
        <Flex direction="column" gap="2" align="start">
          <Heading size="5">{recipe.title}</Heading>
          <Text size="2" color="gray">
            {recipe.description}
          </Text>
          <Badge variant="soft" radius="full" mt="1">
            Makes {recipe.defaultYield} {pluralizeUnit(recipe.yieldUnit, recipe.defaultYield)}
          </Badge>
        </Flex>
      </Link>
    </Card>
  );
}
