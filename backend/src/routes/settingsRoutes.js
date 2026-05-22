const express           = require('express')
const router            = express.Router()
const settingsController = require('../controllers/settings.controller')
const protect           = require('../middleware/protect')
const restrictTo        = require('../middleware/restrictTo')
const { uploadImage } = require('../config/multer')

// Public — check if first-time setup is done
router.get('/setup-status', settingsController.checkSetup)

// Protected — officer only
router.use(protect)
router.use(restrictTo('officer'))

router.get('/',              settingsController.getSettings)
router.post('/',             settingsController.createSettings)
router.put('/',              settingsController.updateSettings)
router.post('/logo',         uploadImage.single('logo'), settingsController.uploadLogo)
router.post('/batches',      settingsController.addBatch)
router.delete('/batches/:batch', settingsController.removeBatch)

module.exports = router