const router = require('express').Router();
const passport = require('passport');

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
  console.log(req.user);
  res.json(req.user);
});

router.get('/google/success', (req, res) => {
  console.log(req.user);
  res.send('successs');
});

router.get('/google/failure', (req, res) => {
  res.send('failure');
});

module.exports = router;
