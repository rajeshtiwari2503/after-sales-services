"use client";

import axios from "axios";
import { useEffect, useState } from "react";

export default function ServiceCentersPage() {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    const response = await axios.get(
      "/api/service-centers"
    );

    setData(response.data.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          Service Centers
        </h1>

        <p className="text-slate-500 mt-2">
          Manage service operations
        </p>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">
                Company
              </th>

              <th className="p-4 text-left">
                City
              </th>

              <th className="p-4 text-left">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((item: any) => (
              <tr
                key={item._id}
                className="border-t"
              >
                <td className="p-4">
                  {item.companyName}
                </td>

                <td className="p-4">
                  {item.city}
                </td>

                <td className="p-4">
                  {item.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}