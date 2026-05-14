"use client";

import { useState } from "react";
import { StickyNote, Send, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { Note } from "@/types/ticket";

const initials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const fmtDateTime = (d: Date | string) =>
  new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

interface Props {
  ticketId: string;
  notes: Note[];
  onUpdate: () => void;
}

export default function TicketNotes({ ticketId, notes, onUpdate }: Props) {
  const [content, setContent] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/notes`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, isInternal }),
      });
      if (!res.ok) throw new Error();
      setContent("");
      setIsInternal(false);
      toast.success("Note added");
      onUpdate();
    } catch {
      toast.error("Failed to add note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
            <StickyNote className="w-4 h-4 text-violet-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Notes</p>
            <p className="text-xs text-slate-400">{notes.length} notes</p>
          </div>
        </div>
      </div>

      {/* Existing notes */}
      {notes.length > 0 && (
        <div className="divide-y divide-slate-100">
          {notes.map((note, i) => (
            <div key={note._id ?? i} className="px-5 py-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                  {initials(note.authorName)}
                </div>
                <span className="text-xs font-semibold text-slate-700">{note.authorName}</span>
                {note.isInternal && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-violet-50 text-violet-700 px-1.5 py-0.5 rounded-full border border-violet-100 font-medium">
                    <Lock className="w-2.5 h-2.5" /> Internal
                  </span>
                )}
                <span className="text-xs text-slate-400 ml-auto">{fmtDateTime(note.createdAt)}</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{note.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add note */}
      <div className="p-5 border-t border-slate-100">
        <div className="border border-slate-200 rounded-lg overflow-hidden focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-400/10 transition">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a note, update or internal comment..."
            rows={3}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
            }}
            className="w-full px-4 py-3 text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed"
          />
          <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="cursor-pointer"
              />
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Internal only
              </span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden sm:block">⌘+Enter to submit</span>
              <button
                onClick={handleSubmit}
                disabled={loading || !content.trim()}
                className="flex items-center gap-1.5 h-8 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white rounded-lg text-xs font-medium transition cursor-pointer"
              >
                {loading
                  ? <span className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
                  : <Send className="w-3.5 h-3.5" />
                }
                Add note
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}