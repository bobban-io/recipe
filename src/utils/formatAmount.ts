import type { ScaledIngredient } from "~/lib/scale";

const gramFormatter = new Intl.NumberFormat("sv-SE", {
  unitDisplay: "short",
  style: "unit",
  unit: "gram",
  maximumFractionDigits: 1,
});

const QUARTERS = ["", "¼", "½", "¾"];

/** 1.5 → "1½", 0.25 → "¼". Expects a value already rounded to quarters. */
function formatQuarters(value: number): string {
  const quarters = Math.round(value * 4);
  const whole = Math.floor(quarters / 4);
  const fraction = QUARTERS[quarters % 4];
  return whole === 0 ? fraction : `${whole}${fraction}`;
}

/** "200 g", "1½ dl", "4 st". */
export function formatAmount({ amount, unit }: Pick<ScaledIngredient, "amount" | "unit">): string {
  return unit === "g" ? gramFormatter.format(amount) : `${formatQuarters(amount)} ${unit}`;
}
