const router = require('express').Router();
const db = require('../firebase/firebase').firestore();
const authCheck = require('../auth-check');
const passport = require('passport');
// create
// post
router.post('/add', passport.authenticate('jwt', { session: false }), (req, res) => {
  db.collection('properties')
    .add(req.body, { merge: true })
    .then((data) => {
      console.log(data);
      return res.status(200).json({ successful: true });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ errorText: `couldn't add data to server` });
    });
});

// read
// get
router.get(
  '/properties',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    db.collection('properties')
      .get()
      .then((snap) => {
        let docs = snap.docs;
        // console.log(docs);
        let datas = docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        });
        // console.log(datas);
        return res.status(200).json(datas);
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).send(error);
      });
  }
);

router.get('/properties/:id', (req, res) => {
  db.collection('properties')
    .doc(req.params.id)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        throw new Error('No document found.');
      } else {
        let data = {
          id: doc.id,
          ...doc.data(),
        };
        return res.status(200).json(data);
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ successful: false });
    });
});

// update
// put
router.put('/update/:id', authCheck, (req, res) => {
  db.collection('properties')
    .doc(req.params.id)
    .update(req.body)
    .then((result) => {
      console.log(result);
      return res.status(200).json({ successful: true });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ successful: false });
    });
});

// delete
router.delete('/delete/:id', authCheck, (req, res) => {
  db.collection('properties')
    .doc(req.params.id)
    .delete()
    .then((result) => {
      console.log(result);
      return res.status(200).json({ successful: true });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ successful: false });
    });
});

module.exports = router;
