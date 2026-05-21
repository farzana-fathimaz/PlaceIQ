import axiosClient from './axiosClient'

export const getNotificationsApi   = (params) => axiosClient.get('/notifications', { params })
export const getUnreadCountApi     = ()        => axiosClient.get('/notifications/unread-count')
export const markAsReadApi         = (id)      => axiosClient.patch(`/notifications/${id}/read`)
export const markAllAsReadApi      = ()        => axiosClient.patch('/notifications/read-all')
export const deleteNotificationApi = (id)      => axiosClient.delete(`/notifications/${id}`)
export const deleteAllReadApi      = ()        => axiosClient.delete('/notifications/clear-read')
export const sendNotificationApi   = (data)    => axiosClient.post('/notifications/send', data)