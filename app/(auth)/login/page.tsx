"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/schemas/auth.schema";
import { z } from "zod";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
const LoginPage = () => {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
    });
    const onSubmit = async (data: z.infer<typeof loginSchema>) => {
        try {
            const response = await axios.post("/api/auth/login", data);
            toast.success(response.data.message);
            router.push("/dashboard");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Login failed");
        }
    };
 
return (
    <div className="min-h-screen flex items-center justify-center bgslate-100 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold mb-6 text-center">
                Login
            </h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                    <input
                        type="email"
                        placeholder="Email"
                        {...register("email")}
                        className="w-full border rounded-xl px-4 py-3" />
                    {errors.email && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.email.message}
                        </p>
                    )}
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="Password"
                        {...register("password")}
                        className="w-full border rounded-xl px-4 py-3"
                    />
                    {errors.password && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.password.message}
                        </p>
                    )}
                </div>
                <button
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white
rounded-xl py-3 font-semibold"
                >
                    {isSubmitting ? "Loading..." : "Login"}
                </button>
                <div className="text-center mt-6">
  <p className="text-slate-500">
    Don&apos;t have an account?
  </p>

  <Link
    href="/register"
    className="inline-flex items-center justify-center mt-4 h-12 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 transition font-bold text-slate-700"
  >
    Create Account
  </Link>
</div>
            </form>
        </div>
    </div>
);
};
export default LoginPage;