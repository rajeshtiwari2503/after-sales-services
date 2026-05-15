

"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/schemas/auth.schema";
import { z } from "zod";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn, Settings2 } from "lucide-react";

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  // const onSubmit = async (data: LoginForm) => {
  //   try {
  //     const res = await fetch("/api/auth/login", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       credentials: "include",
  //       body: JSON.stringify(data),
  //     });
  //     const result = await res.json();
  //     if (!res.ok) throw new Error(result.message || "Login failed");
  //     toast.success(result.message || "Login successful!");
  //     router.push("/dashboard");
  //     router.refresh();
  //   } catch (error: any) {
  //     toast.error(error.message || "Login failed");
  //   }
  // };


  // app/(auth)/login/page.tsx — onSubmit mein update
  const ROLE_REDIRECTS: Record<string, string> = {
    admin: '/dashboard',
    manager: '/brand/dashboard',
    service_center: '/service-center/dashboard',
    technician: '/technician/dashboard',
    customer: '/customer/dashboard',
    support: '/dashboard',
  };

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Login failed');

      const user = result.data?.user;
      localStorage.setItem('user', JSON.stringify(user));

      toast.success(result.message || 'Login successful!');
      // ✅ Role-based redirect
      console.log("user",user?.role);
      
      router.push(ROLE_REDIRECTS[user?.role] ?? '/dashboard');
      // router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    }
  };
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">

      {/* ── Top bar — mobile only ── */}
      <div className="flex lg:hidden items-center gap-2.5 px-5 py-4 bg-white border-b border-slate-200">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Settings2 className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-slate-800 font-bold text-sm leading-none">SaaS Techify</p>
          <p className="text-slate-400 text-[10px] uppercase tracking-widest mt-0.5">After Sales Platform</p>
        </div>
      </div>

      {/* ── Left panel — tablet+ ── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-[42%] bg-gradient-to-br from-blue-900 via-blue-700 to-blue-600 flex-col justify-between p-10 xl:p-14 relative overflow-hidden flex-shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />

        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 bg-white/15 border border-white/20 rounded-xl flex items-center justify-center">
            <Settings2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm tracking-tight">SaaS Techify</p>
            <p className="text-white/50 text-[10px] uppercase tracking-widest">After Sales Platform</p>
          </div>
        </div>

        <div className="z-10">
          <h1 className="text-2xl xl:text-3xl font-bold text-white leading-snug mb-4">
            Manage your<br />service operations<br />effortlessly
          </h1>
          <p className="text-white/60 text-sm leading-relaxed mb-8">
            Streamline after-sales workflows, track service requests, and deliver exceptional customer support.
          </p>
          <ul className="space-y-3">
            {[
              "Real-time service tracking",
              "Multi-tenant secure access",
              "Role-based dashboards",
              "Automated escalations",
            ].map(f => (
              <li key={f} className="flex items-center gap-3 text-white/75 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-300 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-white/30 text-xs z-10">© 2026 SaaS Techify. All rights reserved.</p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-8 sm:py-12 lg:py-0 overflow-y-auto">
        <div className="w-full max-w-sm sm:max-w-md">

          {/* Mobile welcome text */}
          <div className="lg:hidden mb-6 text-center">
            <h2 className="text-xl font-bold text-slate-800">Welcome back</h2>
            <p className="text-slate-500 text-sm mt-1">Sign in to your account</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">

            {/* Desktop welcome text */}
            <div className="hidden lg:block mb-8">
              <h2 className="text-2xl font-bold text-slate-800">Welcome back</h2>
              <p className="text-slate-500 text-sm mt-1">Sign in to your service portal account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  {...register("email")}
                  className="w-full h-11 border border-slate-200 rounded-lg px-3.5 text-sm text-slate-800 bg-slate-50 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <span>⚠</span> {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Password</label>
                  <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline font-medium">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    {...register("password")}
                    className="w-full h-11 border border-slate-200 rounded-lg px-3.5 pr-10 text-sm text-slate-800 bg-slate-50 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    aria-label="Toggle password"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <span>⚠</span> {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:bg-blue-300 disabled:cursor-not-allowed cursor-pointer text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</>
                ) : (
                  <><LogIn className="w-4 h-4" />Sign in</>
                )}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5 sm:my-6">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-xs text-slate-400">or</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <div className="text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-blue-600 font-medium hover:underline">
                Create account
              </Link>
            </div>
          </div>

          {/* Footer — mobile */}
          <p className="lg:hidden text-center text-xs text-slate-400 mt-6">
            © 2026 SaaS Techify. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}