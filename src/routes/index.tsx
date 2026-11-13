import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Flex, Grid, Heading, SegmentedControl, Section, Text } from "@radix-ui/themes";
import { filtersToShow, passesFilter, type CategoryFilter } from "~/lib/categories";
import { getAllRecipes } from "~/lib/recipes";
import { searchRecipes } from "~/lib/search";
import { CategoryChips } from "~/ui/CategoryChips";
import { FinderTab } from "~/ui/finder/FinderTab";
import { updateHomeState, useHomeState, type HomeTab } from "~/ui/homeState";
import { RecipeCard } from "~/ui/RecipeCard";
import { RecipeSearch } from "~/ui/RecipeSearch";

export const Route = createFileRoute("/")({
  component: Home,
});

const INTRO: Record<HomeTab, string> = {
  recipes: "Välj ett recept och hur mycket du vill göra, så räknas mängderna om automatiskt.",
  finder: "Lägg till det du har hemma, så föreslår vi recept som använder det.",
};

function Home() {
  const { tab } = useHomeState();
  // Here rather than in the list, so the search survives switching tabs.
  const [query, setQuery] = useState("");

  return (
    <Section>
      <Flex direction="column" gap="2" mb="5">
        <Heading size="7">Recept</Heading>
        <Text color="gray">{INTRO[tab]}</Text>
      </Flex>

      <SegmentedControl.Root
        className="home-tabs"
        size={{ initial: "2", xs: "3" }}
        value={tab}
        onValueChange={(next) => updateHomeState({ tab: next as HomeTab })}
        mb="5"
        style={{ width: "100%" }}
      >
        <SegmentedControl.Item value="recipes">Alla recept</SegmentedControl.Item>
        <SegmentedControl.Item value="finder">Vad har du hemma?</SegmentedControl.Item>
      </SegmentedControl.Root>

      {tab === "recipes" ? <RecipeList query={query} onQueryChange={setQuery} /> : <FinderTab />}
    </Section>
  );
}

function RecipeList({ query, onQueryChange }: { query: string; onQueryChange: (next: string) => void }) {
  const { categoryFilter } = useHomeState();
  const allRecipes = getAllRecipes();
  const recipes = searchRecipes(allRecipes, query).filter(passesFilter(categoryFilter));

  return (
    <>
      <RecipeSearch value={query} onChange={onQueryChange} mb="3" />
      <CategoryChips
        filters={filtersToShow(allRecipes)}
        value={categoryFilter}
        onChange={(next) => updateHomeState({ categoryFilter: next })}
        mb="5"
      />

      {recipes.length > 0 ? (
        <Grid columns={{ initial: "1", sm: "2" }} gap="4">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.slug} recipe={recipe} />
          ))}
        </Grid>
      ) : (
        <Text as="p" color="gray">
          {noRecipesText(categoryFilter, query.trim())}
        </Text>
      )}
    </>
  );
}

function noRecipesText(filter: CategoryFilter, query: string): string {
  if (filter === "alla") return `Inga recept matchar ”${query}”.`;
  return query ? `Inga recept i den här kategorin matchar ”${query}”.` : "Inga recept i den här kategorin.";
}
