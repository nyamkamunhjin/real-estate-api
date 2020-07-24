const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const oAuthKeys = require('./oAuth_keys.json');
const db = require('./firebase/firebase').firestore();

passport.use(
  new GoogleStrategy(
    {
      clientID: oAuthKeys.web.client_id,
      clientSecret: oAuthKeys.web.client_secret,
      callbackURL: '/real-estate-281401/us-central1/app/auth/google/redirect',
    },
    (accessToken, refreshToken, profile, done) => {
      // console.log('access token: ', accessToken);
      // console.log(profile);
      db.collection('users')
        .where('googleID', '==', profile._json.sub)
        .get()
        .then((snapshot) => {
          // check if user exists
          if (!snapshot.empty) {
            let user = snapshot.docs[0].data();
            console.log('user exists:', user);
            done(null, user);
          } else {
            let user = {
              googleID: profile._json.sub,
              firstName: profile._json.given_name,
              lastName: profile._json.family_name,
              email: profile._json.email,
              picURL: profile._json.picture,
            };
            // add new user
            db.collection('users')
              .add(user, { merge: true })
              .then((data) => {
                console.log('new user created:', user);
                done(null, user);
              });
          }
        });
    }
  )
);

passport.serializeUser((user, done) => {
  console.log('serializer called: ', user.id);
  done(null, user);
});

passport.deserializeUser((id, done) => {
  db.collection('users')
    .doc(id)
    .get()
    .then((doc) => {
      const user = doc.data();
      done(null, user);
    });
});
