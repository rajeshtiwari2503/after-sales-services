import NotificationBell from "@/components/notifications/NotificationBell";

export default function Page() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">
            Notifications
          </h1>

          <p className="text-slate-500 mt-1">
            Realtime system alerts
          </p>
        </div>

        <NotificationBell />
      </div>
    </div>
  );
}