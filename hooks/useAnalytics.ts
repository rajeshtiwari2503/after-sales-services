"use client";

import { useState, useEffect, useCallback } from "react";

type Range = "7" | "30" | "90" | "365";

interface Analytics {
  kpis: {
    totalTickets: number;
    resolvedTickets: number;
    resolutionRate: number;
    openTickets: number;
    inProgressTickets: number;
    pendingTickets: number;
    slaComplianceRate: number;
    avgResolutionHours: number;
  };
  statusDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
  timeline: { _id: string; created: number; resolved: number }[];
  technicianPerformance: any[];
  sla: {
    total: number; responseBreached: number;
    resolutionBreached: number; responseMet: number; resolutionMet: number;
  };
  recentActivity: any[];
  satisfaction: {
    csatScore: number; avgResolutionHours: number;
    totalResolved: number; resolutionRate: number;
  };
}

export function useAnalytics(initialRange: Range = "30") {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<Range>(initialRange);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analytics/overview?range=${range}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const json = await res.json();
      setData(json.data ?? json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  return { data, loading, error, range, setRange, refetch: fetchAnalytics };
}