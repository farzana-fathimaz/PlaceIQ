const Application    = require('../models/Application')
const Drive          = require('../models/Drive')
const StudentProfile = require('../models/StudentProfile')
const User           = require('../models/User')
const AppError       = require('../utils/AppError')
const { validateStatusTransition } = require('../validators/application.validator')

// Check if student is eligible for a drive
const checkEligibility = async (studentUserId, drive) => {
  const profile = await StudentProfile.findOne({ userId: studentUserId })
  if (!profile) throw new AppError('Student profile not found. Complete your profile first.', 400)

  const e = drive.eligibility

  if (profile.cgpa < (e.minCGPA || 0)) {
    throw new AppError(`Your CGPA (${profile.cgpa}) is below the minimum required (${e.minCGPA})`, 400)
  }

  if (profile.activeBacklogs > (e.maxBacklogs ?? 999)) {
    throw new AppError(`Your active backlogs (${profile.activeBacklogs}) exceed the maximum allowed (${e.maxBacklogs})`, 400)
  }

  if (e.allowedBranches?.length > 0 && !e.allowedBranches.includes(profile.branch)) {
    throw new AppError(`Your branch (${profile.branch}) is not eligible for this drive`, 400)
  }

  if (e.allowedBatches?.length > 0 && !e.allowedBatches.includes(profile.batch)) {
    throw new AppError(`Your batch (${profile.batch}) is not eligible for this drive`, 400)
  }

  if (e.genderAllowed && e.genderAllowed !== 'All' && profile.gender !== e.genderAllowed) {
    throw new AppError(`This drive is open for ${e.genderAllowed} candidates only`, 400)
  }

  if (e.tenthMin && profile.tenthPercent && profile.tenthPercent < e.tenthMin) {
    throw new AppError(`Your 10th percentage (${profile.tenthPercent}%) is below minimum required (${e.tenthMin}%)`, 400)
  }

  if (e.twelfthMin && profile.twelfthPercent && profile.twelfthPercent < e.twelfthMin) {
    throw new AppError(`Your 12th percentage (${profile.twelfthPercent}%) is below minimum required (${e.twelfthMin}%)`, 400)
  }

  if (!e.allowPlaced && profile.placementStatus === 'placed') {
    throw new AppError('This drive does not allow already placed students to apply', 400)
  }

  return profile
}

const applyToDrive = async (studentUserId, driveId) => {
  const drive = await Drive.findById(driveId)
  if (!drive) throw new AppError('Drive not found', 404)

  if (drive.status !== 'active') {
    throw new AppError('This drive is not currently accepting applications', 400)
  }

  if (drive.lastApplyDate && new Date() > new Date(drive.lastApplyDate)) {
    throw new AppError('The application deadline for this drive has passed', 400)
  }

  const existing = await Application.findOne({ studentId: studentUserId, driveId })
  if (existing) throw new AppError('You have already applied to this drive', 409)

  await checkEligibility(studentUserId, drive)

  const application = await Application.create({
    studentId: studentUserId,
    driveId,
    status: 'applied',
    appliedAt: new Date(),
    statusHistory: [
      {
        status:    'applied',
        changedBy: studentUserId,
        changedAt: new Date(),
        note:      'Application submitted',
      },
    ],
  })

  // Increment drive applicant count
  await Drive.findByIdAndUpdate(driveId, { $inc: { totalApplicants: 1 } })

  const populated = await application
    .populate('studentId', 'name email')
    .then((a) => a.populate('driveId', 'title company'))

  return populated
}

const getApplicationsForDrive = async (driveId, queryParams) => {
  const page  = parseInt(queryParams.page)  || 1
  const limit = parseInt(queryParams.limit) || 30
  const skip  = (page - 1) * limit

  const filter = { driveId }
  if (queryParams.status) filter.status = queryParams.status

  if (queryParams.search) {
    const regex  = new RegExp(queryParams.search, 'i')
    const users  = await User.find({ $or: [{ name: regex }, { email: regex }] }).select('_id')
    filter.studentId = { $in: users.map((u) => u._id) }
  }

  const total        = await Application.countDocuments(filter)
  const applications = await Application.find(filter)
    .populate('studentId', 'name email')
    .populate('driveId',   'title company')
    .populate('lastUpdatedBy', 'name')
    .sort({ appliedAt: -1 })
    .skip(skip)
    .limit(limit)

  // Attach student profiles
  const enriched = await Promise.all(
    applications.map(async (app) => {
      const profile = await StudentProfile.findOne({ userId: app.studentId._id })
        .select('rollNumber branch batch cgpa activeBacklogs resumeUrl')
      return { ...app.toObject(), studentProfile: profile }
    })
  )

  return {
    applications: enriched,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

const getAllApplications = async (queryParams) => {
  const page  = parseInt(queryParams.page)  || 1
  const limit = parseInt(queryParams.limit) || 20
  const skip  = (page - 1) * limit

  const filter = {}
  if (queryParams.status)  filter.status  = queryParams.status
  if (queryParams.driveId) filter.driveId = queryParams.driveId

  const total        = await Application.countDocuments(filter)
  const applications = await Application.find(filter)
    .populate('studentId', 'name email')
    .populate('driveId',   'title company status')
    .populate('lastUpdatedBy', 'name')
    .sort({ appliedAt: -1 })
    .skip(skip)
    .limit(limit)

  return {
    applications,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

const getMyApplications = async (studentUserId, queryParams) => {
  const page  = parseInt(queryParams.page)  || 1
  const limit = parseInt(queryParams.limit) || 20
  const skip  = (page - 1) * limit

  const filter = { studentId: studentUserId }
  if (queryParams.status) filter.status = queryParams.status

  const total        = await Application.countDocuments(filter)
  const applications = await Application.find(filter)
    .populate('driveId', 'title company type salaryLPA status driveDate jobRole jobLocation')
    .sort({ appliedAt: -1 })
    .skip(skip)
    .limit(limit)

  return {
    applications,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

const getApplicationById = async (applicationId) => {
  const application = await Application.findById(applicationId)
    .populate('studentId',   'name email')
    .populate('driveId',     'title company status')
    .populate('currentRound', 'name roundNumber type scheduledAt')
    .populate('lastUpdatedBy', 'name')

  if (!application) throw new AppError('Application not found', 404)
  return application
}

const updateApplicationStatus = async (applicationId, newStatus, officerId, note = '') => {
  const application = await Application.findById(applicationId)
  if (!application) throw new AppError('Application not found', 404)

  validateStatusTransition(application.status, newStatus, 'officer')

  const previousStatus  = application.status
  application.status    = newStatus
  application.lastUpdatedBy = officerId

  if (note) application.notes = note

  application.statusHistory.push({
    status:    newStatus,
    changedBy: officerId,
    changedAt: new Date(),
    note:      note || `Status changed from ${previousStatus} to ${newStatus}`,
  })

  await application.save()

  // If placed — update student placement status and drive placed count
  if (newStatus === 'placed') {
    const drive = await Drive.findById(application.driveId)
    const profile = await StudentProfile.findOne({ userId: application.studentId })

    if (profile) {
      profile.placementStatus = 'placed'
      profile.placedAt        = drive?.company || 'Unknown'
      await profile.save()
    }

    await Drive.findByIdAndUpdate(application.driveId, { $inc: { totalPlaced: 1 } })
  }

  // If un-placed via rejection after placed — reverse
  if (previousStatus === 'placed' && newStatus === 'rejected') {
    const profile = await StudentProfile.findOne({ userId: application.studentId })
    if (profile) {
      profile.placementStatus = 'not_placed'
      profile.placedAt        = null
      await profile.save()
    }
    await Drive.findByIdAndUpdate(application.driveId, {
      $inc: { totalPlaced: -1 },
    })
  }

  return application
}

const withdrawApplication = async (applicationId, studentUserId) => {
  const application = await Application.findById(applicationId)
  if (!application) throw new AppError('Application not found', 404)

  if (application.studentId.toString() !== studentUserId) {
    throw new AppError('You can only withdraw your own application', 403)
  }

  validateStatusTransition(application.status, 'withdrawn', 'student')

  application.status = 'withdrawn'
  application.statusHistory.push({
    status:    'withdrawn',
    changedBy: studentUserId,
    changedAt: new Date(),
    note:      'Application withdrawn by student',
  })

  await application.save()
  await Drive.findByIdAndUpdate(application.driveId, { $inc: { totalApplicants: -1 } })

  return application
}

const getApplicationStats = async (driveId) => {
  const match = driveId ? { driveId: new (require('mongoose').Types.ObjectId)(driveId) } : {}

  const stats = await Application.aggregate([
    { $match: match },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ])

  const result = {
    applied: 0, shortlisted: 0, in_rounds: 0,
    placed: 0, rejected: 0, withdrawn: 0, total: 0,
  }

  stats.forEach((s) => {
    result[s._id] = s.count
    result.total += s.count
  })

  return result
}

const checkIfApplied = async (studentUserId, driveId) => {
  const application = await Application.findOne({
    studentId: studentUserId,
    driveId,
  })
  return application
}

module.exports = {
  applyToDrive,
  getApplicationsForDrive,
  getAllApplications,
  getMyApplications,
  getApplicationById,
  updateApplicationStatus,
  withdrawApplication,
  getApplicationStats,
  checkIfApplied,
}