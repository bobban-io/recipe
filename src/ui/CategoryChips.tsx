import { Button, Flex } from "@radix-ui/themes";
import type { ComponentProps } from "react";
import { filterLabel, type CategoryFilter } from "~/lib/categories";

type Props = {
  /** The chips to show, from `filtersToShow`. */
  filters: readonly CategoryFilter[];
  value: CategoryFilter;
  onChange: (next: CategoryFilter) => void;
  mb?: ComponentProps<typeof Flex>["mb"];
};

/** Single-choice category chips. */
export function CategoryChips({ filters, value, onChange, mb }: Props) {
  return (
    <Flex role="group" aria-label="Kategori" gap="2" wrap="wrap" mb={mb}>
      {filters.map((filter) => {
        const chosen = filter === value;
        return (
          <Button
            key={filter}
            type="button"
            size="2"
            radius="full"
            variant={chosen ? "solid" : "soft"}
            color={chosen ? undefined : "gray"}
            aria-pressed={chosen}
            onClick={() => onChange(filter)}
          >
            {filterLabel(filter)}
          </Button>
        );
      })}
    </Flex>
  );
}
