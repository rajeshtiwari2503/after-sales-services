export function getTenant(
  host: string
) {
  return host.split(".")[0];
}