module.exports = {
  ensureAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.redirect('/');
    }
  },
  ensureGuest: (req, res, next) => {
    console.log('ensureGuest');
    if (req.isAuthenticated()) {
      res.redirect('/crawls');
    } else {
      next();
    }
  }
}