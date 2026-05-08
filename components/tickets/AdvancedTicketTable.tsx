"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Search,
  Eye,
} from "lucide-react";

import TicketStatusBadge from "./TicketStatusBadge";

import PriorityBadge from "./PriorityBadge";

import SLABadge from "./SLABadge";

export default function AdvancedTicketTable() {
  const [tickets, setTickets] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets =
    async () => {
      try {
        const res =
          await fetch(
            "/api/tickets"
          );

        const data =
          await res.json();

        setTickets(
          data.tickets || []
        );
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

  const filteredTickets =
    useMemo(() => {
      return tickets.filter(
        (ticket: any) =>
          ticket.ticketId
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||
          ticket.customerName
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||
          ticket.title
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            )
      );
    }, [tickets, search]);

  const columns = [
    {
      accessorKey:
        "ticketId",

      header:
        "Ticket ID",
    },

    {
      accessorKey:
        "title",

      header: "Title",
    },

    {
      accessorKey:
        "customerName",

      header:
        "Customer",
    },

    {
      accessorKey:
        "priority",

      header:
        "Priority",

      cell: ({
        row,
      }: any) => (
        <PriorityBadge
          priority={
            row.original
              .priority
          }
        />
      ),
    },

    {
      accessorKey:
        "status",

      header: "Status",

      cell: ({
        row,
      }: any) => (
        <TicketStatusBadge
          status={
            row.original
              .status
          }
        />
      ),
    },

    {
      accessorKey:
        "slaStatus",

      header: "SLA",

      cell: ({
        row,
      }: any) => (
        <SLABadge
          status={
            row.original
              .slaStatus ||
            "ON_TIME"
          }
        />
      ),
    },

    {
      accessorKey:
        "actions",

      header:
        "Actions",

      cell: ({
        row,
      }: any) => (
        <Link
          href={`/dashboard/tickets/${row.original._id}`}
          className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition"
        >
          <Eye size={18} />
        </Link>
      ),
    },
  ];

  const table =
    useReactTable({
      data: filteredTickets,

      columns,

      getCoreRowModel:
        getCoreRowModel(),

      getPaginationRowModel:
        getPaginationRowModel(),
    });

  return (
    <div className="bg-white border border-sky-100 rounded-[30px] overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-sky-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">
            Ticket
            Management
          </h2>

          <p className="text-slate-500 mt-1">
            Manage customer
            support tickets
          </p>
        </div>

        <div className="relative w-full lg:w-[340px]">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="w-full h-12 pl-11 pr-4 rounded-2xl border border-sky-100 bg-sky-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead className="bg-sky-50/70">
            {table
              .getHeaderGroups()
              .map(
                (
                  headerGroup
                ) => (
                  <tr
                    key={
                      headerGroup.id
                    }
                  >
                    {headerGroup.headers.map(
                      (
                        header
                      ) => (
                        <th
                          key={
                            header.id
                          }
                          className="text-left p-5 text-sm font-bold text-slate-700"
                        >
                          {flexRender(
                            header
                              .column
                              .columnDef
                              .header,
                            header.getContext()
                          )}
                        </th>
                      )
                    )}
                  </tr>
                )
              )}
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-10 text-center text-slate-500"
                >
                  Loading...
                </td>
              </tr>
            ) : filteredTickets.length ===
              0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-10 text-center text-slate-500"
                >
                  No tickets
                  found
                </td>
              </tr>
            ) : (
              table
                .getRowModel()
                .rows.map(
                  (
                    row
                  ) => (
                    <tr
                      key={
                        row.id
                      }
                      className="border-t border-sky-100 hover:bg-sky-50/40 transition"
                    >
                      {row
                        .getVisibleCells()
                        .map(
                          (
                            cell
                          ) => (
                            <td
                              key={
                                cell.id
                              }
                              className="p-5 text-slate-700"
                            >
                              {flexRender(
                                cell
                                  .column
                                  .columnDef
                                  .cell,
                                cell.getContext()
                              )}
                            </td>
                          )
                        )}
                    </tr>
                  )
                )
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-5 border-t border-sky-100 flex items-center justify-between">
        <button
          onClick={() =>
            table.previousPage()
          }
          disabled={
            !table.getCanPreviousPage()
          }
          className="px-5 h-11 rounded-2xl border border-sky-100 disabled:opacity-40"
        >
          Previous
        </button>

        <p className="text-sm text-slate-500">
          Page{" "}
          <span className="font-bold">
            {table.getState()
              .pagination
              .pageIndex + 1}
          </span>{" "}
          of{" "}
          <span className="font-bold">
            {table.getPageCount()}
          </span>
        </p>

        <button
          onClick={() =>
            table.nextPage()
          }
          disabled={
            !table.getCanNextPage()
          }
          className="px-5 h-11 rounded-2xl border border-sky-100 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}