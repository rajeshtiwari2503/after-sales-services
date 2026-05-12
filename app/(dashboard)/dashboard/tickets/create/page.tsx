"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function CreateTicketPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
  });
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/dashboard/tickets");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-2xl border p-8 shadow-sm">
        <h1 className="text-3xl font-bold mb-6">Create Ticket</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="Ticket Title"
            className="w-full border rounded-xl px-4 py-3"
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
          />
          <textarea
            placeholder="Description"
            rows={6}
            className="w-full border rounded-xl px-4 py-3"
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
          />
          <select
            className="w-full border rounded-xl px-4 py-3"
            value={form.priority}
            onChange={(e) =>
              setForm({
                ...form,
                priority: e.target.value,
              })
            }
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <button
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl"
          >
            {loading ? "Creating..." : "Create Ticket"}
          </button>
        </form>
      </div>
    </div>
  );
}