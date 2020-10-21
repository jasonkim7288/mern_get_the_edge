const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');

const User = require('../models/user');
const passport = require('passport');

module.exports = (passport) => {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
    proxy: true
  }, (accessToken, refreshToken, profile, done) => {
    console.log('accessToken:', accessToken);
    console.log('refreshToken:', refreshToken);
    console.log('profile:', profile);

    console.log('***photo:', profile.photos[0].value);

    const newUser = {
      googleID: profile.id,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      email: profile.emails[0].value,
      photo: profile.photos[0].value
    }

    User.findOne({googleID: profile.id})
    .then(user => {
      if (user) {
        console.log('Already existing user:', user);
        done(null, user);
      } else {
        console.log('New User');
        new User(newUser).save()
        .then(user => done(null, user));
      }
    })
  })
  );
  passport.serializeUser((user, done) => {
    // console.log('serializeUser, user:', user)
    done(null, user._id);
  });

  passport.deserializeUser((_id, done) => {
    // console.log('deserializeUser, id' + _id);
    User.findById(_id)
    .then(user => done(null, user));
  });
}