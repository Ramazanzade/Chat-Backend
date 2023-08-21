const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const socketIo = require("./api/contruler/soketcontruler"); 
const io = socketIo.init(server); 


io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("new-user", (username) => {
    io.emit("user-connected", username);
  });

  socket.on("send-message", (message) => {
    io.emit("message-received", message);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});
server.listen(5555 , ()=>{
  console.log('connet')
});
