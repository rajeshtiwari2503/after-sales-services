"use client";

import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  onClose: () => void;
  fetchUsers: () => void;
  editData?: any;
}

export default function UserDialog({
  open,
  onClose,
  fetchUsers,
  editData,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
  } = useForm({
    defaultValues: {
      name: editData?.name || "",
      email: editData?.email || "",
      role: editData?.role || "customer",
    },
  });

  if (!open) return null;

  const onSubmit = async (data: any) => {
    try {
      if (editData) {
        await axios.put(
          `/api/users/${editData._id}`,
          data
        );

        toast.success("User updated");
      } else {
        await axios.post("/api/users", data);

        toast.success("User created");
      }

      fetchUsers();
      reset();
      onClose();
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-6">
          {editData ? "Edit User" : "Add User"}
        </h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <input
            {...register("name")}
            placeholder="Name"
            className="w-full border rounded-xl px-4 py-3"
          />

          <input
            {...register("email")}
            placeholder="Email"
            className="w-full border rounded-xl px-4 py-3"
          />

          <select
            {...register("role")}
            className="w-full border rounded-xl px-4 py-3"
          >
            <option value="admin">
              Admin
            </option>

            <option value="brand">
              Brand
            </option>

            <option value="serviceCenter">
              Service Center
            </option>

            <option value="technician">
              Technician
            </option>

            <option value="customer">
              Customer
            </option>
          </select>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl border"
            >
              Cancel
            </button>

            <button className="bg-blue-600 text-white px-5 py-3 rounded-xl">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}