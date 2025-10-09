"use client";

import { formatDateTimeLocal } from "~/utils/formatDateTimeLocal";
import { dateTomorrowAt } from "~/utils/dateTomorrowAt";
import { Button, Flex, Text } from "@radix-ui/themes";
import { TextField } from "~/ui/TextField/TextField";
import { calculate } from "../actions/calculate";
import { useActionState } from "react";

export function CalculatorForm() {
  const [state, formAction, isPending] = useActionState(calculate, {
    startDate: dateTomorrowAt(new Date(), 8, 0).toString(),
    hydrationLevel: "75",
    starterLevel: "20",
    flourGrams: "1000",
    saltLevel: "2",
    ryeLevel: "10",
  });

  return (
    <form action={formAction}>
      <Flex direction="column" gap="6">
        <Flex direction="column" gap="4">
          <Flex direction="column" gap="2">
            <Text as="label" htmlFor="flourGrams">
              Flour
            </Text>

            <TextField
              isInvalid={!!state.errors?.flourGrams}
              defaultValue={state.flourGrams}
              name="flourGrams"
              id="flourGrams"
              type="text"
              autoFocus
            >
              <TextField.Slot side="right">g</TextField.Slot>
            </TextField>

            {state.errors?.flourGrams ? (
              <Text size="1" color="red">
                {state.errors.flourGrams}
              </Text>
            ) : (
              <Text size="1" color="gray">
                Typically, 1000g is enough for two loaves.
              </Text>
            )}
          </Flex>

          <Flex direction="column" gap="2">
            <Text as="label" htmlFor="hydrationLevel">
              Hydration
            </Text>

            <TextField
              isInvalid={!!state.errors?.hydrationLevel}
              defaultValue={state.hydrationLevel}
              name="hydrationLevel"
              id="hydrationLevel"
              type="text"
            >
              <TextField.Slot side="right">%</TextField.Slot>
            </TextField>

            {state.errors?.hydrationLevel ? (
              <Text size="1" color="red">
                {state.errors.hydrationLevel}
              </Text>
            ) : (
              <Text size="1" color="gray">
                A higher hydration level gives you a fluffier bread, but the dough also becomes way harder to work with.
              </Text>
            )}
          </Flex>

          <Flex direction="column" gap="2">
            <Text as="label" htmlFor="starterLevel">
              Starter
            </Text>

            <TextField
              isInvalid={!!state.errors?.starterLevel}
              defaultValue={state.starterLevel}
              name="starterLevel"
              id="starterLevel"
              type="text"
            >
              <TextField.Slot side="right">%</TextField.Slot>
            </TextField>

            {state.errors?.starterLevel ? (
              <Text size="1" color="red">
                {state.errors.starterLevel}
              </Text>
            ) : (
              <Text size="1" color="gray">
                More starter speeds up fermentation, while less gives a slower, deeper flavor.
              </Text>
            )}
          </Flex>

          <Flex direction="column" gap="2">
            <Text as="label" htmlFor="ryeLevel">
              Rye wheat
            </Text>

            <TextField
              isInvalid={!!state.errors?.ryeLevel}
              defaultValue={state.ryeLevel}
              name="ryeLevel"
              id="ryeLevel"
              type="text"
            >
              <TextField.Slot side="right">%</TextField.Slot>
            </TextField>

            {state.errors?.ryeLevel ? (
              <Text size="1" color="red">
                {state.errors.ryeLevel}
              </Text>
            ) : (
              <Text size="1" color="gray">
                Rye adds deeper flavor and a denser texture to your bread, but it also makes the dough stickier.
              </Text>
            )}
          </Flex>

          <Flex direction="column" gap="2">
            <Text as="label" htmlFor="saltLevel">
              Salt
            </Text>

            <TextField
              isInvalid={!!state.errors?.saltLevel}
              defaultValue={state.saltLevel}
              name="saltLevel"
              id="saltLevel"
              type="text"
            >
              <TextField.Slot side="right">%</TextField.Slot>
            </TextField>

            {state.errors?.saltLevel ? (
              <Text size="1" color="red">
                {state.errors.saltLevel}
              </Text>
            ) : (
              <Text size="1" color="gray">
                Salt enhances flavor and strengthens gluten — too much slows fermentation, too little makes dough bland.
              </Text>
            )}
          </Flex>

          <Flex direction="column" gap="2">
            <Text as="label" htmlFor="startDate">
              Start at
            </Text>

            <TextField
              isInvalid={!!state.errors?.startDate}
              defaultValue={formatDateTimeLocal(new Date(state.startDate ?? ""))}
              type="datetime-local"
              name="startDate"
              id="startDate"
            />

            {state.errors?.startDate ? (
              <Text size="1" color="red">
                {state.errors.startDate}
              </Text>
            ) : (
              <Text size="1" color="gray">
                When do you expect to start your sourdough baking?
              </Text>
            )}
          </Flex>
        </Flex>

        <Button disabled={isPending}>Calculate</Button>
      </Flex>
    </form>
  );
}
