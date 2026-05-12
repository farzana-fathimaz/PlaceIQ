import axiosClient from './axiosClient'

export const loginApi = (data) => axiosClient.post('/auth/login', data)
export const registerApi = (data) => axiosClient.post('/auth/register', data)
export const logoutApi = () => axiosClient.post('/auth/logout')
export const refreshApi = () => axiosClient.post('/auth/refresh')
export const getMeApi = () => axiosClient.get('/auth/me')