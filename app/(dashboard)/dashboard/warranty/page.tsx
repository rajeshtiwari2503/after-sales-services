"use client";
import { useEffect, useState } from "react";
import WarrantyTable from "@/components/warranty/WarrantyTable";
import WarrantyStats from "@/components/warranty/WarrantyStats";
export default function WarrantyPage() {
  const [warranties, setWarranties] = useState([]);
  useEffect(() => {
    fetchWarranty();
  }, []);
  const fetchWarranty = async () => {
    const res = await fetch("/api/warranty");
    const data = await res.json();
    setWarranties(data.warranties || []);
  };
  return (
    <div className="space-y-6 p-6">
      <WarrantyStats warranties={warranties} />
      <WarrantyTable warranties={warranties} />
    </div>
  );
}