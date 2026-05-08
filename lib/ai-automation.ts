export function detectCategory(
  text: string
) {
  const lower =
    text.toLowerCase();

  if (
    lower.includes(
      "screen"
    )
  ) {
    return "DISPLAY";
  }

  if (
    lower.includes(
      "battery"
    )
  ) {
    return "BATTERY";
  }

  if (
    lower.includes(
      "network"
    )
  ) {
    return "NETWORK";
  }

  return "GENERAL";
}