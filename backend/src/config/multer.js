const multer = require('multer')
const path = require('path')
const AppError = require('../utils/AppError')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'))
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${unique}${path.extname(file.originalname)}`)
  },
})

const csvFilter = (req, file, cb) => {
  if (
    file.mimetype === 'text/csv' ||
    file.mimetype === 'application/vnd.ms-excel' ||
    file.originalname.endsWith('.csv')
  ) {
    cb(null, true)
  } else {
    cb(new AppError('Only CSV files are allowed', 400), false)
  }
}

const resumeFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true)
  } else {
    cb(new AppError('Only PDF files are allowed for resume', 400), false)
  }
}

const imageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new AppError('Only image files are allowed (JPEG, PNG, WebP, SVG)', 400), false)
  }
}

const uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
})

const uploadCSV = multer({
  storage,
  fileFilter: csvFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
})

const uploadResume = multer({
  storage,
  fileFilter: resumeFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
})

module.exports = { uploadCSV, uploadResume, uploadImage }