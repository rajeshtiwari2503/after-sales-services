import { createServer } from "http";

import { Server } from "socket.io";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Socket Connected");

  socket.on("message", (data) => {
    io.emit("message", data);
  });
});

httpServer.listen(4004, () => {
  console.log("WebSocket Running");
});