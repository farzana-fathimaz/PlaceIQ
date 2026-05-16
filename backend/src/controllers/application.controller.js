const applicationService = require('../services/application.service')
const ApiResponse        = require('../utils/ApiResponse')
const AppError           = require('../utils/AppError')

const apply = async (req, res) => {
  const { driveId } = req.body
  if (!driveId) throw new AppError('Drive ID is required', 400)

  const application = await applicationService.applyToDrive(req.user.id, driveId)
  return ApiResponse.created(res, { application }, 'Application submitted successfully')
}

const getApplicationsForDrive = async (req, res) => {
  const result = await applicationService.getApplicationsForDrive(
    req.params.driveId,
    req.query
  )
  return ApiResponse.success(res, result, 'Applications fetched successfully')
}

const getAllApplications = async (req, res) => {
  const result = await applicationService.getAllApplications(req.query)
  return ApiResponse.success(res, result, 'Applications fetched successfully')
}

const getMyApplications = async (req, res) => {
  const result = await applicationService.getMyApplications(req.user.id, req.query)
  return ApiResponse.success(res, result, 'Your applications fetched successfully')
}

const getApplicationById = async (req, res) => {
  const application = await applicationService.getApplicationById(req.params.id)

  if (
    req.user.role === 'student' &&
    application.studentId._id.toString() !== req.user.id
  ) {
    throw new AppError('Access denied', 403)
  }

  return ApiResponse.success(res, { application }, 'Application fetched')
}

const updateApplicationStatus = async (req, res) => {
  const { status, note } = req.body
  if (!status) throw new AppError('Status is required', 400)

  const application = await applicationService.updateApplicationStatus(
    req.params.id,
    status,
    req.user.id,
    note || ''
  )

  return ApiResponse.success(res, { application }, `Application ${status} successfully`)
}

const withdrawApplication = async (req, res) => {
  const application = await applicationService.withdrawApplication(
    req.params.id,
    req.user.id
  )
  return ApiResponse.success(res, { application }, 'Application withdrawn successfully')
}

const getApplicationStats = async (req, res) => {
  const driveId = req.query.driveId || null
  const stats   = await applicationService.getApplicationStats(driveId)
  return ApiResponse.success(res, { stats }, 'Stats fetched successfully')
}

const checkIfApplied = async (req, res) => {
  const application = await applicationService.checkIfApplied(
    req.user.id,
    req.params.driveId
  )
  return ApiResponse.success(
    res,
    { applied: !!application, application: application || null },
    'Check complete'
  )
}

module.exports = {
  apply,
  getApplicationsForDrive,
  getAllApplications,
  getMyApplications,
  getApplicationById,
  updateApplicationStatus,
  withdrawApplication,
  getApplicationStats,
  checkIfApplied,
}