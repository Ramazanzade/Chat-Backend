const http = require('http');
const express = require('express');
const axios = require('axios'); // You'll need Axios to make HTTP requests
const app = express();
const server = http.createServer(app);
const socketIo = require('socket.io'); 

const io = socketIo(server);

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('new-user', (username) => {
    io.emit('user-connected', username);
  });

  socket.on('send-message', (message) => {
    io.emit('message-received', message);

    axios
      .post('https://chat-backend-ulkc.onrender.com/addmsg', message)
      .then((response) => {
        console.log('Message sent to external API:', response.data);
      })
      .catch((error) => {
        console.error('Error sending message to external API:', error);
      });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(5555, () => {
  console.log('Server is listening on port 5555');
});
