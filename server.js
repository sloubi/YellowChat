var express = require('express');
var app = express();
var flash = require('connect-flash');
var config = require('config');
var passport = require('./lib/auth');
var connection = require('./lib/database');
var session = require('./lib/session');
var server = require('./lib/socket')(app, session);
var router = require('./lib/router');

// Serve static files
app.use(express.static('public'));

// Request body parsing support
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use(session.middleWare);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use('/', router);

server.listen(config.get('server.port'));

// Handle exits
process.on('exit', function () {
  session.store.close();
  connection.end();
});
// Catch CTRL+C
process.on('SIGINT', function () {
  process.exit(0);
});
// Catch uncaught exception
process.on('uncaughtException', function () {
  process.exit(1);
});
