var connection = require('./database');
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
    connection.query(
      'SELECT * FROM users WHERE nickname = ?',
      [username],
      function (error, results, fields) {
        if (error) { return done(error); }

        // User found
        if (results.length > 0) {
          // Compare passwords
          bcrypt.compare(password, results[0].password, function (err, match) {
            if (err) return done(err);

            if (match) {
              return done(null, results[0]);
            } else {
              return done(null, false, { message: 'Invalid username or password.' });
            }
          });
        } else { // User not found
          return done(null, false, { message: 'Invalid username or password.' });
        }
      });
  }
));

module.exports = passport;
