import { Card, Flex, Text } from "@radix-ui/themes";
import { defaultYieldCaption, nameList, suggestionStatus, yieldLimitText } from "~/lib/finderText";
import type { Suggestion } from "~/lib/suggestions";
import { BuyList } from "~/ui/finder/BuyList";
import { RecipeTitle } from "~/ui/finder/RecipeTitle";
import { StatusBadge } from "~/ui/finder/StatusBadge";
import { UsesLine } from "~/ui/finder/UsesLine";

type Props = {
  suggestion: Suggestion;
  /** How many on-hand rows there are. */
  onHandCount: number;
};

export function SuggestionCard({ suggestion, onHandCount }: Props) {
  const { recipe, used, shortfalls, missing, optionalNotOnHand } = suggestion;
  const yieldLimit = yieldLimitText(suggestion);

  return (
    <Card size={{ initial: "2", sm: "3" }} asChild>
      <article>
        <RecipeTitle recipe={recipe} />
        <Flex align="center" gap="2" wrap="wrap" mt="3">
          <StatusBadge status={suggestionStatus(suggestion)} />
          <UsesLine used={used} onHandCount={onHandCount} />
        </Flex>
        {yieldLimit && (
          <Text as="p" size="2" color="orange" mt="2">
            {yieldLimit}
          </Text>
        )}
        <BuyList shortfalls={shortfalls} missing={missing} caption={defaultYieldCaption(recipe)} />
        {optionalNotOnHand.length > 0 && (
          <Text as="p" size="2" color="gray" mt="3">
            Valfritt: {nameList(optionalNotOnHand)}
          </Text>
        )}
      </article>
    </Card>
  );
}
