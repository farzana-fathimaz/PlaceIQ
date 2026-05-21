const notificationService = require('../services/notification.service')
const ApiResponse          = require('../utils/ApiResponse')
const AppError             = require('../utils/AppError')

const getNotifications = async (req, res) => {
  const result = await notificationService.getNotificationsForUser(
    req.user.id,
    req.query
  )
  return ApiResponse.success(res, result, 'Notifications fetched')
}

const getUnreadCount = async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user.id)
  return ApiResponse.success(res, { count }, 'Unread count fetched')
}

const markAsRead = async (req, res) => {
  const notification = await notificationService.markAsRead(
    req.params.id,
    req.user.id
  )
  return ApiResponse.success(res, { notification }, 'Marked as read')
}

const markAllAsRead = async (req, res) => {
  await notificationService.markAllAsRead(req.user.id)
  return ApiResponse.success(res, {}, 'All notifications marked as read')
}

const deleteNotification = async (req, res) => {
  await notificationService.deleteNotification(req.params.id, req.user.id)
  return ApiResponse.success(res, {}, 'Notification deleted')
}

const deleteAllRead = async (req, res) => {
  await notificationService.deleteAllRead(req.user.id)
  return ApiResponse.success(res, {}, 'Read notifications cleared')
}

const sendNotification = async (req, res) => {
  const {
    targetGroup,
    targetIds,
    title,
    message,
    type,
    relatedDriveId,
    sendEmail,
  } = req.body

  if (!title || !message) {
    throw new AppError('Title and message are required', 400)
  }

  if (!targetGroup) {
    throw new AppError('Target group is required', 400)
  }

  const result = await notificationService.sendManualNotification({
    targetGroup,
    targetIds,
    title,
    message,
    type:           type || 'general',
    relatedDriveId: relatedDriveId || null,
    sendEmail:      sendEmail !== false,
  })

  return ApiResponse.success(
    res,
    result,
    `Notification sent to ${result.sent} recipient(s)`
  )
}

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  sendNotification,
}