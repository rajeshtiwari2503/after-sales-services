import Link from "next/link";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative">
          <div className="text-[120px] font-black text-slate-100 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center">
              <FileQuestion className="w-8 h-8 text-indigo-500" />
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-800">Page not found</h1>
          <p className="text-slate-500 text-sm mt-2">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="javascript:history.back()"
            className="flex items-center gap-2 h-10 px-4 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Go back
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition cursor-pointer"
          >
            <Home className="w-4 h-4" /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}