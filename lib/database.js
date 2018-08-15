var mysql = require('mysql');
var config = require('config');

var pool = mysql.createPool({
  host: config.get('database.host'),
  user: config.get('database.user'),
  password: config.get('database.password'),
  database: config.get('database.database')
});

// Ping database to check for common exception errors.
pool.getConnection((err, connection) => {
  if (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed.');
    } else if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has too many connections.');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('Database connection was refused.');
    } else {
      console.error(err.message);
    }
  }

  if (connection) connection.release();
});

module.exports = pool;
