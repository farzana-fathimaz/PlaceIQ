const Settings   = require('../models/Settings')
const AppError   = require('../utils/AppError')
const { validateSettings } = require('../validators/settings.validator')

const getSettings = async () => {
  const settings = await Settings.findOne()
  return settings
}

const createSettings = async (data) => {
  validateSettings(data)

  const existing = await Settings.findOne()
  if (existing) {
    throw new AppError(
      'Settings already exist. Use PUT to update them.',
      409
    )
  }

  const settings = await Settings.create({
    ...data,
    isSetupComplete: true,
  })

  return settings
}

const updateSettings = async (data) => {
  validateSettings(data)

  let settings = await Settings.findOne()

  if (!settings) {
    settings = await Settings.create({
      ...data,
      isSetupComplete: true,
    })
    return settings
  }

  Object.assign(settings, data)
  settings.isSetupComplete = true
  await settings.save()

  return settings
}

const updateLogo = async (logoUrl) => {
  let settings = await Settings.findOne()
  if (!settings) throw new AppError('Settings not found. Complete setup first.', 404)

  settings.logo = logoUrl
  await settings.save()
  return settings
}

const addBatch = async (batch) => {
  if (!batch || typeof batch !== 'string') {
    throw new AppError('Batch is required', 400)
  }

  const trimmed  = batch.trim()
  const settings = await Settings.findOne()
  if (!settings) throw new AppError('Settings not found', 404)

  if (settings.batches.includes(trimmed)) {
    throw new AppError('Batch already exists', 409)
  }

  settings.batches.push(trimmed)
  await settings.save()
  return settings
}

const removeBatch = async (batch) => {
  const settings = await Settings.findOne()
  if (!settings) throw new AppError('Settings not found', 404)

  settings.batches = settings.batches.filter((b) => b !== batch)
  await settings.save()
  return settings
}

const isSetupComplete = async () => {
  const settings = await Settings.findOne()
  return !!(settings && settings.isSetupComplete)
}

module.exports = {
  getSettings,
  createSettings,
  updateSettings,
  updateLogo,
  addBatch,
  removeBatch,
  isSetupComplete,
}