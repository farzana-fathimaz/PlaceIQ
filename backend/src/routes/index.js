const express = require('express')
const router = express.Router()

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'PlaceIQ API is healthy',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} seconds`,
  })
})

router.use('/auth', require('./authRoutes'))
router.use('/students',      require('./studentRoutes'))
router.use('/drives',        require('./driveRoutes'))
router.use('/applications',  require('./applicationRoutes'))
router.use('/rounds',        require('./roundRoutes'))
router.use('/notifications', require('./notificationRoutes'))
router.use('/reports',       require('./reportRoutes'))
// router.use('/analytics',     require('./analyticsRoutes'))
// router.use('/settings',      require('./settingsRoutes'))

module.exports = router