const workflow = [
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "PART_PENDING",
  "RESOLVED",
  "CLOSED",
];

export default function StatusWorkflow({
  currentStatus,
}: {
  currentStatus: string;
}) {
  const currentIndex =
    workflow.indexOf(
      currentStatus
    );

  return (
    <div className="bg-white border border-sky-100 rounded-[30px] p-6">
      <h2 className="text-xl font-black mb-8">
        Ticket Workflow
      </h2>

      <div className="flex items-center justify-between overflow-x-auto gap-4">
        {workflow.map(
          (
            status,
            index
          ) => (
            <div
              key={status}
              className="flex items-center gap-4 min-w-max"
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold ${
                    index <=
                    currentIndex
                      ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {index + 1}
                </div>

                <p className="text-xs font-bold mt-3 text-center">
                  {status.replace(
                    "_",
                    " "
                  )}
                </p>
              </div>

              {index !==
                workflow.length -
                  1 && (
                <div
                  className={`w-16 h-1 rounded-full ${
                    index <
                    currentIndex
                      ? "bg-blue-500"
                      : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}