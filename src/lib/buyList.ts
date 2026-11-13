import type { EntryUnit } from "~/lib/catalog";
import { roundGrams, roundToQuarter } from "~/lib/scale";
import { formatAmount } from "~/utils/formatAmount";

/** One thing to buy, in the ingredient's entry unit at the recipe's default yield. */
export type BuyItem = {
  ingredient: string;
  unit: EntryUnit;
  /** A missing ingredient's whole need, or a shortfall's difference. */
  amount: number;
};

/** An on-hand ingredient you have too little of. `amount` is the difference, `have` what you gave. */
export type Shortfall = BuyItem & { have: number };

/** Float error never drops an amount below a threshold: 1.45 - 1.3 dl is 1 msk, not 3 tsk. */
const EPSILON = 1e-9;

/** The measures a dl amount shows in, largest first: each holds `ml` and takes over `from` that many ml. */
const VOLUME_STEPS = [
  { unit: "dl", ml: 100, from: 50 },
  { unit: "msk", ml: 15, from: 15 },
  { unit: "tsk", ml: 5, from: 5 },
  { unit: "krm", ml: 1, from: 0 },
] as const;

/** A buy list: the shortfalls, then the missing ingredients. */
export function buyList(items: { shortfalls: readonly Shortfall[]; missing: readonly BuyItem[] }): BuyItem[] {
  return [...items.shortfalls, ...items.missing];
}

/**
 * A buy-list amount as it shows on screen: "600 g", "1½ st", "2 msk". Grams round as on the recipe
 * page, a count to the nearest quarter, and dl to quarters from ½ dl up. Less than ½ dl steps down
 * to msk from 15 ml, tsk from 5 ml and krm below that, each in quarters.
 */
export function formatBuyAmount(amount: number, unit: EntryUnit): string {
  if (unit === "g") return formatAmount({ amount: roundGrams(amount), unit: "g" });
  if (unit === "st") return formatAmount({ amount: roundToQuarter(amount), unit: "st" });

  const ml = amount * 100;
  const step = VOLUME_STEPS.find(({ from }) => ml + EPSILON >= from) ?? VOLUME_STEPS[VOLUME_STEPS.length - 1];
  return formatAmount({ amount: roundToQuarter(ml / step.ml), unit: step.unit });
}

const onHandFormatter = new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 2 });

/** An on-hand amount, as in a shortfall's "du har 1,5 dl": up to two decimals and a decimal comma. */
export function formatOnHandAmount(amount: number, unit: EntryUnit): string {
  return `${onHandFormatter.format(amount)} ${unit}`;
}

/**
 * The buy list as copied text: one line per item, the amount then the ingredient name ("600 g
 * Kyckling"). `Intl` separates thousands with a no-break space ("1 000 g"), which becomes a plain
 * space here so the text pastes cleanly anywhere.
 */
export function buyListText(items: readonly BuyItem[]): string {
  return items
    .map((item) => `${formatBuyAmount(item.amount, item.unit)} ${item.ingredient}`.replace(/[\u00a0\u202f]/g, " "))
    .join("\n");
}
