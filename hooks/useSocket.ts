"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket;

export default function useSocket() {
  const [connected, setConnected] =
    useState(false);

  useEffect(() => {
    socket = io(
      process.env
        .NEXT_PUBLIC_SOCKET_URL ||
        "http://localhost:3000"
    );

    socket.on(
      "connect",
      () => {
        setConnected(true);
        console.log(
          "Socket connected"
        );
      }
    );

    socket.on(
      "disconnect",
      () => {
        setConnected(false);
        console.log(
          "Socket disconnected"
        );
      }
    );

    return () => {
      socket.disconnect();
    };
  }, []);

  return {
    socket,
    connected,
  };
}