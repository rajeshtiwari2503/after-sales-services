export const SLA_DEFAULTS = {
  low:      { responseHours: 48, resolutionHours: 120 },
  medium:   { responseHours: 4,  resolutionHours: 24  },
  high:     { responseHours: 1,  resolutionHours: 8   },
  critical: { responseHours: 0.25, resolutionHours: 2 },
};

export function calculateSLADeadlines(priority: string, createdAt: Date = new Date()) {
  const sla = SLA_DEFAULTS[priority as keyof typeof SLA_DEFAULTS] ?? SLA_DEFAULTS.medium;
  return {
    responseDeadline: new Date(createdAt.getTime() + sla.responseHours * 3600000),
    resolutionDeadline: new Date(createdAt.getTime() + sla.resolutionHours * 3600000),
    isResponseBreached: false,
    isResolutionBreached: false,
  };
}

export function getSLAStatus(deadline?: Date | string) {
  if (!deadline) return { pct: 0, remaining: null, color: "bg-blue-500", status: "none" };
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return { pct: 100, remaining: "Overdue", color: "bg-red-500", status: "breached" };
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const remaining = h > 24 ? `${Math.floor(h / 24)}d ${h % 24}h` : `${h}h ${m}m`;
  const totalMs = 24 * 3600000;
  const pct = Math.min(100, Math.round(((totalMs - diff) / totalMs) * 100));
  const color = pct < 50 ? "bg-blue-500" : pct < 80 ? "bg-amber-500" : "bg-red-500";
  const status = pct < 50 ? "healthy" : pct < 80 ? "warning" : "critical";
  return { pct, remaining: `${remaining} remaining`, color, status };
}

export function formatSLATime(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} minutes`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""}`;
  const days = Math.floor(hours / 24);
  const rem = hours % 24;
  return rem > 0 ? `${days}d ${rem}h` : `${days} day${days !== 1 ? "s" : ""}`;
}