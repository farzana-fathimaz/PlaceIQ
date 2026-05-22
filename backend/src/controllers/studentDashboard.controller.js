const { getStudentDashboard } = require('../services/studentDashboard.service')
const ApiResponse             = require('../utils/ApiResponse')

const getDashboard = async (req, res) => {
  const data = await getStudentDashboard(req.user.id)
  return ApiResponse.success(res, data, 'Dashboard data fetched')
}

module.exports = { getDashboard }