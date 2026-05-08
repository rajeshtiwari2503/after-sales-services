const { Server } =
  require("socket.io");

const http =
  require("http");

const server =
  http.createServer();

const io = new Server(
  server,
  {
    cors: {
      origin: "*",
    },
  }
);

io.on(
  "connection",
  (socket) => {
    console.log(
      "Client connected"
    );

    socket.on(
      "disconnect",
      () => {
        console.log(
          "Disconnected"
        );
      }
    );
  }
);

server.listen(
  3001,
  () => {
    console.log(
      "Socket Server Running"
    );
  }
);

// "scripts": {
//   "socket": "node src/server/socket-server.js"
// }