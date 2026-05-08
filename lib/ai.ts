export function detectPriority(
  text: string
) {
  const lower =
    text.toLowerCase();

  if (
    lower.includes(
      "urgent"
    )
  ) {
    return "HIGH";
  }

  if (
    lower.includes(
      "not working"
    )
  ) {
    return "MEDIUM";
  }

  return "LOW";
}