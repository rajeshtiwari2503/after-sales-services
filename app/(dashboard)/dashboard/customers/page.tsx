"use client";
import { useEffect, useState } from "react";
export default function CustomersPage() {
    const [customers, setCustomers] = useState([]);
    useEffect(() => {
        fetchCustomers();
    }, []);
    const fetchCustomers = async () => {
        const res = await fetch("/api/users?role=customer");
        const data = await res.json();
        
        setCustomers(data?.data?.users || []);
    };
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Customers</h1>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customers.map((customer: any) => (
                    <div
                        key={customer._id}
                        className="bg-white rounded-2xl border p-5 shadow-sm"
                    >
                        <h2 className="font-semibold text-lg">
                            {customer.name}
                        </h2>
                        <p className="text-slate-500 mt-2">
                            {customer.email}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}