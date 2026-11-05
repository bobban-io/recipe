import { IconButton, TextField } from "@radix-ui/themes";
import { Cross2Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import type { ComponentProps } from "react";

type Props = {
  value: string;
  onChange: (next: string) => void;
  mb?: ComponentProps<typeof TextField.Root>["mb"];
};

export function RecipeSearch({ value, onChange, mb }: Props) {
  return (
    <TextField.Root
      type="search"
      size="3"
      placeholder="Sök recept eller ingrediens"
      aria-label="Sök recept"
      enterKeyHint="search"
      autoComplete="off"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Escape") onChange("");
      }}
      mb={mb}
    >
      <TextField.Slot>
        <MagnifyingGlassIcon height="16" width="16" />
      </TextField.Slot>
      {value && (
        <TextField.Slot side="right">
          <IconButton
            size="1"
            variant="ghost"
            color="gray"
            radius="full"
            aria-label="Rensa sökningen"
            onClick={() => onChange("")}
          >
            <Cross2Icon />
          </IconButton>
        </TextField.Slot>
      )}
    </TextField.Root>
  );
}
