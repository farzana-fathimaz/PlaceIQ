const express        = require('express')
const router         = express.Router()
const driveController = require('../controllers/drive.controller')
const protect        = require('../middleware/protect')
const restrictTo     = require('../middleware/restrictTo')

router.use(protect)

// Both roles
router.get('/',    driveController.getAllDrives)
router.get('/stats', restrictTo('officer'), driveController.getDriveStats)
router.get('/:id', driveController.getDriveById)

// Officer only
router.post('/',                              restrictTo('officer'), driveController.createDrive)
router.put('/:id',                            restrictTo('officer'), driveController.updateDrive)
router.patch('/:id/status',                   restrictTo('officer'), driveController.updateDriveStatus)
router.delete('/:id',                         restrictTo('officer'), driveController.deleteDrive)
router.get('/:id/eligible-students',          restrictTo('officer'), driveController.getEligibleStudents)

module.exports = router