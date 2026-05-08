"use client";

import { useEffect, useState } from "react";

import WarrantyCard from "@/components/warranty/WarrantyCard";

export default function WarrantyPage() {
  const [warranties, setWarranties] =
    useState([]);

  useEffect(() => {
    fetchWarranties();
  }, []);

  const fetchWarranties =
    async () => {
      try {
        const res = await fetch(
          "/api/warranty"
        );

        const data =
          await res.json();

        setWarranties(data);
      } catch (error) {
        console.log(error);
      }
    };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-black">
          Warranty Management
        </h1>

        <button className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold">
          Add Warranty
        </button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {warranties.map(
          (warranty: any) => (
            <WarrantyCard
              key={warranty._id}
              warranty={warranty}
            />
          )
        )}
      </div>
    </div>
  );
}