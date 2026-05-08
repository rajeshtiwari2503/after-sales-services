interface Props {
  status: string;
}

export default function TicketStatusBadge({
  status,
}: Props) {
  const styles: Record<
    string,
    string
  > = {
    OPEN: "bg-blue-100 text-blue-700",

    ASSIGNED:
      "bg-purple-100 text-purple-700",

    IN_PROGRESS:
      "bg-yellow-100 text-yellow-700",

    RESOLVED:
      "bg-green-100 text-green-700",

    CLOSED:
      "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`px-4 py-2 rounded-full text-sm font-semibold ${
        styles[status] ||
        "bg-slate-100 text-slate-700"
      }`}
    >
      {status.replace(
        "_",
        " "
      )}
    </span>
  );
}