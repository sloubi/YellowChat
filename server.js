var express = require('express');
var app = express();
var flash = require('connect-flash');
var path = require('path');

// We set config dir in the root path of the app (to work with process managers)
process.env['NODE_CONFIG_DIR'] = path.resolve(__dirname) + '/config/';
var config = require('config');

// App files
var passport = require('./lib/auth');
var connection = require('./lib/database');
var session = require('./lib/session');
var server = require('./lib/socket')(app, session);
var router = require('./lib/router');

// Serve static files
if (config.get('server.staticFiles')) {
  app.use('/public', express.static(path.resolve(__dirname) + '/public'));
}

// Set the views dir
app.set('views', path.resolve(__dirname) + '/views');

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
process.stdin.resume(); // so the program will not close instantly

function exitHandler(options, err) {
  session.store.close();
  connection.end();

  if (typeof err !== 'undefined' && typeof err.stack !== 'undefined') {
    console.log('toto' + err.stack);
  }
  if (options.exit) process.exit();
}

// When app is closing
process.on('exit', exitHandler.bind(null));

// Catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));

// Catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));

// Catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
