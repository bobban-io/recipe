import { Flex, Text } from "@radix-ui/themes";
import { formatAmount } from "~/utils/formatAmount";
import type { ScaledIngredient } from "~/lib/scale";

export function IngredientList({ ingredients }: { ingredients: ScaledIngredient[] }) {
  return (
    <Flex direction="column" gap="2" asChild>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {ingredients.map((ingredient, index) => (
          <li key={`${ingredient.name}-${index}`}>
            <Text>
              <Text as="span" weight="bold" style={{ minWidth: "90px", display: "inline-block" }}>
                {formatAmount(ingredient)}
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
