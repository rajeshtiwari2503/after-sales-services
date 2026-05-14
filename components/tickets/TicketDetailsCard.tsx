import TicketStatusBadge from "./TicketStatusBadge";

import PriorityBadge from "./PriorityBadge";
import StatusWorkflow from "./StatusWorkflow";
import ChangeStatus from "./ChangeStatus";
import TicketNotes from "./TicketNotes";

interface Props {
  ticketId: string;
  notes: any[];
  onUpdate: () => void;
}
interface Props {
  ticket: any;
}
export default function TicketDetailsCard({
  ticket,
}: Props) {
  return (
    <div className="bg-white border border-sky-100 rounded-[30px] p-8">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-black text-slate-900">
              {
                ticket.ticketId
              }
            </h1>

            <TicketStatusBadge
              status={
                ticket.status
              }
            />

            <PriorityBadge
              priority={
                ticket.priority
              }
            />
            <StatusWorkflow
  currentStatus={
    ticket.status
  }
/>

<ChangeStatus
  ticketId={ticket._id.toString()}
/>

<TicketNotes
  ticketId={ticket._id.toString()}
  notes={ticket.notes || []}
  onUpdate={() => {}}
/>
          </div>

          <h2 className="text-2xl font-bold mt-5 text-slate-800">
            {ticket.title}
          </h2>

          <p className="mt-4 text-slate-600 leading-7">
            {
              ticket.description
            }
          </p>
        </div>
      </div>

      {/* Customer */}
      <div className="grid md:grid-cols-3 gap-5 mt-10">
        <div className="bg-sky-50 rounded-2xl p-5">
          <p className="text-sm text-slate-500">
            Customer Name
          </p>

          <h3 className="font-bold text-lg mt-2">
            {
              ticket.customerName
            }
          </h3>
        </div>

        <div className="bg-sky-50 rounded-2xl p-5">
          <p className="text-sm text-slate-500">
            Customer Email
          </p>

          <h3 className="font-bold text-lg mt-2 break-all">
            {
              ticket.customerEmail
            }
          </h3>
        </div>

        <div className="bg-sky-50 rounded-2xl p-5">
          <p className="text-sm text-slate-500">
            Phone
          </p>

          <h3 className="font-bold text-lg mt-2">
            {
              ticket.customerPhone
            }
          </h3>
        </div>
      </div>

      {/* Attachments */}
      <div className="mt-10">
        <h2 className="text-xl font-black mb-5">
          Attachments
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          {ticket.attachments
            ?.length ? (
            ticket.attachments.map(
              (
                item: any,
                index: number
              ) => (
                <a
                  key={index}
                  href={
                    item.url
                  }
                  target="_blank"
                  className="p-5 border border-sky-100 rounded-2xl hover:bg-sky-50 transition"
                >
                  <p className="font-semibold">
                    {
                      item.fileName
                    }
                  </p>
                </a>
              )
            )
          ) : (
            <p className="text-slate-500">
              No attachments
            </p>
          )}
        </div>
      </div>
    </div>
  );
}