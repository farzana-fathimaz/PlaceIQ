const morgan = require('morgan')

const skip = () => process.env.NODE_ENV === 'test'

const requestLogger = morgan('dev', { skip })

module.exports = requestLogger