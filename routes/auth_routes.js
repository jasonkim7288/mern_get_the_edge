const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: true}));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/', session: true}),
  (req, res) => {
    console.log('req.user:', req.user);
    setTimeout(() => res.redirect('/crawls'), 1000);
    // res.redirect('http://localhost:3000/dashboard');
  }
);

router.get('/verify', (req, res) => {
  if (req.user) {
    console.log('req.user:', req.user);
    res.json(req.user);
  } else {
    console.log('Not authenticated');
    res.json({error: "not auth"})
  }
})

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
})

module.exports = router;

