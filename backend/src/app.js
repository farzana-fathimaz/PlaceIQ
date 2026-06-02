require('express-async-errors')
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const cookieParser = require('cookie-parser')

const corsOptions = require('./config/corsOptions')
const { defaultLimiter } = require('./middleware/rateLimiter')
const requestLogger = require('./middleware/requestLogger')
const errorHandler = require('./middleware/errorHandler')
const notFound = require('./middleware/notFound')
const apiRoutes = require('./routes/index')

const app = express()

app.set('trust proxy', 1)

// Security headers
app.use(helmet())

// CORS
app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

// Compression
app.use(compression())

// Body parsers
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Cookie parser
app.use(cookieParser(process.env.COOKIE_SECRET))
const path = require('path')
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Request logging
app.use(requestLogger)

// Rate limiting on all API routes
app.use('/api', defaultLimiter)

// API routes — all versioned under /api/v1
app.use('/api/v1', apiRoutes)

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'PlaceIQ API',
    version: '1.0.0',
    docs: '/api/v1/health',
  })
})

// 404 handler — must be after all routes
app.use(notFound)

// Global error handler — must be last
app.use(errorHandler)

module.exports = app