'use strict';

var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var ent = require('ent');
var path = require('path');

const PORT = process.env.PORT || 3000;

app.get('/', function (req, res) {
  res.sendFile(path.resolve(__dirname, './index.html'));
});

io.sockets.on('connection', function (socket) {
  socket.on('new_user', function (pseudo) {
    socket.pseudo = ent.encode(pseudo);
    socket.broadcast.emit('new_user', socket.pseudo);
  });

  socket.on('new_msg', function (msg) {
    socket.broadcast.emit('user_msg', { pseudo: socket.pseudo, msg: ent.encode(msg) });
  });

  socket.on('disconnect', function () {
    console.log('user disconnected');
  });
});

server.listen(PORT);
