import { createServer } from "http";

import { Server } from "socket.io";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("STATUS_UPDATED", (data) => {
    io.emit("STATUS_UPDATED", data);
  });

  socket.on("NEW_NOTIFICATION", (data) => {
    io.emit("NEW_NOTIFICATION", data);
  });
});

httpServer.listen(4000, () => {
  console.log("Socket running on 4000");
});