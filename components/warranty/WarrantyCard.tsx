export default function WarrantyCard({
  warranty,
}: any) {
  return (
    <div className="bg-white rounded-[30px] border border-sky-100 p-6">
      <h2 className="text-2xl font-black">
        {warranty.productName}
      </h2>

      <p className="mt-3 text-slate-500">
        Serial:{" "}
        {warranty.serialNumber}
      </p>

      <div className="mt-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Expiry
          </p>

          <p className="font-bold mt-1">
            {new Date(
              warranty.expiryDate
            ).toLocaleDateString()}
          </p>
        </div>

        <span className="px-4 py-2 rounded-full bg-green-100 text-sm font-semibold">
          {warranty.status}
        </span>
      </div>
    </div>
  );
}