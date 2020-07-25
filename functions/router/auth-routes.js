const router = require('express').Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const keys = require('../keys');
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
  // console.log(req.user);
  // res.redirect(keys.url.front_end);
  const user = {
    id: req.user.id,
    email: req.user.email,
  };

  const token = jwt.sign({ user: user }, keys.jwt.secretKey, { expiresIn: '60s'});

  return res.json({ token });
});

router.get('/google/success', (req, res) => {
  console.log(req.user);
  res.send('successs');
});

router.get('/google/failure', (req, res) => {
  res.send('failure');
});

module.exports = router;
