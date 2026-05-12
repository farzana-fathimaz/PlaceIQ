require('dotenv').config()
const validateEnv = require('./config/env')
const app = require('./app')
const connectDB = require('./config/db')

validateEnv()

const PORT = process.env.PORT || 5000

const startServer = async () => {
  await connectDB()

  const server = app.listen(PORT, () => {
    console.log('=========================================')
    console.log(`  PlaceIQ Backend`)
    console.log(`  Port     : ${PORT}`)
    console.log(`  Env      : ${process.env.NODE_ENV}`)
    console.log(`  Health   : http://localhost:${PORT}/api/v1/health`)
    console.log('=========================================')
  })

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION:', err.message)
    server.close(() => process.exit(1))
  })

  // Handle SIGTERM (Docker stop signal)
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...')
    server.close(() => {
      console.log('Server closed.')
      process.exit(0)
    })
  })

  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...')
    server.close(() => {
      console.log('Server closed.')
      process.exit(0)
    })
  })
}

startServer()