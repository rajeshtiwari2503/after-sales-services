interface Props {
  title: string;
  value: string;
}

export default function StatsCard({
  title,
  value,
}: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border">
      <p className="text-slate-500 mb-2">
        {title}
      </p>

      <h3 className="text-3xl font-bold">
        {value}
      </h3>
    </div>
  );
}