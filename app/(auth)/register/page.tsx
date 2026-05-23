 

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/schemas/auth.schema";
import { z } from "zod";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import Image from "next/image";

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "customer" },
  });

  const password = watch("password", "");

  const getStrength = (pw: string) => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };

  const strengthColors = ["bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-green-500"];
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
  const currentStrength = getStrength(password);

  const onSubmit = async (data: RegisterForm) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Registration failed");
      toast.success(result.message || "Account created successfully!");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
    }
  };

  const inputClass =
    "w-full h-11 border border-slate-200 rounded-lg px-3.5 text-sm text-slate-800 bg-slate-50 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition";
  const labelClass =
    "block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5";

  return (
  <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-[#eef7ff] via-[#f8fbff] to-[#f4f1ff] overflow-hidden">

  {/* ───────────────── MOBILE TOP BAR ───────────────── */}
  <div className="lg:hidden relative overflow-hidden border-b border-cyan-100 bg-white/80 backdrop-blur-xl shrink-0">

    {/* Glow */}
    <div className="absolute top-0 left-0 w-40 h-40 bg-cyan-300/20 blur-3xl rounded-full" />
    <div className="absolute bottom-0 right-0 w-32 h-32 bg-fuchsia-300/20 blur-3xl rounded-full" />

    <div className="relative flex justify-center items-center px-5 py-5">
      <Image
        src="/logo13.png"
        alt="SaaSTechify"
        width={220}
        height={80}
        priority
        className="
          h-14 w-auto object-contain
          drop-shadow-[0_10px_30px_rgba(34,211,238,0.25)]
        "
      />
    </div>
  </div>

  {/* ───────────────── LEFT PANEL ───────────────── */}
  <div
    className="
      hidden lg:flex
      lg:w-5/12 xl:w-[43%]
      relative overflow-hidden
      flex-col justify-between
      px-10 xl:px-14 py-10
      bg-gradient-to-br
      from-[#eff8ff]
      via-[#f8fbff]
      to-[#f3f0ff]
      border-r border-white/50
      flex-shrink-0
    "
  >

    {/* Background glow */}
    <div className="absolute top-0 right-0 w-[420px] h-[420px] rounded-full bg-cyan-300/15 blur-3xl -translate-y-1/3 translate-x-1/3" />
    <div className="absolute bottom-0 left-0 w-[360px] h-[360px] rounded-full bg-fuchsia-300/15 blur-3xl translate-y-1/3 -translate-x-1/3" />

    {/* Grid */}
    <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(15,23,42,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.12)_1px,transparent_1px)] bg-[size:42px_42px]" />

    {/* ── Logo ── */}
    <div className="relative z-10 flex justify-center">
      <div className="relative">

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
            drop-shadow-[0_15px_40px_rgba(34,211,238,0.22)]
            hover:scale-[1.02]
            transition-all duration-500
          "
        />
      </div>
    </div>

    {/* ── Main Content ── */}
    <div className="relative z-10 max-w-xl mx-auto">

      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-200 bg-white/70 backdrop-blur-xl shadow-sm mb-8">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />

        <span className="text-cyan-700 text-xs font-semibold tracking-wide">
          Free 30-Day Trial
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
          mb-5
        "
      >
        Start your

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
          SaaS Journey
        </span>

        today
      </h1>

      {/* Description */}
      <p className="text-slate-600 text-base xl:text-lg leading-relaxed mb-10 max-w-lg">
        Join thousands of businesses managing after-sales
        operations smarter, faster, and more efficiently.
      </p>

      {/* Steps */}
      <div className="space-y-5">

        {[
          {
            n: 1,
            title: "Create your account",
            desc: "Register your workspace in seconds.",
          },
          {
            n: 2,
            title: "Configure your team",
            desc: "Set roles, permissions and workflows.",
          },
          {
            n: 3,
            title: "Start managing services",
            desc: "Track tickets and customer support instantly.",
          },
        ].map(({ n, title, desc }) => (
          <div
            key={n}
            className="
              flex items-start gap-4
              rounded-2xl
              border border-white/60
              bg-white/60
              backdrop-blur-xl
              p-4
              shadow-sm
              hover:shadow-md
              hover:-translate-y-0.5
              transition-all duration-300
            "
          >

            <div
              className="
                w-9 h-9 rounded-xl
                bg-gradient-to-br
                from-cyan-500
                to-fuchsia-500
                flex items-center justify-center
                text-white text-sm font-bold
                shadow-[0_10px_20px_rgba(59,130,246,0.25)]
                shrink-0
              "
            >
              {n}
            </div>

            <div>
              <p className="text-slate-800 font-semibold text-sm">
                {title}
              </p>

              <p className="text-slate-500 text-xs leading-relaxed mt-1">
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Footer */}
    <div className="relative z-10 flex items-center justify-between pt-10 text-xs text-slate-500">

      <p>© 2026 SaaS Techify</p>

      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>All systems operational</span>
      </div>
    </div>
  </div>

  {/* ───────────────── RIGHT PANEL ───────────────── */}
  <div
  className="
    flex-1 flex items-start lg:items-center justify-center
    px-4 py-8 sm:px-8 lg:px-12
    lg:py-10 overflow-y-auto
    relative
  "
>

  {/* Background glow */}
  <div className="absolute top-0 left-0 w-[320px] h-[320px] bg-cyan-300/10 blur-3xl rounded-full" />
  <div className="absolute bottom-0 right-0 w-[320px] h-[320px] bg-fuchsia-300/10 blur-3xl rounded-full" />

  <div className="relative w-full max-w-md">

    {/* ── Mobile Heading ── */}
    <div className="lg:hidden mb-6 text-center">
      <h2 className="text-2xl font-bold text-slate-800">
        Create your account
      </h2>

      <p className="text-slate-500 text-sm mt-1">
        Get started in under 2 minutes
      </p>
    </div>

    {/* ── Form Card ── */}
    <div
      className="
        relative overflow-hidden
        rounded-3xl
        border border-white/60
        bg-white/80
        backdrop-blur-2xl
        shadow-[0_20px_80px_rgba(15,23,42,0.08)]
        p-5 sm:p-8
      "
    >

      {/* Card glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_35%)]" />

      {/* ── Desktop Heading ── */}
      <div className="hidden lg:block relative z-10 mb-7">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-200 bg-cyan-50 mb-5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />

          <span className="text-cyan-700 text-xs font-semibold">
            Free 30-Day Trial
          </span>
        </div>

        <h2 className="text-3xl font-bold text-slate-800">
          Create your account
        </h2>

        <p className="text-slate-500 text-sm mt-2">
          Start using SaaS Techify today.
        </p>
      </div>

      {/* ── FORM ── */}
      <form
        onSubmit={handleSubmit(onSubmit, (errs) => console.log(errs))}
        className="relative z-10 space-y-5"
      >

        {/* Full Name */}
        <div>
          <label className={labelClass}>Full name</label>

          <input
            {...register("name")}
            placeholder="Rahul Sharma"
            autoComplete="name"
            className={inputClass}
          />

          {errors.name && (
            <p className="text-red-500 text-xs mt-1">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className={labelClass}>Work email</label>

          <input
            type="email"
            {...register("email")}
            placeholder="rahul@company.com"
            autoComplete="email"
            className={inputClass}
          />

          {errors.email && (
            <p className="text-red-500 text-xs mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Role */}
        <div>
          <label className={labelClass}>Your role</label>

          <select
            {...register("role")}
            className={`${inputClass} cursor-pointer`}
          >
            <option value="customer">Customer</option>
            <option value="technician">Technician</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
            <option value="support">Support</option>
          </select>

          {errors.role && (
            <p className="text-red-500 text-xs mt-1">
              {errors.role.message}
            </p>
          )}
        </div>

        {/* Password Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Password */}
          <div>
            <label className={labelClass}>Password</label>

            <div className="relative">

              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Min. 8 chars"
                autoComplete="new-password"
                className={`${inputClass} pr-10`}
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
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className={labelClass}>Confirm password</label>

            <div className="relative">

              <input
                type={showConfirm ? "text" : "password"}
                {...register("confirmPassword")}
                placeholder="Re-enter password"
                autoComplete="new-password"
                className={`${inputClass} pr-10`}
              />

              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="
                  absolute right-3 top-1/2 -translate-y-1/2
                  text-slate-400 hover:text-cyan-500
                  transition cursor-pointer
                "
              >
                {showConfirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        {/* Password Strength */}
        {password.length > 0 && (
          <div className="-mt-1">

            <div className="flex gap-1">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`
                    flex-1 h-1.5 rounded-full transition-all
                    ${
                      i < currentStrength
                        ? strengthColors[currentStrength - 1]
                        : "bg-slate-200"
                    }
                  `}
                />
              ))}
            </div>

            <p className="text-xs mt-2 text-slate-500">
              Password strength:{" "}
              <span className="font-semibold">
                {strengthLabels[currentStrength - 1] || "Weak"}
              </span>
            </p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="
            w-full h-12
            rounded-xl
            cursor-pointer 
            bg-gradient-to-r
            from-cyan-500
            via-blue-500
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
              <span className="w-4 h-4 border-2  border-white/30 border-t-white rounded-full animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              Create account
            </>
          )}
        </button>
      </form>

      {/* Terms */}
      <div className="relative z-10">
        <p className="text-xs text-slate-500 text-center mt-5 leading-relaxed">
          By registering, you agree to our{" "}

          <Link
            href="/terms"
            className="text-cyan-600 hover:text-fuchsia-600 font-medium transition"
          >
            Terms
          </Link>{" "}
          and{" "}

          <Link
            href="/privacy"
            className="text-cyan-600 hover:text-fuchsia-600 font-medium transition"
          >
            Privacy Policy
          </Link>
        </p>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-slate-200" />

          <span className="text-xs text-slate-400">
            already have an account?
          </span>

          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Login */}
        <div className="text-center text-sm">
          <Link
            href="/login"
            className="
              text-cyan-600 hover:text-fuchsia-600
              font-semibold transition
            "
          >
            Sign in instead
          </Link>
        </div>
      </div>
    </div>

    {/* Mobile Footer */}
    <p className="lg:hidden text-center text-xs text-slate-400 mt-6">
      © 2026 SaaS Techify. All rights reserved.
    </p>
  </div>
</div>
</div>
  );
}