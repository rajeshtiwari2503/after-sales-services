"use client";

import { useForm } from "react-hook-form";

export default function AddWarrantyDialog({
  open,
  onClose,
  onSuccess,
}: any) {
  const {
    register,
    handleSubmit,
    reset,
  } = useForm();

  const onSubmit = async (
    data: any
  ) => {
    await fetch(
      "/api/warranty",
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

    reset();

    onSuccess();

    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[30px] w-full max-w-xl p-8">
        <h2 className="text-3xl font-black mb-8">
          Add Warranty
        </h2>

        <form
          onSubmit={handleSubmit(
            onSubmit
          )}
          className="space-y-5"
        >
          <input
            {...register(
              "productName"
            )}
            placeholder="Product Name"
            className="w-full h-14 px-5 rounded-2xl border"
          />

          <input
            {...register(
              "serialNumber"
            )}
            placeholder="Serial Number"
            className="w-full h-14 px-5 rounded-2xl border"
          />

          <input
            type="date"
            {...register(
              "purchaseDate"
            )}
            className="w-full h-14 px-5 rounded-2xl border"
          />

          <input
            type="date"
            {...register(
              "expiryDate"
            )}
            className="w-full h-14 px-5 rounded-2xl border"
          />

          <select
            {...register("status")}
            className="w-full h-14 px-5 rounded-2xl border"
          >
            <option value="">
              Select Status
            </option>

            <option value="ACTIVE">
              ACTIVE
            </option>

            <option value="EXPIRED">
              EXPIRED
            </option>
          </select>

          <div className="flex justify-end gap-4 pt-5">
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