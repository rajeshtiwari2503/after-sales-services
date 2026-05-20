 'use client';

// app/(auth)/forgot-password/page.tsx  — REPLACE existing
// 3-step flow entirely on one page:
//   Step 1 → Enter email → API generates OTP
//   Step 2 → Enter 6-digit OTP (shown in console / email)
//   Step 3 → Enter new password + confirm
//   Done  → Redirect to /login

import { useState, useRef, KeyboardEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck, Mail, ArrowRight, ArrowLeft,
  KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle,
  RefreshCw, LockKeyhole,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Password strength helpers ─────────────────────────────── */
const checks = (pw: string) => ({
  length:    pw.length >= 8,
  uppercase: /[A-Z]/.test(pw),
  lowercase: /[a-z]/.test(pw),
  number:    /[0-9]/.test(pw),
  special:   /[^A-Za-z0-9]/.test(pw),
});
const strengthLabel = (n: number) =>
  n <= 2 ? 'Weak' : n <= 4 ? 'Medium' : 'Strong';
const strengthColor = (s: string) =>
  s === 'Weak' ? 'bg-red-500' : s === 'Medium' ? 'bg-yellow-500' : 'bg-green-500';
const strengthWidth = ['w-0','w-1/5','w-2/5','w-3/5','w-4/5','w-full'];

/* ─── Shared input class ─────────────────────────────────────── */
const inputCls = (error?: boolean) =>
  `h-14 w-full rounded-2xl border bg-slate-50 pl-12 pr-4 text-sm outline-none transition-all focus:bg-white focus:ring-4 ${
    error
      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
  }`;

/* ─── Component ──────────────────────────────────────────────── */
export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);   // 4 = success
  const [loading, setLoading] = useState(false);

  // Step 1
  const [email,    setEmail]    = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [token,    setToken]    = useState('');
  const [devOTP,   setDevOTP]   = useState('');   // shown in dev only

  // Step 2 — OTP boxes
  const [otp,    setOtp]    = useState(['','','','','','']);
  const [otpErr, setOtpErr] = useState('');
  const otpRefs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

  // Step 3 — new password
  const [password,     setPassword]     = useState('');
  const [confirmPw,    setConfirmPw]    = useState('');
  const [showPw,       setShowPw]       = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [pwErr,        setPwErr]        = useState('');

  /* ── OTP input handler ── */
  const handleOtpInput = (i: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next  = [...otp];
    next[i] = digit;
    setOtp(next);
    setOtpErr('');
    if (digit && i < 5) otpRefs[i + 1].current?.focus();
  };

  const handleOtpKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      otpRefs[i - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const digits = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6).split('');
    if (digits.length === 6) {
      setOtp(digits);
      otpRefs[5].current?.focus();
    }
  };

  /* ── Step 1: Request OTP ── */
  const handleRequestOTP = async () => {
    setEmailErr('');
    if (!email.trim()) { setEmailErr('Email is required'); return; }
    if (!/^\S+@\S+\.\S+$/.test(email)) { setEmailErr('Enter a valid email address'); return; }

    setLoading(true);
    try {
      const res  = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? data.error ?? 'Request failed');

      if (data.data?.token) {
        setToken(data.data.token);
        // Dev: show OTP in UI so testers don't need to check console
        if (data.data.otp) setDevOTP(data.data.otp);
        toast.success('OTP sent! Check your email (or console in dev).');
        setStep(2);
      } else {
        // Account not found — still show step 2 for security (don't reveal)
        toast.success('If this email exists, an OTP has been sent.');
        setStep(2);
      }
    } catch (e: any) {
      toast.error(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: Verify OTP ── */
  const handleVerifyOTP = async () => {
    setOtpErr('');
    const otpValue = otp.join('');
    if (otpValue.length < 6) { setOtpErr('Enter the complete 6-digit OTP'); return; }

    setLoading(true);
    try {
      const res  = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, otp: otpValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? data.error ?? 'Invalid OTP');
      toast.success('OTP verified!');
      setStep(3);
    } catch (e: any) {
      setOtpErr(e.message || 'Incorrect OTP');
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 3: Reset password ── */
  const handleResetPassword = async () => {
    setPwErr('');
    if (!password) { setPwErr('New password is required'); return; }
    if (password.length < 8) { setPwErr('Password must be at least 8 characters'); return; }
    if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/.test(password)) {
      setPwErr('Must include uppercase, lowercase and a number');
      return;
    }
    if (password !== confirmPw) { setPwErr('Passwords do not match'); return; }

    setLoading(true);
    try {
      const res  = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          otp: otp.join(''),
          password,
          confirmPassword: confirmPw,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? data.error ?? 'Reset failed');
      setStep(4);
    } catch (e: any) {
      toast.error(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const pwChecks  = checks(password);
  const passed    = Object.values(pwChecks).filter(Boolean).length;
  const strength  = strengthLabel(passed);

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_80px_rgba(15,23,42,0.08)] lg:grid-cols-2">

        {/* ── LEFT PANEL ── */}
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#2563eb] p-10 text-white lg:flex flex-col justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_30%)]" />
          <div className="relative z-10">
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-xl">
              <KeyRound className="h-10 w-10" />
            </div>
            <h1 className="text-4xl font-bold leading-tight">Forgot your password?</h1>
            <p className="mt-4 text-base text-slate-300 leading-7">
              No worries — enter your email and we'll send you a one-time OTP to reset your password securely.
            </p>

            {/* Step progress */}
            <div className="mt-10 space-y-4">
              {[
                { n: 1, label: 'Enter your email address' },
                { n: 2, label: 'Verify the 6-digit OTP'   },
                { n: 3, label: 'Set your new password'     },
              ].map(({ n, label }) => (
                <div key={n} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                    step > n  ? 'bg-green-500 text-white' :
                    step === n ? 'bg-white text-blue-900' :
                    'bg-white/20 text-white'
                  }`}>
                    {step > n ? '✓' : n}
                  </div>
                  <p className={`text-sm ${step === n ? 'text-white font-semibold' : 'text-slate-400'}`}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
            <p className="text-sm text-slate-300">
              <span className="font-semibold text-white">Remember your password?</span>{' '}
              Go back to{' '}
              <Link href="/login" className="text-blue-300 hover:underline">Login</Link>
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="p-8 sm:p-12 flex flex-col justify-center min-h-[560px]">

          {/* Mobile back link */}
          <Link href="/login" className="lg:hidden flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Back to login
          </Link>

          {/* ════ STEP 1: Email ════ */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Password Recovery</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">Enter your email</h2>
                <p className="mt-2 text-sm text-slate-500">
                  We'll send a 6-digit OTP to your registered email address.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setEmailErr(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleRequestOTP()}
                    className={`${inputCls(!!emailErr)} pl-12`}
                    autoFocus
                  />
                </div>
                {emailErr && (
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-red-500">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />{emailErr}
                  </p>
                )}
              </div>

              <button
                onClick={handleRequestOTP}
                disabled={loading}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.01] hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading
                  ? <><span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />Sending OTP...</>
                  : <><ArrowRight className="h-5 w-5" />Send OTP</>}
              </button>

              <p className="text-center text-sm text-slate-500">
                Remember your password?{' '}
                <Link href="/login" className="font-semibold text-blue-600 hover:underline">Sign in</Link>
              </p>
            </div>
          )}

          {/* ════ STEP 2: OTP ════ */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">OTP Verification</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">Enter OTP</h2>
                <p className="mt-2 text-sm text-slate-500">
                  We sent a 6-digit code to{' '}
                  <span className="font-semibold text-slate-700">{email}</span>
                </p>
              </div>

              {/* Dev OTP hint */}
              {devOTP && (
                <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <span className="text-xs font-semibold text-amber-700">Dev mode OTP:</span>
                  <span className="font-mono text-base font-bold tracking-[0.3em] text-amber-800">{devOTP}</span>
                </div>
              )}

              {/* 6 OTP boxes */}
              <div>
                <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={otpRefs[i]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpInput(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className={`h-14 w-12 rounded-2xl border text-center text-xl font-bold outline-none transition-all focus:ring-4 ${
                        otpErr
                          ? 'border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-100 text-red-700'
                          : digit
                            ? 'border-blue-400 bg-blue-50 text-blue-800 focus:ring-blue-100'
                            : 'border-slate-300 bg-slate-50 text-slate-800 focus:border-blue-500 focus:ring-blue-100'
                      }`}
                    />
                  ))}
                </div>
                {otpErr && (
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-red-500">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />{otpErr}
                  </p>
                )}
              </div>

              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.join('').length < 6}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.01] hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading
                  ? <><span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />Verifying...</>
                  : <><ArrowRight className="h-5 w-5" />Verify OTP</>}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button onClick={() => setStep(1)}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-700 cursor-pointer">
                  <ArrowLeft className="h-4 w-4" /> Change email
                </button>
                <button
                  onClick={() => { setOtp(['','','','','','']); setDevOTP(''); handleRequestOTP(); }}
                  disabled={loading}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Resend OTP
                </button>
              </div>
            </div>
          )}

          {/* ════ STEP 3: New password ════ */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">New Password</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">Set new password</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Choose a strong password for your account.
                </p>
              </div>

              {/* New password */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">New password</label>
                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setPwErr(''); }}
                    className={`${inputCls(!!pwErr)} pl-12 pr-12`}
                  />
                  <button type="button" onClick={() => setShowPw(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                    {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Strength */}
                {password.length > 0 && (
                  <div className="mt-3">
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className="text-slate-500">Strength</span>
                      <span className={strength === 'Weak' ? 'text-red-500' : strength === 'Medium' ? 'text-yellow-500' : 'text-green-600'}>
                        {strength}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                      <div className={`h-full rounded-full transition-all duration-500 ${strengthWidth[passed]} ${strengthColor(strength)}`} />
                    </div>
                  </div>
                )}

                {/* Requirement pills */}
                <div className="mt-3 grid grid-cols-2 gap-1.5">
                  {[
                    { label: '8+ chars',   valid: pwChecks.length    },
                    { label: 'Uppercase',  valid: pwChecks.uppercase  },
                    { label: 'Lowercase',  valid: pwChecks.lowercase  },
                    { label: 'Number',     valid: pwChecks.number     },
                    { label: 'Symbol',     valid: pwChecks.special    },
                  ].map(r => (
                    <div key={r.label} className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs ${
                      r.valid ? 'border-green-200 bg-green-50 text-green-700' : 'border-slate-200 bg-slate-50 text-slate-500'
                    }`}>
                      {r.valid
                        ? <CheckCircle2 className="h-3 w-3 shrink-0" />
                        : <AlertCircle  className="h-3 w-3 shrink-0" />}
                      {r.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Confirm password</label>
                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPw}
                    onChange={e => { setConfirmPw(e.target.value); setPwErr(''); }}
                    className={`${inputCls(!!(pwErr && pwErr.includes('match')))} pl-12 pr-12 ${
                      confirmPw && confirmPw === password ? '!border-green-400 focus:!border-green-400' : ''
                    }`}
                  />
                  <button type="button" onClick={() => setShowConfirm(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                    {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                  {confirmPw && confirmPw === password && (
                    <CheckCircle2 className="absolute right-12 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                  )}
                </div>
                {pwErr && (
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-red-500">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />{pwErr}
                  </p>
                )}
              </div>

              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.01] hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading
                  ? <><span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />Resetting...</>
                  : <><LockKeyhole className="h-5 w-5" />Reset Password</>}
              </button>
            </div>
          )}

          {/* ════ STEP 4: Success ════ */}
          {step === 4 && (
            <div className="flex flex-col items-center text-center space-y-6 py-8">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Password Reset!</h2>
                <p className="mt-3 text-sm text-slate-500 max-w-xs">
                  Your password has been reset successfully. You can now sign in with your new password.
                </p>
              </div>
              <Link
                href="/login"
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.01] hover:shadow-xl"
              >
                <ArrowRight className="h-5 w-5" /> Go to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}