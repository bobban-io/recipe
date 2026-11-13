import { Card, Flex } from "@radix-ui/themes";
import type { Combo } from "~/lib/combos";
import { matchStatus } from "~/lib/finderText";
import { BuyList } from "~/ui/finder/BuyList";
import { RecipeTitle } from "~/ui/finder/RecipeTitle";
import { StatusBadge } from "~/ui/finder/StatusBadge";
import { UsesLine } from "~/ui/finder/UsesLine";

type Props = {
  combo: Combo;
  /** How many on-hand rows there are. */
  onHandCount: number;
};

/** A combo: both titles, the second after "+ ", then one status, one uses line and one buy list. */
export function ComboCard({ combo, onHandCount }: Props) {
  const [first, second] = combo.pair;

  return (
    <Card size={{ initial: "2", sm: "3" }} asChild>
      <article>
        <Flex direction="column" gap="1">
          <RecipeTitle recipe={first.recipe} />
          <RecipeTitle recipe={second.recipe} prefix="+ " />
        </Flex>
        <Flex align="center" gap="2" wrap="wrap" mt="3">
          <StatusBadge status={matchStatus(combo)} />
          <UsesLine used={combo.used} onHandCount={onHandCount} />
        </Flex>
        <BuyList
          shortfalls={combo.shortfalls}
          missing={combo.missing}
          caption="Till båda recepten, räknat på mängderna i recepten. Det som båda använder är ihopslaget."
        />
      </article>
    </Card>
  );
}
