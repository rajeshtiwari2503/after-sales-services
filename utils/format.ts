export const fmtDate = (d?: string | Date) =>
  d ? new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  }) : "—";

export const fmtDateTime = (d?: string | Date) =>
  d ? new Date(d).toLocaleString("en-IN", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
  }) : "—";

export const fmtTime = (d?: string | Date) =>
  d ? new Date(d).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit"
  }) : "—";

export const fmtCurrency = (n: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

export const fmtNumber = (n: number) =>
  new Intl.NumberFormat("en-IN").format(n);

export const fmtFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};

export const timeAgo = (d: string | Date) => {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (days < 7) return `${days}d ago`;
  return fmtDate(d);
};

export const initials = (name?: string) =>
  (name ?? "?").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

export const capitalize = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1);

export const slugify = (s: string) =>
  s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");