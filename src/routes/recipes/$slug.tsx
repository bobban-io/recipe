import { Fragment, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Button, Flex, Heading, Section, Separator, Text } from "@radix-ui/themes";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { getRecipe } from "~/lib/recipes";
import { scaleSections } from "~/lib/scale";
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

  const sections = scaleSections(recipe.ingredientSections, recipe.defaultYield, yieldCount);

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

      {sections.map((section, index) => (
        <Fragment key={section.title ?? index}>
          <Heading size="5" mt={index === 0 ? "7" : "6"} mb="4">
            {section.title ? `Ingredienser (${section.title})` : "Ingredienser"}
          </Heading>
          <IngredientList ingredients={section.ingredients} />
        </Fragment>
      ))}

      <Separator my="7" size="4" />

      <Markdown>{recipe.body}</Markdown>
    </Section>
  );
}
