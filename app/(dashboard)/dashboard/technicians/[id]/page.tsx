"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
export default function TechnicianDetailsPage() {
    const params = useParams();
    const [technician, setTechnician] = useState<any>(null);
    useEffect(() => {
        if (params?.id) {
            fetchTechnician();
        }
    }, [params?.id]);
    const fetchTechnician = async () => {
        const res = await fetch(`/api/technicians/${params.id}`);
        const data = await res.json();
        setTechnician(data.technician);
    };
    if (!technician) return <div className="p-6">Loading...</div>;
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold">
                {technician.name}
            </h1>
        </div>
    );
}
