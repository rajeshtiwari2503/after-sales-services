"use client";

import {
    useEffect,
    useState,
} from "react";
import TicketStatusBadge from "./TicketStatusBadge";
export default function TicketTable() {
    const [tickets, setTickets] =
        useState([]);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets =
        async () => {
            const res =
                await fetch(
                    "/api/tickets"
                );

            const data =
                await res.json();

            setTickets(data.tickets);
        };

    return (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
            <div className="p-6 border-b">
                <h1 className="text-2xl font-bold">
                    Tickets
                </h1>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="text-left p-4">
                                Ticket ID
                            </th>

                            <th className="text-left p-4">
                                Customer
                            </th>

                            <th className="text-left p-4">
                                Priority
                            </th>

                            <th className="text-left p-4">
                                Status
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {tickets.map(
                            (
                                ticket: any
                            ) => (
                                <tr
                                    key={
                                        ticket._id
                                    }
                                    className="border-t"
                                >
                                    <td className="p-4">
                                        {
                                            ticket.ticketId
                                        }
                                    </td>

                                    <td className="p-4">
                                        {
                                            ticket.customerName
                                        }
                                    </td>

                                    <td className="p-4">
                                        {
                                            ticket.priority
                                        }
                                    </td>

                                    <td className="p-4">
                                        <TicketStatusBadge
                                            status={ticket.status}
                                        />
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}