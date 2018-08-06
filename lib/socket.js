var connection = require('./database');
var mysql = require('mysql');
var ent = require('ent');
var config = require('config');
var http = require('http');

var init = function (app, session) {
  var server;
  // Secured server thanks to Let's encrypt
  if (config.get('server.https')) {
    var Greenlock = require('greenlock-express');
    var greenlock = Greenlock.create(config.get('greenlock'));

    // Redirect http to https
    var redirectHttps = require('redirect-https')();
    var acmeChallengeHandler = greenlock.middleware(redirectHttps);
    http.createServer(acmeChallengeHandler).listen(80);

    // Use spdy for "h2" (http2) as to not be penalized by Google
    server = require('spdy').createServer(greenlock.tlsOptions, app);
  } else {
    server = http.createServer(app);
  }

  var io = require('socket.io').listen(server);

  // Allow sockets to access session data
  io.use(function (socket, next) {
    session.middleWare(socket.request, socket.request.res, next);
  });

  io.sockets.on('connection', listenEvents);

  return server;
};

var listenEvents = function (socket) {
  // New message received
  socket.on('new_msg', function (msg) {
    // If the session were lost
    if (typeof socket.request.session.passport.user === 'undefined') {
      socket.emit('not_logged');
    } else {
      socket.broadcast.emit('user_msg', {
        nickname: socket.request.session.passport.user.nickname,
        msg: ent.encode(msg)
      });
      saveMessage(msg, socket.request.session.passport.user.id);
    }
  });
};

// Save message in db
var saveMessage = function (msg, userId) {
  var message = {
    message: msg,
    created_at: mysql.raw('NOW()'),
    user_id: userId
  };
  connection.query('INSERT INTO messages SET ?', message);
};

module.exports = init;
