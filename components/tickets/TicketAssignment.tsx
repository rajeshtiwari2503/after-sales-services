"use client";

import { useState } from "react";

export default function TicketAssignment({
  technicians = [],
  ticketId,
  assignedTo,
}: any) {
  const [loading, setLoading] =
    useState(false);

  const [selected, setSelected] =
    useState(
      assignedTo || ""
    );

  const assignTechnician =
    async () => {
      try {
        setLoading(true);

        await fetch(
          `/api/tickets/${ticketId}/assign`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              technicianId:
                selected,
            }),
          }
        );

        alert(
          "Technician assigned successfully"
        );
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="bg-white rounded-[30px] border border-slate-200 p-6">
      <h2 className="text-2xl font-black mb-6">
        Technician Assignment
      </h2>

      <div className="space-y-5">
        <select
          value={selected}
          onChange={(e) =>
            setSelected(
              e.target.value
            )
          }
          className="w-full h-14 px-5 rounded-2xl border border-slate-200"
        >
          <option value="">
            Select Technician
          </option>

          {technicians.map(
            (tech: any) => (
              <option
                key={tech._id}
                value={tech._id}
              >
                {tech.name}
              </option>
            )
          )}
        </select>

        <button
          onClick={
            assignTechnician
          }
          disabled={
            loading
          }
          className="w-full h-14 rounded-2xl bg-blue-600 text-white font-bold"
        >
          {loading
            ? "Assigning..."
            : "Assign Technician"}
        </button>
      </div>
    </div>
  );
}