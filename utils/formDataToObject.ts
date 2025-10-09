export function formDataToObject(
  data: FormData
): Record<string, FormDataEntryValue | undefined> {
  return Object.fromEntries(data.entries());
}
