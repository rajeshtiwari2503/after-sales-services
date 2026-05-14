"use client";

import { Suspense } from "react";
import TicketsPageContent from "./TicketsPageContent";
 export const dynamic = "force-dynamic";

export default function TicketsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TicketsPageContent />
    </Suspense>
  );
}