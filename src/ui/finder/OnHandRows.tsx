import { Box, Button, Flex, IconButton, Text, TextField } from "@radix-ui/themes";
import { Cross2Icon } from "@radix-ui/react-icons";
import type { EntryUnit } from "~/lib/catalog";
import { inRunningText } from "~/lib/finderText";
import type { OnHandRow } from "~/lib/onHand";

type Props = {
  rows: readonly OnHandRow[];
  /** An ingredient's entry unit, shown inside its amount field. */
  unitOf: (ingredient: string) => EntryUnit;
  onAmountChange: (ingredient: string, amountText: string) => void;
  onRemove: (ingredient: string) => void;
  onClear: () => void;
};

/** One row per on-hand ingredient, in the order added, each with an optional amount. */
export function OnHandRows({ rows, unitOf, onAmountChange, onRemove, onClear }: Props) {
  if (rows.length === 0) return null;

  return (
    <Box mt="3">
      <ul className="on-hand-rows">
        {rows.map(({ ingredient, amountText }) => {
          const unit = unitOf(ingredient);
          const name = inRunningText(ingredient);
          return (
            <li key={ingredient}>
              <Text weight="medium" className="on-hand-name">
                {ingredient}
              </Text>
              <TextField.Root
                size="2"
                className="on-hand-amount"
                inputMode="decimal"
                autoComplete="off"
                placeholder="Mängd"
                aria-label={`Hur mycket ${name} du har, i ${unit}`}
                value={amountText}
                onChange={(event) => onAmountChange(ingredient, event.target.value)}
              >
                <TextField.Slot side="right">
                  <Text size="2" color="gray">
                    {unit}
                  </Text>
                </TextField.Slot>
              </TextField.Root>
              <IconButton
                size="2"
                variant="ghost"
                color="gray"
                aria-label={`Ta bort ${name}`}
                onClick={() => onRemove(ingredient)}
              >
                <Cross2Icon aria-hidden />
              </IconButton>
            </li>
          );
        })}
      </ul>
      <Flex justify="between" align="center" gap="3" mt="3">
        <Text size="1" color="gray">
          Mängden är valfri. Utan den räknar vi med att du har tillräckligt.
        </Text>
        <Button size="1" variant="soft" color="gray" onClick={onClear} style={{ flexShrink: 0 }}>
          Börja om
        </Button>
      </Flex>
    </Box>
  );
}
