var connection = require('./database');
var config = require('config');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

var store = new MySQLStore({}, connection);

var middleWare = session({
  secret: config.get('session.secret'),
  store: store,
  resave: config.get('session.resave'),
  saveUninitialized: config.get('session.saveUninitialized'),
  cookie: {
    secure: config.get('server.https')
  }
});

module.exports = {
  middleWare,
  store
};
