export function formatTime(date: Date) {
  const formatter = new Intl.DateTimeFormat(navigator.language, {
    minute: "2-digit",
    hour: "numeric",
  });

  return formatter.format(date);
}
