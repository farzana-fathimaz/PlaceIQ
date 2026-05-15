const driveService   = require('../services/drive.service')
const ApiResponse    = require('../utils/ApiResponse')
const AppError       = require('../utils/AppError')
const { validateCreateDrive } = require('../validators/drive.validator')

const getAllDrives = async (req, res) => {
  const result = await driveService.getAllDrives(req.query, req.user.role, req.user.id)
  return ApiResponse.success(res, result, 'Drives fetched successfully')
}

const getDriveById = async (req, res) => {
  const drive = await driveService.getDriveById(req.params.id)
  return ApiResponse.success(res, { drive }, 'Drive fetched successfully')
}

const createDrive = async (req, res) => {
  validateCreateDrive(req.body)
  const drive = await driveService.createDrive(req.body, req.user.id)
  return ApiResponse.created(res, { drive }, 'Drive created successfully')
}

const updateDrive = async (req, res) => {
  const drive = await driveService.updateDrive(req.params.id, req.body)
  return ApiResponse.success(res, { drive }, 'Drive updated successfully')
}

const updateDriveStatus = async (req, res) => {
  const { status } = req.body
  if (!status) throw new AppError('New status is required', 400)
  const drive = await driveService.updateDriveStatus(req.params.id, status)
  return ApiResponse.success(res, { drive }, `Drive status updated to ${status}`)
}

const deleteDrive = async (req, res) => {
  await driveService.deleteDrive(req.params.id)
  return ApiResponse.success(res, {}, 'Drive deleted successfully')
}

const getEligibleStudents = async (req, res) => {
  const result = await driveService.getEligibleStudents(req.params.id)
  return ApiResponse.success(res, result, 'Eligible students fetched successfully')
}

const getDriveStats = async (req, res) => {
  const stats = await driveService.getDriveStats()
  return ApiResponse.success(res, { stats }, 'Drive stats fetched successfully')
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