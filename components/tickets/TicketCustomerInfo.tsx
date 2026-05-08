"use client";

import {
  User2,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function TicketCustomerInfo({
  customer,
}: any) {
  return (
    <div className="bg-white rounded-[30px] border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-8">
        <User2
          className="text-blue-600"
          size={24}
        />

        <h2 className="text-2xl font-black">
          Customer Information
        </h2>
      </div>

      <div className="flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-black">
          {customer?.name?.charAt(
            0
          ) || "C"}
        </div>

        <h3 className="mt-5 text-2xl font-black">
          {customer?.name ||
            "Customer"}
        </h3>

        <p className="text-slate-500 mt-2">
          Customer ID: #
          {customer?._id?.slice(
            -6
          ) || "000001"}
        </p>
      </div>

      <div className="space-y-5 mt-8">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50">
          <Mail
            className="text-blue-600"
            size={20}
          />

          <div>
            <p className="text-sm text-slate-500">
              Email
            </p>

            <p className="font-semibold mt-1">
              {customer?.email ||
                "N/A"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50">
          <Phone
            className="text-green-600"
            size={20}
          />

          <div>
            <p className="text-sm text-slate-500">
              Phone
            </p>

            <p className="font-semibold mt-1">
              {customer?.phone ||
                "N/A"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50">
          <MapPin
            className="text-red-600 mt-1"
            size={20}
          />

          <div>
            <p className="text-sm text-slate-500">
              Address
            </p>

            <p className="font-semibold mt-1 leading-7">
              {customer?.address ||
                "Address not available"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button className="w-full h-14 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition">
          Contact Customer
        </button>
      </div>
    </div>
  );
}