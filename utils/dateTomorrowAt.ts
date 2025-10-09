export function dateTomorrowAt(date: Date, hours: number, minutes: number) {
  const tomorrow = new Date(date);

  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(hours, minutes, 0, 0);

  return tomorrow;
}
