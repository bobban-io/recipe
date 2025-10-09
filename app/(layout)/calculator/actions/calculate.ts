"use server";

import { calculatorSchema } from "../schemas/calculatorSchema";
import { formDataToObject } from "~/utils/formDataToObject";
import { redirect } from "next/navigation";
import z from "zod";

export type ActionState = {
  errors?: Partial<Record<keyof z.infer<typeof calculatorSchema>, string[]>>;
  hydrationLevel: string | undefined;
  starterLevel: string | undefined;
  startDate: string | undefined;
  flourGrams: string | undefined;
  saltLevel: string | undefined;
  ryeLevel: string | undefined;
};

export async function calculate(_: ActionState, formData: FormData): Promise<ActionState> {
  const raw = formDataToObject(formData);
  const validation = calculatorSchema.safeParse(raw);

  if (!validation.success) {
    return {
      errors: z.flattenError(validation.error).fieldErrors,
      hydrationLevel: raw.hydration?.toString(),
      starterLevel: raw.starter?.toString(),
      flourGrams: raw.flour?.toString(),
      startDate: raw.start?.toString(),
      saltLevel: raw.salt?.toString(),
      ryeLevel: raw.rye?.toString(),
    };
  }

  const rye = validation.data.ryeLevel * (validation.data.flourGrams / 100);
  const wheat = (100 - validation.data.ryeLevel) * (validation.data.flourGrams / 100);
  const starter = validation.data.starterLevel * (validation.data.flourGrams / 100);
  const water = validation.data.hydrationLevel * (validation.data.flourGrams / 100);
  const salt = validation.data.saltLevel * (validation.data.flourGrams / 100);

  return redirect(
    `/recipe?wheat=${wheat}&rye=${rye}&starter=${starter}&water=${water}&salt=${salt}&startDate=${validation.data.startDate}`
  );
}
