import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Flex, Grid, Heading, Section, Text } from "@radix-ui/themes";
import { getAllRecipes } from "~/lib/recipes";
import { searchRecipes } from "~/lib/search";
import { RecipeCard } from "~/ui/RecipeCard";
import { RecipeSearch } from "~/ui/RecipeSearch";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [query, setQuery] = useState("");
  const recipes = searchRecipes(getAllRecipes(), query);

  return (
    <Section>
      <Flex direction="column" gap="2" mb="5">
        <Heading size="7">Recept</Heading>
        <Text color="gray">Välj ett recept och hur mycket du vill göra, så räknas mängderna om automatiskt.</Text>
      </Flex>

      <RecipeSearch value={query} onChange={setQuery} mb="5" />

      {recipes.length > 0 ? (
        <Grid columns={{ initial: "1", sm: "2" }} gap="4">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.slug} recipe={recipe} />
          ))}
        </Grid>
      ) : (
        <Text as="p" color="gray">
          Inga recept matchar ”{query.trim()}”.
        </Text>
      )}
    </Section>
  );
}
