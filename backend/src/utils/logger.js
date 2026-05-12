const morgan = require('morgan')
const fs = require('fs')
const path = require('path')

const logDir = path.join(__dirname, '../../logs')

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

const accessLogStream = fs.createWriteStream(
  path.join(logDir, 'access.log'),
  { flags: 'a' }
)

const devLogger = morgan('dev')
const prodLogger = morgan('combined', { stream: accessLogStream })

const getLogger = () => {
  return process.env.NODE_ENV === 'production' ? prodLogger : devLogger
}

module.exports = { getLogger }