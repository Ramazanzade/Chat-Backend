const http =require('http')
const app =require('./app')
require('dotenv').config();
const server = http.createServer(app)

  
server.listen(5555)