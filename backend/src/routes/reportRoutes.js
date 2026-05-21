const express        = require('express')
const router         = express.Router()
const reportCtrl     = require('../controllers/report.controller')
const protect        = require('../middleware/protect')
const restrictTo     = require('../middleware/restrictTo')

router.use(protect)
router.use(restrictTo('officer'))

router.get('/students/excel',              reportCtrl.studentsExcel)
router.get('/placement/excel',             reportCtrl.placementSummaryExcel)
router.get('/placement/pdf',               reportCtrl.placementSummaryPDF)
router.get('/naac/excel',                  reportCtrl.naacExcel)
router.get('/drive/:driveId/excel',        reportCtrl.driveExcel)
router.get('/drive/:driveId/pdf',          reportCtrl.drivePDF)

module.exports = router