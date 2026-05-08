interface Props {
  priority: string;
}

export default function PriorityBadge({
  priority,
}: Props) {
  const styles: Record<
    string,
    string
  > = {
    LOW: "bg-slate-100 text-slate-700",

    MEDIUM:
      "bg-blue-100 text-blue-700",

    HIGH:
      "bg-orange-100 text-orange-700",

    URGENT:
      "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold ${styles[priority]}`}
    >
      {priority}
    </span>
  );
}