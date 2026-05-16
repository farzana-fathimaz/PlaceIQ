const express       = require('express')
const router        = express.Router()
const appController = require('../controllers/application.controller')
const protect       = require('../middleware/protect')
const restrictTo    = require('../middleware/restrictTo')

router.use(protect)

// Student routes
router.post('/',                              restrictTo('student'), appController.apply)
router.get('/me',                             restrictTo('student'), appController.getMyApplications)
router.patch('/:id/withdraw',                 restrictTo('student'), appController.withdrawApplication)

// Officer routes
router.get('/',                               restrictTo('officer'), appController.getAllApplications)
router.get('/stats',                          restrictTo('officer'), appController.getApplicationStats)
router.get('/drive/:driveId',                 restrictTo('officer'), appController.getApplicationsForDrive)
router.patch('/:id/status',                   restrictTo('officer'), appController.updateApplicationStatus)

// Both roles
router.get('/check/:driveId',                 appController.checkIfApplied)
router.get('/:id',                            appController.getApplicationById)

module.exports = router