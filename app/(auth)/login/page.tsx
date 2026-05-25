

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
import Image from "next/image";

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
      console.log("user", user?.role);

      router.push(ROLE_REDIRECTS[user?.role] ?? '/dashboard');
      // router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    }
  };
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">

    {/* ─────────────────────────────────────────────
   LEFT BRAND PANEL — LIGHT PREMIUM SAAS UI
───────────────────────────────────────────── */}

{/* ── Mobile Top Bar ── */}
<div className="lg:hidden relative overflow-hidden border-b border-cyan-100 bg-gradient-to-br from-[#f5fbff] via-[#f9fcff] to-[#f6f2ff]">

  {/* Soft glow */}
  <div className="absolute top-0 left-0 w-48 h-48 bg-cyan-300/20 blur-3xl rounded-full" />
  <div className="absolute bottom-0 right-0 w-40 h-40 bg-fuchsia-300/20 blur-3xl rounded-full" />

  <div className="relative flex justify-center items-center px-5 py-5">
    <Image
      src="/logo13.png"
      alt="SaaSTechify"
      width={240}
      height={90}
      priority
      className="
        h-14 sm:h-16
        w-auto object-contain
        drop-shadow-[0_10px_35px_rgba(34,211,238,0.25)]
      "
    />
  </div>
</div>

{/* ── Desktop Left Panel ── */}
<div
  className="
    hidden lg:flex
    lg:w-5/12 xl:w-[43%]
    relative overflow-hidden
    flex-col justify-between
    px-10 xl:px-14 py-8
    bg-gradient-to-br
    from-[#eef7ff]
    via-[#f8fbff]
    to-[#f3f0ff]
    border-r border-white/40
    flex-shrink-0
  "
>

  {/* Background Glow */}
  <div className="absolute top-0 right-0 w-[420px] h-[420px] rounded-full bg-cyan-300/15 blur-3xl -translate-y-1/3 translate-x-1/3" />
  <div className="absolute bottom-0 left-0 w-[380px] h-[380px] rounded-full bg-fuchsia-300/15 blur-3xl translate-y-1/3 -translate-x-1/3" />

  {/* Glass overlay */}
  <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />

  {/* Subtle grid */}
  <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(15,23,42,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.12)_1px,transparent_1px)] bg-[size:40px_40px]" />

  {/* ── Logo ── */}
  <div className="relative z-10 flex justify-center  ">
    <div className="relative">

      {/* Soft glow */}
      <div className="absolute inset-0 blur-3xl bg-cyan-300/20 rounded-full scale-110" />

      <Image
        src="/logo13.png"
        alt="SaaSTechify"
        width={360}
        height={130}
        priority
        className="
          relative
          h-[110px] xl:h-[130px]
          w-auto object-contain
          drop-shadow-[0_15px_40px_rgba(34,211,238,0.25)]
          hover:scale-[1.02]
          transition-all duration-500
        "
      />
    </div>
  </div>

  {/* ── Main Content ── */}
  <div className="relative z-10 text-center max-w-xl mx-auto">

    {/* Badge */}
    <div
      className="
        inline-flex items-center gap-2
        px-4 py-2
        rounded-full
        border border-cyan-200
        bg-white/70
        backdrop-blur-xl
        shadow-sm
        mb-7
      "
    >
      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />

      <span className="text-cyan-700 text-xs font-semibold tracking-wide">
        Next Gen After-Sales Platform
      </span>
    </div>

    {/* Heading */}
    <h1
      className="
        text-4xl xl:text-5xl 2xl:text-6xl
        font-black
        tracking-tight
        leading-[1.08]
        text-slate-800
        mb-2
      "
    >
      Smart Service

      <span
        className="
          block
          bg-gradient-to-r
          from-cyan-500
          via-blue-500
          to-fuchsia-500
          bg-clip-text
          text-transparent
        "
      >
        Management
      </span>

      Simplified
    </h1>

    {/* Description */}
    <p
      className="
        text-slate-600
        text-base xl:text-lg
        leading-relaxed
        max-w-lg
        mx-auto
        mb-5
      "
    >
      Manage service requests, technicians, escalations,
      and customer experiences from one powerful SaaS dashboard.
    </p>

    {/* Features */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">

      {[
        "Real-time tracking",
        "Secure multi-tenant access",
        "Role-based dashboards",
        "Automated workflows",
      ].map((f) => (
        <div
          key={f}
          className="
            flex items-center gap-3
            rounded-2xl
            border border-white/60
            bg-white/60
            backdrop-blur-xl
            px-4 py-3
            shadow-sm
            hover:shadow-md
            hover:-translate-y-0.5
            transition-all duration-300
          "
        >
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.5)] shrink-0" />

          <span className="text-sm text-slate-700 font-semibold">
            {f}
          </span>
        </div>
      ))}
    </div>
  </div>

  {/* ── Footer ── */}
  <div className="relative z-10 flex items-center justify-between pt-10 text-xs text-slate-500">

    <p>© 2026 SaaS Techify</p>

    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      <span>System Operational</span>
    </div>
  </div>
</div>

      {/* ── Right panel — form ── */}
      {/* ─────────────────────────────────────────────
   RIGHT PANEL — LIGHT PREMIUM SAAS UI
───────────────────────────────────────────── */}

<div
  className="
    flex-1 flex items-center justify-center
    px-4 py-8 sm:px-8 lg:px-12
    lg:py-0 overflow-y-auto
    relative
    bg-gradient-to-br
    from-[#eef7ff]
    via-[#f7fbff]
    to-[#f3f0ff]
  "
>

  {/* Soft Glow */}
  <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-cyan-400/10 blur-3xl rounded-full" />
  <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-fuchsia-400/10 blur-3xl rounded-full" />

  <div className="relative w-full max-w-sm sm:max-w-md">

    {/* Mobile Welcome */}
    <div className="lg:hidden mb-7 text-center">
      <h2 className="text-2xl font-bold text-slate-800">
        Welcome back
      </h2>

      <p className="text-slate-500 text-sm mt-1">
        Sign in to continue
      </p>
    </div>

    {/* ── Login Card ── */}
    <div
      className="
        relative overflow-hidden
        rounded-3xl
        border border-white/60
        bg-white/80
        backdrop-blur-2xl
        shadow-[0_20px_80px_rgba(15,23,42,0.08)]
        p-6 sm:p-8
      "
    >

      {/* Top gradient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_35%)]" />

      {/* Desktop Heading */}
      <div className="hidden lg:block relative z-10 mb-8">

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-200 bg-cyan-50 mb-5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />

          <span className="text-cyan-700 text-xs font-semibold">
            Secure Login Portal
          </span>
        </div>

        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
          Welcome back
        </h2>

        <p className="text-slate-500 text-sm mt-2">
          Access your SaaS Techify dashboard securely.
        </p>
      </div>

      {/* ── Form ── */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative z-10 space-y-5"
      >

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-[0.18em] mb-2">
            Email address
          </label>

          <input
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            {...register("email")}
            className="
              w-full h-12
              rounded-xl
              border border-slate-200
              bg-white/90
              px-4
              text-sm text-slate-800
              placeholder:text-slate-400
              focus:outline-none
              focus:border-cyan-400
              focus:ring-4
              focus:ring-cyan-400/10
              transition-all duration-300
            "
          />

          {errors.email && (
            <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
              <span>⚠</span> {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>

          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-[0.18em]">
              Password
            </label>

            <Link
              href="/forgot-password"
              className="text-xs text-cyan-600 hover:text-cyan-700 transition"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative">

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              {...register("password")}
              className="
                w-full h-12
                rounded-xl
                border border-slate-200
                bg-white/90
                px-4 pr-11
                text-sm text-slate-800
                placeholder:text-slate-400
                focus:outline-none
                focus:border-cyan-400
                focus:ring-4
                focus:ring-cyan-400/10
                transition-all duration-300
              "
            />

            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="
                absolute right-3 top-1/2 -translate-y-1/2
                text-slate-400 hover:text-cyan-500
                transition cursor-pointer
              "
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {errors.password && (
            <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
              <span>⚠</span> {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="
            w-full h-12
            rounded-xl
            bg-gradient-to-r
            from-cyan-500
            via-blue-500
            cursor-pointer 
            to-fuchsia-500
            hover:scale-[1.01]
            active:scale-[0.99]
            disabled:opacity-50
            disabled:cursor-not-allowed
            text-white
            text-sm font-semibold
            transition-all duration-300
            shadow-[0_10px_35px_rgba(59,130,246,0.25)]
            flex items-center justify-center gap-2
          "
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Sign in
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative z-10 flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs text-slate-400 uppercase tracking-widest">
          or
        </span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* Register */}
      <div className="relative z-10 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}

        <Link
          href="/register"
          className="
            text-cyan-600
            hover:text-fuchsia-600
            font-semibold
            transition
          "
        >
          Create account
        </Link>
      </div>
    </div>

    {/* Footer */}
    <p className="lg:hidden text-center text-xs text-slate-400 mt-6">
      © 2026 SaaS Techify. All rights reserved.
    </p>
  </div>
</div>
    </div>
  );
}