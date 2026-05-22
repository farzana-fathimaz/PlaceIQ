const Application    = require('../models/Application')
const Drive          = require('../models/Drive')
const StudentProfile = require('../models/StudentProfile')
const Notification   = require('../models/Notification')
const RecruitmentRound = require('../models/RecruitmentRound')

const getStudentDashboard = async (userId) => {
  // Fetch profile
  const profile = await StudentProfile.findOne({ userId })
    .populate('userId', 'name email avatar createdAt')

  if (!profile) {
    return {
      hasProfile:      false,
      profile:         null,
      applications:    [],
      eligibleDrives:  [],
      notifications:   [],
      rounds:          [],
      stats:           null,
    }
  }

  // All applications by this student
  const applications = await Application.find({ studentId: userId })
    .populate('driveId', 'title company type salaryLPA status driveDate jobRole jobLocation lastApplyDate')
    .sort({ appliedAt: -1 })
    .limit(10)

  // Eligible active drives (not already applied)
  const appliedDriveIds = applications.map((a) => a.driveId?._id?.toString())

  const e = profile
  const eligibleFilter = {
    status:                        'active',
    isArchived:                    false,
    'eligibility.minCGPA':         { $lte: e.cgpa },
    'eligibility.maxBacklogs':     { $gte: e.activeBacklogs },
    'eligibility.allowedBranches': e.branch,
  }

  if (e.placementStatus === 'placed') {
    eligibleFilter['eligibility.allowPlaced'] = true
  }

  const allEligible = await Drive.find(eligibleFilter)
    .sort({ lastApplyDate: 1 })
    .limit(5)

  // Filter out drives already applied to
  const eligibleDrives = allEligible.filter(
    (d) => !appliedDriveIds.includes(d._id.toString())
  )

  // Rounds for in-progress applications
  const inRoundApps = applications.filter((a) => a.status === 'in_rounds')
  const roundData   = []

  for (const app of inRoundApps) {
    const rounds = await RecruitmentRound.find({ driveId: app.driveId?._id })
      .sort({ roundNumber: 1 })

    const studentRounds = rounds
      .map((r) => {
        const resultEntry = r.results.find(
          (res) => res.studentId.toString() === userId
        )
        if (!resultEntry) return null
        return {
          roundId:     r._id,
          name:        r.name,
          roundNumber: r.roundNumber,
          type:        r.type,
          scheduledAt: r.scheduledAt,
          venue:       r.venue,
          mode:        r.mode,
          instructions: r.instructions,
          roundStatus: r.status,
          result:      resultEntry.result,
          remarks:     resultEntry.remarks,
        }
      })
      .filter(Boolean)

    if (studentRounds.length > 0) {
      roundData.push({
        driveId:   app.driveId?._id,
        company:   app.driveId?.company,
        driveTitle: app.driveId?.title,
        rounds:    studentRounds,
      })
    }
  }

  // Recent notifications
  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(5)

  // Stats
  const totalApps      = await Application.countDocuments({ studentId: userId })
  const shortlisted    = await Application.countDocuments({ studentId: userId, status: 'shortlisted' })
  const inRoundsCount  = await Application.countDocuments({ studentId: userId, status: 'in_rounds' })
  const placedCount    = await Application.countDocuments({ studentId: userId, status: 'placed' })
  const unreadNotifs   = await Notification.countDocuments({ userId, isRead: false })

  // Profile completion percentage
  const profileFields = [
    profile.phone,
    profile.gender,
    profile.tenthPercent,
    profile.twelfthPercent,
    profile.resumeUrl,
    profile.skills?.length > 0,
    profile.cgpa,
    profile.branch,
    profile.rollNumber,
    profile.batch,
  ]
  const completedFields  = profileFields.filter(Boolean).length
  const profileCompletion = Math.round((completedFields / profileFields.length) * 100)

  return {
    hasProfile: true,
    profile,
    applications,
    eligibleDrives,
    roundData,
    notifications,
    stats: {
      totalApps,
      shortlisted,
      inRoundsCount,
      placedCount,
      unreadNotifs,
      profileCompletion,
      isPlaced:   profile.placementStatus === 'placed',
      placedAt:   profile.placedAt,
      placedCTC:  profile.placedCTC,
    },
  }
}

module.exports = { getStudentDashboard }