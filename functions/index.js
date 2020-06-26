const functions = require('firebase-functions');
const admin = require('firebase-admin');
const serviceAccount = require('./api_key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://real-estate-281401.firebaseio.com',
});

const express = require('express');
const cors = require('cors');

const app = express();
const db = admin.firestore();

app.use(cors({ origin: true }));
// routes
app.get('/', (req, res) => {
  return res.status(200).json({ text: 'hello world' });
});

// create
// post
app.post('/api/create', (req, res) => {
  db.collection('properties')
    .add({ ...req.body }, { merge: true })
    .then((data) => {
      console.log(data);
      res.status(200).json({ successful: true });
    })
    .catch((err) => {
      return res.status(500).json({ errorText: `couldn't add data to server` });
    });
});

// read
// get
app.get('/api/properties', (req, res) => {
  db.collection('properties')
    .get()
    .then((snap) => {
      let docs = snap.docs;
      let datas = docs.map((doc) => doc.data());
      console.log(datas);
      res.status(200).json(datas);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(error);
    });
});

app.get('/api/properties/:id', (req, res) => {
  db.collection('properties')
    .doc(req.params.id)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        console.log('No document found.');
        throw new Error();
      } else {
        console.log(doc.data());
        res.status(200).json(doc.data());
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// update
// put
app.put('/api/update/:id', (req, res) => {
  db.collection('properties')
    .doc(req.params.id)
    .update({ ...req.body })
    .then((result) => {
      console.log(result);
      res.status(200).json({ successful: true });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ successful: false });
    });
});

// delete
app.delete('/api/delete/:id', (req, res) => {
  db.collection('properties')
    .doc(req.params.id)
    .delete()
    .then((result) => {
      console.log(result);
      res.status(200).json({ successful: true });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ successful: false });
    });
});

exports.app = functions.https.onRequest(app);
