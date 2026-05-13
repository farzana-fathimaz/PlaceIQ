const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')
const protect = require('../middleware/protect')
const { authLimiter } = require('../middleware/rateLimiter')

// Public routes with strict rate limiting
router.post('/register', authLimiter, authController.register)
router.post('/login',    authLimiter, authController.login)
router.post('/refresh',              authController.refresh)

// Protected routes
router.post('/logout', protect, authController.logout)
router.get('/me',      protect, authController.getMe)

// Google OAuth — only wire if credentials are set
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const passport = require('../config/passport')
  router.use(passport.initialize())

  router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })
  )

  router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    authController.googleCallback
  )
}

module.exports = router