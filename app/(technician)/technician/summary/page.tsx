 "use client";
// app/(technician)/technician/summary/page.tsx  — REPLACE existing
import ReportShell from "@/components/reports/ReportShell";

export default function TechnicianSummaryPage() {
  return (
    <ReportShell
      role="technician"
      title="My Performance Summary"
      subtitle="Your personal job stats — completion rate, resolution time, faults"
      accentColor="amber"
    />
  );
}