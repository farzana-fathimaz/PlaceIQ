const reportService = require('../services/report.service')
const AppError      = require('../utils/AppError')

const sendExcel = async (res, workbook, filename) => {
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  )
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  await workbook.xlsx.write(res)
  res.end()
}

const sendPDF = (res, buffer, filename) => {
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  res.send(buffer)
}

const studentsExcel = async (req, res) => {
  const wb = await reportService.generateStudentsExcel()
  await sendExcel(res, wb, `students_${Date.now()}.xlsx`)
}

const driveExcel = async (req, res) => {
  const { driveId } = req.params
  if (!driveId) throw new AppError('Drive ID required', 400)
  const wb = await reportService.generateDriveExcel(driveId)
  await sendExcel(res, wb, `drive_report_${driveId}_${Date.now()}.xlsx`)
}

const placementSummaryExcel = async (req, res) => {
  const wb = await reportService.generatePlacementSummaryExcel()
  await sendExcel(res, wb, `placement_summary_${Date.now()}.xlsx`)
}

const naacExcel = async (req, res) => {
  const wb = await reportService.generateNAACExcel()
  await sendExcel(res, wb, `naac_placement_${Date.now()}.xlsx`)
}

const placementSummaryPDF = async (req, res) => {
  const buffer = await reportService.generatePlacementSummaryPDF()
  sendPDF(res, buffer, `placement_summary_${Date.now()}.pdf`)
}

const drivePDF = async (req, res) => {
  const { driveId } = req.params
  if (!driveId) throw new AppError('Drive ID required', 400)
  const buffer = await reportService.generateDrivePDF(driveId)
  sendPDF(res, buffer, `drive_report_${driveId}_${Date.now()}.pdf`)
}

module.exports = {
  studentsExcel,
  driveExcel,
  placementSummaryExcel,
  naacExcel,
  placementSummaryPDF,
  drivePDF,
}