import axiosClient from './axiosClient'

export const getSettingsApi       = ()       => axiosClient.get('/settings')
export const checkSetupApi        = ()       => axiosClient.get('/settings/setup-status')
export const createSettingsApi    = (data)   => axiosClient.post('/settings', data)
export const updateSettingsApi    = (data)   => axiosClient.put('/settings', data)
export const uploadLogoApi        = (formData) =>
  axiosClient.post('/settings/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const addBatchApi          = (batch)  => axiosClient.post('/settings/batches', { batch })
export const removeBatchApi       = (batch)  => axiosClient.delete(`/settings/batches/${encodeURIComponent(batch)}`)