const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const oAuthKeys = require('./oAuth_keys.json');
const keys = require('./keys');
const db = require('./firebase/firebase').firestore();

const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

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
            let user = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
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
                console.log('new user created:', data);
                user.id = data.id;
                done(null, user);
              });
          }
        });
    }
  )
);

passport.serializeUser((user, done) => {
  console.log('serializer called: ', user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  console.log(id);
  db.collection('users')
    .doc(id)
    .get()
    .then((doc) => {
      const user = doc.data();
      done(null, user);
    });
});

passport.use(
  new JWTstrategy(
    {
      secretOrKey: keys.jwt.secretKey,
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    },
    async (token, done) => {
      try {
        return done(null, token.user);
      } catch (error) {
        done(error);
      }
    }
  )
);
