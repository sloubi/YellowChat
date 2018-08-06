var mysql = require('mysql');
var config = require('config');

// Connection to the db
var connection = mysql.createConnection({
  host: config.get('database.host'),
  user: config.get('database.user'),
  password: config.get('database.password'),
  database: config.get('database.database')
});

// Catches connection errors
var del = connection._protocol._delegateError;
connection._protocol._delegateError = function (err, sequence) {
  if (err.fatal) {
    console.trace('fatal error: ' + err.message);
  }
  return del.call(this, err, sequence);
};

connection.connect();

module.exports = connection;
