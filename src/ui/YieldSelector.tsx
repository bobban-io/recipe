import { Flex, IconButton, Text } from "@radix-ui/themes";
import { MinusIcon, PlusIcon } from "@radix-ui/react-icons";
import { pluralizeUnit } from "~/lib/scale";

type Props = {
  unit: string;
  value: number;
  onChange: (next: number) => void;
};

export function YieldSelector({ unit, value, onChange }: Props) {
  return (
    <Flex align="center" justify="between" gap="4" wrap="wrap">
      <Text as="label" weight="medium">
        How many {pluralizeUnit(unit, 2)}?
      </Text>

      <Flex align="center" gap="3">
        <IconButton
          variant="soft"
          radius="full"
          onClick={() => onChange(value - 1)}
          disabled={value <= 1}
          aria-label={`One fewer ${unit}`}
        >
          <MinusIcon />
        </IconButton>

        <Text size="6" weight="bold" align="center" style={{ minWidth: "2ch" }}>
          {value}
        </Text>

        <IconButton variant="soft" radius="full" onClick={() => onChange(value + 1)} aria-label={`One more ${unit}`}>
          <PlusIcon />
        </IconButton>
      </Flex>
    </Flex>
  );
}
