import { Flex, IconButton, Text } from "@radix-ui/themes";
import { MinusIcon, PlusIcon } from "@radix-ui/react-icons";

type Props = {
  /** Plural yield unit, e.g. "limpor". */
  unitPlural: string;
  value: number;
  onChange: (next: number) => void;
};

export function YieldSelector({ unitPlural, value, onChange }: Props) {
  return (
    <Flex align="center" justify="between" gap="4" wrap="wrap">
      <Text as="label" weight="medium">
        Hur många {unitPlural}?
      </Text>

      <Flex align="center" gap="3">
        <IconButton
          variant="soft"
          radius="full"
          onClick={() => onChange(value - 1)}
          disabled={value <= 1}
          aria-label={`Färre ${unitPlural}`}
        >
          <MinusIcon />
        </IconButton>

        <Text size="6" weight="bold" align="center" style={{ minWidth: "2ch" }}>
          {value}
        </Text>

        <IconButton variant="soft" radius="full" onClick={() => onChange(value + 1)} aria-label={`Fler ${unitPlural}`}>
          <PlusIcon />
        </IconButton>
      </Flex>
    </Flex>
  );
}
