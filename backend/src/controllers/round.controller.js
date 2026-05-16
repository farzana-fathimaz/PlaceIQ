const roundService = require('../services/round.service')
const ApiResponse  = require('../utils/ApiResponse')
const AppError     = require('../utils/AppError')

const getRoundsForDrive = async (req, res) => {
  const rounds = await roundService.getRoundsForDrive(req.params.driveId)
  return ApiResponse.success(res, { rounds }, 'Rounds fetched successfully')
}

const getRoundSummary = async (req, res) => {
  const summary = await roundService.getRoundSummary(req.params.driveId)
  return ApiResponse.success(res, { summary }, 'Summary fetched')
}

const getRoundById = async (req, res) => {
  const round = await roundService.getRoundById(req.params.id)
  return ApiResponse.success(res, { round }, 'Round fetched successfully')
}

const createRound = async (req, res) => {
  const round = await roundService.createRound(req.body)
  return ApiResponse.created(res, { round }, 'Round created successfully')
}

const updateRound = async (req, res) => {
  const round = await roundService.updateRound(req.params.id, req.body)
  return ApiResponse.success(res, { round }, 'Round updated successfully')
}

const updateRoundStatus = async (req, res) => {
  const { status } = req.body
  if (!status) throw new AppError('Status is required', 400)

  const round = await roundService.updateRoundStatus(req.params.id, status)
  return ApiResponse.success(res, { round }, `Round moved to ${status}`)
}

const deleteRound = async (req, res) => {
  await roundService.deleteRound(req.params.id)
  return ApiResponse.success(res, {}, 'Round deleted')
}

const markResults = async (req, res) => {
  const { results } = req.body
  if (!results || !Array.isArray(results)) {
    throw new AppError('Results array is required', 400)
  }

  const round = await roundService.markResults(req.params.id, results, req.user.id)
  return ApiResponse.success(res, { round }, 'Results saved successfully')
}

const addStudentsToRound = async (req, res) => {
  const { applicationIds } = req.body
  if (!applicationIds || !Array.isArray(applicationIds)) {
    throw new AppError('applicationIds array is required', 400)
  }

  const round = await roundService.addStudentsToRound(req.params.id, applicationIds)
  return ApiResponse.success(res, { round }, 'Students added to round')
}

const getStudentRoundStatus = async (req, res) => {
  const result = await roundService.getStudentRoundStatus(
    req.user.id,
    req.params.driveId
  )
  return ApiResponse.success(res, { roundStatus: result }, 'Round status fetched')
}

module.exports = {
  getRoundsForDrive,
  getRoundSummary,
  getRoundById,
  createRound,
  updateRound,
  updateRoundStatus,
  deleteRound,
  markResults,
  addStudentsToRound,
  getStudentRoundStatus,
}