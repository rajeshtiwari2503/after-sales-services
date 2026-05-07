export const calculateSLAStatus = (
  createdAt: string
) => {
  const created =
    new Date(createdAt).getTime();

  const now = new Date().getTime();

  const hours =
    (now - created) / (1000 * 60 * 60);

  if (hours < 24) {
    return "WITHIN_SLA";
  }

  return "BREACHED";
};