import axiosClient from './axiosClient'

export const applyToDriveApi         = (driveId)       => axiosClient.post('/applications', { driveId })
export const checkIfAppliedApi       = (driveId)       => axiosClient.get(`/applications/check/${driveId}`)
export const getMyApplicationsApi    = (params)        => axiosClient.get('/applications/me', { params })
export const getAllApplicationsApi   = (params)        => axiosClient.get('/applications', { params })
export const getApplicationsByDriveApi = (driveId, params) => axiosClient.get(`/applications/drive/${driveId}`, { params })
export const getApplicationByIdApi   = (id)            => axiosClient.get(`/applications/${id}`)
export const updateApplicationStatusApi = (id, data)  => axiosClient.patch(`/applications/${id}/status`, data)
export const withdrawApplicationApi  = (id)            => axiosClient.patch(`/applications/${id}/withdraw`)
export const getApplicationStatsApi  = (driveId)       => axiosClient.get('/applications/stats', { params: driveId ? { driveId } : {} })