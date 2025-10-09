export function formatGrams(value: number) {
  const formatter = new Intl.NumberFormat(navigator.language, {
    unitDisplay: "short",
    style: "unit",
    unit: "gram",
  });

  return formatter.format(value);
}
