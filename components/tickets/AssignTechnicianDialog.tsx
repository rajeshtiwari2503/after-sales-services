"use client";

import {
  useState,
} from "react";

import toast from "react-hot-toast";

export default function AssignTechnicianDialog({
  ticketId,
}: {
  ticketId: string;
}) {
  const [
    technician,
    setTechnician,
  ] = useState("");

  const assignTechnician =
    async () => {
      try {
        const res =
          await fetch(
            "/api/tickets/assign",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify(
                {
                  ticketId,
                  technician,
                }
              ),
            }
          );

        const data =
          await res.json();

        if (data.success) {
          toast.success(
            "Technician Assigned"
          );
        }
      } catch (error) {
        toast.error(
          "Assignment failed"
        );
      }
    };

  return (
    <div className="bg-white border border-sky-100 rounded-[30px] p-6">
      <h2 className="text-xl font-black mb-5">
        Assign Technician
      </h2>

      <div className="space-y-4">
        <input
          placeholder="Technician Name"
          value={technician}
          onChange={(e) =>
            setTechnician(
              e.target.value
            )
          }
          className="w-full h-12 rounded-2xl border border-sky-100 px-4"
        />

        <button
          onClick={
            assignTechnician
          }
          className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold"
        >
          Assign
        </button>
      </div>
    </div>
  );
}