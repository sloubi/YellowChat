var model = require('./model');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (id, done) {
  done(null, id);
});

passport.use(new LocalStrategy(
  function (username, password, done) {
    // Fetch user from db
    model.getUserByNickname(username, function (user) {
      // User not found
      if (user === false) {
        return done(null, false, { message: 'Invalid username or password.' });
      } else {
        // User found
        // Compare passwords
        bcrypt.compare(password, user.password, function (err, match) {
          if (err) return done(err);

          if (match) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Invalid username or password.' });
          }
        });
      }
    });
  }
));

module.exports = passport;
