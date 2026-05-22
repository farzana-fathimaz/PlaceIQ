import axiosClient from './axiosClient'

export const getSummaryApi           = () => axiosClient.get('/analytics/summary')
export const getBranchWiseApi        = () => axiosClient.get('/analytics/branch-wise')
export const getCompanyWiseApi       = () => axiosClient.get('/analytics/company-wise')
export const getDriveWiseApi         = () => axiosClient.get('/analytics/drive-wise')
export const getMonthlyTrendApi      = () => axiosClient.get('/analytics/monthly-trend')
export const getCGPADistributionApi  = () => axiosClient.get('/analytics/cgpa-distribution')
export const getTopPerformersApi     = () => axiosClient.get('/analytics/top-performers')
export const getRecentActivityApi    = () => axiosClient.get('/analytics/recent-activity')