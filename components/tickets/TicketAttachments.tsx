"use client";

import { Paperclip } from "lucide-react";

export default function TicketAttachments({
  attachments = [],
}: any) {
  return (
    <div className="bg-white rounded-[30px] border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Paperclip size={22} />

        <h2 className="text-2xl font-black">
          Attachments
        </h2>
      </div>

      {attachments.length === 0 ? (
        <div className="h-40 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center">
          <p className="text-slate-500">
            No attachments uploaded
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {attachments.map(
            (
              file: any,
              index: number
            ) => (
              <a
                key={index}
                href={file.url}
                target="_blank"
                className="border border-slate-200 rounded-2xl p-4 hover:border-blue-500 transition"
              >
                <div className="h-36 rounded-xl bg-slate-100 overflow-hidden">
                  <img
                    src={file.url}
                    alt="attachment"
                    className="w-full h-full object-cover"
                  />
                </div>

                <p className="mt-3 font-semibold truncate">
                  {file.name}
                </p>
              </a>
            )
          )}
        </div>
      )}
    </div>
  );
}