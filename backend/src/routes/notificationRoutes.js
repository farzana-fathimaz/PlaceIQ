const express      = require('express')
const router       = express.Router()
const notifCtrl    = require('../controllers/notification.controller')
const protect      = require('../middleware/protect')
const restrictTo   = require('../middleware/restrictTo')

router.use(protect)

// All users
router.get('/',              notifCtrl.getNotifications)
router.get('/unread-count',  notifCtrl.getUnreadCount)
router.patch('/read-all',    notifCtrl.markAllAsRead)
router.delete('/clear-read', notifCtrl.deleteAllRead)
router.patch('/:id/read',    notifCtrl.markAsRead)
router.delete('/:id',        notifCtrl.deleteNotification)

// Officer only
router.post('/send', restrictTo('officer'), notifCtrl.sendNotification)

module.exports = router