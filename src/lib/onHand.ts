import type { OnHandIngredient } from "~/lib/suggestions";

/** A row on the finder tab: an ingredient you added and its amount field's text, as you typed it. */
export type OnHandRow = { ingredient: string; amountText: string };

/** Digits with an optional comma or dot: "2", "1,5", "1.", ",5". */
const AMOUNT = /^(\d+[.,]?\d*|[.,]\d+)$/;

/**
 * An amount field's text as a number, with a comma or a dot for decimals. Anything that isn't a
 * positive number is no amount. "1," is 1, so the amount holds while you type "1,5".
 */
export function parseAmount(text: string): number | undefined {
  const trimmed = text.trim();
  if (!AMOUNT.test(trimmed)) return undefined;
  const amount = Number(trimmed.replace(",", "."));
  return amount > 0 ? amount : undefined;
}

/** The rows as the matching engine takes them, with each amount text parsed. */
export function onHandIngredients(rows: readonly OnHandRow[]): OnHandIngredient[] {
  return rows.map(({ ingredient, amountText }) => {
    const amount = parseAmount(amountText);
    return amount == null ? { ingredient } : { ingredient, amount };
  });
}
