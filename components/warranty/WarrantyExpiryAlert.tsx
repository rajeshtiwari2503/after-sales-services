"use client";

export default function WarrantyExpiryAlert() {
  const items = [
    {
      product:
        "Battery Pack",

      expiry:
        "2026-06-20",
    },
  ];

  return (
    <div className="bg-white rounded-[30px] border border-orange-200 p-6">
      <h2 className="text-2xl font-black text-orange-600 mb-6">
        Warranty Expiring Soon
      </h2>

      <div className="space-y-4">
        {items.map(
          (item) => (
            <div
              key={item.product}
              className="bg-orange-50 rounded-2xl p-5 flex items-center justify-between"
            >
              <div>
                <h3 className="font-bold">
                  {
                    item.product
                  }
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Expiry:
                  {
                    item.expiry
                  }
                </p>
              </div>

              <div className="text-orange-600 font-black">
                ALERT
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}