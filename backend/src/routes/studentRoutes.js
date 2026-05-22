const express = require('express')
const router = express.Router()
const studentController = require('../controllers/student.controller')
const protect = require('../middleware/protect')
const restrictTo = require('../middleware/restrictTo')
const { uploadCSV, uploadResume } = require('../config/multer')
const { getDashboard } = require('../controllers/studentDashboard.controller')

router.use(protect)

// Student dashboard — aggregated endpoint
router.get('/dashboard/me', getDashboard)

// Student self routes
router.get('/me/profile',         studentController.getMyProfile)
router.put('/me/profile',         studentController.updateMyProfile)
router.post('/me/resume',         uploadResume.single('resume'), studentController.uploadResume)

// Officer only routes
router.get('/',                   restrictTo('officer'), studentController.getAllStudents)
router.post('/',                  restrictTo('officer'), studentController.createStudent)
router.get('/export',             restrictTo('officer'), studentController.exportStudents)
router.post('/import',            restrictTo('officer'), uploadCSV.single('file'), studentController.bulkImport)
router.get('/:id',                studentController.getStudentById)
router.put('/:id',                studentController.updateStudent)
router.patch('/:id/toggle-active', restrictTo('officer'), studentController.toggleStudentActive)

module.exports = router