const express = require('express')
const router = express.Router()

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'PlaceIQ API is healthy',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} seconds`,
  })
})

// TEST ERROR ROUTE
// router.get('/test-error', (req, res, next) => {
//   const AppError = require('../utils/AppError')
//   throw new AppError('This is a test error', 400)
// })

// Module routes — uncommented as each step is completed
// router.use('/auth', require('./authRoutes'))
// router.use('/students', require('./studentRoutes'))
// router.use('/drives', require('./driveRoutes'))
// router.use('/applications', require('./applicationRoutes'))
// router.use('/rounds', require('./roundRoutes'))
// router.use('/notifications', require('./notificationRoutes'))
// router.use('/reports', require('./reportRoutes'))
// router.use('/analytics', require('./analyticsRoutes'))
// router.use('/settings', require('./settingsRoutes'))

module.exports = router