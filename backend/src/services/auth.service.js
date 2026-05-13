const User = require('../models/User')
const AppError = require('../utils/AppError')
const { generateTokens } = require('../utils/jwt')

const saveRefreshToken = async (userId, refreshToken) => {
  await User.findByIdAndUpdate(userId, { refreshToken })
}

const registerUser = async ({ name, email, password, role = 'student' }) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() })
  if (existingUser) {
    throw new AppError('An account with this email already exists', 409)
  }

  const user = await User.create({ name, email, password, role })

  const payload = { id: user._id, role: user.role }
  const { accessToken, refreshToken } = generateTokens(payload)

  await saveRefreshToken(user._id, refreshToken)

  return { user, accessToken, refreshToken }
}

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password')

  if (!user) {
    throw new AppError('Invalid email or password', 401)
  }

  if (!user.password) {
    throw new AppError('This account uses Google Sign-In. Please log in with Google.', 401)
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Contact admin.', 403)
  }

  const isMatch = await user.comparePassword(password)
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401)
  }

  const payload = { id: user._id, role: user.role }
  const { accessToken, refreshToken } = generateTokens(payload)

  await saveRefreshToken(user._id, refreshToken)

  return { user, accessToken, refreshToken }
}

const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null })
}

const refreshUserToken = async (incomingRefreshToken) => {
  const { verifyRefreshToken } = require('../utils/jwt')

  let decoded
  try {
    decoded = verifyRefreshToken(incomingRefreshToken)
  } catch (err) {
    throw new AppError('Invalid or expired refresh token', 401)
  }

  const user = await User.findById(decoded.id).select('+refreshToken')
  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw new AppError('Refresh token mismatch. Please log in again.', 401)
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated.', 403)
  }

  const payload = { id: user._id, role: user.role }
  const { generateTokens } = require('../utils/jwt')
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(payload)

  await saveRefreshToken(user._id, newRefreshToken)

  return { user, accessToken, refreshToken: newRefreshToken }
}

const findOrCreateGoogleUser = async ({ googleId, email, name, avatar }) => {
  let user = await User.findOne({ email: email.toLowerCase() })

  if (user) {
    if (!user.googleId) {
      user.googleId = googleId
      if (!user.avatar) user.avatar = avatar
      await user.save({ validateBeforeSave: false })
    }
  } else {
    user = await User.create({
      name,
      email,
      googleId,
      avatar,
      role: 'student',
      isActive: true,
    })
  }

  const payload = { id: user._id, role: user.role }
  const { generateTokens } = require('../utils/jwt')
  const { accessToken, refreshToken } = generateTokens(payload)

  await saveRefreshToken(user._id, refreshToken)

  return { user, accessToken, refreshToken }
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshUserToken,
  findOrCreateGoogleUser,
}