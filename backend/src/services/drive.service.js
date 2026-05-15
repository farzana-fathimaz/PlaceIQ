const Drive = require('../models/Drive')
const StudentProfile = require('../models/StudentProfile')
const AppError = require('../utils/AppError')
const { validateStatusTransition } = require('../validators/drive.validator')

const getAllDrives = async (queryParams, role, userId) => {
  const page  = parseInt(queryParams.page)  || 1
  const limit = parseInt(queryParams.limit) || 20
  const skip  = (page - 1) * limit

  const filter = { isArchived: false }

  if (queryParams.status)  filter.status  = queryParams.status
  if (queryParams.type)    filter.type    = queryParams.type
  if (queryParams.company) filter.company = new RegExp(queryParams.company, 'i')

  if (queryParams.search) {
    const regex = new RegExp(queryParams.search, 'i')
    filter.$or = [{ title: regex }, { company: regex }, { jobRole: regex }]
  }

  if (queryParams.archived === 'true') {
    filter.isArchived = true
    delete filter.status
  }

  // Students only see active drives they are eligible for
  if (role === 'student') {
    filter.status = 'active'
    filter.isArchived = false

    const profile = await StudentProfile.findOne({ userId })
    if (profile) {
      filter['eligibility.allowedBranches'] = profile.branch
      filter['eligibility.minCGPA'] = { $lte: profile.cgpa }
      filter['eligibility.maxBacklogs'] = { $gte: profile.activeBacklogs }

      if (!queryParams.includeAll) {
        filter.$and = [
          {
            $or: [
              { 'eligibility.allowedBatches': { $size: 0 } },
              { 'eligibility.allowedBatches': profile.batch },
            ],
          },
        ]
      }

      if (profile.placementStatus === 'placed') {
        filter['eligibility.allowPlaced'] = true
      }
    }
  }

  const total  = await Drive.countDocuments(filter)
  const drives = await Drive.find(filter)
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

  return {
    drives,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

const getDriveById = async (driveId) => {
  const drive = await Drive.findById(driveId).populate('createdBy', 'name email')
  if (!drive) throw new AppError('Drive not found', 404)
  return drive
}

const createDrive = async (data, officerId) => {
  const drive = await Drive.create({
    ...data,
    createdBy: officerId,
    eligibility: data.eligibility || {},
  })
  return drive
}

const updateDrive = async (driveId, data) => {
  const drive = await Drive.findById(driveId)
  if (!drive) throw new AppError('Drive not found', 404)

  if (drive.status === 'archived') {
    throw new AppError('Cannot edit an archived drive', 400)
  }

  const protectedFields = ['status', 'totalApplicants', 'totalPlaced', 'rounds', 'createdBy']
  protectedFields.forEach((f) => delete data[f])

  Object.assign(drive, data)
  await drive.save()

  return drive
}

const updateDriveStatus = async (driveId, newStatus) => {
  const drive = await Drive.findById(driveId)
  if (!drive) throw new AppError('Drive not found', 404)

  validateStatusTransition(drive.status, newStatus)

  drive.status = newStatus
  if (newStatus === 'archived') drive.isArchived = true

  await drive.save()
  return drive
}

const deleteDrive = async (driveId) => {
  const drive = await Drive.findById(driveId)
  if (!drive) throw new AppError('Drive not found', 404)

  if (drive.totalApplicants > 0) {
    throw new AppError('Cannot delete a drive with applicants. Archive it instead.', 400)
  }

  await Drive.findByIdAndDelete(driveId)
}

const getEligibleStudents = async (driveId) => {
  const drive = await Drive.findById(driveId)
  if (!drive) throw new AppError('Drive not found', 404)

  const e = drive.eligibility

  const profileFilter = {
    cgpa:          { $gte: e.minCGPA || 0 },
    activeBacklogs: { $lte: e.maxBacklogs ?? 999 },
  }

  if (e.allowedBranches && e.allowedBranches.length > 0) {
    profileFilter.branch = { $in: e.allowedBranches }
  }

  if (e.allowedBatches && e.allowedBatches.length > 0) {
    profileFilter.batch = { $in: e.allowedBatches }
  }

  if (e.genderAllowed && e.genderAllowed !== 'All') {
    profileFilter.gender = e.genderAllowed
  }

  if (e.tenthMin)   profileFilter.tenthPercent  = { $gte: e.tenthMin }
  if (e.twelfthMin) profileFilter.twelfthPercent = { $gte: e.twelfthMin }

  if (!e.allowPlaced) {
    profileFilter.placementStatus = 'not_placed'
  }

  const profiles = await StudentProfile.find(profileFilter)
    .populate('userId', 'name email isActive')
    .sort({ cgpa: -1 })

  const activeProfiles = profiles.filter((p) => p.userId?.isActive)

  return { count: activeProfiles.length, students: activeProfiles }
}

const getDriveStats = async () => {
  const stats = await Drive.aggregate([
    { $match: { isArchived: false } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ])

  const result = { draft: 0, upcoming: 0, active: 0, closed: 0, archived: 0, total: 0 }

  stats.forEach((s) => {
    result[s._id] = s.count
    result.total += s.count
  })

  const archivedCount = await Drive.countDocuments({ isArchived: true })
  result.archived = archivedCount
  result.total += archivedCount

  return result
}

module.exports = {
  getAllDrives,
  getDriveById,
  createDrive,
  updateDrive,
  updateDriveStatus,
  deleteDrive,
  getEligibleStudents,
  getDriveStats,
}