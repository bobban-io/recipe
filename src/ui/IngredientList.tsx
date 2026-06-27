import { Flex, Text } from "@radix-ui/themes";
import { formatGrams } from "~/utils/formatGrams";
import type { ScaledIngredient } from "~/lib/scale";

export function IngredientList({ ingredients }: { ingredients: ScaledIngredient[] }) {
  return (
    <Flex direction="column" gap="2" asChild>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {ingredients.map((ingredient) => (
          <li key={ingredient.name}>
            <Text>
              <Text as="span" weight="bold" style={{ minWidth: "90px", display: "inline-block" }}>
                {formatGrams(ingredient.grams)}
              </Text>
              {ingredient.name}
              {ingredient.note ? (
                <Text as="span" size="2" color="gray">
                  {" "}
                  — {ingredient.note}
                </Text>
              ) : null}
            </Text>
          </li>
        ))}
      </ul>
    </Flex>
  );
}
