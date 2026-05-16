"use client";

import { useEffect, useState } from "react";

import TechnicianCard from "@/components/technicians/TechnicianCard";

export default function TechniciansPage() {
  const [technicians, setTechnicians] =
    useState([]);

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians =
    async () => {
      try {
        const res = await fetch(
          "/api/technicians"
        );

        const data =
          await res.json();

        setTechnicians(data?.data || []);
      } catch (error) {
        console.log(error);
      }
    };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-black">
          Technicians
        </h1>

        <button className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold">
          Add Technician
        </button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {technicians?.map(
          (technician: any) => (
            <TechnicianCard
              key={technician._id}
              technician={
                technician
              }
            />
          )
        )}
      </div>
    </div>
  );
}