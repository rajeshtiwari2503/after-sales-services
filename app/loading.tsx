 import Image from "next/image";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-cyan-50 overflow-hidden">

      {/* Background Glow */}
      <div className="absolute w-72 h-72 bg-cyan-400/10 blur-3xl rounded-full" />
      <div className="absolute w-72 h-72 bg-indigo-500/10 blur-3xl rounded-full right-10 top-10" />

      <div className="relative flex flex-col items-center">

        {/* Logo */}
        <div className="relative flex items-center justify-center mb-6">

          {/* Glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-44 h-24 bg-cyan-300/20 blur-3xl rounded-full scale-125" />
          </div>

          {/* Logo Image */}
          <Image
            src="/logo13.png"
            alt="SaaSTechify"
            width={320}
            height={120}
            priority
            className="
              relative z-10
              h-20 md:h-24
              w-auto
              object-contain
              drop-shadow-[0_15px_40px_rgba(34,211,238,0.22)]
              animate-pulse
            "
          />
        </div>

        {/* Loader */}
        <div className="relative mb-4">
          <div className="w-12 h-12 rounded-full border-[3px] border-slate-200" />

          <div className="absolute inset-0 w-12 h-12 rounded-full border-[3px] border-cyan-500 border-t-transparent animate-spin" />
        </div>

        {/* Text */}
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700 tracking-wide">
            Loading
          </p>

          <p className="text-xs text-slate-400 mt-1 tracking-[1px]">
            Please wait...
          </p>
        </div>
      </div>
    </div>
  );
}