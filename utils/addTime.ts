export function addTime(date: Date, hours: number, minutes: number = 0) {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}
