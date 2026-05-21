import axiosClient from './axiosClient'

const blobConfig = { responseType: 'blob' }

export const downloadStudentsExcelApi       = ()        => axiosClient.get('/reports/students/excel',      blobConfig)
export const downloadPlacementExcelApi      = ()        => axiosClient.get('/reports/placement/excel',     blobConfig)
export const downloadPlacementPDFApi        = ()        => axiosClient.get('/reports/placement/pdf',       blobConfig)
export const downloadNAACExcelApi           = ()        => axiosClient.get('/reports/naac/excel',          blobConfig)
export const downloadDriveExcelApi          = (driveId) => axiosClient.get(`/reports/drive/${driveId}/excel`, blobConfig)
export const downloadDrivePDFApi            = (driveId) => axiosClient.get(`/reports/drive/${driveId}/pdf`,   blobConfig)