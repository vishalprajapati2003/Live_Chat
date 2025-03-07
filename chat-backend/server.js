const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const rooms = new Map();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join_room", ({ room, username }) => {
    socket.join(room);
    socket.username = username;

    if (!rooms.has(room)) {
      rooms.set(room, []);
    }

    socket.emit("message_history", rooms.get(room));

    io.to(room).emit("user_joined", `${username} joined the chat`);
  });

  socket.on("send_message", ({ room, message }) => {
    const chatMessage = { sender: socket.username, message };

    rooms.get(room).push(chatMessage);

    io.to(room).emit("receive_message", chatMessage);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
