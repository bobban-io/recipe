import { formatGrams } from "~/utils/formatGrams";
import { RecipeSchema } from "../schemas/recipeSchema";
import { Text } from "@radix-ui/themes";

type Props = {
  ingredients: Omit<RecipeSchema, "startDate">;
};

export function IngredientList(props: Props) {
  const { ingredients } = props;

  return (
    <ul style={{ listStyleType: "none" }}>
      <li>
        <Text>
          <span style={{ minWidth: "90px", display: "inline-block" }}>{formatGrams(ingredients.rye)}</span>
          Rye wheat flour
        </Text>
      </li>
      <li>
        <Text>
          <span style={{ minWidth: "90px", display: "inline-block" }}>{formatGrams(ingredients.wheat)}</span>
          Wheat flour
        </Text>
      </li>
      <li>
        <Text>
          <span style={{ minWidth: "90px", display: "inline-block" }}>{formatGrams(ingredients.water)}</span>
          Water
        </Text>
      </li>
      <li>
        <Text>
          <span style={{ minWidth: "90px", display: "inline-block" }}>{formatGrams(ingredients.starter)}</span>
          Starter
        </Text>
      </li>
      <li>
        <Text>
          <span style={{ minWidth: "90px", display: "inline-block" }}>{formatGrams(ingredients.salt)}</span>
          Salt
        </Text>
      </li>
    </ul>
  );
}
