const http =require('http')
const app =require('./app')
require('dotenv').config();
const socket = require("socket.io");
const server = http.createServer(app)
const io = socket(server, {
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
    });})
  
server.listen(5555)