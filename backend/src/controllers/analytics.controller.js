const analyticsService = require('../services/analytics.service')
const ApiResponse      = require('../utils/ApiResponse')

const getSummary = async (req, res) => {
  const data = await analyticsService.getSummary()
  return ApiResponse.success(res, data, 'Summary fetched')
}

const getBranchWise = async (req, res) => {
  const data = await analyticsService.getBranchWise()
  return ApiResponse.success(res, { branches: data }, 'Branch-wise data fetched')
}

const getCompanyWise = async (req, res) => {
  const data = await analyticsService.getCompanyWise()
  return ApiResponse.success(res, { companies: data }, 'Company-wise data fetched')
}

const getDriveWise = async (req, res) => {
  const data = await analyticsService.getDriveWise()
  return ApiResponse.success(res, { drives: data }, 'Drive-wise data fetched')
}

const getMonthlyTrend = async (req, res) => {
  const data = await analyticsService.getMonthlyTrend()
  return ApiResponse.success(res, { trend: data }, 'Monthly trend fetched')
}

const getCGPADistribution = async (req, res) => {
  const data = await analyticsService.getCGPADistribution()
  return ApiResponse.success(res, { distribution: data }, 'CGPA distribution fetched')
}

const getTopPerformers = async (req, res) => {
  const data = await analyticsService.getTopPerformers()
  return ApiResponse.success(res, { performers: data }, 'Top performers fetched')
}

const getRecentActivity = async (req, res) => {
  const data = await analyticsService.getRecentActivity()
  return ApiResponse.success(res, data, 'Recent activity fetched')
}

module.exports = {
  getSummary,
  getBranchWise,
  getCompanyWise,
  getDriveWise,
  getMonthlyTrend,
  getCGPADistribution,
  getTopPerformers,
  getRecentActivity,
}