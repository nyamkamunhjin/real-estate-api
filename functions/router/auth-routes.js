const router = require('express').Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const bcrypt = require('bcrypt');

const keys = require('../keys');
const url = require('url');
const db = require('../firebase/firebase').firestore();

const addedSeconds = 60;

router.post(
  '/login',
  passport.authenticate('local', { session: false }),
  (req, res) => {
    const user = {
      id: req.user.id,
      email: req.user.email,
    };

    // calc expire date
    let expiresIn = new Date();

    expiresIn.setSeconds(expiresIn.getSeconds() + addedSeconds);

    const token = jwt.sign({ user }, keys.jwt.secretKey, {
      expiresIn: addedSeconds,
    });

    return res.json({ token, userId: user.id, expires: expiresIn.toISOString });
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
  }
);

router.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    console.log(req.body);

    const usersRef = db.collection('users');
    const doc = await usersRef.where('email', '==', req.body.email).get();

    if (doc.empty) {
      console.log('user doesnt exists');

      let user = {
        username: req.body.username,
        password: hashedPassword,
        googleID: req.body.googleID,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        picUrl: req.body.picUrl,
      };
      console.log(user);

      const result = await usersRef.add(user, { merge: true });

      console.log('Added user with username and password: ', result.id);
      return res.status(200).json({ successful: true });
    } else {
      console.log('user exists.');
      // user exists
      // check if user already completed registration

      const user = doc.docs[0].data();
      const id = doc.docs[0].id;

      if (user.username === '' && user.password === '') {
        const result = usersRef.doc(id).update({
          username: req.body.username,
          password: hashedPassword,
        });

        console.log('Updated user with username and password: ', result.id);
        return res.status(200).json({ successful: true });
      } else {
        return res
          .status(500)
          .json({ successful: false, message: 'user exists' });
      }
    }
    // db.collection('users')
    //   .where('email', '==', req.body.email)
    //   .get()
    //   .then((snapshot) => {
    //     // check if user exists
    //     if (snapshot.empty) {
    //       // add new user
    //       console.log('user exists not.');

    //       let user = {
    //         username: req.body.username,
    //         password: hashedPassword,
    //         googleID: req.body.googleID,
    //         firstName: req.body.firstName,
    //         lastName: req.body.lastName,
    //         email: req.body.email,
    //         picUrl: req.body.picUrl,
    //       };
    //       console.log(user);

    //       db.collection('users')
    //         .add(user, { merge: true })
    //         .then((data) => {
    //           console.log('new user created:');
    //           return res.status(200).json({ successful: true });
    //         })
    //         .catch((err) => {
    //           return res.status(500).json({ successful: false });
    //         });
    //     } else {
    //       console.log('user exists.');
    //       // user exists
    //       // check if user already completed registration

    //       const user = snapshot.docs[0].data();
    //       if (user.username === '' && user.password === '') {
    //         db.collection('users')
    //           .doc(snapshot.docs[0].id)
    //           .update({
    //             username: req.body.username,
    //             password: hashedPassword,
    //           })
    //           .then((data) => {
    //             console.log('updated username and password:');
    //             return res.status(200).json({ successful: true });
    //           })
    //           .catch((err) => {
    //             return res.status(500).json({ successful: false });
    //           });
    //       }
    //     }
    //   })
    //   .catch((err) => {
    //     return res.status(500).json({ successful: false });
    //   });
  } catch (err) {
    console.log(err);

    return res.status(500).json({ successful: false });
  }
});

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get(
  '/google/redirect',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const user = {
      id: req.user.id,
      email: req.user.email,
    };

    // calc expire date
    let expiresIn = new Date();
    expiresIn.setSeconds(expiresIn.getSeconds() + addedSeconds);

    const token = jwt.sign({ user }, keys.jwt.secretKey, {
      expiresIn: addedSeconds,
    });

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
  }
);

// router.get('/login', (req, res) => {
//   return res.json(req.body);
// })

router.get('/google/success', (req, res) => {
  console.log(req.user);
  res.send('successs');
});

router.get('/google/failure', (req, res) => {
  res.send('failure');
});

module.exports = router;
