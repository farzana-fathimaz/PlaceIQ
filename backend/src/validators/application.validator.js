const AppError = require('../utils/AppError')
const { APPLICATION_STATUS } = require('../utils/constants')

const VALID_OFFICER_TRANSITIONS = {
  applied:     ['shortlisted', 'rejected'],
  shortlisted: ['in_rounds', 'rejected'],
  in_rounds:   ['placed', 'rejected'],
  placed:      [],
  rejected:    [],
  withdrawn:   [],
}

const validateStatusTransition = (currentStatus, newStatus, role) => {
  if (role === 'student') {
    if (newStatus !== 'withdrawn') {
      throw new AppError('Students can only withdraw their application', 403)
    }
    if (!['applied', 'shortlisted'].includes(currentStatus)) {
      throw new AppError('You can only withdraw before shortlisting is finalised', 400)
    }
    return
  }

  const allowed = VALID_OFFICER_TRANSITIONS[currentStatus] || []
  if (!allowed.includes(newStatus)) {
    throw new AppError(
      `Cannot move application from '${currentStatus}' to '${newStatus}'`,
      400
    )
  }
}

const validateApply = (data) => {
  if (!data.driveId) throw new AppError('Drive ID is required', 400)
}

module.exports = { validateStatusTransition, validateApply }