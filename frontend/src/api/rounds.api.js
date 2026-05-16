import axiosClient from './axiosClient'

export const getRoundsForDriveApi    = (driveId)       => axiosClient.get(`/rounds/drive/${driveId}`)
export const getRoundSummaryApi      = (driveId)       => axiosClient.get(`/rounds/drive/${driveId}/summary`)
export const getRoundByIdApi         = (id)            => axiosClient.get(`/rounds/${id}`)
export const createRoundApi          = (data)          => axiosClient.post('/rounds', data)
export const updateRoundApi          = (id, data)      => axiosClient.put(`/rounds/${id}`, data)
export const updateRoundStatusApi    = (id, status)    => axiosClient.patch(`/rounds/${id}/status`, { status })
export const deleteRoundApi          = (id)            => axiosClient.delete(`/rounds/${id}`)
export const markRoundResultsApi     = (id, results)   => axiosClient.patch(`/rounds/${id}/results`, { results })
export const addStudentsToRoundApi   = (id, applicationIds) => axiosClient.post(`/rounds/${id}/add-students`, { applicationIds })
export const getStudentRoundStatusApi = (driveId)      => axiosClient.get(`/rounds/my-status/${driveId}`)