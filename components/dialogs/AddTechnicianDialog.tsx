"use client";

import {
  useForm,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import * as z from "zod";

const schema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
});

export default function AddTechnicianDialog({
  open,
  onClose,
  onSuccess,
}: any) {
  const {
    register,
    handleSubmit,
  } = useForm({
    resolver:
      zodResolver(schema),
  });

  const onSubmit =
    async (data: any) => {
      await fetch(
        "/api/technicians",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            data
          ),
        }
      );

      onSuccess();

      onClose();
    };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[30px] w-full max-w-lg p-8">
        <h2 className="text-3xl font-black mb-8">
          Add Technician
        </h2>

        <form
          onSubmit={handleSubmit(
            onSubmit
          )}
          className="space-y-5"
        >
          <input
            {...register("name")}
            placeholder="Name"
            className="w-full h-14 px-5 rounded-2xl border border-slate-200"
          />

          <input
            {...register("email")}
            placeholder="Email"
            className="w-full h-14 px-5 rounded-2xl border border-slate-200"
          />

          <input
            {...register("phone")}
            placeholder="Phone"
            className="w-full h-14 px-5 rounded-2xl border border-slate-200"
          />

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-2xl border"
            >
              Cancel
            </button>

            <button className="px-6 py-3 rounded-2xl bg-blue-600 text-white">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}