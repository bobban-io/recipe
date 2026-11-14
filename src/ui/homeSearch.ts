import { useSyncExternalStore } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";

/** The home page's search params: what's typed in each tab's search field. */
export type HomeSearch = {
  /** The recipe search under Alla recept. */
  q?: string;
  /** The ingredient picker under Vad har du hemma?. */
  ingrediens?: string;
};

/** The home route's `validateSearch`. An empty field leaves its param out. */
export function validateHomeSearch(search: Record<string, unknown>): HomeSearch {
  const result: HomeSearch = {};
  const q = searchText(search.q);
  const ingrediens = searchText(search.ingrediens);
  if (q !== undefined) result.q = q;
  if (ingrediens !== undefined) result.ingrediens = ingrediens;
  return result;
}

function searchText(value: unknown): string | undefined {
  // The router parses each value as JSON when it can, so `?q=12` arrives as a number.
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return typeof value === "string" && value !== "" ? value : undefined;
}

/**
 * A home page search field's text, kept in the URL so a reload or going back to the page keeps it.
 * Typing replaces the history entry instead of adding one, and leaves the scroll position alone.
 *
 * It reads the browser's location rather than `useSearch`: the router updates its own copy in a
 * transition, too late for a controlled field, which would drop keystrokes and move the caret.
 * Prerendering and hydration see an empty field, like `useHomeState`.
 */
export function useHomeSearchParam(key: keyof HomeSearch): [string, (next: string) => void] {
  const router = useRouter();
  const navigate = useNavigate();
  const searchStr = useSyncExternalStore(
    router.history.subscribe,
    () => router.history.location.search,
    () => "",
  );
  const value = validateHomeSearch(router.options.parseSearch(searchStr))[key] ?? "";

  function setValue(next: string) {
    void navigate({
      to: "/",
      search: (prev) => ({ ...prev, [key]: next || undefined }),
      replace: true,
      resetScroll: false,
    });
  }

  return [value, setValue];
}
