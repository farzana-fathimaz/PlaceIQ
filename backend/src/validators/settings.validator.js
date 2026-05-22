const AppError = require('../utils/AppError')
const { BRANCHES } = require('../utils/constants')

const validateSettings = (data) => {
  if (!data.collegeName || data.collegeName.trim().length < 2) {
    throw new AppError('College name must be at least 2 characters', 400)
  }

  if (data.contactEmail && !/^\S+@\S+\.\S+$/.test(data.contactEmail)) {
    throw new AppError('Please provide a valid contact email', 400)
  }

  if (data.branches && data.branches.length > 0) {
    const invalid = data.branches.filter((b) => !BRANCHES.includes(b))
    if (invalid.length > 0) {
      throw new AppError(`Invalid branches: ${invalid.join(', ')}`, 400)
    }
  }

  if (data.defaultEligibility) {
    const e = data.defaultEligibility
    if (e.minCGPA !== undefined && (e.minCGPA < 0 || e.minCGPA > 10)) {
      throw new AppError('Default min CGPA must be between 0 and 10', 400)
    }
    if (e.maxBacklogs !== undefined && e.maxBacklogs < 0) {
      throw new AppError('Default max backlogs cannot be negative', 400)
    }
  }
}

module.exports = { validateSettings }