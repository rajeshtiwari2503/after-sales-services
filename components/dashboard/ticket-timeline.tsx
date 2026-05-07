interface Props {
  timeline: {
    status: string;
    time: string;
  }[];
}

export default function TicketTimeline({
  timeline,
}: Props) {
  return (
    <div className="bg-white rounded-2xl border p-6">
      <h2 className="text-2xl font-bold mb-6">
        Ticket Timeline
      </h2>

      <div className="space-y-6">
        {timeline.map((item, index) => (
          <div
            key={index}
            className="flex gap-4"
          >
            <div className="w-4 h-4 rounded-full bg-blue-600 mt-1" />

            <div>
              <h4 className="font-semibold">
                {item.status}
              </h4>

              <p className="text-slate-500 text-sm">
                {item.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}