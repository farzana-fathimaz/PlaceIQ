const Drive          = require('../models/Drive')
const Application    = require('../models/Application')
const StudentProfile = require('../models/StudentProfile')
const User           = require('../models/User')
const Notification   = require('../models/Notification')

const getSummary = async () => {
  const [
    totalStudents,
    totalPlaced,
    totalDrives,
    activeDrives,
    totalApplications,
    totalNotifications,
  ] = await Promise.all([
    StudentProfile.countDocuments(),
    StudentProfile.countDocuments({ placementStatus: 'placed' }),
    Drive.countDocuments(),
    Drive.countDocuments({ status: 'active', isArchived: false }),
    Application.countDocuments(),
    Notification.countDocuments(),
  ])

  const notPlaced       = totalStudents - totalPlaced
  const placementPct    = totalStudents > 0
    ? parseFloat(((totalPlaced / totalStudents) * 100).toFixed(1))
    : 0

  const avgCTCResult = await StudentProfile.aggregate([
    { $match: { placementStatus: 'placed', placedCTC: { $ne: null, $gt: 0 } } },
    { $group: { _id: null, avg: { $avg: '$placedCTC' }, max: { $max: '$placedCTC' } } },
  ])

  const avgCTC  = avgCTCResult[0]?.avg
    ? parseFloat(avgCTCResult[0].avg.toFixed(2))
    : 0
  const highCTC = avgCTCResult[0]?.max || 0

  const driveStats = await Drive.aggregate([
    { $group: {
      _id:   '$status',
      count: { $sum: 1 },
    }},
  ])

  const driveByStatus = { draft: 0, upcoming: 0, active: 0, closed: 0, archived: 0 }
  driveStats.forEach((d) => { driveByStatus[d._id] = d.count })

  const appStats = await Application.aggregate([
    { $group: {
      _id:   '$status',
      count: { $sum: 1 },
    }},
  ])

  const appByStatus = {
    applied: 0, shortlisted: 0, in_rounds: 0,
    placed: 0, rejected: 0, withdrawn: 0,
  }
  appStats.forEach((a) => { appByStatus[a._id] = a.count })

  return {
    totalStudents,
    totalPlaced,
    notPlaced,
    placementPct,
    avgCTC,
    highCTC,
    totalDrives,
    activeDrives,
    totalApplications,
    totalNotifications,
    driveByStatus,
    appByStatus,
  }
}

const getBranchWise = async () => {
  const branchStats = await StudentProfile.aggregate([
    {
      $group: {
        _id:       '$branch',
        total:     { $sum: 1 },
        placed:    { $sum: { $cond: [{ $eq: ['$placementStatus', 'placed'] }, 1, 0] } },
        avgCGPA:   { $avg: '$cgpa' },
        avgCTC:    {
          $avg: {
            $cond: [
              { $and: [{ $eq: ['$placementStatus', 'placed'] }, { $gt: ['$placedCTC', 0] }] },
              '$placedCTC',
              null,
            ],
          },
        },
        maxCTC: {
          $max: {
            $cond: [
              { $eq: ['$placementStatus', 'placed'] },
              '$placedCTC',
              0,
            ],
          },
        },
      },
    },
    { $sort: { placed: -1 } },
  ])

  return branchStats.map((b) => ({
    branch:    b._id,
    total:     b.total,
    placed:    b.placed,
    notPlaced: b.total - b.placed,
    pct:       b.total > 0
      ? parseFloat(((b.placed / b.total) * 100).toFixed(1))
      : 0,
    avgCGPA: parseFloat((b.avgCGPA || 0).toFixed(2)),
    avgCTC:  b.avgCTC ? parseFloat(b.avgCTC.toFixed(2)) : 0,
    maxCTC:  b.maxCTC || 0,
  }))
}

const getCompanyWise = async () => {
  const companyStats = await StudentProfile.aggregate([
    { $match: { placementStatus: 'placed', placedAt: { $ne: null } } },
    {
      $group: {
        _id:    '$placedAt',
        count:  { $sum: 1 },
        avgCTC: { $avg: { $cond: [{ $gt: ['$placedCTC', 0] }, '$placedCTC', null] } },
        maxCTC: { $max: '$placedCTC' },
        branches: { $addToSet: '$branch' },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 15 },
  ])

  return companyStats.map((c) => ({
    company:  c._id,
    count:    c.count,
    avgCTC:   c.avgCTC ? parseFloat(c.avgCTC.toFixed(2)) : 0,
    maxCTC:   c.maxCTC || 0,
    branches: c.branches || [],
  }))
}

const getDriveWise = async () => {
  const drives = await Drive.find({ status: { $ne: 'draft' } })
    .sort({ totalApplicants: -1 })
    .limit(20)
    .select('title company type salaryLPA totalApplicants totalPlaced status driveDate')

  return drives.map((d) => ({
    driveId:        d._id,
    title:          d.title,
    company:        d.company,
    type:           d.type,
    salaryLPA:      d.salaryLPA || 0,
    totalApplicants: d.totalApplicants,
    totalPlaced:    d.totalPlaced,
    conversionRate: d.totalApplicants > 0
      ? parseFloat(((d.totalPlaced / d.totalApplicants) * 100).toFixed(1))
      : 0,
    status:    d.status,
    driveDate: d.driveDate,
  }))
}

const getMonthlyTrend = async () => {
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11)
  twelveMonthsAgo.setDate(1)
  twelveMonthsAgo.setHours(0, 0, 0, 0)

  const [applicationTrend, placementTrend, driveTrend] = await Promise.all([
    Application.aggregate([
      { $match: { appliedAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year:  { $year:  '$appliedAt' },
            month: { $month: '$appliedAt' },
          },
          applications: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),

    Application.aggregate([
      { $match: { status: 'placed', updatedAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year:  { $year:  '$updatedAt' },
            month: { $month: '$updatedAt' },
          },
          placements: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),

    Drive.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo }, isArchived: false } },
      {
        $group: {
          _id: {
            year:  { $year:  '$createdAt' },
            month: { $month: '$createdAt' },
          },
          drives: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ])

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const months = []
  const now    = new Date()

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      year:         d.getFullYear(),
      month:        d.getMonth() + 1,
      label:        `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`,
      applications: 0,
      placements:   0,
      drives:       0,
    })
  }

  applicationTrend.forEach((item) => {
    const m = months.find(
      (m) => m.year === item._id.year && m.month === item._id.month
    )
    if (m) m.applications = item.applications
  })

  placementTrend.forEach((item) => {
    const m = months.find(
      (m) => m.year === item._id.year && m.month === item._id.month
    )
    if (m) m.placements = item.placements
  })

  driveTrend.forEach((item) => {
    const m = months.find(
      (m) => m.year === item._id.year && m.month === item._id.month
    )
    if (m) m.drives = item.drives
  })

  return months
}

const getCGPADistribution = async () => {
  const ranges = [
    { label: '9-10',  min: 9,   max: 10  },
    { label: '8-9',   min: 8,   max: 9   },
    { label: '7-8',   min: 7,   max: 8   },
    { label: '6-7',   min: 6,   max: 7   },
    { label: '5-6',   min: 5,   max: 6   },
    { label: 'Below 5', min: 0, max: 5   },
  ]

  const results = await Promise.all(
    ranges.map(async (r) => {
      const total  = await StudentProfile.countDocuments({ cgpa: { $gte: r.min, $lt: r.max } })
      const placed = await StudentProfile.countDocuments({
        cgpa: { $gte: r.min, $lt: r.max },
        placementStatus: 'placed',
      })
      return { label: r.label, total, placed, notPlaced: total - placed }
    })
  )

  return results
}

const getTopPerformers = async () => {
  const topPlaced = await StudentProfile.find({ placementStatus: 'placed' })
    .populate('userId', 'name email')
    .sort({ placedCTC: -1 })
    .limit(10)
    .select('rollNumber branch cgpa placedAt placedCTC batch')

  return topPlaced.map((p) => ({
    name:      p.userId?.name  || '',
    email:     p.userId?.email || '',
    rollNumber: p.rollNumber,
    branch:    p.branch,
    batch:     p.batch,
    cgpa:      p.cgpa,
    company:   p.placedAt  || '',
    ctc:       p.placedCTC || 0,
  }))
}

const getRecentActivity = async () => {
  const recentApps = await Application.find()
    .populate('studentId', 'name')
    .populate('driveId',   'title company')
    .sort({ updatedAt: -1 })
    .limit(8)
    .select('status updatedAt studentId driveId')

  const recentDrives = await Drive.find({ isArchived: false })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title company status createdAt totalApplicants')

  return {
    recentApplications: recentApps.map((a) => ({
      studentName: a.studentId?.name    || '',
      driveTitle:  a.driveId?.title     || '',
      company:     a.driveId?.company   || '',
      status:      a.status,
      updatedAt:   a.updatedAt,
    })),
    recentDrives: recentDrives.map((d) => ({
      title:       d.title,
      company:     d.company,
      status:      d.status,
      applicants:  d.totalApplicants,
      createdAt:   d.createdAt,
    })),
  }
}

module.exports = {
  getSummary,
  getBranchWise,
  getCompanyWise,
  getDriveWise,
  getMonthlyTrend,
  getCGPADistribution,
  getTopPerformers,
  getRecentActivity,
}