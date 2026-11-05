import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Button, Flex, Heading, Section, Separator, Text } from "@radix-ui/themes";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { getRecipe } from "~/lib/recipes";
import { scaleIngredients } from "~/lib/scale";
import { IngredientList } from "~/ui/IngredientList";
import { YieldSelector } from "~/ui/YieldSelector";
import { Markdown } from "~/ui/Markdown";

export const Route = createFileRoute("/recipes/$slug")({
  loader: ({ params }) => {
    const recipe = getRecipe(params.slug);
    if (!recipe) throw notFound();
    return recipe;
  },
  component: RecipePage,
});

function RecipePage() {
  const recipe = Route.useLoaderData();
  const [yieldCount, setYieldCount] = useState(recipe.defaultYield);

  const ingredients = scaleIngredients(recipe.ingredients, recipe.defaultYield, yieldCount);

  return (
    <Section>
      <Flex justify="between" align="center" gap="4" mb="4">
        <Heading size="7">{recipe.title}</Heading>
        <Button asChild variant="ghost">
          <Link to="/">
            <ArrowLeftIcon />
            Alla recept
          </Link>
        </Button>
      </Flex>

      <Text as="p" color="gray" mb="6">
        {recipe.description}
      </Text>

      <YieldSelector unitPlural={recipe.yieldUnitPlural} value={yieldCount} onChange={(n) => setYieldCount(Math.max(1, n))} />

      <Heading size="5" mt="7" mb="4">
        Ingredienser
      </Heading>
      <IngredientList ingredients={ingredients} />

      <Separator my="7" size="4" />

      <Markdown>{recipe.body}</Markdown>
    </Section>
  );
}
