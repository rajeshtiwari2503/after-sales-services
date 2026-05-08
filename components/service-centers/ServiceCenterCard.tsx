export default function ServiceCenterCard({
  item,
}: any) {
  return (
    <div className="bg-white rounded-[30px] border border-sky-100 p-6">
      <h2 className="text-2xl font-black">
        {item.name}
      </h2>

      <p className="mt-3 text-slate-600">
        {item.city},{" "}
        {item.state}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {item.supportedBrands?.map(
          (brand: string) => (
            <span
              key={brand}
              className="px-4 py-2 rounded-full bg-sky-100 text-sm font-semibold"
            >
              {brand}
            </span>
          )
        )}
      </div>
    </div>
  );
}