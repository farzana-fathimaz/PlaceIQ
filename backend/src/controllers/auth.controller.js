const authService = require('../services/auth.service')
const ApiResponse = require('../utils/ApiResponse')
const AppError = require('../utils/AppError')
const { validateRegister, validateLogin } = require('../validators/auth.validator')
const {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  getRefreshTokenFromCookie,
} = require('../utils/Cookie')

const register = async (req, res) => {
  validateRegister(req.body)

  const { name, email, password, role } = req.body

  // Only allow officer role if no officer exists yet
  if (role === 'officer') {
    const User = require('../models/User')
    const officerExists = await User.findOne({ role: 'officer' })
    if (officerExists) {
      throw new AppError('An officer account already exists for this system.', 403)
    }
  }

  const { user, accessToken, refreshToken } = await authService.registerUser({
    name,
    email,
    password,
    role: role || 'student',
  })

  setRefreshTokenCookie(res, refreshToken)

  return ApiResponse.created(res, { user, accessToken }, 'Account created successfully')
}

const login = async (req, res) => {
  validateLogin(req.body)

  const { email, password } = req.body

  const { user, accessToken, refreshToken } = await authService.loginUser({ email, password })

  setRefreshTokenCookie(res, refreshToken)

  return ApiResponse.success(res, { user, accessToken }, 'Logged in successfully')
}

const logout = async (req, res) => {
  const userId = req.user?.id

  if (userId) {
    await authService.logoutUser(userId)
  }

  clearRefreshTokenCookie(res)

  return ApiResponse.success(res, {}, 'Logged out successfully')
}

const refresh = async (req, res) => {
  const incomingRefreshToken = getRefreshTokenFromCookie(req)

  if (!incomingRefreshToken) {
    throw new AppError('No refresh token provided', 401)
  }

  const { user, accessToken, refreshToken } = await authService.refreshUserToken(
    incomingRefreshToken
  )

  setRefreshTokenCookie(res, refreshToken)

  return ApiResponse.success(res, { user, accessToken }, 'Token refreshed')
}

const getMe = async (req, res) => {
  const User = require('../models/User')
  const user = await User.findById(req.user.id)

  if (!user || !user.isActive) {
    throw new AppError('User not found or deactivated', 404)
  }

  return ApiResponse.success(res, { user }, 'User fetched successfully')
}

const googleCallback = async (req, res) => {
  const { user, accessToken, refreshToken } = req.user

  setRefreshTokenCookie(res, refreshToken)

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'

  res.redirect(
    `${clientUrl}/auth/google/success?token=${accessToken}&role=${user.role}`
  )
}

module.exports = { register, login, logout, refresh, getMe, googleCallback }