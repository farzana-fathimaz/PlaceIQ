import axiosClient from './axiosClient'

export const getDrivesApi        = (params) => axiosClient.get('/drives', { params })
export const getDriveByIdApi     = (id)     => axiosClient.get(`/drives/${id}`)
export const getDriveStatsApi    = ()        => axiosClient.get('/drives/stats')
export const createDriveApi      = (data)   => axiosClient.post('/drives', data)
export const updateDriveApi      = (id, data) => axiosClient.put(`/drives/${id}`, data)
export const updateDriveStatusApi = (id, status) =>
  axiosClient.patch(`/drives/${id}/status`, { status })
export const deleteDriveApi      = (id)     => axiosClient.delete(`/drives/${id}`)
export const getEligibleStudentsApi = (id)  => axiosClient.get(`/drives/${id}/eligible-students`)