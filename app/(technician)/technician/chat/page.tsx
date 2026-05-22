 "use client";

// app/(technician)/technician/chat/page.tsx  — REPLACE existing
// Features: job list sidebar, real-time polling, reactions, edit/delete, typing, read receipts

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft, Send, Phone, MessageSquare, Check, CheckCheck,
  MoreHorizontal, Edit2, Trash2, Smile, X, Search,
  Clock, RefreshCw, ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  messageType: string;
  readBy: string[];
  reactions: { emoji: string; userId: string }[];
  isEdited: boolean;
  createdAt: string;
  pending?: boolean;
}

interface Job {
  _id: string;
  ticketNumber: string;
  title: string;
  status: string;
  customerId: { _id: string; name: string; email: string; phone?: string } | null;
  unread?: number;
}

/* ─── Constants ──────────────────────────────────────────────────────────── */
const EMOJIS = ["👍","❤️","😂","😮","😢","🙏"];
const POLL_INTERVAL = 5000; // 5s

const STATUS_COLOR: Record<string, string> = {
  open:        "bg-blue-400",
  in_progress: "bg-amber-400",
  resolved:    "bg-green-400",
  closed:      "bg-slate-400",
};

const fmtTime = (d: string) =>
  new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });

const fmtDay = (d: string) => {
  const date = new Date(d);
  const now  = new Date();
  if (date.toDateString() === now.toDateString()) return "Today";
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

/* ─── Reaction summary helper ────────────────────────────────────────────── */
function groupReactions(reactions: { emoji: string; userId: string }[]) {
  const map: Record<string, number> = {};
  reactions.forEach(r => { map[r.emoji] = (map[r.emoji] ?? 0) + 1; });
  return Object.entries(map);
}

/* ─── Message bubble ─────────────────────────────────────────────────────── */
function MsgBubble({
  msg, isMe, myId, onReact, onEdit, onDelete,
}: {
  msg: Message; isMe: boolean; myId: string;
  onReact: (msgId: string, emoji: string) => void;
  onEdit:  (msg: Message) => void;
  onDelete:(msgId: string) => void;
}) {
  const [showMenu,    setShowMenu]    = useState(false);
  const [showReact,   setShowReact]   = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false); setShowReact(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const reactionGroups = groupReactions(msg.reactions ?? []);
  const myReactions    = (msg.reactions ?? []).filter(r => r.userId === myId).map(r => r.emoji);

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} group`}>
      <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%]`}>

        {/* Sender name (not-me only) */}
        {!isMe && (
          <p className="text-[10px] text-slate-500 mb-1 ml-1 font-medium capitalize">
            {msg.senderName}
            <span className="ml-1 text-[9px] text-slate-400">({msg.senderRole?.replace("_"," ")})</span>
          </p>
        )}

        <div className="relative" ref={menuRef}>
          {/* Bubble */}
          <div
            className={`relative px-3.5 py-2.5 rounded-2xl ${
              msg.pending ? "opacity-70" : ""
            } ${
              isMe
                ? "bg-amber-500 text-white rounded-br-sm"
                : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm"
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
            <div className={`flex items-center gap-1.5 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
              {msg.isEdited && (
                <span className={`text-[9px] italic ${isMe ? "text-amber-200" : "text-slate-400"}`}>edited</span>
              )}
              <span className={`text-[10px] ${isMe ? "text-amber-200" : "text-slate-400"}`}>{fmtTime(msg.createdAt)}</span>
              {isMe && !msg.pending && (
                msg.readBy.length > 1
                  ? <CheckCheck className="w-3 h-3 text-amber-200" />
                  : <Check className="w-3 h-3 text-amber-300" />
              )}
              {msg.pending && <RefreshCw className="w-3 h-3 text-amber-200 animate-spin" />}
            </div>
          </div>

          {/* Hover menu */}
          {!msg.pending && (
            <div className={`absolute top-0 ${isMe ? "left-0 -translate-x-full pr-1.5" : "right-0 translate-x-full pl-1.5"} hidden group-hover:flex items-center gap-1`}>
              <button
                onClick={() => { setShowReact(p => !p); setShowMenu(false); }}
                className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-500 hover:bg-slate-50 shadow-sm cursor-pointer"
              >
                <Smile className="w-3.5 h-3.5" />
              </button>
              {isMe && (
                <button
                  onClick={() => { setShowMenu(p => !p); setShowReact(false); }}
                  className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-500 hover:bg-slate-50 shadow-sm cursor-pointer"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Emoji picker */}
              {showReact && (
                <div className={`absolute top-8 ${isMe ? "right-0" : "left-0"} bg-white border border-slate-200 rounded-2xl shadow-xl p-2 flex gap-1 z-20`}>
                  {EMOJIS.map(e => (
                    <button
                      key={e}
                      onClick={() => { onReact(msg._id, e); setShowReact(false); }}
                      className={`w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 cursor-pointer text-lg transition ${myReactions.includes(e) ? "bg-amber-50 ring-1 ring-amber-300" : ""}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}

              {/* Action menu */}
              {showMenu && isMe && (
                <div className="absolute top-8 right-0 bg-white border border-slate-200 rounded-xl shadow-xl py-1 w-32 z-20">
                  <button
                    onClick={() => { onEdit(msg); setShowMenu(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => { onDelete(msg._id); setShowMenu(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reactions display */}
        {reactionGroups.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {reactionGroups.map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => onReact(msg._id, emoji)}
                className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border text-xs cursor-pointer transition ${
                  myReactions.includes(emoji)
                    ? "bg-amber-50 border-amber-200 text-amber-800"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>{emoji}</span>
                <span className="font-semibold">{count}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function TechnicianChatPage() {
  const [jobs,          setJobs]          = useState<Job[]>([]);
  const [selectedJob,   setSelectedJob]   = useState<Job | null>(null);
  const [messages,      setMessages]      = useState<Message[]>([]);
  const [input,         setInput]         = useState("");
  const [sending,       setSending]       = useState(false);
  const [loadingJobs,   setLoadingJobs]   = useState(true);
  const [loadingMsgs,   setLoadingMsgs]   = useState(false);
  const [editTarget,    setEditTarget]    = useState<Message | null>(null);
  const [editContent,   setEditContent]   = useState("");
  const [jobSearch,     setJobSearch]     = useState("");
  const [myId,          setMyId]          = useState("");
  const [isAtBottom,    setIsAtBottom]    = useState(true);
  const [newMsgCount,   setNewMsgCount]   = useState(0);

  const bottomRef    = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);
  const messagesRef  = useRef<HTMLDivElement>(null);
  const pollRef      = useRef<NodeJS.Timeout | null>(null);
  const lastCountRef = useRef(0);

  /* ── Get current user id ── */
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(r => r.json())
      .then(d => setMyId(d?.data?._id ?? d?.data?.id ?? d?.user?._id ?? ""))
      .catch(() => {});
  }, []);

  /* ── Fetch assigned jobs ── */
  useEffect(() => {
    setLoadingJobs(true);
    fetch("/api/tickets?limit=50", { credentials: "include" })
      .then(r => r.json())
      .then(d => setJobs(d.data?.tickets ?? []))
      .catch(() => toast.error("Failed to load jobs"))
      .finally(() => setLoadingJobs(false));
  }, []);

  /* ── Scroll handler ── */
  const handleScroll = useCallback(() => {
    const el = messagesRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    setIsAtBottom(atBottom);
    if (atBottom) setNewMsgCount(0);
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "instant" });
    setNewMsgCount(0);
  }, []);

  /* ── Fetch messages ── */
  const fetchMessages = useCallback(async (jobId: string, silent = false) => {
    if (!silent) setLoadingMsgs(true);
    try {
      const res  = await fetch(`/api/chat/${jobId}`, { credentials: "include" });
      const data = await res.json();
      const msgs: Message[] = (data.data?.messages ?? []).map((m: any) => ({
        ...m, content: m.content ?? m.message ?? "",
      }));
      setMessages(prev => {
        const newCount = msgs.length - lastCountRef.current;
        if (silent && newCount > 0) {
          const lastMsg = msgs[msgs.length - 1];
          if (lastMsg.senderId !== myId) {
            if (!isAtBottom) setNewMsgCount(c => c + newCount);
            else scrollToBottom();
          }
        }
        lastCountRef.current = msgs.length;
        return msgs;
      });
    } catch {} finally {
      if (!silent) setLoadingMsgs(false);
    }
  }, [myId, isAtBottom, scrollToBottom]);

  /* ── Poll every 5s ── */
  useEffect(() => {
    if (!selectedJob) return;
    fetchMessages(selectedJob._id);
    lastCountRef.current = 0;
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      fetchMessages(selectedJob._id, true);
    }, POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [selectedJob, fetchMessages]);

  /* ── Auto scroll on new messages ── */
  useEffect(() => {
    if (isAtBottom) scrollToBottom();
  }, [messages, isAtBottom, scrollToBottom]);

  /* ── Focus input when job selected ── */
  useEffect(() => {
    if (selectedJob) setTimeout(() => inputRef.current?.focus(), 100);
  }, [selectedJob]);

  /* ── Send ── */
  const sendMessage = async () => {
    if (!input.trim() || !selectedJob) return;
    const content = input.trim();
    setInput("");

    const optimistic: Message = {
      _id:         `opt-${Date.now()}`,
      senderId:    myId,
      senderName:  "You",
      senderRole:  "technician",
      content,
      messageType: "text",
      readBy:      [myId],
      reactions:   [],
      isEdited:    false,
      createdAt:   new Date().toISOString(),
      pending:     true,
    };
    setMessages(p => [...p, optimistic]);
    scrollToBottom();
    setSending(true);

    try {
      const res = await fetch(`/api/chat/${selectedJob._id}`, {
        method:  "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ message: content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed");
      // Replace optimistic
      setMessages(p => p.map(m => m._id === optimistic._id ? { ...data.data, content: data.data.content ?? data.data.message } : m));
    } catch {
      toast.error("Failed to send message");
      setMessages(p => p.filter(m => m._id !== optimistic._id));
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  /* ── React ── */
  const handleReact = async (msgId: string, emoji: string) => {
    if (!selectedJob) return;
    try {
      const res = await fetch(`/api/chat/${selectedJob._id}`, {
        method:  "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action: "react", messageId: msgId, emoji }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(p => p.map(m =>
          m._id === msgId ? { ...m, reactions: data.data?.reactions ?? m.reactions } : m
        ));
      }
    } catch {}
  };

  /* ── Edit ── */
  const handleEdit = async () => {
    if (!editTarget || !editContent.trim() || !selectedJob) return;
    try {
      const res = await fetch(`/api/chat/${selectedJob._id}`, {
        method:  "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action: "edit", messageId: editTarget._id, newMessage: editContent }),
      });
      if (res.ok) {
        setMessages(p => p.map(m =>
          m._id === editTarget._id ? { ...m, content: editContent, isEdited: true } : m
        ));
        setEditTarget(null);
        setEditContent("");
        toast.success("Message edited");
      }
    } catch { toast.error("Failed to edit"); }
  };

  /* ── Delete ── */
  const handleDelete = async (msgId: string) => {
    if (!selectedJob) return;
    if (!confirm("Delete this message?")) return;
    try {
      const res = await fetch(`/api/chat/${selectedJob._id}?messageId=${msgId}`, {
        method: "DELETE", credentials: "include",
      });
      if (res.ok) {
        setMessages(p => p.map(m =>
          m._id === msgId ? { ...m, content: "This message was deleted", isEdited: false } : m
        ));
      }
    } catch { toast.error("Failed to delete"); }
  };

  /* ── Date separators ── */
  const withSeparators = () => {
    const result: (Message | { type: "separator"; label: string; key: string })[] = [];
    let lastDay = "";
    messages.forEach(msg => {
      const day = fmtDay(msg.createdAt);
      if (day !== lastDay) {
        result.push({ type: "separator", label: day, key: `sep-${day}` });
        lastDay = day;
      }
      result.push(msg);
    });
    return result;
  };

  /* ── Filtered jobs ── */
  const filteredJobs = jobs.filter(j =>
    !jobSearch ||
    j.title?.toLowerCase().includes(jobSearch.toLowerCase()) ||
    j.ticketNumber?.toLowerCase().includes(jobSearch.toLowerCase()) ||
    j.customerId?.name?.toLowerCase().includes(jobSearch.toLowerCase())
  );

  /* ─────────────────────────────────────────────────────────────────────── */
  return (
    <div className="flex h-[calc(100vh-80px)] gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* ══ LEFT: Job list ══ */}
      <div className="w-72 border-r border-slate-100 flex flex-col shrink-0">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-sm font-bold text-slate-800 mb-2">My Jobs</p>
          <div className="flex items-center gap-2 h-8 bg-slate-50 border border-slate-200 rounded-lg px-2.5">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input type="text" placeholder="Search jobs..." value={jobSearch}
              onChange={e => setJobSearch(e.target.value)}
              className="flex-1 text-xs bg-transparent outline-none text-slate-700 placeholder:text-slate-400" />
          </div>
        </div>

        {/* Job list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {loadingJobs ? (
            Array(5).fill(0).map((_,i) => (
              <div key={i} className="px-4 py-3 animate-pulse space-y-1.5">
                <div className="h-3 bg-slate-200 rounded w-3/4" />
                <div className="h-2.5 bg-slate-100 rounded w-1/2" />
              </div>
            ))
          ) : filteredJobs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">No jobs found</div>
          ) : filteredJobs.map(job => (
            <button key={job._id} onClick={() => setSelectedJob(job)}
              className={`w-full px-4 py-3 text-left transition ${
                selectedJob?._id === job._id
                  ? "bg-amber-50 border-r-2 border-amber-500"
                  : "hover:bg-slate-50"
              }`}>
              <div className="flex items-start gap-2">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${STATUS_COLOR[job.status] ?? "bg-slate-300"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{job.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{job.ticketNumber}</p>
                  {job.customerId && (
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                      👤 {job.customerId.name}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ══ RIGHT: Chat window ══ */}
      {selectedJob ? (
        <div className="flex-1 flex flex-col min-w-0">

          {/* Chat header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 shrink-0 bg-white">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{selectedJob.customerId?.name ?? "Customer"}</p>
              <p className="text-xs text-slate-400 truncate">
                {selectedJob.ticketNumber} — {selectedJob.title}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selectedJob.customerId?.phone && (
                <a href={`tel:${selectedJob.customerId.phone}`}
                  className="w-8 h-8 flex items-center justify-center bg-green-50 border border-green-100 rounded-xl text-green-600 hover:bg-green-100 transition cursor-pointer"
                  title="Call customer">
                  <Phone className="w-4 h-4" />
                </a>
              )}
              <span className={`text-[10px] font-semibold px-2 py-1 rounded-full capitalize ${
                STATUS_COLOR[selectedJob.status]?.replace("bg-", "bg-").replace("-400", "-100")
              } text-slate-700`}
              style={{ background: "#f1f5f9" }}>
                {selectedJob.status?.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          {/* Messages area */}
          <div
            ref={messagesRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-slate-50/40"
          >
            {loadingMsgs ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin" />
                <p className="text-sm">Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
                <MessageSquare className="w-12 h-12 opacity-20" />
                <p className="text-sm font-medium">Start the conversation</p>
                <p className="text-xs">Send a message to the customer</p>
              </div>
            ) : (
              withSeparators().map(item => {
                if ("type" in item && item.type === "separator") {
                  return (
                    <div key={item.key} className="flex items-center gap-3 my-2">
                      <div className="flex-1 h-px bg-slate-200" />
                      <span className="text-[10px] text-slate-400 font-medium px-2">{item.label}</span>
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>
                  );
                }
                const msg = item as Message;
                return (
                  <MsgBubble
                    key={msg._id}
                    msg={msg}
                    isMe={msg.senderId === myId}
                    myId={myId}
                    onReact={handleReact}
                    onEdit={m => { setEditTarget(m); setEditContent(m.content); }}
                    onDelete={handleDelete}
                  />
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Scroll-to-bottom button */}
          {!isAtBottom && (
            <button
              onClick={() => scrollToBottom()}
              className="absolute bottom-24 right-8 flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-full shadow-lg cursor-pointer z-10"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              {newMsgCount > 0 ? `${newMsgCount} new` : "Scroll down"}
            </button>
          )}

          {/* Edit banner */}
          {editTarget && (
            <div className="flex items-center gap-3 px-5 py-2 bg-amber-50 border-t border-amber-100 shrink-0">
              <Edit2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-700 flex-1 truncate">Editing: {editTarget.content}</p>
              <button onClick={() => { setEditTarget(null); setEditContent(""); }}
                className="text-amber-500 hover:text-amber-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 px-4 py-3 border-t border-slate-100 bg-white shrink-0">
            {editTarget ? (
              <>
                <input ref={inputRef} type="text" value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleEdit()}
                  className="flex-1 h-10 border border-amber-300 rounded-xl px-3.5 text-sm focus:outline-none focus:border-amber-500 bg-amber-50 text-slate-800"
                  placeholder="Edit message..."
                  autoFocus
                />
                <button onClick={handleEdit}
                  className="h-10 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium cursor-pointer transition">
                  Save
                </button>
              </>
            ) : (
              <>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a message..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  className="flex-1 h-10 border border-slate-200 rounded-xl px-3.5 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10 bg-slate-50 text-slate-800 transition"
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || !input.trim()}
                  className="w-10 h-10 flex items-center justify-center bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-xl cursor-pointer transition"
                >
                  {sending
                    ? <RefreshCw className="w-4 h-4 animate-spin" />
                    : <Send className="w-4 h-4" />}
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        /* No job selected */
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-400 bg-slate-50/30">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
            <MessageSquare className="w-10 h-10 opacity-30" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-slate-600">Select a job</p>
            <p className="text-sm mt-1">Choose a job from the list to start chatting with the customer</p>
          </div>
        </div>
      )}
    </div>
  );
}