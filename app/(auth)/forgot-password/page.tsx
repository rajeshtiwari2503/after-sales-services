 'use client';

import { useState } from 'react';

import {
  Eye,
  EyeOff,
  ShieldCheck,
  LockKeyhole,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

import { useForm } from 'react-hook-form';

 

interface FormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePasswordPage() {
  const [loading, setLoading] =
    useState(false);

  const [showCurrent, setShowCurrent] =
    useState(false);

  const [showNew, setShowNew] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  const password =
    watch('newPassword') || '';

  const passwordChecks = {
    length: password.length >= 8,
    uppercase:
      /[A-Z]/.test(password),
    lowercase:
      /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special:
      /[^A-Za-z0-9]/.test(password),
  };

  const passedChecks =
    Object.values(
      passwordChecks
    ).filter(Boolean).length;

  const strength =
    passedChecks <= 2
      ? 'Weak'
      : passedChecks <= 4
      ? 'Medium'
      : 'Strong';

  const onSubmit = async (
    data: FormValues
  ) => {
    try {
      setLoading(true);

      const res = await fetch(
        '/api/auth/change-password',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            currentPassword:
              data.currentPassword,
            newPassword:
              data.newPassword,
          }),
        }
      );

      const result =
        await res.json();

      if (!res.ok) {
        throw new Error(
          result.message
        );
      }

    //   toast.success(
    //     result.message ||
    //       'Password updated successfully'
    //   );

      reset();
    } catch (error: any) {
    //   toast.error(
    //     error.message ||
    //       'Something went wrong'
    //   );
    } finally {
      setLoading(false);
    }
  };

  const strengthWidth =
    passedChecks === 0
      ? 'w-0'
      : passedChecks === 1
      ? 'w-1/5'
      : passedChecks === 2
      ? 'w-2/5'
      : passedChecks === 3
      ? 'w-3/5'
      : passedChecks === 4
      ? 'w-4/5'
      : 'w-full';

  const strengthColor =
    strength === 'Weak'
      ? 'bg-red-500'
      : strength === 'Medium'
      ? 'bg-yellow-500'
      : 'bg-green-500';

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_80px_rgba(15,23,42,0.08)] lg:grid-cols-2">
          {/* LEFT SIDE */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#2563eb] p-10 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_30%)]" />

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-xl">
                  <ShieldCheck className="h-10 w-10" />
                </div>

                <h1 className="max-w-md text-5xl font-bold leading-tight">
                  Update Your Password
                </h1>

                <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
                  Protect your account
                  with a strong and
                  unique password.
                  Enterprise-grade
                  security starts with
                  your credentials.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-green-500/20 p-3">
                    <CheckCircle2 className="h-6 w-6 text-green-300" />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">
                      Security Best
                      Practices
                    </h3>

                    <ul className="mt-4 space-y-3 text-sm text-slate-300">
                      <li>
                        • Use at least 8
                        characters
                      </li>

                      <li>
                        • Include
                        uppercase &
                        lowercase
                      </li>

                      <li>
                        • Add numbers &
                        special symbols
                      </li>

                      <li>
                        • Avoid reusing
                        passwords
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="p-8 sm:p-12">
            <div className="mb-10">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                Account Security
              </p>

              <h2 className="mt-3 text-4xl font-bold text-slate-900">
                Change Password
              </h2>

              <p className="mt-3 text-slate-500">
                Enter your current
                password and choose a
                new secure password.
              </p>
            </div>

            <form
              onSubmit={handleSubmit(
                onSubmit
              )}
              className="space-y-7"
            >
              {/* Current */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Current Password
                </label>

                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    type={
                      showCurrent
                        ? 'text'
                        : 'password'
                    }
                    placeholder="Enter current password"
                    {...register(
                      'currentPassword',
                      {
                        required:
                          'Current password is required',
                      }
                    )}
                    className="h-14 w-full rounded-2xl border border-slate-300 bg-slate-50 pl-12 pr-14 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrent(
                        !showCurrent
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                  >
                    {showCurrent ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {errors.currentPassword && (
                  <p className="mt-2 text-sm text-red-500">
                    {
                      errors
                        .currentPassword
                        .message
                    }
                  </p>
                )}
              </div>

              {/* New */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  New Password
                </label>

                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    type={
                      showNew
                        ? 'text'
                        : 'password'
                    }
                    placeholder="Enter new password"
                    {...register(
                      'newPassword',
                      {
                        required:
                          'New password is required',
                      }
                    )}
                    className="h-14 w-full rounded-2xl border border-slate-300 bg-slate-50 pl-12 pr-14 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNew(
                        !showNew
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                  >
                    {showNew ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Strength */}
                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">
                      Password Strength
                    </span>

                    <span
                      className={`text-sm font-semibold ${
                        strength ===
                        'Weak'
                          ? 'text-red-500'
                          : strength ===
                            'Medium'
                          ? 'text-yellow-500'
                          : 'text-green-600'
                      }`}
                    >
                      {strength}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${strengthWidth} ${strengthColor}`}
                    />
                  </div>
                </div>

                {/* Rules */}
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    {
                      label:
                        '8+ Characters',
                      valid:
                        passwordChecks.length,
                    },
                    {
                      label:
                        'Uppercase Letter',
                      valid:
                        passwordChecks.uppercase,
                    },
                    {
                      label:
                        'Lowercase Letter',
                      valid:
                        passwordChecks.lowercase,
                    },
                    {
                      label: 'Number',
                      valid:
                        passwordChecks.number,
                    },
                    {
                      label:
                        'Special Character',
                      valid:
                        passwordChecks.special,
                    },
                  ].map((rule) => (
                    <div
                      key={rule.label}
                      className={`flex items-center gap-2 rounded-xl border p-3 text-sm ${
                        rule.valid
                          ? 'border-green-200 bg-green-50 text-green-700'
                          : 'border-slate-200 bg-slate-50 text-slate-500'
                      }`}
                    >
                      {rule.valid ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}

                      {rule.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Confirm Password
                </label>

                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    type={
                      showConfirm
                        ? 'text'
                        : 'password'
                    }
                    placeholder="Confirm new password"
                    {...register(
                      'confirmPassword',
                      {
                        required:
                          'Confirm password is required',
                        validate: (
                          value
                        ) =>
                          value ===
                            password ||
                          'Passwords do not match',
                      }
                    )}
                    className="h-14 w-full rounded-2xl border border-slate-300 bg-slate-50 pl-12 pr-14 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirm(
                        !showConfirm
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                  >
                    {showConfirm ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-500">
                    {
                      errors
                        .confirmPassword
                        .message
                    }
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading
                  ? 'Updating Password...'
                  : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}