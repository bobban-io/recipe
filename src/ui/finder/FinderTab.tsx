import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import { filtersToShow, passesFilter } from "~/lib/categories";
import { suggestCombos } from "~/lib/combos";
import { pickableIngredients } from "~/lib/ingredientPicker";
import { onHandIngredients } from "~/lib/onHand";
import { getAllRecipes, getIngredientCatalog } from "~/lib/recipes";
import { suggest } from "~/lib/suggestions";
import { CategoryChips } from "~/ui/CategoryChips";
import { ComboCard } from "~/ui/finder/ComboCard";
import { IngredientPicker } from "~/ui/finder/IngredientPicker";
import { OnHandRows } from "~/ui/finder/OnHandRows";
import { SuggestionCard } from "~/ui/finder/SuggestionCard";
import { useHomeSearchParam } from "~/ui/homeSearch";
import { addOnHand, removeOnHand, setOnHandAmount, updateHomeState, useHomeState } from "~/ui/homeState";

const recipes = getAllRecipes();
const catalog = getIngredientCatalog();
const pickable = pickableIngredients(recipes, catalog);

function unitOf(ingredient: string) {
  const unit = catalog.byName.get(ingredient)?.unit;
  if (!unit) throw new Error(`${ingredient} has no entry unit`);
  return unit;
}

/**
 * The "Vad har du hemma?" tab: the picker, the on-hand rows, the category chips, the suggestions and
 * then the combos, when some pair uses more of what you have than any single recipe.
 */
export function FinderTab() {
  const { onHand: rows, categoryFilter } = useHomeState();
  const [pickerQuery, setPickerQuery] = useHomeSearchParam("ingrediens");
  const onHand = onHandIngredients(rows);
  const suggestions = suggest(recipes, catalog, onHand, passesFilter(categoryFilter));
  const combos = suggestCombos(suggestions, onHand);

  return (
    <>
      <IngredientPicker
        pickable={pickable}
        added={new Set(rows.map((row) => row.ingredient))}
        query={pickerQuery}
        onQueryChange={setPickerQuery}
        onAdd={addOnHand}
      />
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
        mt="3"
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
        <>
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
          {combos.length > 0 && (
            <Box asChild mt="8">
              <section aria-labelledby="finder-combos">
                <Heading as="h2" size="5" id="finder-combos">
                  Två recept tillsammans
                </Heading>
                <Text as="p" size="2" color="gray" mt="1" mb="3">
                  De här paren använder fler av dina ingredienser än något enskilt recept.
                </Text>
                <Flex direction="column" gap="3">
                  {combos.map((combo) => (
                    <ComboCard
                      key={combo.pair.map(({ recipe }) => recipe.slug).join("+")}
                      combo={combo}
                      onHandCount={rows.length}
                    />
                  ))}
                </Flex>
              </section>
            </Box>
          )}
        </>
      )}
    </>
  );
}
