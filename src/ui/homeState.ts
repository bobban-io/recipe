import { useSyncExternalStore } from "react";
import type { CategoryFilter } from "~/lib/categories";

/**
 * What the home page remembers within one visit. It lives in memory, so it survives opening a
 * recipe and going back, and a reload resets it. Prerendering always sees `INITIAL`.
 */
export type HomeState = {
  /** The chosen chip, shared by the recipe list and the finder. */
  categoryFilter: CategoryFilter;
};

const INITIAL: HomeState = { categoryFilter: "alla" };

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
