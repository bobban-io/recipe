import { Text } from "@radix-ui/themes";
import { usesText } from "~/lib/finderText";

type Props = {
  /** The on-hand ingredients used, in the order added. */
  used: readonly string[];
  /** How many on-hand rows there are. */
  onHandCount: number;
};

/** "Använder 3 av dina 4: kyckling, citron och vitlöksklyftor", next to a status badge. */
export function UsesLine({ used, onHandCount }: Props) {
  return (
    <Text size="2" color="gray">
      {usesText(used, onHandCount)}
    </Text>
  );
}
