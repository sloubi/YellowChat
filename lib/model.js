var pool = require('./database');
var mysql = require('mysql');

// Get all messages
var getMessages = function (callback) {
  pool.query(
    'SELECT m.*, u.nickname FROM messages m ' +
    'INNER JOIN users u ON m.user_id = u.id ' +
    'ORDER BY m.created_at', function (error, results) {
      if (error) return console.error(error);

      results.forEach(message => {
        var createdAt = new Date(message['created_at']);
        message['created_at'] = createdAt.toLocaleString();
      });

      callback(results);
    });
};

// Get the number of messages
var countMessages = function (callback) {
  pool.query(
    'SELECT COUNT(*) as nb FROM messages',
    function (error, results) {
      if (error) return console.error(error);

      callback(results[0].nb);
    });
};

// Save message in db
var saveMessage = function (msg, userId) {
  var message = {
    message: msg,
    created_at: mysql.raw('NOW()'),
    user_id: userId
  };
  pool.query('INSERT INTO messages SET ?', message);
};

// Get user for a nickname
var getUserByNickname = function (nickname, callback) {
  pool.query(
    'SELECT * FROM users WHERE nickname = ?',
    [nickname],
    function (error, results) {
      if (error) console.error(error);

      // User found
      if (results.length > 0) {
        callback(results[0]);
      } else {
        callback(false);
      }
    });
};

module.exports = {
  getMessages,
  countMessages,
  saveMessage,
  getUserByNickname
};
