import axiosClient from './axiosClient'

export const getStudentDashboardApi = () =>
  axiosClient.get('/students/dashboard/me')