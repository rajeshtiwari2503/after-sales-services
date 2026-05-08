"use client";

import { useState } from "react";

export default function AddWarrantyDialog() {
  const [open, setOpen] =
    useState(false);

  return (
    <>
      <button
        onClick={() =>
          setOpen(true)
        }
        className="h-12 px-6 rounded-2xl bg-blue-600 text-white font-bold"
      >
        Add Warranty
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-5">
          <div className="w-full max-w-2xl bg-white rounded-[30px] p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black">
                Add Warranty
              </h2>

              <button
                onClick={() =>
                  setOpen(false)
                }
                className="text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <input
                placeholder="Product Name"
                className="h-14 rounded-2xl border border-slate-200 px-5"
              />

              <input
                placeholder="Serial Number"
                className="h-14 rounded-2xl border border-slate-200 px-5"
              />

              <input
                placeholder="Customer Name"
                className="h-14 rounded-2xl border border-slate-200 px-5"
              />

              <input
                type="date"
                className="h-14 rounded-2xl border border-slate-200 px-5"
              />
            </div>

            <button className="w-full h-14 rounded-2xl bg-blue-600 text-white font-bold mt-8">
              Save Warranty
            </button>
          </div>
        </div>
      )}
    </>
  );
}