const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);

app.use(express.static(__dirname + "/public"));

var connectedUsers = {};
var recentlyUsedNicks = [];
const assignUserName = () => {
  const set = new Set(Object.keys(connectedUsers).concat(recentlyUsedNicks));
  let i = 0;
  while (set.has(`anonymous${i}`)) {
    i++;
  }
  return `anonymous${i}`;
};
setInterval(() => (recentlyUsedNicks = []), 600000);

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/public/index.html");
});

io.on("connection", (socket) => {
  socket.username = assignUserName();
  connectedUsers[socket.username] = socket.id;
  socket.broadcast.emit("announcement", {
    heading: "Announcement",
    text: `@${socket.username} has joined the chat!`,
    classList: "bg-green-50",
  });
  socket.join(`${socket.id}`);
  io.to(socket.id).emit("newNick", socket.username);
  io.to(socket.id).emit("announcement", {
    heading: "Welcome!",
    text: `Hey there - you can start typing below and press send or hit enter to chat! If you'd like to set a nickname, use /nick`,
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("announcement", {
      heading: "Announcement",
      text: `@${socket.username} has left the chat :(`,
      classList: "bg-red-50",
    });
    recentlyUsedNicks.push(socket.username);
    delete connectedUsers[socket.username];
  });

  socket.on("chatMessage", (message) => {
    message.nick = socket.username;
    if (message.private) {
      message.recipients.forEach((recipient) => {
        const nick = recipient.slice(1);
        io.to(connectedUsers[nick]).emit("chatMessage", message);
      });
    } else {
      socket.broadcast.emit("chatMessage", message);
    }
  });

  socket.on("newNick", (socketId, newNick) => {
    io.emit("announcement", {
      heading: "Announcement",
      text: `${socket.username} shall now be known as... @${newNick}!`,
      classList: "bg-yellow-50",
    });
    recentlyUsedNicks.push(socket.username);
    delete connectedUsers[socket.username];
    socket.username = newNick;
    connectedUsers[socket.username] = socket.id;
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});
