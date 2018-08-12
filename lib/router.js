var connection = require('./database');
var config = require('config');
var express = require('express');
var passport = require('passport');
var router = express.Router();

// Chat page
router.get('/', function (req, res) {
  if (typeof req.user === 'undefined') {
    res.redirect('/login');
  } else {
    connection.query(
      'SELECT m.*, u.nickname FROM messages m ' +
      'INNER JOIN users u ON m.user_id = u.id',
      function (error, results, fields) {
        if (error) throw error;

        results.forEach(message => {
          var createdAt = new Date(message['created_at']);
          message['created_at'] = createdAt.toLocaleString();
        });

        res.render('index.ejs', {
          serverUrl: config.get('server.url'),
          nickname: req.user.nickname,
          history: results
        });
      });
  }
});

// Login page
router.get('/login', function (req, res) {
  res.render('login.ejs', { errors: req.flash('error') });
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

// Logout
router.get('/logout', function (req, res, next) {
  // Clear the login session
  req.logout();
  req.session.destroy();

  // Redirect to home
  res.redirect('/');
});

module.exports = router;
