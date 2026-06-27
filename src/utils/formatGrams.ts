function getLocale(): string | undefined {
  // `navigator` is unavailable during static prerendering (Node); fall back to
  // the runtime default locale there and use the visitor's locale in the browser.
  if (typeof navigator !== "undefined" && navigator.language) {
    return navigator.language;
  }
  return undefined;
}

export function formatGrams(value: number) {
  const formatter = new Intl.NumberFormat(getLocale(), {
    unitDisplay: "short",
    style: "unit",
    unit: "gram",
    maximumFractionDigits: 1,
  });

  return formatter.format(value);
}
