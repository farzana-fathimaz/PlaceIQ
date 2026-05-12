const mongoose = require('mongoose')

const MAX_RETRIES = 5
const RETRY_INTERVAL = 5000

let retries = 0

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    })

    console.log(`MongoDB connected: ${conn.connection.host}`)
    retries = 0

    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB error: ${err.message}`)
    })

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...')
      setTimeout(connectDB, RETRY_INTERVAL)
    })

  } catch (error) {
    retries += 1
    console.error(`MongoDB connection failed (attempt ${retries}): ${error.message}`)

    if (retries < MAX_RETRIES) {
      console.log(`Retrying in ${RETRY_INTERVAL / 1000}s...`)
      setTimeout(connectDB, RETRY_INTERVAL)
    } else {
      console.error('Max retries reached. Exiting.')
      process.exit(1)
    }
  }
}

module.exports = connectDB