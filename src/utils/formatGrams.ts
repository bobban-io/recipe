export function formatGrams(value: number) {
  const formatter = new Intl.NumberFormat("sv-SE", {
    unitDisplay: "short",
    style: "unit",
    unit: "gram",
    maximumFractionDigits: 1,
  });

  return formatter.format(value);
}
