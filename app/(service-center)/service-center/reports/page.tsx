 "use client";
// app/(service-center)/service-center/reports/page.tsx  — REPLACE existing
import ReportShell from "@/components/reports/ReportShell";

export default function SCReportsPage() {
  return (
    <ReportShell
      role="service_center"
      title="Service Center Reports"
      subtitle="Your SC's ticket performance and technician stats"
      accentColor="teal"
    />
  );
}