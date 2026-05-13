// "use client";

// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { registerSchema } from "@/schemas/auth.schema";
// import { z } from "zod";
// import { useState } from "react";
// import toast from "react-hot-toast";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { Eye, EyeOff, UserPlus } from "lucide-react";

// type RegisterForm = z.infer<typeof registerSchema>;

// export default function RegisterPage() {
//   const router = useRouter();
//   const [showPassword, setShowPassword] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     watch,
//     formState: { errors, isSubmitting },
//   } = useForm<RegisterForm>({
//     resolver: zodResolver(registerSchema),
//     defaultValues: {
//       role: "customer",
//     },
//   });

//   // ✅ watch se directly liya — alag state nahi chahiye
//   const password = watch("password", "");

//   const getStrength = (pw: string) => {
//     let s = 0;
//     if (pw.length >= 8) s++;
//     if (/[A-Z]/.test(pw)) s++;
//     if (/[0-9]/.test(pw)) s++;
//     if (/[^A-Za-z0-9]/.test(pw)) s++;
//     return s;
//   };

//   const strengthColors = ["bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-green-500"];
//   const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
//   const currentStrength = getStrength(password);

//   const onSubmit = async (data: RegisterForm) => {
//     console.log("✅ onSubmit called", data);
//     try {
//       const res = await fetch("/api/auth/register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify(data),
//       });

//       const result = await res.json();
//       if (!res.ok) throw new Error(result.message || "Registration failed");

//       toast.success(result.message || "Account created successfully!");
//       router.push("/login");
//     } catch (error: any) {
//       toast.error(error.message || "Registration failed");
//     }
//   };

//   return (
//     <div className="min-h-screen flex bg-slate-100">
//       {/* Left Panel */}
//       <div className="hidden lg:flex lg:w-5/12 bg-slate-900 flex-col justify-between p-12 relative overflow-hidden">
//         <div className="absolute inset-0 opacity-10"
//           style={{ backgroundImage: "linear-gradient(rgba(99,102,241,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.5) 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
//         <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-indigo-500/10 -translate-y-1/2 translate-x-1/2" />
//         <div className="absolute bottom-16 left-0 w-40 h-40 rounded-full bg-violet-500/10 -translate-x-1/2" />

//         <div className="flex items-center gap-3 z-10">
//           <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
//             <span className="text-white font-bold text-sm font-mono">ST</span>
//           </div>
//           <div>
//             <p className="text-white font-bold text-sm tracking-tight">SaaS Techify</p>
//             <p className="text-white/40 text-[10px] uppercase tracking-widest">After Sales Platform</p>
//           </div>
//         </div>

//         <div className="z-10">
//           <h1 className="text-3xl font-bold text-white leading-snug mb-3">
//             Start your <span className="text-indigo-400">free</span><br />30-day trial
//           </h1>
//           <p className="text-white/50 text-sm leading-relaxed mb-8">
//             Join thousands of businesses managing after-sales services smarter and faster.
//           </p>
//           <div className="space-y-5">
//             {[
//               { n: 1, title: "Create your account", desc: "Fill in your details to get started instantly." },
//               { n: 2, title: "Set up your workspace", desc: "Configure your team, roles and service categories." },
//               { n: 3, title: "Go live", desc: "Start receiving and managing service tickets immediately." },
//             ].map(({ n, title, desc }) => (
//               <div key={n} className="flex items-start gap-3">
//                 <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 text-xs font-semibold shrink-0 mt-0.5">
//                   {n}
//                 </div>
//                 <div>
//                   <p className="text-white/85 text-sm font-medium">{title}</p>
//                   <p className="text-white/45 text-xs leading-relaxed">{desc}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         <p className="text-white/25 text-xs z-10">© 2026 SaaS Techify. All rights reserved.</p>
//       </div>

//       {/* Right Panel */}
//       <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
//         <div className="w-full max-w-md">
//           <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
//             <div className="mb-7">
//               <h2 className="text-2xl font-bold text-slate-800">Create your account</h2>
//               <p className="text-slate-500 text-sm mt-1">Get started with SaaS Techify in under 2 minutes</p>
//             </div>

//             <form
//               onSubmit={handleSubmit(onSubmit, (errs) => {
//                 console.log("❌ Zod validation errors:", errs);
//               })}
//               className="space-y-4"
//             >
//               {/* Full Name */}
//               <div>
//                 <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
//                   Full name
//                 </label>
//                 <input
//                   {...register("name")}
//                   placeholder="Rahul Sharma"
//                   autoComplete="name"
//                   className="w-full h-11 border border-slate-200 rounded-lg px-3.5 text-sm text-slate-800 bg-slate-50 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition"
//                 />
//                 {errors.name && (
//                   <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
//                 )}
//               </div>

//               {/* Email */}
//               <div>
//                 <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
//                   Work email
//                 </label>
//                 <input
//                   type="email"
//                   {...register("email")}
//                   placeholder="rahul@company.com"
//                   autoComplete="email"
//                   className="w-full h-11 border border-slate-200 rounded-lg px-3.5 text-sm text-slate-800 bg-slate-50 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition"
//                 />
//                 {errors.email && (
//                   <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
//                 )}
//               </div>

//               {/* Role */}
//               <div>
//                 <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
//                   Your role
//                 </label>
//                 <select
//                   {...register("role")}
//                   className="w-full h-11 border border-slate-200 rounded-lg px-3.5 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition cursor-pointer"
//                 >
//                   <option value="customer">Customer</option>
//                   <option value="technician">Technician</option>
//                   <option value="manager">Manager</option>
//                   <option value="admin">Admin</option>
//                   <option value="support">Support</option>
//                 </select>
//                 {errors.role && (
//                   <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>
//                 )}
//               </div>

//               {/* Password */}
//               <div>
//                 <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     // ✅ onChange override nahi — register ka onChange use hoga
//                     {...register("password")}
//                     placeholder="Min. 8 characters"
//                     autoComplete="new-password"
//                     className="w-full h-11 border border-slate-200 rounded-lg px-3.5 pr-10 text-sm text-slate-800 bg-slate-50 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword((p) => !p)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
//                     aria-label="Toggle password"
//                   >
//                     {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                   </button>
//                 </div>

//                 {/* ✅ watch("password") se directly — setStrength nahi chahiye */}
//                 {password.length > 0 && (
//                   <div className="mt-2">
//                     <div className="flex gap-1">
//                       {[0, 1, 2, 3].map((i) => (
//                         <div
//                           key={i}
//                           className={`flex-1 h-1 rounded-full transition-all ${i < currentStrength
//                               ? strengthColors[currentStrength - 1]
//                               : "bg-slate-200"
//                             }`}
//                         />
//                       ))}
//                     </div>
//                     <p className="text-xs mt-1 text-slate-500">
//                       Password strength:{" "}
//                       <span className="font-medium">
//                         {strengthLabels[currentStrength - 1] || "Weak"}
//                       </span>
//                     </p>
//                   </div>
//                 )}
//                 {errors.password && (
//                   <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
//                 )}
//               </div>
//               {/* Confirm Password */}
//               <div>
//                 <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
//                   Confirm password
//                 </label>
//                 <div className="relative">
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     {...register("confirmPassword")}
//                     placeholder="Re-enter your password"
//                     autoComplete="new-password"
//                     className="w-full h-11 border border-slate-200 rounded-lg px-3.5 pr-10 text-sm text-slate-800 bg-slate-50 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition"
//                   />
//                 </div>
//                 {errors.confirmPassword && (
//                   <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
//                 )}
//               </div>
//               {/* Submit */}
//               <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed cursor-pointer text-white rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 mt-2"
//               >
//                 {isSubmitting ? (
//                   <>
//                     <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                     Creating account...
//                   </>
//                 ) : (
//                   <>
//                     <UserPlus className="w-4 h-4" />
//                     Create account
//                   </>
//                 )}
//               </button>
//             </form>

//             <p className="text-xs text-slate-400 text-center mt-4 leading-relaxed">
//               By registering, you agree to our{" "}
//               <Link href="/terms" className="text-indigo-600 hover:underline">Terms</Link>{" "}
//               and{" "}
//               <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>
//             </p>

//             <div className="flex items-center gap-3 my-5">
//               <div className="flex-1 h-px bg-slate-100" />
//               <span className="text-xs text-slate-400">already have an account?</span>
//               <div className="flex-1 h-px bg-slate-100" />
//             </div>

//             <div className="text-center text-sm">
//               <Link href="/login" className="text-indigo-600 font-medium hover:underline">
//                 Sign in instead
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

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
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">

      {/* ── Mobile top bar ── */}
      <div className="flex lg:hidden items-center gap-2.5 px-5 py-4 bg-white border-b border-slate-200 shrink-0">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xs font-mono">ST</span>
        </div>
        <div>
          <p className="text-slate-800 font-bold text-sm leading-none">SaaS Techify</p>
          <p className="text-slate-400 text-[10px] uppercase tracking-widest mt-0.5">After Sales Platform</p>
        </div>
      </div>

      {/* ── Left panel — lg+ ── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-[42%] bg-slate-900 flex-col justify-between p-10 xl:p-14 relative overflow-hidden flex-shrink-0">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(99,102,241,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.5) 1px,transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-indigo-500/10 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-16 left-0 w-40 h-40 rounded-full bg-violet-500/10 -translate-x-1/2" />

        {/* Brand */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm font-mono">ST</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm tracking-tight">SaaS Techify</p>
            <p className="text-white/40 text-[10px] uppercase tracking-widest">After Sales Platform</p>
          </div>
        </div>

        {/* Content */}
        <div className="z-10">
          <h1 className="text-2xl xl:text-3xl font-bold text-white leading-snug mb-3">
            Start your <span className="text-indigo-400">free</span>
            <br />30-day trial
          </h1>
          <p className="text-white/50 text-sm leading-relaxed mb-8">
            Join thousands of businesses managing after-sales services smarter and faster.
          </p>
          <div className="space-y-5">
            {[
              { n: 1, title: "Create your account", desc: "Fill in your details to get started instantly." },
              { n: 2, title: "Set up your workspace", desc: "Configure your team, roles and service categories." },
              { n: 3, title: "Go live", desc: "Start receiving and managing tickets immediately." },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 text-xs font-semibold shrink-0 mt-0.5">
                  {n}
                </div>
                <div>
                  <p className="text-white/85 text-sm font-medium">{title}</p>
                  <p className="text-white/45 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/25 text-xs z-10">© 2026 SaaS Techify. All rights reserved.</p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-start lg:items-center justify-center px-4 py-6 sm:px-8 sm:py-10 lg:py-8 overflow-y-auto">
        <div className="w-full max-w-sm sm:max-w-md">

          {/* Mobile heading */}
          <div className="lg:hidden mb-5 text-center">
            <h2 className="text-xl font-bold text-slate-800">Create your account</h2>
            <p className="text-slate-500 text-sm mt-1">Get started in under 2 minutes</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-8">

            {/* Desktop heading */}
            <div className="hidden lg:block mb-7">
              <h2 className="text-2xl font-bold text-slate-800">Create your account</h2>
              <p className="text-slate-500 text-sm mt-1">Get started with SaaS Techify in under 2 minutes</p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit, (errs) => console.log("❌ errors:", errs))}
              className="space-y-4"
            >
              {/* Full name */}
              <div>
                <label className={labelClass}>Full name</label>
                <input
                  {...register("name")}
                  placeholder="Rahul Sharma"
                  autoComplete="name"
                  className={inputClass}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
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
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
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
                {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
              </div>

              {/* Password + Confirm — side by side on sm+ */}
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      aria-label="Toggle password"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm password */}
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      aria-label="Toggle confirm password"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              {/* Strength bar — full width below both fields */}
              {password.length > 0 && (
                <div className="-mt-2">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 h-1 rounded-full transition-all ${
                          i < currentStrength ? strengthColors[currentStrength - 1] : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs mt-1 text-slate-500">
                    Strength:{" "}
                    <span className="font-medium">
                      {strengthLabels[currentStrength - 1] || "Weak"}
                    </span>
                  </p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:bg-indigo-300 disabled:cursor-not-allowed cursor-pointer text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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

            <p className="text-xs text-slate-400 text-center mt-4 leading-relaxed">
              By registering, you agree to our{" "}
              <Link href="/terms" className="text-indigo-600 hover:underline">Terms</Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>
            </p>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-xs text-slate-400">already have an account?</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <div className="text-center text-sm">
              <Link href="/login" className="text-indigo-600 font-medium hover:underline">
                Sign in instead
              </Link>
            </div>
          </div>

          {/* Mobile footer */}
          <p className="lg:hidden text-center text-xs text-slate-400 mt-6">
            © 2026 SaaS Techify. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}