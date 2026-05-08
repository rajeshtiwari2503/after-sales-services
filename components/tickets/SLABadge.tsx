interface Props {
  status: string;
}

export default function SLABadge({
  status,
}: Props) {
  const styles: Record<
    string,
    string
  > = {
    ON_TIME:
      "bg-green-100 text-green-700",

    WARNING:
      "bg-yellow-100 text-yellow-700",

    BREACHED:
      "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status]}`}
    >
      {status}
    </span>
  );
}