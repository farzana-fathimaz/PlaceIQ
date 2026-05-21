const Notification   = require('../models/Notification')
const User           = require('../models/User')
const AppError       = require('../utils/AppError')
const emailService   = require('./email.service')

const createNotification = async ({
  userId,
  title,
  message,
  type = 'general',
  relatedDriveId = null,
  relatedApplicationId = null,
  metadata = {},
}) => {
  const notification = await Notification.create({
    userId,
    title,
    message,
    type,
    relatedDriveId,
    relatedApplicationId,
    metadata,
  })
  return notification
}

const createBulkNotifications = async (notifications) => {
  if (!notifications.length) return []
  return Notification.insertMany(notifications)
}

const getNotificationsForUser = async (userId, queryParams) => {
  const page   = parseInt(queryParams.page)   || 1
  const limit  = parseInt(queryParams.limit)  || 20
  const skip   = (page - 1) * limit
  const filter = { userId }

  if (queryParams.type) filter.type    = queryParams.type
  if (queryParams.unread === 'true')   filter.isRead = false

  const total         = await Notification.countDocuments(filter)
  const unreadCount   = await Notification.countDocuments({ userId, isRead: false })
  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

  return {
    notifications,
    unreadCount,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    _id:    notificationId,
    userId,
  })
  if (!notification) throw new AppError('Notification not found', 404)

  notification.isRead = true
  await notification.save()
  return notification
}

const markAllAsRead = async (userId) => {
  await Notification.updateMany({ userId, isRead: false }, { isRead: true })
  return { success: true }
}

const deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    _id:    notificationId,
    userId,
  })
  if (!notification) throw new AppError('Notification not found', 404)
  await Notification.findByIdAndDelete(notificationId)
}

const deleteAllRead = async (userId) => {
  await Notification.deleteMany({ userId, isRead: true })
}

const getUnreadCount = async (userId) => {
  return Notification.countDocuments({ userId, isRead: false })
}

// ─── TRIGGER EVENTS ──────────────────────────────────────────────────────────

const notifyDriveOpen = async (drive) => {
  try {
    const StudentProfile = require('../models/StudentProfile')
    const e = drive.eligibility

    const profileFilter = {
      cgpa:           { $gte: e.minCGPA || 0 },
      activeBacklogs: { $lte: e.maxBacklogs ?? 999 },
    }

    if (e.allowedBranches?.length > 0) profileFilter.branch = { $in: e.allowedBranches }
    if (e.allowedBatches?.length  > 0) profileFilter.batch  = { $in: e.allowedBatches  }
    if (e.genderAllowed && e.genderAllowed !== 'All') profileFilter.gender = e.genderAllowed
    if (!e.allowPlaced) profileFilter.placementStatus = 'not_placed'

    const profiles = await StudentProfile.find(profileFilter)
      .populate('userId', 'name email isActive')

    const activeProfiles = profiles.filter((p) => p.userId?.isActive)

    const notifs = activeProfiles.map((p) => ({
      userId:         p.userId._id,
      title:          `New Drive: ${drive.company}`,
      message:        `${drive.title} is now open for applications. Apply before ${
        drive.lastApplyDate
          ? new Date(drive.lastApplyDate).toLocaleDateString('en-IN')
          : 'the deadline'
      }.`,
      type:           'drive_open',
      relatedDriveId: drive._id,
    }))

    if (notifs.length > 0) {
      await createBulkNotifications(notifs)

      // Send emails in background — do not await to avoid blocking response
      setImmediate(async () => {
        for (const p of activeProfiles) {
          if (!p.userId?.email) continue
          const emailContent = emailService.buildDriveOpenEmail(p.userId.name, drive)
          await emailService.sendEmail({
            to:      p.userId.email,
            subject: emailContent.subject,
            html:    emailContent.html,
          })
        }
      })
    }

    console.log(`[NOTIFY] Drive open: ${notifs.length} notifications sent`)
  } catch (err) {
    console.error('[NOTIFY ERROR] notifyDriveOpen:', err.message)
  }
}

const notifyApplicationStatusChange = async (application, newStatus, note = '') => {
  try {
    const Drive = require('../models/Drive')
    const User  = require('../models/User')

    const [drive, student] = await Promise.all([
      Drive.findById(application.driveId),
      User.findById(application.studentId),
    ])

    if (!drive || !student) return

    const statusMessages = {
      shortlisted: `Congratulations! You have been shortlisted for ${drive.company} — ${drive.title}.`,
      in_rounds:   `You have been moved to interview rounds for ${drive.company} — ${drive.title}.`,
      placed:      `Congratulations! You have been selected by ${drive.company}. Your placement is confirmed!`,
      rejected:    `Your application for ${drive.company} — ${drive.title} was not successful this time.`,
      withdrawn:   `Your application for ${drive.company} — ${drive.title} has been withdrawn.`,
    }

    const message = statusMessages[newStatus] || `Your application status was updated to ${newStatus}.`

    await createNotification({
      userId:               student._id,
      title:                `Application Update — ${drive.company}`,
      message,
      type:                 'application_update',
      relatedDriveId:       drive._id,
      relatedApplicationId: application._id,
    })

    // Send email in background
    setImmediate(async () => {
      const emailContent = emailService.buildApplicationUpdateEmail(
        student.name,
        drive,
        newStatus,
        note
      )
      await emailService.sendEmail({
        to:      student.email,
        subject: emailContent.subject,
        html:    emailContent.html,
      })
    })
  } catch (err) {
    console.error('[NOTIFY ERROR] notifyApplicationStatusChange:', err.message)
  }
}

const sendManualNotification = async ({
  targetGroup,
  targetIds,
  title,
  message,
  type,
  relatedDriveId,
  sendEmail: shouldSendEmail,
}) => {
  let recipients = []

  if (targetGroup === 'all_students') {
    recipients = await User.find({ role: 'student', isActive: true }).select('_id name email')
  } else if (targetGroup === 'specific' && targetIds?.length > 0) {
    recipients = await User.find({ _id: { $in: targetIds }, isActive: true }).select('_id name email')
  } else if (targetGroup === 'drive_applicants' && relatedDriveId) {
    const Application = require('../models/Application')
    const apps = await Application.find({
      driveId: relatedDriveId,
      status:  { $nin: ['withdrawn', 'rejected'] },
    }).populate('studentId', '_id name email')

    recipients = apps
      .map((a) => a.studentId)
      .filter(Boolean)
  } else if (targetGroup === 'placed_students') {
    const StudentProfile = require('../models/StudentProfile')
    const profiles = await StudentProfile.find({ placementStatus: 'placed' })
      .populate('userId', '_id name email')
    recipients = profiles.map((p) => p.userId).filter(Boolean)
  }

  if (recipients.length === 0) {
    throw new AppError('No recipients found for the selected group', 400)
  }

  const notifs = recipients.map((r) => ({
    userId:         r._id,
    title,
    message,
    type:           type || 'general',
    relatedDriveId: relatedDriveId || null,
  }))

  await createBulkNotifications(notifs)

  if (shouldSendEmail) {
    setImmediate(async () => {
      for (const r of recipients) {
        if (!r.email) continue
        const emailContent = emailService.buildGeneralEmail(r.name, title, message)
        await emailService.sendEmail({
          to:      r.email,
          subject: emailContent.subject,
          html:    emailContent.html,
        })
      }
    })
  }

  return { sent: recipients.length }
}

module.exports = {
  createNotification,
  createBulkNotifications,
  getNotificationsForUser,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  getUnreadCount,
  notifyDriveOpen,
  notifyApplicationStatusChange,
  sendManualNotification,
}