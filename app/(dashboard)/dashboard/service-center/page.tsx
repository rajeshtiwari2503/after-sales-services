"use client";

import { useEffect, useState } from "react";

import ServiceCenterCard from "@/components/service-centers/ServiceCenterCard";

export default function ServiceCentersPage() {
  const [centers, setCenters] =
    useState([]);

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters =
    async () => {
      try {
        const res = await fetch(
          "/api/service-centers"
        );

        const data =
          await res.json();

        setCenters(data);
      } catch (error) {
        console.log(error);
      }
    };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-black">
          Service Centers
        </h1>

        <button className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold">
          Add Center
        </button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {centers.map((item: any) => (
          <ServiceCenterCard
            key={item._id}
            item={item}
          />
        ))}
      </div>
    </div>
  );
}