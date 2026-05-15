"use client";
import { Suspense } from "react";
// Reuse existing TicketsPageContent with service-center specific filters
import TicketsPageContent from "@/app/(dashboard)/dashboard/tickets/TicketsPageContent";

export default function SCTicketsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Incoming Tickets</h1>
        <p className="text-xs text-slate-400 mt-0.5">Manage and assign service requests</p>
      </div>
      <Suspense fallback={<div className="h-96 bg-white rounded-xl border border-slate-200 animate-pulse" />}>
        <TicketsPageContent />
      </Suspense>
    </div>
  );
}