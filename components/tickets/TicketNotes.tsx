"use client";

import {
  useState,
} from "react";

import toast from "react-hot-toast";

export default function TicketNotes({
  ticketId,
}: {
  ticketId: string;
}) {
  const [note, setNote] =
    useState("");

  const addNote =
    async () => {
      try {
        const res =
          await fetch(
            "/api/tickets/notes",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify(
                {
                  ticketId,
                  note,
                }
              ),
            }
          );

        const data =
          await res.json();

        if (data.success) {
          toast.success(
            "Note added"
          );

          setNote("");
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
        Internal Notes
      </h2>

      <textarea
        value={note}
        onChange={(e) =>
          setNote(
            e.target.value
          )
        }
        placeholder="Write internal note..."
        className="w-full min-h-[130px] rounded-2xl border border-sky-100 p-4"
      />

      <button
        onClick={addNote}
        className="mt-4 h-12 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold"
      >
        Add Note
      </button>
    </div>
  );
}