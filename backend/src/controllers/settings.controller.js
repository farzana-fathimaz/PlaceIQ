const settingsService = require('../services/settings.service')
const ApiResponse     = require('../utils/ApiResponse')
const AppError        = require('../utils/AppError')
const path            = require('path')

const getSettings = async (req, res) => {
  const settings = await settingsService.getSettings()
  return ApiResponse.success(
    res,
    { settings, isSetupComplete: !!(settings?.isSetupComplete) },
    settings ? 'Settings fetched' : 'Settings not configured yet'
  )
}

const createSettings = async (req, res) => {
  const settings = await settingsService.createSettings(req.body)
  return ApiResponse.created(res, { settings }, 'Settings created successfully')
}

const updateSettings = async (req, res) => {
  const settings = await settingsService.updateSettings(req.body)
  return ApiResponse.success(res, { settings }, 'Settings updated successfully')
}

const uploadLogo = async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400)

  const logoUrl  = `/uploads/${req.file.filename}`
  const settings = await settingsService.updateLogo(logoUrl)

  return ApiResponse.success(res, { logoUrl, settings }, 'Logo uploaded successfully')
}

const addBatch = async (req, res) => {
  const { batch } = req.body
  if (!batch) throw new AppError('Batch value is required', 400)

  const settings = await settingsService.addBatch(batch)
  return ApiResponse.success(res, { settings }, `Batch ${batch} added`)
}

const removeBatch = async (req, res) => {
  const { batch } = req.params
  const settings  = await settingsService.removeBatch(batch)
  return ApiResponse.success(res, { settings }, `Batch ${batch} removed`)
}

const checkSetup = async (req, res) => {
  const complete = await settingsService.isSetupComplete()
  return ApiResponse.success(res, { isSetupComplete: complete }, 'Setup status checked')
}

module.exports = {
  getSettings,
  createSettings,
  updateSettings,
  uploadLogo,
  addBatch,
  removeBatch,
  checkSetup,
}