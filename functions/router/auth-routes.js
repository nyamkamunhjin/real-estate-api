const router = require('express').Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const keys = require('../keys');
const url = require('url');

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

  // calc expire date
  let expiresIn = new Date();
  // expiresIn.setHours(expiresIn.getHours() + 1);
  const addedSeconds = 60;
  expiresIn.setSeconds(expiresIn.getSeconds() + addedSeconds);

  const token = jwt.sign({ user }, keys.jwt.secretKey, { expiresIn: addedSeconds });

  // return res.json({ token, userId: user.id, expires: expiresIn.toISOString });
  res.redirect(
    url.format({
      pathname: keys.url.front_end + '/auth',
      query: {
        token,
        userId: user.id,
        expires: expiresIn.toISOString(),
      },
    })
  );
});

router.get('/google/success', (req, res) => {
  console.log(req.user);
  res.send('successs');
});

router.get('/google/failure', (req, res) => {
  res.send('failure');
});

module.exports = router;
