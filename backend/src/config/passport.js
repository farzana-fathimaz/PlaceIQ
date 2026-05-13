const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const { findOrCreateGoogleUser } = require('../services/auth.service')

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const result = await findOrCreateGoogleUser({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          avatar: profile.photos[0]?.value || null,
        })
        done(null, result)
      } catch (err) {
        done(err, null)
      }
    }
  )
)

module.exports = passport