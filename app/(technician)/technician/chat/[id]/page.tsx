
'use client'

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Send,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
} from 'lucide-react';

interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  message: string;
  createdAt: string;
  isOwn: boolean;
}

export default function TechnicianChatPage() {
  const params = useParams();
  const chatId = params?.id as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Fetch Messages
  const fetchMessages = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/chat/${chatId}`, {
        credentials: 'include',
      });

      const result = await res.json();

      if (result?.success) {
        setMessages(result.data || []);
      }
    } catch (error) {
      console.error('Chat fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chatId) {
      fetchMessages();
    }
  }, [chatId]);

  // Auto Scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  // Send Message
  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      setSending(true);

      const res = await fetch(`/api/chat/${chatId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message,
        }),
      });

      const result = await res.json();

      if (result?.success) {
        setMessages((prev) => [
          ...prev,
          result.data,
        ]);

        setMessage('');
      }
    } catch (error) {
      console.error('Send message error:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* Sidebar */}
      <div className="hidden w-[340px] border-r border-slate-200 bg-slate-50 lg:flex lg:flex-col">
        <div className="border-b border-slate-200 p-5">
          <h2 className="font-heading text-2xl font-bold text-slate-900">
            Messages
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Technician Support Chat
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="cursor-pointer rounded-2xl border border-blue-100 bg-white p-4 shadow-sm transition hover:border-blue-300">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                A
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">
                  Admin Support
                </h3>

                <p className="truncate text-sm text-slate-500">
                  Active conversation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Section */}
      <div className="flex flex-1 flex-col bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-lg font-bold text-white">
                A
              </div>

              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500"></span>
            </div>

            <div>
              <h2 className="font-heading text-lg font-semibold text-slate-900">
                Admin Support
              </h2>

              <p className="text-sm text-emerald-600">
                Online
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100">
              <Phone size={18} />
            </button>

            <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100">
              <Video size={18} />
            </button>

            <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-slate-50 px-5 py-6">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-3xl">
                💬
              </div>

              <h3 className="font-heading text-xl font-bold text-slate-900">
                No Messages Yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Start conversation with support team.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${
                    msg.isOwn
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-3xl px-5 py-3 shadow-sm ${
                      msg.isOwn
                        ? 'rounded-br-md bg-blue-600 text-white'
                        : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">
                      {msg.message}
                    </p>

                    <div
                      className={`mt-2 text-[11px] ${
                        msg.isOwn
                          ? 'text-blue-100'
                          : 'text-slate-400'
                      }`}
                    >
                      {new Date(
                        msg.createdAt
                      ).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))}

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
            <button className="text-slate-500 transition hover:text-blue-600">
              <Paperclip size={20} />
            </button>

            <input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSend();
                }
              }}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
            />

            <button className="text-slate-500 transition hover:text-yellow-500">
              <Smile size={20} />
            </button>

            <button
              onClick={handleSend}
              disabled={sending}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 