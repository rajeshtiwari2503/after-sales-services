"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);

  const fetchTickets = async () => {
    const response = await axios.get(
      "/api/tickets"
    );

    setTickets(response.data.data);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          Tickets
        </h1>

        <p className="text-slate-500 mt-2">
          Manage service complaints
        </p>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">
                Title
              </th>

              <th className="p-4 text-left">
                Status
              </th>

              <th className="p-4 text-left">
                Priority
              </th>
            </tr>
          </thead>

          <tbody>
            {tickets.map((ticket: any) => (
              <tr
                key={ticket._id}
                className="border-t"
              >
                <td className="p-4">
                  {ticket.title}
                </td>

                <td className="p-4">
                  {ticket.status}
                </td>

                <td className="p-4">
                  {ticket.priority}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}