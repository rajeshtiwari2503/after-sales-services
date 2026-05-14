"use client";

import { useState, useRef } from "react";
import { Paperclip, CloudUpload, X, FileText, Image, Film, Download } from "lucide-react";
import toast from "react-hot-toast";
import { Attachment } from "@/types/ticket";

interface Props {
  ticketId: string;
  attachments: Attachment[];
  onUpdate: () => void;
}

const fileIcon = (type: string) => {
  if (type.startsWith("image/")) return <Image className="w-4 h-4 text-blue-500" />;
  if (type.startsWith("video/")) return <Film className="w-4 h-4 text-purple-500" />;
  return <FileText className="w-4 h-4 text-slate-400" />;
};

const fmtSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};

const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export default function TicketAttachments({ ticketId, attachments, onUpdate }: Props) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList) => {
    const valid = Array.from(fileList).filter((f) => f.size <= 10 * 1024 * 1024);
    const invalid = Array.from(fileList).filter((f) => f.size > 10 * 1024 * 1024);
    if (invalid.length) toast.error(`${invalid.length} file(s) exceed 10MB limit`);
    setPendingFiles((p) => [...p, ...valid]);
  };

  const removePending = (i: number) => setPendingFiles((p) => p.filter((_, idx) => idx !== i));

  const handleUpload = async () => {
    if (!pendingFiles.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      pendingFiles.forEach((f) => formData.append("attachments", f));

      const res = await fetch(`/api/tickets/${ticketId}/attachments`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      toast.success(`${pendingFiles.length} file(s) uploaded`);
      setPendingFiles([]);
      onUpdate();
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <Paperclip className="w-4 h-4 text-slate-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Attachments</p>
            <p className="text-xs text-slate-400">{attachments.length} files</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Existing attachments */}
        {attachments.length > 0 && (
          <div className="space-y-2">
            {attachments.map((att, i) => (
              <div key={att._id ?? i} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200 group">
                {fileIcon(att.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 truncate">{att.filename}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{fmtSize(att.size)} · {fmtDate(att.uploadedAt)}</p>
                </div>
                
                 <a href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Upload zone */}
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*,.pdf,.mp4,.mov,.doc,.docx"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
          className={`border-2 border-dashed rounded-lg py-6 px-4 text-center cursor-pointer transition-all
            ${dragging ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"}`}
        >
          <CloudUpload className={`w-6 h-6 mx-auto mb-1.5 ${dragging ? "text-indigo-500" : "text-slate-300"}`} />
          <p className="text-xs text-slate-500">
            Drop files or <span className="text-indigo-600 font-medium">browse</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, PDF, MP4 · max 10MB</p>
        </div>

        {/* Pending files */}
        {pendingFiles.length > 0 && (
          <div className="space-y-2">
            {pendingFiles.map((f, i) => (
              <div key={i} className="flex items-center gap-2.5 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-lg">
                {fileIcon(f.type)}
                <span className="text-xs text-slate-700 flex-1 truncate">{f.name}</span>
                <span className="text-[10px] text-slate-400 shrink-0">{fmtSize(f.size)}</span>
                <button
                  onClick={() => removePending(i)}
                  className="text-slate-400 hover:text-red-500 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full h-9 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {uploading
                ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <CloudUpload className="w-3.5 h-3.5" />
              }
              Upload {pendingFiles.length} file{pendingFiles.length > 1 ? "s" : ""}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}