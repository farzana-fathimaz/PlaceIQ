const User = require('../models/User')
const StudentProfile = require('../models/StudentProfile')
const AppError = require('../utils/AppError')
const fs = require('fs')
const csv = require('csv-parser')
const bcrypt = require('bcryptjs')

const buildStudentQuery = (queryParams) => {
  const filter = {}

  if (queryParams.branch) filter.branch = queryParams.branch
  if (queryParams.batch) filter.batch = queryParams.batch
  if (queryParams.placementStatus) filter.placementStatus = queryParams.placementStatus
  if (queryParams.gender) filter.gender = queryParams.gender

  if (queryParams.minCGPA || queryParams.maxCGPA) {
    filter.cgpa = {}
    if (queryParams.minCGPA) filter.cgpa.$gte = parseFloat(queryParams.minCGPA)
    if (queryParams.maxCGPA) filter.cgpa.$lte = parseFloat(queryParams.maxCGPA)
  }

  if (queryParams.maxBacklogs !== undefined) {
    filter.activeBacklogs = { $lte: parseInt(queryParams.maxBacklogs) }
  }

  return filter
}

const getAllStudents = async (queryParams) => {
  const page = parseInt(queryParams.page) || 1
  const limit = parseInt(queryParams.limit) || 20
  const skip = (page - 1) * limit

  const profileFilter = buildStudentQuery(queryParams)

  let userFilter = { role: 'student', isActive: true }

  if (queryParams.search) {
    const regex = new RegExp(queryParams.search, 'i')
    const matchingUsers = await User.find({
      role: 'student',
      $or: [{ name: regex }, { email: regex }],
    }).select('_id')

    const matchingProfiles = await StudentProfile.find({
      $or: [{ rollNumber: regex }],
    }).select('userId')

    const userIds = [
      ...matchingUsers.map((u) => u._id.toString()),
      ...matchingProfiles.map((p) => p.userId.toString()),
    ]

    userFilter._id = { $in: [...new Set(userIds)] }
  }

  const matchingUsers = await User.find(userFilter).select('_id')
  const userIds = matchingUsers.map((u) => u._id)

  profileFilter.userId = { $in: userIds }

  const total = await StudentProfile.countDocuments(profileFilter)

  const profiles = await StudentProfile.find(profileFilter)
    .populate('userId', 'name email avatar isActive createdAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

  return {
    students: profiles,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
}

const getStudentById = async (studentId) => {
  const profile = await StudentProfile.findById(studentId).populate(
    'userId',
    'name email avatar isActive createdAt'
  )

  if (!profile) throw new AppError('Student not found', 404)

  return profile
}

const getStudentByUserId = async (userId) => {
  const profile = await StudentProfile.findOne({ userId }).populate(
    'userId',
    'name email avatar isActive createdAt'
  )

  if (!profile) throw new AppError('Student profile not found', 404)

  return profile
}

const createStudent = async ({ name, email, password, profileData }) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() })
  if (existingUser) throw new AppError('Email already registered', 409)

  const existingRoll = await StudentProfile.findOne({
    rollNumber: profileData.rollNumber.toUpperCase(),
  })
  if (existingRoll) throw new AppError('Roll number already exists', 409)

  const user = await User.create({
    name,
    email,
    password,
    role: 'student',
  })

  const profile = await StudentProfile.create({
    userId: user._id,
    ...profileData,
    rollNumber: profileData.rollNumber.toUpperCase(),
  })

  const populated = await profile.populate('userId', 'name email avatar isActive createdAt')

  return populated
}

const updateStudentProfile = async (studentId, updateData, requestingUserId, requestingRole) => {
  const profile = await StudentProfile.findById(studentId)
  if (!profile) throw new AppError('Student not found', 404)

  if (requestingRole === 'student') {
    if (profile.userId.toString() !== requestingUserId) {
      throw new AppError('You can only update your own profile', 403)
    }
    const restrictedFields = ['rollNumber', 'batch', 'placementStatus', 'placedAt', 'placedCTC']
    restrictedFields.forEach((field) => delete updateData[field])
  }

  Object.assign(profile, updateData)
  await profile.save()

  const populated = await profile.populate('userId', 'name email avatar isActive createdAt')
  return populated
}

const updateStudentByUserId = async (userId, updateData) => {
  const profile = await StudentProfile.findOne({ userId })
  if (!profile) throw new AppError('Profile not found', 404)

  const restrictedFields = ['rollNumber', 'placementStatus', 'placedAt', 'placedCTC', 'userId']
  restrictedFields.forEach((f) => delete updateData[f])

  Object.assign(profile, updateData)
  await profile.save()

  const populated = await profile.populate('userId', 'name email avatar isActive createdAt')
  return populated
}

const toggleStudentActive = async (studentId) => {
  const profile = await StudentProfile.findById(studentId).populate('userId')
  if (!profile) throw new AppError('Student not found', 404)

  const user = await User.findById(profile.userId._id)
  user.isActive = !user.isActive
  await user.save({ validateBeforeSave: false })

  return { isActive: user.isActive }
}

const updateResumeUrl = async (userId, resumeUrl) => {
  const profile = await StudentProfile.findOne({ userId })
  if (!profile) throw new AppError('Profile not found', 404)
  profile.resumeUrl = resumeUrl
  await profile.save()
  return profile
}

const bulkImportStudents = async (filePath) => {
  const results = []
  const errors = []
  const defaultPassword = await bcrypt.hash('Student@123', 12)

  const rows = await new Promise((resolve, reject) => {
    const data = []
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => data.push(row))
      .on('end', () => resolve(data))
      .on('error', reject)
  })

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNum = i + 2

    try {
      const required = ['name', 'email', 'rollNumber', 'branch', 'batch', 'cgpa']
      const missing = required.filter((f) => !row[f]?.trim())
      if (missing.length > 0) {
        errors.push({ row: rowNum, error: `Missing fields: ${missing.join(', ')}` })
        continue
      }

      const existingUser = await User.findOne({ email: row.email.toLowerCase() })
      if (existingUser) {
        errors.push({ row: rowNum, error: `Email ${row.email} already exists` })
        continue
      }

      const existingRoll = await StudentProfile.findOne({
        rollNumber: row.rollNumber.toUpperCase(),
      })
      if (existingRoll) {
        errors.push({ row: rowNum, error: `Roll number ${row.rollNumber} already exists` })
        continue
      }

      const user = new User({
        name: row.name.trim(),
        email: row.email.trim().toLowerCase(),
        password: row.password?.trim() || undefined,
        role: 'student',
      })

      if (!row.password) {
        user.password = 'Student@123'
      }

      await user.save()

      await StudentProfile.create({
        userId: user._id,
        rollNumber: row.rollNumber.trim().toUpperCase(),
        branch: row.branch.trim(),
        batch: row.batch.trim(),
        cgpa: parseFloat(row.cgpa),
        activeBacklogs: parseInt(row.activeBacklogs) || 0,
        totalBacklogs: parseInt(row.totalBacklogs) || 0,
        phone: row.phone?.trim() || undefined,
        gender: row.gender?.trim() || undefined,
        tenthPercent: row.tenthPercent ? parseFloat(row.tenthPercent) : undefined,
        twelfthPercent: row.twelfthPercent ? parseFloat(row.twelfthPercent) : undefined,
      })

      results.push({ row: rowNum, email: row.email, status: 'created' })
    } catch (err) {
      errors.push({ row: rowNum, error: err.message })
    }
  }

  try { fs.unlinkSync(filePath) } catch (_) {}

  return { created: results.length, failed: errors.length, errors }
}

const getStudentsForExport = async () => {
  const profiles = await StudentProfile.find()
    .populate('userId', 'name email isActive createdAt')
    .sort({ createdAt: 1 })

  return profiles
}

module.exports = {
  getAllStudents,
  getStudentById,
  getStudentByUserId,
  createStudent,
  updateStudentProfile,
  updateStudentByUserId,
  toggleStudentActive,
  updateResumeUrl,
  bulkImportStudents,
  getStudentsForExport,
}