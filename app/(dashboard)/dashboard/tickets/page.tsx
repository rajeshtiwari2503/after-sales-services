 "use client";
import { useEffect, useState } from "react";
import AdvancedTicketTable from "@/components/tickets/AdvancedTicketTable";
export default function TicketsPage() {
const [tickets, setTickets] = useState([]);
const [loading, setLoading] = useState(true);
useEffect(() => {
fetchTickets();
}, []);
const fetchTickets = async () => {
try {
const res = await fetch("/api/tickets");
const data = await res.json();
setTickets(data.tickets || []);
} catch (error) {
console.error(error);
} finally {
setLoading(false);
}
};
return (
<div className="p-6">
<div className="mb-6">
<h1 className="text-3xl font-bold">Ticket Management</h1>
<p className="text-slate-500 mt-2">
Manage support tickets and workflow.
</p>
</div>
<AdvancedTicketTable
// tickets={tickets}
// loading={loading}
/>
</div>
);
}
