var config = require('config');
var express = require('express');
var passport = require('passport');
var model = require('./model');
var router = express.Router();

// Chat page
router.get('/', function routeHome(req, res) {
  if (typeof req.user === 'undefined') {
    res.redirect('/login');
  } else {
    model.getMessages(renderChatPage.bind({ req: req, res: res }));
  }
});

// Login page
router.get('/login', function (req, res) {
  res.render('login.ejs', { errors: req.flash('error') });
});

// Post login page
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

function renderChatPage(messages) {
  this.res.render('index.ejs', {
    serverUrl: config.get('server.url'),
    nickname: this.req.user.nickname,
    history: messages,
    nbMessages: messages.length
  });
}

module.exports = router;
