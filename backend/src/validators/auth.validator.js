const AppError = require('../utils/AppError')

const validateRegister = (data) => {
  const { name, email, password, role } = data

  if (!name || name.trim().length < 2) {
    throw new AppError('Name must be at least 2 characters', 400)
  }

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    throw new AppError('Please provide a valid email', 400)
  }

  if (!password || password.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400)
  }

  if (role && !['officer', 'student'].includes(role)) {
    throw new AppError('Invalid role', 400)
  }
}

const validateLogin = (data) => {
  const { email, password } = data

  if (!email || !password) {
    throw new AppError('Email and password are required', 400)
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new AppError('Please provide a valid email', 400)
  }
}

module.exports = { validateRegister, validateLogin }