"use client";

export default function NotificationDrawer({
  open,
  onClose,
}: any) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />

      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black">
            Notifications
          </h2>

          <button
            onClick={onClose}
            className="text-xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map(
            (item) => (
              <div
                key={item}
                className="p-5 rounded-2xl border border-slate-200"
              >
                <h3 className="font-bold">
                  Ticket Updated
                </h3>

                <p className="text-slate-500 mt-2">
                  Ticket status changed
                  successfully.
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}