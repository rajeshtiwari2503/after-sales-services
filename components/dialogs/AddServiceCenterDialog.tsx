"use client";

import { useForm } from "react-hook-form";

export default function AddServiceCenterDialog({
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
    try {
      await fetch(
        "/api/service-centers",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            ...data,

            supportedBrands:
              data.supportedBrands.split(
                ","
              ),
          }),
        }
      );

      reset();

      onSuccess();

      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-[30px] w-full max-w-xl p-8">
        <h2 className="text-3xl font-black mb-8">
          Add Service Center
        </h2>

        <form
          onSubmit={handleSubmit(
            onSubmit
          )}
          className="space-y-5"
        >
          <input
            {...register("name")}
            placeholder="Center Name"
            className="w-full h-14 px-5 rounded-2xl border"
          />

          <input
            {...register("email")}
            placeholder="Email"
            className="w-full h-14 px-5 rounded-2xl border"
          />

          <input
            {...register("phone")}
            placeholder="Phone"
            className="w-full h-14 px-5 rounded-2xl border"
          />

          <input
            {...register("city")}
            placeholder="City"
            className="w-full h-14 px-5 rounded-2xl border"
          />

          <input
            {...register("state")}
            placeholder="State"
            className="w-full h-14 px-5 rounded-2xl border"
          />

          <textarea
            {...register(
              "supportedBrands"
            )}
            placeholder="Samsung, LG, Sony"
            className="w-full h-32 p-5 rounded-2xl border"
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