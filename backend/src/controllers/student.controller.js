const studentService = require('../services/student.service')
const ApiResponse = require('../utils/ApiResponse')
const AppError = require('../utils/AppError')
const path = require('path')
const ExcelJS = require('exceljs')

const getAllStudents = async (req, res) => {
  const result = await studentService.getAllStudents(req.query)
  return ApiResponse.success(res, result, 'Students fetched successfully')
}

const getStudentById = async (req, res) => {
  const profile = await studentService.getStudentById(req.params.id)
  return ApiResponse.success(res, { student: profile }, 'Student fetched successfully')
}

const getMyProfile = async (req, res) => {
  const profile = await studentService.getStudentByUserId(req.user.id)
  return ApiResponse.success(res, { student: profile }, 'Profile fetched successfully')
}

const createStudent = async (req, res) => {
  const { name, email, password = 'Student@123', ...profileData } = req.body

  if (!name || !email) throw new AppError('Name and email are required', 400)
  if (!profileData.rollNumber) throw new AppError('Roll number is required', 400)
  if (!profileData.branch) throw new AppError('Branch is required', 400)
  if (!profileData.batch) throw new AppError('Batch is required', 400)
  if (profileData.cgpa === undefined) throw new AppError('CGPA is required', 400)

  const student = await studentService.createStudent({ name, email, password, profileData })
  return ApiResponse.created(res, { student }, 'Student created successfully')
}

const updateStudent = async (req, res) => {
  const updated = await studentService.updateStudentProfile(
    req.params.id,
    req.body,
    req.user.id,
    req.user.role
  )
  return ApiResponse.success(res, { student: updated }, 'Student updated successfully')
}

const updateMyProfile = async (req, res) => {
  const updated = await studentService.updateStudentByUserId(req.user.id, req.body)
  return ApiResponse.success(res, { student: updated }, 'Profile updated successfully')
}

const toggleStudentActive = async (req, res) => {
  const result = await studentService.toggleStudentActive(req.params.id)
  const msg = result.isActive ? 'Student activated' : 'Student deactivated'
  return ApiResponse.success(res, result, msg)
}

const uploadResume = async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400)

  const resumeUrl = `/uploads/${req.file.filename}`
  const profile = await studentService.updateResumeUrl(req.user.id, resumeUrl)

  return ApiResponse.success(res, { resumeUrl }, 'Resume uploaded successfully')
}

const bulkImport = async (req, res) => {
  if (!req.file) throw new AppError('Please upload a CSV file', 400)

  const result = await studentService.bulkImportStudents(req.file.path)

  return ApiResponse.success(
    res,
    result,
    `Import complete: ${result.created} created, ${result.failed} failed`
  )
}

const exportStudents = async (req, res) => {
  const profiles = await studentService.getStudentsForExport()

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Students')

  sheet.columns = [
    { header: 'Name',             key: 'name',             width: 25 },
    { header: 'Email',            key: 'email',            width: 30 },
    { header: 'Roll Number',      key: 'rollNumber',       width: 15 },
    { header: 'Branch',           key: 'branch',           width: 10 },
    { header: 'Batch',            key: 'batch',            width: 12 },
    { header: 'CGPA',             key: 'cgpa',             width: 8  },
    { header: 'Active Backlogs',  key: 'activeBacklogs',   width: 15 },
    { header: 'Total Backlogs',   key: 'totalBacklogs',    width: 15 },
    { header: 'Gender',           key: 'gender',           width: 10 },
    { header: 'Phone',            key: 'phone',            width: 15 },
    { header: '10th %',           key: 'tenthPercent',     width: 10 },
    { header: '12th %',           key: 'twelfthPercent',   width: 10 },
    { header: 'Placement Status', key: 'placementStatus',  width: 18 },
    { header: 'Placed At',        key: 'placedAt',         width: 20 },
    { header: 'CTC (LPA)',        key: 'placedCTC',        width: 12 },
    { header: 'Status',           key: 'isActive',         width: 10 },
  ]

  sheet.getRow(1).font = { bold: true }
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE8F0FE' },
  }

  profiles.forEach((p) => {
    sheet.addRow({
      name:            p.userId?.name || '',
      email:           p.userId?.email || '',
      rollNumber:      p.rollNumber,
      branch:          p.branch,
      batch:           p.batch,
      cgpa:            p.cgpa,
      activeBacklogs:  p.activeBacklogs,
      totalBacklogs:   p.totalBacklogs,
      gender:          p.gender || '',
      phone:           p.phone || '',
      tenthPercent:    p.tenthPercent || '',
      twelfthPercent:  p.twelfthPercent || '',
      placementStatus: p.placementStatus,
      placedAt:        p.placedAt || '',
      placedCTC:       p.placedCTC || '',
      isActive:        p.userId?.isActive ? 'Active' : 'Inactive',
    })
  })

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', 'attachment; filename=students.xlsx')

  await workbook.xlsx.write(res)
  res.end()
}

module.exports = {
  getAllStudents,
  getStudentById,
  getMyProfile,
  createStudent,
  updateStudent,
  updateMyProfile,
  toggleStudentActive,
  uploadResume,
  bulkImport,
  exportStudents,
}