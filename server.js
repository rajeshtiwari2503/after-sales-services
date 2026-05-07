const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";

const app = next({ dev });

const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(server);

  io.on("connection", (socket) => {
    console.log("Socket connected");

    socket.on("send-message", (data) => {
      io.emit("receive-message", data);
    });
  });

  server.listen(3000, () => {
    console.log(
      "Server running on port 3000"
    );
  });
});