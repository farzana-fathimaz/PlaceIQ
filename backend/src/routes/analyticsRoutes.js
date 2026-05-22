const express       = require('express')
const router        = express.Router()
const analyticsCtrl = require('../controllers/analytics.controller')
const protect       = require('../middleware/protect')
const restrictTo    = require('../middleware/restrictTo')

router.use(protect)
router.use(restrictTo('officer'))

router.get('/summary',            analyticsCtrl.getSummary)
router.get('/branch-wise',        analyticsCtrl.getBranchWise)
router.get('/company-wise',       analyticsCtrl.getCompanyWise)
router.get('/drive-wise',         analyticsCtrl.getDriveWise)
router.get('/monthly-trend',      analyticsCtrl.getMonthlyTrend)
router.get('/cgpa-distribution',  analyticsCtrl.getCGPADistribution)
router.get('/top-performers',     analyticsCtrl.getTopPerformers)
router.get('/recent-activity',    analyticsCtrl.getRecentActivity)

module.exports = router