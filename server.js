const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);

app.use(express.static(__dirname + "/public"));

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/public/index.html");
});

io.on("connection", (socket) => {
  socket.broadcast.emit("announcement", {
    heading: "Announcement",
    text: "A new user has joined the chat!",
    classList: "bg-green-50",
  });
  socket.join(`${socket.id}`);
  io.to(`${socket.id}`).emit("announcement", {
    heading: "Welcome!",
    text: `Hey there - you can start typing below and press send or hit enter to chat! If you'd like to set a nickname, use /nick`,
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("announcement", {
      heading: "Announcement",
      text: "A user has left the chat :(",
      classList: "bg-red-50",
    });
  });

  socket.on("chat message", (message) => {
    io.emit("chat message", message);
  });

  socket.on("nick change", ({ oldNick, newNick }) => {
    io.emit("announcement", {
      heading: "Announcement",
      text: `${oldNick} shall now be known as... ${newNick}!`,
      classList: "bg-yellow-50",
    });
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});
