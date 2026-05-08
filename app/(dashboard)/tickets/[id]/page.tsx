 "use client";

import { useEffect, useState } from "react";

import TicketHeader from "@/components/tickets/TicketHeader";

import TicketCustomerInfo from "@/components/tickets/TicketCustomerInfo";

import TicketTimeline from "@/components/tickets/TicketTimeline";

import TicketNotes from "@/components/tickets/TicketNotes";

import TicketAttachments from "@/components/tickets/TicketAttachments";

import TicketAssignment from "@/components/tickets/TicketAssignment";

import TicketStatusWorkflow from "@/components/tickets/TicketStatusWorkflow";

import TicketSLA from "@/components/tickets/TicketSLA";

import RealtimeTimeline from "@/components/tickets/RealtimeTimeline";

export default function TicketDetailsPage({
  params,
}: any) {
  const [ticket, setTicket] =
    useState<any>(null);

  const [technicians, setTechnicians] =
    useState([]);

  useEffect(() => {
    fetchTicket();

    fetchTechnicians();
  }, []);

  const fetchTicket =
    async () => {
      const res = await fetch(
        `/api/tickets/${params.id}`
      );

      const data =
        await res.json();

      setTicket(data);
    };

  const fetchTechnicians =
    async () => {
      const res = await fetch(
        "/api/technicians"
      );

      const data =
        await res.json();

      setTechnicians(data);
    };

  if (!ticket) {
    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">
      <TicketHeader
        ticket={ticket}
      />

      <div className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <TicketStatusWorkflow
            ticketId={
              ticket._id
            }
            currentStatus={
              ticket.status
            }
          />

          <TicketTimeline
            activities={
              ticket.activities
            }
          />

          <RealtimeTimeline />

          <TicketNotes
            ticketId={
              ticket._id
            }
            notes={
              ticket.notes
            }
          />

          <TicketAttachments
            attachments={
              ticket.attachments
            }
          />
        </div>

        <div className="space-y-6">
          <TicketCustomerInfo
            customer={
              ticket.customer
            }
          />

          <TicketAssignment
            ticketId={
              ticket._id
            }
            technicians={
              technicians
            }
            assignedTo={
              ticket.assignedTo
            }
          />

          <TicketSLA
            sla={{
              status:
                ticket.slaStatus,

              deadline:
                ticket.slaDeadline,

              progress: 70,
            }}
          />
        </div>
      </div>
    </div>
  );
}