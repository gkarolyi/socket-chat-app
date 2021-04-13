const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const path = require("path");
const io = require("socket.io")(server);

app.get("/", (request, response) => {
  response.sendFile(path.join(__dirname, "/index.html"));
});

io.on("connection", (socket) => {
  socket.broadcast.emit("user joined", socket.id);
  socket.on("disconnect", () => {
    socket.broadcast.emit("user left", socket.id);
  });
  socket.on("chat message", (message) => {
    io.emit("chat message", message);
  });
});

const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});
