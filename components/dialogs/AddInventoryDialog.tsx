"use client";

import { useForm } from "react-hook-form";

export default function AddInventoryDialog({
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
      "/api/inventory",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          ...data,

          stock: Number(
            data.stock
          ),

          price: Number(
            data.price
          ),
        }),
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
          Add Inventory
        </h2>

        <form
          onSubmit={handleSubmit(
            onSubmit
          )}
          className="space-y-5"
        >
          <input
            {...register(
              "partName"
            )}
            placeholder="Part Name"
            className="w-full h-14 px-5 rounded-2xl border"
          />

          <input
            {...register("sku")}
            placeholder="SKU"
            className="w-full h-14 px-5 rounded-2xl border"
          />

          <input
            {...register("stock")}
            placeholder="Stock"
            type="number"
            className="w-full h-14 px-5 rounded-2xl border"
          />

          <input
            {...register("price")}
            placeholder="Price"
            type="number"
            className="w-full h-14 px-5 rounded-2xl border"
          />

          <input
            {...register("vendor")}
            placeholder="Vendor"
            className="w-full h-14 px-5 rounded-2xl border"
          />

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