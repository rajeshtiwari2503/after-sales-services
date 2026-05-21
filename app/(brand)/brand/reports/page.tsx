"use client";
// app/(brand)/brand/reports/page.tsx  — NEW FILE
import ReportShell from "@/components/reports/ReportShell";

export default function BrandReportsPage() {
  return (
    <ReportShell
      role="brand"
      title="Brand Reports"
      subtitle="Your brand's service performance — tickets, SCs, technicians"
      accentColor="blue"
    />
  );
}