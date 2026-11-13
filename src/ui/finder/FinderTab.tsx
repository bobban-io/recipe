import { Flex, Heading, Text } from "@radix-ui/themes";
import { filtersToShow, passesFilter } from "~/lib/categories";
import { pickableIngredients } from "~/lib/ingredientPicker";
import { onHandIngredients } from "~/lib/onHand";
import { getAllRecipes, getIngredientCatalog } from "~/lib/recipes";
import { suggest } from "~/lib/suggestions";
import { CategoryChips } from "~/ui/CategoryChips";
import { IngredientPicker } from "~/ui/finder/IngredientPicker";
import { OnHandRows } from "~/ui/finder/OnHandRows";
import { SuggestionCard } from "~/ui/finder/SuggestionCard";
import { addOnHand, removeOnHand, setOnHandAmount, updateHomeState, useHomeState } from "~/ui/homeState";

const recipes = getAllRecipes();
const catalog = getIngredientCatalog();
const pickable = pickableIngredients(recipes, catalog);

function unitOf(ingredient: string) {
  const unit = catalog.byName.get(ingredient)?.unit;
  if (!unit) throw new Error(`${ingredient} has no entry unit`);
  return unit;
}

/** The "Vad har du hemma?" tab: the picker, the on-hand rows, the category chips and the suggestions. */
export function FinderTab() {
  const { onHand: rows, categoryFilter } = useHomeState();
  const suggestions = suggest(recipes, catalog, onHandIngredients(rows), passesFilter(categoryFilter));

  return (
    <>
      <IngredientPicker pickable={pickable} added={new Set(rows.map((row) => row.ingredient))} onAdd={addOnHand} />
      <OnHandRows
        rows={rows}
        unitOf={unitOf}
        onAmountChange={setOnHandAmount}
        onRemove={removeOnHand}
        onClear={() => updateHomeState({ onHand: [] })}
      />
      <CategoryChips
        filters={filtersToShow(recipes)}
        value={categoryFilter}
        onChange={(next) => updateHomeState({ categoryFilter: next })}
        mt="5"
        mb="5"
      />

      {rows.length === 0 ? (
        <Text as="p" color="gray">
          Börja med något du har, till exempel kyckling eller ägg.
        </Text>
      ) : suggestions.length === 0 ? (
        <Text as="p" color="gray">
          Inget recept i den här kategorin använder det du har. Välj Alla för att se fler.
        </Text>
      ) : (
        <section aria-labelledby="finder-suggestions">
          <Heading as="h2" size="5" mb="3" id="finder-suggestions">
            Förslag
          </Heading>
          <Flex direction="column" gap="3">
            {suggestions.map((suggestion) => (
              <SuggestionCard key={suggestion.recipe.slug} suggestion={suggestion} onHandCount={rows.length} />
            ))}
          </Flex>
        </section>
      )}
    </>
  );
}
