"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/schemas/auth.schema";
import { z } from "zod";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (
    data: z.infer<typeof registerSchema>
  ) => {
    try {
      const response = await axios.post(
        "/api/auth/register",
        data
      );

      toast.success(response.data.message);

      router.push("/login");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Registration failed"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Create Account
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <input
            placeholder="Name"
            {...register("name")}
            className="w-full border rounded-xl px-4 py-3"
          />

          <input
            placeholder="Email"
            {...register("email")}
            className="w-full border rounded-xl px-4 py-3"
          />

          <input
            type="password"
            placeholder="Password"
            {...register("password")}
            className="w-full border rounded-xl px-4 py-3"
          />

          <button
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 rounded-xl"
          >
            {isSubmitting ? "Loading..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}