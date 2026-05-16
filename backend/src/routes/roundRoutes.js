const express         = require('express')
const router          = express.Router()
const roundController = require('../controllers/round.controller')
const protect         = require('../middleware/protect')
const restrictTo      = require('../middleware/restrictTo')

router.use(protect)

// Officer routes
router.post('/',                                    restrictTo('officer'), roundController.createRound)
router.get('/drive/:driveId',                       restrictTo('officer'), roundController.getRoundsForDrive)
router.get('/drive/:driveId/summary',               restrictTo('officer'), roundController.getRoundSummary)
router.get('/:id',                                  restrictTo('officer'), roundController.getRoundById)
router.put('/:id',                                  restrictTo('officer'), roundController.updateRound)
router.patch('/:id/status',                         restrictTo('officer'), roundController.updateRoundStatus)
router.delete('/:id',                               restrictTo('officer'), roundController.deleteRound)
router.patch('/:id/results',                        restrictTo('officer'), roundController.markResults)
router.post('/:id/add-students',                    restrictTo('officer'), roundController.addStudentsToRound)

// Student route
router.get('/my-status/:driveId',                   restrictTo('student'), roundController.getStudentRoundStatus)

module.exports = router