"use client";

import AgoraRTC from "agora-rtc-sdk-ng";

const client =
  AgoraRTC.createClient({
    mode: "rtc",
    codec: "vp8",
  });

export default function VideoCall() {
  return (
    <div className="bg-white rounded-2xl border p-6">
      <h2 className="text-2xl font-bold">
        Video Call Module
      </h2>
    </div>
  );
}