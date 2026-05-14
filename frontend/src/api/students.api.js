import axiosClient from './axiosClient'

export const getStudentsApi = (params) =>
  axiosClient.get('/students', { params })

export const getStudentByIdApi = (id) =>
  axiosClient.get(`/students/${id}`)

export const createStudentApi = (data) =>
  axiosClient.post('/students', data)

export const updateStudentApi = (id, data) =>
  axiosClient.put(`/students/${id}`, data)

export const toggleStudentActiveApi = (id) =>
  axiosClient.patch(`/students/${id}/toggle-active`)

export const bulkImportStudentsApi = (formData) =>
  axiosClient.post('/students/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const exportStudentsApi = () =>
  axiosClient.get('/students/export', { responseType: 'blob' })

export const getMyProfileApi = () =>
  axiosClient.get('/students/me/profile')

export const updateMyProfileApi = (data) =>
  axiosClient.put('/students/me/profile', data)

export const uploadResumeApi = (formData) =>
  axiosClient.post('/students/me/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })