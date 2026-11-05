import { createFileRoute } from "@tanstack/react-router";
import { Flex, Grid, Heading, Section, Text } from "@radix-ui/themes";
import { getAllRecipes } from "~/lib/recipes";
import { RecipeCard } from "~/ui/RecipeCard";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const recipes = getAllRecipes();

  return (
    <Section>
      <Flex direction="column" gap="2" mb="6">
        <Heading size="7">Recept</Heading>
        <Text color="gray">Välj ett recept och hur mycket du vill göra, så räknas mängderna om automatiskt.</Text>
      </Flex>

      <Grid columns={{ initial: "1", sm: "2" }} gap="4">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.slug} recipe={recipe} />
        ))}
      </Grid>
    </Section>
  );
}
