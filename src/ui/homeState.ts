import { useSyncExternalStore } from "react";
import type { CategoryFilter } from "~/lib/categories";
import type { OnHandRow } from "~/lib/onHand";

/** The switch under the home page's heading: the recipe list, or the finder ("Vad har du hemma?"). */
export type HomeTab = "recipes" | "finder";

/**
 * What the home page remembers within one visit. It lives in memory, so it survives opening a
 * recipe and going back, and a reload resets it. Prerendering always sees `INITIAL`.
 */
export type HomeState = {
  tab: HomeTab;
  /** The chosen chip, shared by the recipe list and the finder. */
  categoryFilter: CategoryFilter;
  /** The finder's rows, in the order added. */
  onHand: OnHandRow[];
};

const INITIAL: HomeState = { tab: "recipes", categoryFilter: "alla", onHand: [] };

let state = INITIAL;
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useHomeState(): HomeState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => INITIAL,
  );
}

/** Merge changes into the state, given directly or computed from the current state. */
export function updateHomeState(changes: Partial<HomeState> | ((current: HomeState) => Partial<HomeState>)): void {
  state = { ...state, ...(typeof changes === "function" ? changes(state) : changes) };
  for (const listener of listeners) listener();
}

/** Add a row for an ingredient, with no amount. An ingredient already added keeps its row. */
export function addOnHand(ingredient: string): void {
  updateHomeState(({ onHand }) =>
    onHand.some((row) => row.ingredient === ingredient) ? {} : { onHand: [...onHand, { ingredient, amountText: "" }] },
  );
}

/** Keep the amount field's text as typed. `parseAmount` reads it. */
export function setOnHandAmount(ingredient: string, amountText: string): void {
  updateHomeState(({ onHand }) => ({
    onHand: onHand.map((row) => (row.ingredient === ingredient ? { ...row, amountText } : row)),
  }));
}

export function removeOnHand(ingredient: string): void {
  updateHomeState(({ onHand }) => ({ onHand: onHand.filter((row) => row.ingredient !== ingredient) }));
}
