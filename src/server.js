const https = require('https');
const express = require('express');
const socketIO = require('socket.io');
const { log } = require('console');

const app = express();
const server = https.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "https://chat-backend-ulkc.onrender.com",
    credentials: true,
  },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});

server.listen(5555 , ()=>{
  console.log('connet')
});
