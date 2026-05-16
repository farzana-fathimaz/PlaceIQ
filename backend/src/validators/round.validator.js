const AppError = require('../utils/AppError')
const { ROUND_TYPES, ROUND_STATUS } = require('../utils/constants')

const validateCreateRound = (data) => {
  if (!data.name || data.name.trim().length < 2) {
    throw new AppError('Round name must be at least 2 characters', 400)
  }

  if (!data.type || !ROUND_TYPES.includes(data.type)) {
    throw new AppError(`Round type must be one of: ${ROUND_TYPES.join(', ')}`, 400)
  }

  if (!data.driveId) {
    throw new AppError('Drive ID is required', 400)
  }
}

const validateStatusTransition = (current, next) => {
  const allowed = {
    scheduled: ['ongoing', 'completed'],
    ongoing:   ['completed'],
    completed: [],
  }

  if (!allowed[current]?.includes(next)) {
    throw new AppError(
      `Cannot move round from '${current}' to '${next}'`,
      400
    )
  }
}

module.exports = { validateCreateRound, validateStatusTransition }