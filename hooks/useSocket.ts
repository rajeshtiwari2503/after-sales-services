 // hooks/useSocket.ts

"use client";

import { useEffect } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export default function useSocket(
  event: string,
  callback: (data: any) => void
) {
  useEffect(() => {
    if (!socket) {
      socket = io(
        process.env.NEXT_PUBLIC_SOCKET_URL ||
          "http://localhost:3000"
      );
    }

    socket.on(event, callback);

    return () => {
      socket?.off(event, callback);
    };
  }, [event, callback]);

  return socket;
}