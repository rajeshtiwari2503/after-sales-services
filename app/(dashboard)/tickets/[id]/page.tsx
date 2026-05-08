import TicketDetailsCard from "@/components/tickets/TicketDetailsCard";

import TicketTimeline from "@/components/tickets/TicketTimeline";

import AssignTechnicianDialog from "@/components/tickets/AssignTechnicianDialog";

import { connectDB } from "@/lib/db";

import Ticket from "@/models/Ticket";

interface Props {
  params: {
    id: string;
  };
}

export default async function TicketDetailsPage({
  params,
}: Props) {
  await connectDB();

  const ticket =
    await Ticket.findById(
      params.id
    ).lean();

  return (
    <div className="p-6 space-y-6">
      <div className="grid xl:grid-cols-3 gap-6">
        {/* Left */}
        <div className="xl:col-span-2 space-y-6">
          <TicketDetailsCard
            ticket={JSON.parse(
              JSON.stringify(
                ticket
              )
            )}
          />

          <TicketTimeline
            timeline={
              ticket.timeline ||
              []
            }
          />
        </div>

        {/* Right */}
        <div className="space-y-6">
          <AssignTechnicianDialog
            ticketId={
              ticket._id.toString()
            }
          />

          {/* SLA */}
          <div className="bg-white border border-sky-100 rounded-[30px] p-6">
            <h2 className="text-xl font-black mb-5">
              SLA Details
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">
                  SLA Status
                </p>

                <p className="font-bold text-lg">
                  {
                    ticket.slaStatus
                  }
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Due Date
                </p>

                <p className="font-bold text-lg">
                  {ticket.dueDate
                    ? new Date(
                        ticket.dueDate
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white border border-sky-100 rounded-[30px] p-6">
            <h2 className="text-xl font-black mb-5">
              Internal Notes
            </h2>

            <div className="space-y-4">
              {ticket.internalNotes
                ?.length ? (
                ticket.internalNotes.map(
                  (
                    note: any,
                    index: number
                  ) => (
                    <div
                      key={index}
                      className="p-4 rounded-2xl bg-sky-50"
                    >
                      <p className="text-slate-700">
                        {
                          note.note
                        }
                      </p>

                      <p className="text-xs text-slate-500 mt-2">
                        {
                          note.createdBy
                        }
                      </p>
                    </div>
                  )
                )
              ) : (
                <p className="text-slate-500">
                  No notes added
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}