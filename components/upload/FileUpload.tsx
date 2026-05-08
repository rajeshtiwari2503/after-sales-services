"use client";

import { useState } from "react";

export default function FileUpload() {
  const [loading, setLoading] =
    useState(false);

  const uploadFile =
    async (
      e: any
    ) => {
      const file =
        e.target.files[0];

      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      setLoading(true);

      const res =
        await fetch(
          "/api/upload",
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await res.json();

      console.log(data);

      setLoading(false);
    };

  return (
    <div className="bg-white rounded-[30px] border border-slate-200 p-6">
      <input
        type="file"
        onChange={uploadFile}
      />

      {loading && (
        <p className="mt-4">
          Uploading...
        </p>
      )}
    </div>
  );
}