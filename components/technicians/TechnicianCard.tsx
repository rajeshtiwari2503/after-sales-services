export default function TechnicianCard({
  technician,
}: any) {
  return (
    <div className="bg-white rounded-[30px] border border-sky-100 p-6">
      <h2 className="text-2xl font-black">
        {technician.name}
      </h2>

      <p className="mt-3 text-slate-500">
        {technician.email}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {technician.skills?.map(
          (skill: string) => (
            <span
              key={skill}
              className="px-4 py-2 rounded-full bg-blue-100 text-sm font-semibold"
            >
              {skill}
            </span>
          )
        )}
      </div>
    </div>
  );
}