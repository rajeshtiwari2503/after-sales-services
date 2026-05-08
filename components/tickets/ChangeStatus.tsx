"use client";

import toast from "react-hot-toast";

const statuses = [
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "PART_PENDING",
  "RESOLVED",
  "CLOSED",
];

export default function ChangeStatus({
  ticketId,
}: {
  ticketId: string;
}) {
  const updateStatus =
    async (
      status: string
    ) => {
      try {
        const res =
          await fetch(
            "/api/tickets/status",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify(
                {
                  ticketId,
                  status,
                }
              ),
            }
          );

        const data =
          await res.json();

        if (data.success) {
          toast.success(
            "Status updated"
          );

          location.reload();
        }
      } catch (error) {
        toast.error(
          "Failed"
        );
      }
    };

  return (
    <div className="bg-white border border-sky-100 rounded-[30px] p-6">
      <h2 className="text-xl font-black mb-5">
        Change Status
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {statuses.map(
          (status) => (
            <button
              key={status}
              onClick={() =>
                updateStatus(
                  status
                )
              }
              className="h-11 rounded-2xl border border-sky-100 hover:bg-sky-50 transition text-sm font-semibold"
            >
              {status.replace(
                "_",
                " "
              )}
            </button>
          )
        )}
      </div>
    </div>
  );
}