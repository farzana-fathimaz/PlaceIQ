const AppError = require('../utils/AppError')
const { verifyAccessToken } = require('../utils/jwt')
const User = require('../models/User')

const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return next(
      new AppError(
        'You are not logged in. Please log in to access this.',
        401
      )
    )
  }

  let decoded

  try {
    decoded = verifyAccessToken(token)
  } catch (error) {
    return next(new AppError('Invalid or expired token.', 401))
  }

  const user = await User.findById(decoded.id)

  if (!user) {
    return next(new AppError('User no longer exists.', 401))
  }

  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated.', 403))
  }

  req.user = {
    id: user._id.toString(),
    role: user.role,
    email: user.email
  }

  next()
}

module.exports = protect