'use strict';

var os = require('os');
var nodeStatic = require('node-static');
var http = require('http');
var socketIO = require('socket.io')();

var fileServer = new(nodeStatic.Server)();
var app = http.createServer(function(req, res) {
  fileServer.serve(req, res);
}).listen(8000, '0.0.0.0'); // ovde moze da se menja koji je localhost

var rooms = {};
var io = socketIO.listen(app);
io.sockets.on('connection', function(socket) {

  // convenience function to log server messages on the client
  socket.on('joinroom', function(room) {
        this.join(room);
        if (typeof rooms[room] === "undefined") rooms[room] = {};
        rooms[room].count = rooms[room].total ? rooms[room].total+1 : 1; 
        io.to(room).emit("new user", rooms[room].count)
    });

  socket.on('ipaddr', function() {
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
      ifaces[dev].forEach(function(details) {
        if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
          socket.emit('ipaddr', details.address);
        }
      });
    }
  });

});