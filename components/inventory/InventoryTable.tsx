export default function InventoryTable({
  parts,
}: any) {
  return (
    <div className="bg-white rounded-[30px] border border-sky-100 overflow-hidden">
      <table className="w-full">
        <thead className="bg-sky-50">
          <tr>
            <th className="p-4 text-left">
              Part
            </th>

            <th className="p-4 text-left">
              SKU
            </th>

            <th className="p-4 text-left">
              Stock
            </th>

            <th className="p-4 text-left">
              Price
            </th>
          </tr>
        </thead>

        <tbody>
          {parts.map((part: any) => (
            <tr
              key={part._id}
              className="border-t border-sky-100"
            >
              <td className="p-4">
                {part.partName}
              </td>

              <td className="p-4">
                {part.sku}
              </td>

              <td className="p-4">
                {part.stock}
              </td>

              <td className="p-4">
                ₹{part.price}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}