"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import TicketHeader from "@/components/tickets/TicketHeader";
import TicketCustomerInfo from "@/components/tickets/TicketCustomerInfo";
import TicketTimeline from "@/components/tickets/TicketTimeline";
import TicketNotes from "@/components/tickets/TicketNotes";
import TicketAssignment from "@/components/tickets/TicketAssignment";
import TicketStatusWorkflow from "@/components/tickets/TicketStatusWorkflow";
import TicketAttachments from "@/components/tickets/TicketAttachments";
import TicketSLA from "@/components/tickets/TicketSLA";
export default function TicketDetailsPage() {
  const params = useParams();
  const [ticket, setTicket] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  useEffect(() => {
    if (params?.id) {
      fetchTicket();
      fetchTimeline();
    }
  }, [params?.id]);
  const fetchTicket = async () => {
    const res = await fetch(`/api/tickets/${params.id}`);
    const data = await res.json();
    setTicket(data.ticket);
  };
  const fetchTimeline = async () => {
    const res = await fetch(`/api/tickets/${params.id}/timeline`);
    const data = await res.json();
    setTimeline(data.timeline || []);
  };
  if (!ticket) {
    return <div className="p-6">Loading...</div>;
  }
  return (
    <div className="p-6 space-y-6">
      <TicketHeader ticket={ticket} />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TicketTimeline timeline={timeline} />
          <TicketNotes ticketId={ticket._id} />
          <TicketAttachments ticketId={ticket._id} />
        </div>
        <div className="space-y-6">
          <TicketCustomerInfo customer={ticket.customer} />
          <TicketAssignment ticket={ticket} />
          <TicketStatusWorkflow ticket={ticket} />
          <TicketSLA ticket={ticket} />
        </div>
      </div>
    </div>
  );
}