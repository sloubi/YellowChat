var model = require('./model');
var config = require('config');
var http = require('http');

// Online users
var users = {};

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
  socket.on('new_msg', function (msg, fn) {
    // If the session were lost
    if (typeof socket.request.session.passport.user === 'undefined') {
      socket.emit('not_logged');
    } else {
      socket.broadcast.emit('user_msg', {
        nickname: socket.request.session.passport.user.nickname,
        msg: msg,
        time: new Date(),
        nbMessages: 5
      });

      model.saveMessage(msg, socket.request.session.passport.user.id);

      model.countMessages(function (nb) {
        fn(nb);
      });
    }
  });

  // New user logged in
  socket.on('new_user', function (fn) {
    // Hum, what are you doing ?
    if (socket.request.session.passport === null) {
      return false;
    }

    var user = socket.request.session.passport.user;
    users[user.id] = user.nickname;
    fn(users);
    socket.broadcast.emit('update_users_list', users);
  });

  // When an user exits (a socket exits)
  socket.on('disconnect', function () {
    // If user is no longer logged in (session expired)
    if (socket.request.session.passport === null) {
      return false;
    }

    var user = socket.request.session.passport.user;
    delete users[user.id];
    socket.broadcast.emit('update_users_list', users);
  });
};

module.exports = init;
