interface Props {
  timeline: any[];
}

export default function TicketTimeline({
  timeline,
}: Props) {
  return (
    <div className="bg-white border border-sky-100 rounded-[30px] p-8">
      <h2 className="text-2xl font-black mb-8">
        Activity Timeline
      </h2>

      <div className="space-y-8">
        {timeline.length ? (
          timeline.map(
            (
              item,
              index
            ) => (
              <div
                key={index}
                className="flex gap-5"
              >
                <div className="relative">
                  <div className="w-4 h-4 rounded-full bg-blue-600" />

                  {index !==
                    timeline.length -
                      1 && (
                    <div className="absolute top-4 left-1.5 w-[2px] h-full bg-sky-200" />
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    {
                      item.action
                    }
                  </h3>

                  <p className="text-slate-500 mt-1">
                    By{" "}
                    {
                      item.performedBy
                    }
                  </p>

                  <p className="text-sm text-slate-400 mt-1">
                    {new Date(
                      item.createdAt
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            )
          )
        ) : (
          <p className="text-slate-500">
            No activity yet
          </p>
        )}
      </div>
    </div>
  );
}