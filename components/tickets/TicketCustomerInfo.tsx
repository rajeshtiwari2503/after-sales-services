"use client";

import { Users, Mail, Phone, MapPin } from "lucide-react";

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

// interface ServiceCenter {
//   _id: string;
//   name: string;
//   address?: string;
// }
interface ServiceCenter {
  _id: string;
  name: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}
interface Props {
  customer: Customer | null;
  serviceCenter: ServiceCenter | null;
}

const initials = (name?: string) =>
  (name ?? "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);


export default function TicketCustomerInfo({ customer, serviceCenter }: Props) {
  // console.log(serviceCenter);
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
          <Users className="w-4 h-4 text-green-600" />
        </div>
        <p className="text-sm font-semibold text-slate-800">Customer</p>
      </div>

      <div className="p-4">
        {customer ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold shrink-0">
                {initials(customer.name)}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{customer.name}</p>
                <p className="text-xs text-slate-400">Customer</p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{customer.email}</span>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{customer.phone}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-3">No customer assigned</p>
        )}

        {/* {serviceCenter && (
          <>
            <div className="h-px bg-slate-100 my-4" />
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Service Center</p>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-700">{serviceCenter?.name}</p>
                  {serviceCenter?.address && (
                    <p className="text-xs text-slate-400 mt-0.5">{serviceCenter?.address}</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )} */}
        {serviceCenter?.address && (
  <p className="mt-0.5 text-xs text-slate-400">
    {[
      serviceCenter.address.street,
      serviceCenter.address.city,
      serviceCenter.address.state,
      serviceCenter.address.postalCode,
      serviceCenter.address.country,
    ]
      .filter(Boolean)
      .join(", ")}
  </p>
)}
      </div>
    </div>
  );
}