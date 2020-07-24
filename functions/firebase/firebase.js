const admin = require('firebase-admin');
const serviceAccount = require('../api_key.json');


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://real-estate-281401.firebaseio.com',
});


module.exports = admin;