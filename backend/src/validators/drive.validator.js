const AppError = require('../utils/AppError')
const { DRIVE_TYPES, DRIVE_STATUS, BRANCHES } = require('../utils/constants')

const validateCreateDrive = (data) => {
  const { title, company, type } = data

  if (!title || title.trim().length < 2) {
    throw new AppError('Drive title must be at least 2 characters', 400)
  }

  if (!company || company.trim().length < 1) {
    throw new AppError('Company name is required', 400)
  }

  if (!type || !DRIVE_TYPES.includes(type)) {
    throw new AppError(`Drive type must be one of: ${DRIVE_TYPES.join(', ')}`, 400)
  }


  if (data.lastApplyDate && data.driveDate) {
    if (new Date(data.lastApplyDate) > new Date(data.driveDate)) {
      throw new AppError('Last apply date must be before drive date', 400)
    }
  }

  if (data.eligibility) {
    const e = data.eligibility
    if (e.minCGPA !== undefined && (e.minCGPA < 0 || e.minCGPA > 10)) {
      throw new AppError('Min CGPA must be between 0 and 10', 400)
    }
    if (e.allowedBranches && e.allowedBranches.length > 0) {
      const invalid = e.allowedBranches.filter((b) => !BRANCHES.includes(b))
      if (invalid.length > 0) {
        throw new AppError(`Invalid branches: ${invalid.join(', ')}`, 400)
      }
    }
  }
}

const validateStatusTransition = (currentStatus, newStatus) => {
  const allowed = {
    draft:    ['upcoming', 'archived'],
    upcoming: ['active', 'archived'],
    active:   ['closed', 'archived'],
    closed:   ['archived'],
    archived: [],
  }

  if (!allowed[currentStatus]?.includes(newStatus)) {
    throw new AppError(
      `Cannot transition drive from '${currentStatus}' to '${newStatus}'`,
      400
    )
  }
}

module.exports = { validateCreateDrive, validateStatusTransition }