import { useId, useState, type KeyboardEvent } from "react";
import { Box, Text, TextField } from "@radix-ui/themes";
import { PlusIcon } from "@radix-ui/react-icons";
import { ingredientOptions, type IngredientOption, type PickableIngredient } from "~/lib/ingredientPicker";

type Props = {
  /** The ingredients to offer, from `pickableIngredients`. */
  pickable: readonly PickableIngredient[];
  /** Ingredients already added, which aren't offered again. */
  added: ReadonlySet<string>;
  onAdd: (ingredient: string) => void;
};

/**
 * A type-ahead field for adding an on-hand ingredient: a combobox with a listbox of options.
 * Arrow keys move the highlight, Enter adds the highlighted option, Escape clears the field, and a
 * click adds an option.
 */
export function IngredientPicker({ pickable, added, onAdd }: Props) {
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const [focused, setFocused] = useState(false);
  const id = useId();
  const listId = `${id}-options`;
  const optionId = (index: number) => `${id}-option-${index}`;

  const options = ingredientOptions(query, pickable, added);
  const typed = query.trim();
  const open = focused && typed !== "";
  const expanded = open && options.length > 0;
  const active = Math.min(highlighted, options.length - 1);

  function type(next: string) {
    setQuery(next);
    setHighlighted(0);
  }

  function add(option: IngredientOption) {
    onAdd(option.ingredient);
    type("");
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      type("");
      return;
    }
    if (!expanded) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted(Math.min(active + 1, options.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted(Math.max(active - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      add(options[active]);
    }
  }

  return (
    <Box position="relative">
      <TextField.Root
        size="3"
        placeholder="Lägg till något du har hemma"
        aria-label="Lägg till något du har hemma"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={expanded ? listId : undefined}
        aria-activedescendant={expanded ? optionId(active) : undefined}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        enterKeyHint="done"
        value={query}
        onChange={(event) => type(event.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        <TextField.Slot>
          <PlusIcon height="16" width="16" aria-hidden />
        </TextField.Slot>
      </TextField.Root>

      {open && (
        <div className="picker-popup">
          {options.length > 0 ? (
            <ul role="listbox" id={listId} aria-label="Ingredienser">
              {options.map((option, index) => (
                <li
                  key={option.ingredient}
                  id={optionId(index)}
                  role="option"
                  aria-selected={index === active}
                  // Not onMouseEnter: a list opening under a resting pointer mustn't move the highlight.
                  onMouseMove={() => setHighlighted(index)}
                  // Keep focus in the field, so you can type the next one.
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => add(option)}
                >
                  {option.ingredient}
                  {option.alias && <Text color="gray"> ({option.alias})</Text>}
                </li>
              ))}
            </ul>
          ) : (
            <Text as="p" size="2" color="gray" role="status">
              Inget recept använder ”{typed}”.
            </Text>
          )}
        </div>
      )}
    </Box>
  );
}
