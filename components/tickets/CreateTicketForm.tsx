"use client";

import {
  useForm,
} from "react-hook-form";

import toast from "react-hot-toast";

export default function CreateTicketForm() {
  const {
    register,
    handleSubmit,
    reset,
  } = useForm();

  const onSubmit = async (
    data: any
  ) => {
    try {
      const res =
        await fetch(
          "/api/tickets",
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

      const result =
        await res.json();

      if (result.success) {
        toast.success(
          "Ticket Created"
        );

        reset();
      }
    } catch (error) {
      toast.error(
        "Something went wrong"
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl p-8">
      <h1 className="text-3xl font-bold mb-8">
        Create Ticket
      </h1>

      <form
        onSubmit={handleSubmit(
          onSubmit
        )}
        className="space-y-6"
      >
        <input
          {...register("title")}
          placeholder="Ticket Title"
          className="w-full h-14 border border-slate-200 rounded-2xl px-4"
        />

        <textarea
          {...register(
            "description"
          )}
          placeholder="Description"
          className="w-full border border-slate-200 rounded-2xl p-4 min-h-[140px]"
        />

        <div className="grid md:grid-cols-2 gap-5">
          <input
            {...register(
              "customerName"
            )}
            placeholder="Customer Name"
            className="w-full h-14 border border-slate-200 rounded-2xl px-4"
          />

          <input
            {...register(
              "customerEmail"
            )}
            placeholder="Customer Email"
            className="w-full h-14 border border-slate-200 rounded-2xl px-4"
          />
        </div>

        <input
          {...register(
            "customerPhone"
          )}
          placeholder="Phone Number"
          className="w-full h-14 border border-slate-200 rounded-2xl px-4"
        />

        <select
          {...register("priority")}
          className="w-full h-14 border border-slate-200 rounded-2xl px-4"
        >
          <option value="">
            Select Priority
          </option>

          <option value="LOW">
            LOW
          </option>

          <option value="MEDIUM">
            MEDIUM
          </option>

          <option value="HIGH">
            HIGH
          </option>

          <option value="URGENT">
            URGENT
          </option>
        </select>

        <button className="h-14 px-8 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold">
          Create Ticket
        </button>
      </form>
    </div>
  );
}