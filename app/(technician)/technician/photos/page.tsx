"use client";
import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Camera, Upload, X, CheckCircle, ArrowLeft, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

interface Photo {
  url: string;
  caption: string;
  uploadedAt: string;
}

export default function JobPhotosPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [pending, setPending] = useState<{ file: File; preview: string; caption: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [ticket, setTicket] = useState<any>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    fetch(`/api/tickets/${jobId}`, { credentials: "include" })
      .then(r => r.json()).then(d => {
        const t = d.data ?? d;
        setTicket(t);
        // Extract existing attachment photos
        const existingPhotos = (t.attachments ?? [])
          .filter((a: any) => a.type?.startsWith("image/"))
          .map((a: any) => ({ url: a.url, caption: a.filename, uploadedAt: a.uploadedAt }));
        setPhotos(existingPhotos);
      }).catch(() => {});
  }, [jobId]);

  const handleFiles = (fileList: FileList) => {
    const valid = Array.from(fileList).filter(f => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024);
    const invalid = Array.from(fileList).length - valid.length;
    if (invalid > 0) toast.error(`${invalid} file(s) skipped (must be images under 10MB)`);
    valid.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        setPending(p => [...p, { file, preview: e.target?.result as string, caption: "" }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePending = (i: number) => {
    setPending(p => p.filter((_, idx) => idx !== i));
  };

  const updateCaption = (i: number, caption: string) => {
    setPending(p => p.map((item, idx) => idx === i ? { ...item, caption } : item));
  };

  const handleUpload = async () => {
    if (!pending.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      pending.forEach(p => formData.append("attachments", p.file));
      const res = await fetch(`/api/tickets/${jobId}/attachments`, {
        method: "POST", credentials: "include", body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      toast.success(`${pending.length} photo(s) uploaded`);
      setPending([]);
      // Refresh ticket
      const tRes = await fetch(`/api/tickets/${jobId}`, { credentials: "include" });
      const tData = await tRes.json();
      const t = tData.data ?? tData;
      const updatedPhotos = (t.attachments ?? [])
        .filter((a: any) => a.type?.startsWith("image/"))
        .map((a: any) => ({ url: a.url, caption: a.filename, uploadedAt: a.uploadedAt }));
      setPhotos(updatedPhotos);
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); }
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/technician/jobs"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Job Photos</h1>
          <p className="text-xs text-slate-400 mt-0.5">{ticket?.ticketNumber ?? jobId} — {ticket?.title ?? "Loading..."}</p>
        </div>
      </div>

      {/* Upload zone */}
      <input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
        onChange={e => e.target.files && handleFiles(e.target.files)} />
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        className={`border-2 border-dashed rounded-xl py-10 text-center cursor-pointer transition-all
          ${dragging ? "border-amber-400 bg-amber-50" : "border-slate-200 hover:border-amber-300 hover:bg-slate-50"}`}>
        <Camera className={`w-8 h-8 mx-auto mb-2 ${dragging ? "text-amber-500" : "text-slate-300"}`} />
        <p className="text-sm text-slate-600 font-medium">
          Drop photos here or <span className="text-amber-600">browse</span>
        </p>
        <p className="text-xs text-slate-400 mt-1">JPG, PNG — max 10MB each</p>
      </div>

      {/* Pending previews */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {pending.map((item, i) => (
              <div key={i} className="relative group">
                <img src={item.preview} alt="" className="w-full h-32 object-cover rounded-xl border border-slate-200" />
                <button onClick={() => removePending(i)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
                <input
                  value={item.caption}
                  onChange={e => updateCaption(i, e.target.value)}
                  placeholder="Caption (optional)"
                  className="w-full mt-1.5 h-8 border border-slate-200 rounded-lg px-2 text-xs focus:outline-none focus:border-amber-400 bg-slate-50"
                />
              </div>
            ))}
          </div>
          <button onClick={handleUpload} disabled={uploading}
            className="w-full h-10 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 cursor-pointer">
            {uploading
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Uploading...</>
              : <><Upload className="w-4 h-4" />Upload {pending.length} photo{pending.length > 1 ? "s" : ""}</>
            }
          </button>
        </div>
      )}

      {/* Uploaded photos */}
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-3">
          Uploaded photos ({photos.length})
        </p>
        {photos.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200/80 py-12 text-center">
            <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No photos uploaded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((photo, i) => (
              <div key={i} className="group relative">
                <img src={photo.url} alt={photo.caption}
                  className="w-full h-36 object-cover rounded-xl border border-slate-200" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition rounded-xl" />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent rounded-b-xl">
                  {photo.caption && <p className="text-white text-[10px] truncate">{photo.caption}</p>}
                  <p className="text-white/60 text-[9px]">{fmtDate(photo.uploadedAt)}</p>
                </div>
                <div className="absolute top-2 right-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}