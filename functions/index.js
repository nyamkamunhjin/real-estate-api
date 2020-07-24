const functions = require('firebase-functions');

const express = require('express');
const cors = require('cors');
const passport = require('passport');
const authRoutes = require('./router/auth-routes');
const apiRoutes = require('./router/api-routes');
const session = require('express-session');
const db = require('./firebase/firebase').firestore()
const keys = require('./keys');
const cookieSession = require('cookie-session');

require('./GooglePassport.js');

const app = express();

app.use(cookieSession({
  maxAge: 20 * 1000,
  keys: [keys.session.cookieKey]
}));

// initialize session
app.use(cors({ origin: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  return res.status(200).json({ text: 'hello world' });
});

exports.app = functions.https.onRequest(app);
