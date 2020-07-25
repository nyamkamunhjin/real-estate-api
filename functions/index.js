const functions = require('firebase-functions');

const express = require('express');
const cors = require('cors');
const passport = require('passport');
const authRoutes = require('./router/auth-routes');
const apiRoutes = require('./router/api-routes');

require('./passport-setup.js');

const app = express();


app.use(cors({ origin: true }));
app.use(passport.initialize());
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  return res.status(200).json({ text: 'hello world' });
});

exports.app = functions.https.onRequest(app);
