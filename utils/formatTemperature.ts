export function formatTemperature(value: number) {
  const formatter = new Intl.NumberFormat(navigator.language, {
    unitDisplay: "short",
    unit: "celsius",
    style: "unit",
  });

  return formatter.format(value);
}
