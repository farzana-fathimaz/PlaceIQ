const ExcelJS        = require('exceljs')
const PDFDocument    = require('pdfkit')
const Drive          = require('../models/Drive')
const Application    = require('../models/Application')
const StudentProfile = require('../models/StudentProfile')
const User           = require('../models/User')
const AppError       = require('../utils/AppError')

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const styleHeaderRow = (sheet, colCount) => {
  const headerRow = sheet.getRow(1)
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2563EB' },
  }
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
  headerRow.height = 20
  for (let i = 1; i <= colCount; i++) {
    headerRow.getCell(i).border = {
      bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
    }
  }
}

const styleDataRows = (sheet, startRow, endRow) => {
  for (let r = startRow; r <= endRow; r++) {
    const row = sheet.getRow(r)
    row.height = 16
    row.alignment = { vertical: 'middle' }
    if (r % 2 === 0) {
      for (let c = 1; c <= sheet.columnCount; c++) {
        row.getCell(c).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF1F5F9' },
        }
      }
    }
  }
}

const addSheetTitle = (sheet, title, colSpan) => {
  sheet.insertRow(1, [])
  const titleCell = sheet.getCell('A1')
  titleCell.value = title
  titleCell.font  = { bold: true, size: 13, color: { argb: 'FF1E3A5F' } }
  titleCell.fill  = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFDBEAFE' },
  }
  sheet.mergeCells(1, 1, 1, colSpan)
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
  sheet.getRow(1).height = 28
}

// ─── EXCEL REPORTS ───────────────────────────────────────────────────────────

const generateStudentsExcel = async () => {
  const profiles = await StudentProfile.find()
    .populate('userId', 'name email isActive createdAt')
    .sort({ createdAt: 1 })

  const wb    = new ExcelJS.Workbook()
  wb.creator  = 'PlaceIQ'
  wb.created  = new Date()

  const sheet = wb.addWorksheet('All Students')

  sheet.columns = [
    { header: 'S.No',            key: 'sno',            width: 6  },
    { header: 'Name',            key: 'name',           width: 24 },
    { header: 'Email',           key: 'email',          width: 30 },
    { header: 'Roll Number',     key: 'rollNumber',     width: 14 },
    { header: 'Branch',          key: 'branch',         width: 8  },
    { header: 'Batch',           key: 'batch',          width: 12 },
    { header: 'CGPA',            key: 'cgpa',           width: 7  },
    { header: 'Active Backlogs', key: 'activeBacklogs', width: 14 },
    { header: 'Total Backlogs',  key: 'totalBacklogs',  width: 14 },
    { header: 'Gender',          key: 'gender',         width: 9  },
    { header: 'Phone',           key: 'phone',          width: 14 },
    { header: '10th %',          key: 'tenthPercent',   width: 9  },
    { header: '12th %',          key: 'twelfthPercent', width: 9  },
    { header: 'Placement',       key: 'placement',      width: 14 },
    { header: 'Placed At',       key: 'placedAt',       width: 20 },
    { header: 'CTC (LPA)',       key: 'placedCTC',      width: 11 },
    { header: 'Status',          key: 'status',         width: 10 },
  ]

  styleHeaderRow(sheet, sheet.columns.length)

  profiles.forEach((p, i) => {
    const row = sheet.addRow({
      sno:            i + 1,
      name:           p.userId?.name            || '',
      email:          p.userId?.email           || '',
      rollNumber:     p.rollNumber,
      branch:         p.branch,
      batch:          p.batch,
      cgpa:           p.cgpa,
      activeBacklogs: p.activeBacklogs,
      totalBacklogs:  p.totalBacklogs,
      gender:         p.gender                  || '',
      phone:          p.phone                   || '',
      tenthPercent:   p.tenthPercent            || '',
      twelfthPercent: p.twelfthPercent          || '',
      placement:      p.placementStatus === 'placed' ? 'Placed' : 'Not Placed',
      placedAt:       p.placedAt                || '',
      placedCTC:      p.placedCTC               || '',
      status:         p.userId?.isActive        ? 'Active' : 'Inactive',
    })

    // Highlight placed students in green
    if (p.placementStatus === 'placed') {
      row.getCell('placement').font = { color: { argb: 'FF16A34A' }, bold: true }
    }

    // Highlight low CGPA
    if (p.cgpa < 6) {
      row.getCell('cgpa').font = { color: { argb: 'FFDC2626' } }
    }
  })

  styleDataRows(sheet, 2, profiles.length + 1)
  addSheetTitle(sheet, `PlaceIQ — Student Report (${profiles.length} students)`, sheet.columns.length)

  return wb
}

const generateDriveExcel = async (driveId) => {
  const drive = await Drive.findById(driveId)
  if (!drive) throw new AppError('Drive not found', 404)

  const applications = await Application.find({ driveId })
    .populate('studentId', 'name email')
    .sort({ status: 1, appliedAt: 1 })

  const profileMap = {}
  const profiles   = await StudentProfile.find({
    userId: { $in: applications.map((a) => a.studentId?._id) },
  })
  profiles.forEach((p) => { profileMap[p.userId.toString()] = p })

  const wb   = new ExcelJS.Workbook()
  wb.creator = 'PlaceIQ'

  // Sheet 1 — Drive Info
  const infoSheet = wb.addWorksheet('Drive Info')
  infoSheet.columns = [{ key: 'key', width: 22 }, { key: 'value', width: 40 }]

  const driveInfo = [
    ['Drive Title',    drive.title],
    ['Company',        drive.company],
    ['Job Role',       drive.jobRole        || '—'],
    ['Job Location',   drive.jobLocation    || '—'],
    ['Type',           drive.type],
    ['Salary (LPA)',   drive.salaryLPA      || '—'],
    ['Drive Date',     drive.driveDate ? new Date(drive.driveDate).toLocaleDateString('en-IN') : '—'],
    ['Last Apply',     drive.lastApplyDate ? new Date(drive.lastApplyDate).toLocaleDateString('en-IN') : '—'],
    ['Status',         drive.status],
    ['Total Applicants', drive.totalApplicants],
    ['Total Placed',   drive.totalPlaced],
    ['Min CGPA',       drive.eligibility?.minCGPA      ?? '—'],
    ['Max Backlogs',   drive.eligibility?.maxBacklogs   ?? '—'],
    ['Allowed Branches', (drive.eligibility?.allowedBranches || []).join(', ')],
    ['Allowed Batches', (drive.eligibility?.allowedBatches  || []).join(', ') || 'All'],
    ['Report Generated', new Date().toLocaleString('en-IN')],
  ]

  driveInfo.forEach(([key, value]) => {
    const row = infoSheet.addRow({ key, value })
    row.getCell(1).font = { bold: true, color: { argb: 'FF374151' } }
    row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } }
  })

  // Sheet 2 — All Applicants
  const appSheet = wb.addWorksheet('Applicants')
  appSheet.columns = [
    { header: 'S.No',        key: 'sno',        width: 6  },
    { header: 'Name',        key: 'name',        width: 24 },
    { header: 'Email',       key: 'email',       width: 30 },
    { header: 'Roll Number', key: 'rollNumber',  width: 14 },
    { header: 'Branch',      key: 'branch',      width: 8  },
    { header: 'Batch',       key: 'batch',       width: 12 },
    { header: 'CGPA',        key: 'cgpa',        width: 7  },
    { header: 'Backlogs',    key: 'backlogs',    width: 10 },
    { header: 'Status',      key: 'status',      width: 14 },
    { header: 'Applied At',  key: 'appliedAt',   width: 16 },
  ]

  styleHeaderRow(appSheet, appSheet.columns.length)

  applications.forEach((app, i) => {
    const profile = profileMap[app.studentId?._id?.toString()] || {}
    const row = appSheet.addRow({
      sno:        i + 1,
      name:       app.studentId?.name  || '',
      email:      app.studentId?.email || '',
      rollNumber: profile.rollNumber   || '',
      branch:     profile.branch       || '',
      batch:      profile.batch        || '',
      cgpa:       profile.cgpa         || '',
      backlogs:   profile.activeBacklogs ?? '',
      status:     app.status,
      appliedAt:  new Date(app.appliedAt).toLocaleDateString('en-IN'),
    })

    const statusColors = {
      placed:      'FF16A34A',
      shortlisted: 'FFD97706',
      in_rounds:   'FF7C3AED',
      rejected:    'FFDC2626',
      withdrawn:   'FF6B7280',
    }
    if (statusColors[app.status]) {
      row.getCell('status').font = {
        color: { argb: statusColors[app.status] },
        bold: app.status === 'placed',
      }
    }
  })

  styleDataRows(appSheet, 2, applications.length + 1)
  addSheetTitle(
    appSheet,
    `${drive.company} — ${drive.title} (${applications.length} applicants)`,
    appSheet.columns.length
  )

  // Sheet 3 — Placed Students Only
  const placedApps = applications.filter((a) => a.status === 'placed')
  if (placedApps.length > 0) {
    const placedSheet = wb.addWorksheet('Placed Students')
    placedSheet.columns = [
      { header: 'S.No',       key: 'sno',       width: 6  },
      { header: 'Name',       key: 'name',       width: 24 },
      { header: 'Email',      key: 'email',      width: 30 },
      { header: 'Roll Number',key: 'rollNumber', width: 14 },
      { header: 'Branch',     key: 'branch',     width: 8  },
      { header: 'CGPA',       key: 'cgpa',       width: 7  },
      { header: 'Company',    key: 'company',    width: 20 },
      { header: 'CTC (LPA)', key: 'ctc',        width: 11 },
    ]

    styleHeaderRow(placedSheet, placedSheet.columns.length)

    placedApps.forEach((app, i) => {
      const profile = profileMap[app.studentId?._id?.toString()] || {}
      placedSheet.addRow({
        sno:        i + 1,
        name:       app.studentId?.name  || '',
        email:      app.studentId?.email || '',
        rollNumber: profile.rollNumber   || '',
        branch:     profile.branch       || '',
        cgpa:       profile.cgpa         || '',
        company:    drive.company,
        ctc:        drive.salaryLPA      || '',
      })
    })

    styleDataRows(placedSheet, 2, placedApps.length + 1)
    addSheetTitle(placedSheet, `Placed Students — ${drive.company}`, placedSheet.columns.length)
  }

  return wb
}

const generatePlacementSummaryExcel = async () => {
  const wb   = new ExcelJS.Workbook()
  wb.creator = 'PlaceIQ'

  // ── Overall Summary Sheet ──────────────────────────────────────────────────
  const summarySheet = wb.addWorksheet('Overall Summary')
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 30 },
    { header: 'Value',  key: 'value',  width: 20 },
  ]
  styleHeaderRow(summarySheet, 2)

  const totalStudents    = await StudentProfile.countDocuments()
  const totalPlaced      = await StudentProfile.countDocuments({ placementStatus: 'placed' })
  const totalDrives      = await Drive.countDocuments()
  const activeDrives     = await Drive.countDocuments({ status: 'active', isArchived: false })
  const totalApps        = await Application.countDocuments()
  const placedApps       = await Application.countDocuments({ status: 'placed' })
  const placementPct     = totalStudents > 0 ? ((totalPlaced / totalStudents) * 100).toFixed(1) : 0

  const avgCTCResult = await StudentProfile.aggregate([
    { $match: { placementStatus: 'placed', placedCTC: { $ne: null } } },
    { $group: { _id: null, avg: { $avg: '$placedCTC' } } },
  ])
  const avgCTC = avgCTCResult[0]?.avg?.toFixed(2) || '—'

  const highCTCResult = await StudentProfile.aggregate([
    { $match: { placementStatus: 'placed', placedCTC: { $ne: null } } },
    { $group: { _id: null, max: { $max: '$placedCTC' } } },
  ])
  const highCTC = highCTCResult[0]?.max || '—'

  const metrics = [
    ['Total Students',             totalStudents],
    ['Total Placed',               totalPlaced],
    ['Placement Percentage',       `${placementPct}%`],
    ['Total Drives',               totalDrives],
    ['Active Drives',              activeDrives],
    ['Total Applications',         totalApps],
    ['Total Selections',           placedApps],
    ['Average CTC (LPA)',          avgCTC],
    ['Highest CTC (LPA)',          highCTC],
    ['Report Generated',           new Date().toLocaleString('en-IN')],
  ]

  metrics.forEach(([metric, value]) => {
    summarySheet.addRow({ metric, value })
  })
  styleDataRows(summarySheet, 2, metrics.length + 1)
  addSheetTitle(summarySheet, 'PlaceIQ — Placement Summary Report', 2)

  // ── Branch-wise Sheet ──────────────────────────────────────────────────────
  const branchSheet = wb.addWorksheet('Branch-wise')
  branchSheet.columns = [
    { header: 'Branch',    key: 'branch',    width: 10 },
    { header: 'Total',     key: 'total',     width: 10 },
    { header: 'Placed',    key: 'placed',    width: 10 },
    { header: 'Not Placed',key: 'notPlaced', width: 12 },
    { header: '% Placed',  key: 'pct',       width: 12 },
    { header: 'Avg CGPA',  key: 'avgCGPA',   width: 11 },
    { header: 'Avg CTC',   key: 'avgCTC',    width: 11 },
  ]
  styleHeaderRow(branchSheet, branchSheet.columns.length)

  const branchStats = await StudentProfile.aggregate([
    {
      $group: {
        _id:       '$branch',
        total:     { $sum: 1 },
        placed:    { $sum: { $cond: [{ $eq: ['$placementStatus', 'placed'] }, 1, 0] } },
        avgCGPA:   { $avg: '$cgpa' },
        avgCTC:    { $avg: { $cond: [{ $ne: ['$placedCTC', null] }, '$placedCTC', null] } },
      },
    },
    { $sort: { placed: -1 } },
  ])

  branchStats.forEach((b) => {
    const pct = b.total > 0 ? ((b.placed / b.total) * 100).toFixed(1) : 0
    const row = branchSheet.addRow({
      branch:    b._id,
      total:     b.total,
      placed:    b.placed,
      notPlaced: b.total - b.placed,
      pct:       `${pct}%`,
      avgCGPA:   b.avgCGPA?.toFixed(2) || '—',
      avgCTC:    b.avgCTC?.toFixed(2)  || '—',
    })
    if (parseFloat(pct) >= 70) {
      row.getCell('pct').font = { color: { argb: 'FF16A34A' }, bold: true }
    } else if (parseFloat(pct) < 30) {
      row.getCell('pct').font = { color: { argb: 'FFDC2626' } }
    }
  })

  styleDataRows(branchSheet, 2, branchStats.length + 1)
  addSheetTitle(branchSheet, 'Branch-wise Placement Statistics', branchSheet.columns.length)

  // ── Company-wise Sheet ─────────────────────────────────────────────────────
  const companySheet = wb.addWorksheet('Company-wise')
  companySheet.columns = [
    { header: 'Company',     key: 'company',  width: 24 },
    { header: 'Drive Title', key: 'title',    width: 30 },
    { header: 'Type',        key: 'type',     width: 10 },
    { header: 'Applicants',  key: 'applicants',width: 12 },
    { header: 'Placed',      key: 'placed',   width: 10 },
    { header: 'CTC (LPA)',   key: 'ctc',      width: 11 },
    { header: 'Date',        key: 'date',     width: 14 },
  ]
  styleHeaderRow(companySheet, companySheet.columns.length)

  const drives = await Drive.find({ status: { $ne: 'draft' } }).sort({ createdAt: -1 })
  drives.forEach((d) => {
    companySheet.addRow({
      company:    d.company,
      title:      d.title,
      type:       d.type,
      applicants: d.totalApplicants,
      placed:     d.totalPlaced,
      ctc:        d.salaryLPA    || '—',
      date:       d.driveDate ? new Date(d.driveDate).toLocaleDateString('en-IN') : '—',
    })
  })

  styleDataRows(companySheet, 2, drives.length + 1)
  addSheetTitle(companySheet, 'Company-wise Drive Summary', companySheet.columns.length)

  // ── Placed Students Sheet ──────────────────────────────────────────────────
  const placedSheet = wb.addWorksheet('Placed Students')
  placedSheet.columns = [
    { header: 'S.No',       key: 'sno',       width: 6  },
    { header: 'Name',       key: 'name',       width: 24 },
    { header: 'Email',      key: 'email',      width: 30 },
    { header: 'Roll Number',key: 'rollNumber', width: 14 },
    { header: 'Branch',     key: 'branch',     width: 8  },
    { header: 'Batch',      key: 'batch',      width: 12 },
    { header: 'CGPA',       key: 'cgpa',       width: 7  },
    { header: 'Company',    key: 'company',    width: 22 },
    { header: 'CTC (LPA)', key: 'ctc',        width: 11 },
  ]
  styleHeaderRow(placedSheet, placedSheet.columns.length)

  const placedProfiles = await StudentProfile.find({ placementStatus: 'placed' })
    .populate('userId', 'name email')
    .sort({ placedCTC: -1 })

  placedProfiles.forEach((p, i) => {
    placedSheet.addRow({
      sno:        i + 1,
      name:       p.userId?.name  || '',
      email:      p.userId?.email || '',
      rollNumber: p.rollNumber,
      branch:     p.branch,
      batch:      p.batch,
      cgpa:       p.cgpa,
      company:    p.placedAt  || '—',
      ctc:        p.placedCTC || '—',
    })
  })

  styleDataRows(placedSheet, 2, placedProfiles.length + 1)
  addSheetTitle(placedSheet, `All Placed Students (${placedProfiles.length})`, placedSheet.columns.length)

  return wb
}

const generateNAACExcel = async () => {
  const wb   = new ExcelJS.Workbook()
  wb.creator = 'PlaceIQ'

  const sheet = wb.addWorksheet('NAAC Placement Data')

  sheet.columns = [
    { header: 'S.No',                                    key: 'sno',      width: 6  },
    { header: 'Name of Student',                          key: 'name',     width: 26 },
    { header: 'Programme',                                key: 'branch',   width: 14 },
    { header: 'Year of Passing',                          key: 'year',     width: 16 },
    { header: 'Name of Employer / Company',               key: 'company',  width: 28 },
    { header: 'Designation',                              key: 'role',     width: 22 },
    { header: 'Pay Package (LPA)',                        key: 'ctc',      width: 16 },
    { header: 'Self-employed / Govt / Private / Abroad',  key: 'sector',   width: 34 },
  ]

  const headerRow = sheet.getRow(1)
  headerRow.font      = { bold: true, size: 10, color: { argb: 'FF1E3A5F' } }
  headerRow.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } }
  headerRow.alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' }
  headerRow.height    = 40

  const placedProfiles = await StudentProfile.find({ placementStatus: 'placed' })
    .populate('userId', 'name email')
    .sort({ branch: 1, batch: 1 })

  placedProfiles.forEach((p, i) => {
    const batchYear = p.batch?.split('-')[1] || ''
    sheet.addRow({
      sno:     i + 1,
      name:    p.userId?.name || '',
      branch:  p.branch,
      year:    batchYear,
      company: p.placedAt   || '',
      role:    '',
      ctc:     p.placedCTC  || '',
      sector:  'Private',
    })
  })

  styleDataRows(sheet, 2, placedProfiles.length + 1)

  // Add title row at top
  sheet.insertRow(1, [])
  sheet.insertRow(1, [])
  sheet.mergeCells('A1', 'H1')
  const titleCell       = sheet.getCell('A1')
  titleCell.value       = 'NAAC CRITERION V — STUDENT SUPPORT AND PROGRESSION'
  titleCell.font        = { bold: true, size: 12, color: { argb: 'FF1E3A5F' } }
  titleCell.alignment   = { horizontal: 'center', vertical: 'middle' }
  titleCell.fill        = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBFDBFE' } }
  sheet.getRow(1).height = 26

  sheet.mergeCells('A2', 'H2')
  const subCell       = sheet.getCell('A2')
  subCell.value       = `5.2.1 — Placement Data (Generated: ${new Date().toLocaleDateString('en-IN')})`
  subCell.font        = { size: 10, color: { argb: 'FF374151' } }
  subCell.alignment   = { horizontal: 'center', vertical: 'middle' }
  subCell.fill        = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } }
  sheet.getRow(2).height = 18

  return wb
}

// ─── PDF REPORTS ─────────────────────────────────────────────────────────────

const generatePlacementSummaryPDF = async () => {
  const Settings = require('../models/Settings')
  const settings = await Settings.findOne()
  const collegeName = settings?.collegeName || 'PlaceIQ'
  const academicYear = settings?.academicYear || ''
  const officerName  = settings?.placementOfficerName || ''

  const doc = new PDFDocument({ margin: 50, size: 'A4' })
  const buffers = []

  doc.on('data', (chunk) => buffers.push(chunk))

  // Header
  doc
    .rect(0, 0, doc.page.width, 70)
    .fill('#2563eb')

  doc
  .fillColor('#ffffff')
  .fontSize(16)
  .font('Helvetica-Bold')
  .text(collegeName, 50, 18)
  doc
  .fontSize(9)
  .font('Helvetica')
  .text(
  `Placement Report${academicYear ? ` · ${academicYear}` : ''}`,
  50, 38
)

  doc.fillColor('#000000').moveDown()

  // Title
  doc
    .fontSize(16)
    .font('Helvetica-Bold')
    .fillColor('#1e3a5f')
    .text('Placement Summary Report', { align: 'center' })
    .moveDown(0.3)

  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor('#6b7280')
    .text(`Generated: ${new Date().toLocaleString('en-IN')}`, { align: 'center' })
    .moveDown(1)

  // Fetch data
  const totalStudents = await StudentProfile.countDocuments()
  const totalPlaced   = await StudentProfile.countDocuments({ placementStatus: 'placed' })
  const totalDrives   = await Drive.countDocuments()
  const totalApps     = await Application.countDocuments()
  const placementPct  = totalStudents > 0 ? ((totalPlaced / totalStudents) * 100).toFixed(1) : 0

  const avgCTCResult = await StudentProfile.aggregate([
    { $match: { placementStatus: 'placed', placedCTC: { $ne: null } } },
    { $group: { _id: null, avg: { $avg: '$placedCTC' } } },
  ])
  const avgCTC = avgCTCResult[0]?.avg?.toFixed(2) || '—'

  const highCTCResult = await StudentProfile.aggregate([
    { $match: { placementStatus: 'placed', placedCTC: { $ne: null } } },
    { $group: { _id: null, max: { $max: '$placedCTC' } } },
  ])
  const highCTC = highCTCResult[0]?.max || '—'

  // KPI boxes
  const kpis = [
    { label: 'Total Students',    value: totalStudents  },
    { label: 'Total Placed',      value: totalPlaced    },
    { label: 'Placement %',       value: `${placementPct}%` },
    { label: 'Total Drives',      value: totalDrives    },
    { label: 'Total Applications',value: totalApps      },
    { label: 'Avg CTC (LPA)',     value: avgCTC         },
    { label: 'Highest CTC (LPA)', value: highCTC        },
  ]

  const boxW  = 150
  const boxH  = 60
  const startX = 50
  let   x     = startX
  let   y     = doc.y

  kpis.forEach((kpi, i) => {
    if (i > 0 && i % 3 === 0) {
      x  = startX
      y += boxH + 10
    }

    doc.rect(x, y, boxW, boxH).fillAndStroke('#eff6ff', '#bfdbfe')
    doc
      .fillColor('#1e3a5f')
      .fontSize(20)
      .font('Helvetica-Bold')
      .text(String(kpi.value), x + 10, y + 10, { width: boxW - 20, align: 'center' })

    doc
      .fillColor('#6b7280')
      .fontSize(8)
      .font('Helvetica')
      .text(kpi.label, x + 10, y + 38, { width: boxW - 20, align: 'center' })

    x += boxW + 10
  })

  doc.moveDown(6)

  // Branch-wise table
  doc
    .fontSize(13)
    .font('Helvetica-Bold')
    .fillColor('#1e3a5f')
    .text('Branch-wise Placement Breakdown', 50, doc.y + 10)
    .moveDown(0.5)

  const branchStats = await StudentProfile.aggregate([
    {
      $group: {
        _id:     '$branch',
        total:   { $sum: 1 },
        placed:  { $sum: { $cond: [{ $eq: ['$placementStatus', 'placed'] }, 1, 0] } },
        avgCGPA: { $avg: '$cgpa' },
      },
    },
    { $sort: { placed: -1 } },
  ])

  const tableTop   = doc.y
  const colWidths  = [60, 80, 80, 80, 90]
  const headers    = ['Branch', 'Total', 'Placed', 'Not Placed', '% Placed']
  let   tableX     = 50

  // Table header
  doc.rect(tableX, tableTop, colWidths.reduce((a, b) => a + b, 0), 20).fill('#2563eb')
  headers.forEach((h, i) => {
    doc
      .fillColor('#ffffff')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text(h, tableX + 5, tableTop + 6, { width: colWidths[i] - 10, align: 'center' })
    tableX += colWidths[i]
  })

  // Table rows
  let rowY = tableTop + 20
  branchStats.forEach((b, idx) => {
    tableX = 50
    const pct  = b.total > 0 ? ((b.placed / b.total) * 100).toFixed(1) : 0
    const fill = idx % 2 === 0 ? '#f0f9ff' : '#ffffff'
    const rowData = [b._id, b.total, b.placed, b.total - b.placed, `${pct}%`]

    doc.rect(50, rowY, colWidths.reduce((a, c) => a + c, 0), 18).fill(fill)

    rowData.forEach((val, i) => {
      const color = i === 4 && parseFloat(pct) >= 70 ? '#16a34a' : '#374151'
      doc
        .fillColor(color)
        .fontSize(9)
        .font(i === 4 && parseFloat(pct) >= 70 ? 'Helvetica-Bold' : 'Helvetica')
        .text(String(val), tableX + 5, rowY + 5, { width: colWidths[i] - 10, align: 'center' })
      tableX += colWidths[i]
    })

    rowY += 18
  })

  doc.moveDown(2)

  // Company-wise drives
  const drives = await Drive.find({ status: { $ne: 'draft' }, totalApplicants: { $gt: 0 } })
    .sort({ totalPlaced: -1 })
    .limit(15)

  if (drives.length > 0) {
    doc
      .addPage()
      .fontSize(13)
      .font('Helvetica-Bold')
      .fillColor('#1e3a5f')
      .text('Top Drives by Placement', 50, 50)
      .moveDown(0.5)

    const dTableTop  = doc.y
    const dColWidths = [160, 80, 80, 80, 80]
    const dHeaders   = ['Company — Drive', 'Type', 'Applicants', 'Placed', 'CTC (LPA)']
    let   dX         = 50

    doc.rect(dX, dTableTop, dColWidths.reduce((a, b) => a + b, 0), 20).fill('#2563eb')
    dHeaders.forEach((h, i) => {
      doc
        .fillColor('#ffffff')
        .fontSize(9)
        .font('Helvetica-Bold')
        .text(h, dX + 5, dTableTop + 6, { width: dColWidths[i] - 10, align: i === 0 ? 'left' : 'center' })
      dX += dColWidths[i]
    })

    let dRowY = dTableTop + 20
    drives.forEach((d, idx) => {
      dX = 50
      const fill = idx % 2 === 0 ? '#f0f9ff' : '#ffffff'
      doc.rect(50, dRowY, dColWidths.reduce((a, c) => a + c, 0), 18).fill(fill)
      const dData = [
        `${d.company} — ${d.title}`.slice(0, 38),
        d.type,
        d.totalApplicants,
        d.totalPlaced,
        d.salaryLPA || '—',
      ]
      dData.forEach((val, i) => {
        doc
          .fillColor('#374151')
          .fontSize(8.5)
          .font('Helvetica')
          .text(String(val), dX + 5, dRowY + 5, { width: dColWidths[i] - 10, align: i === 0 ? 'left' : 'center' })
        dX += dColWidths[i]
      })
      dRowY += 18
    })
  }

  // Footer on all pages
  const pages = doc.bufferedPageRange()
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i)
    doc
      .fontSize(8)
      .fillColor('#9ca3af')
      .text(
        `PlaceIQ Placement ERP — Confidential | Page ${i + 1} of ${pages.count}`,
        50,
        doc.page.height - 40,
        { align: 'center' }
      )
  }

  doc.end()

  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)))
  })
}

const generateDrivePDF = async (driveId) => {
  const Settings = require('../models/Settings')
  const settings = await Settings.findOne()
  const collegeName = settings?.collegeName || 'PlaceIQ'
  const academicYear = settings?.academicYear || ''
  const officerName  = settings?.placementOfficerName || ''

  const drive = await Drive.findById(driveId)
  if (!drive) throw new AppError('Drive not found', 404)

  const applications = await Application.find({ driveId })
    .populate('studentId', 'name email')
    .sort({ status: 1 })

  const profileMap = {}
  const profiles   = await StudentProfile.find({
    userId: { $in: applications.map((a) => a.studentId?._id) },
  })
  profiles.forEach((p) => { profileMap[p.userId.toString()] = p })

  const placedApps = applications.filter((a) => a.status === 'placed')
  const rejApps    = applications.filter((a) => a.status === 'rejected')

  const doc     = new PDFDocument({ margin: 50, size: 'A4' })
  const buffers = []
  doc.on('data', (chunk) => buffers.push(chunk))

  // Header
  doc.rect(0, 0, doc.page.width, 70).fill('#2563eb')
  doc.fillColor('#ffffff').fontSize(16).font('Helvetica-Bold').text(collegeName, 50, 18)
  doc.fontSize(9).font('Helvetica').text(
    `Placement Report${academicYear ? ` · ${academicYear}` : ''}`,
    50, 38
  )
  doc.fillColor('#000000').moveDown()

  // Drive title
  doc.fontSize(16).font('Helvetica-Bold').fillColor('#1e3a5f').text(drive.title, { align: 'center' }).moveDown(0.2)
  doc.fontSize(12).font('Helvetica').fillColor('#374151').text(drive.company, { align: 'center' }).moveDown(0.5)
  doc.fontSize(9).fillColor('#6b7280').text(`Generated: ${new Date().toLocaleString('en-IN')}`, { align: 'center' }).moveDown(1)

  // Drive info grid
  const infoItems = [
    ['Job Role',     drive.jobRole     || '—'],
    ['Location',     drive.jobLocation || '—'],
    ['Type',         drive.type],
    ['Salary (LPA)', drive.salaryLPA   || '—'],
    ['Drive Date',   drive.driveDate ? new Date(drive.driveDate).toLocaleDateString('en-IN') : '—'],
    ['Status',       drive.status.toUpperCase()],
    ['Total Applicants', drive.totalApplicants],
    ['Total Placed',     drive.totalPlaced],
  ]

  const gridX    = 50
  let   gridY    = doc.y
  const cellW    = 230
  const cellH    = 24

  infoItems.forEach((item, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const cx  = gridX + col * (cellW + 10)
    const cy  = gridY + row * cellH

    doc.rect(cx, cy, cellW, cellH).fillAndStroke(i % 2 === 0 ? '#f9fafb' : '#f0f9ff', '#e5e7eb')
    doc.fillColor('#6b7280').fontSize(8).font('Helvetica').text(item[0], cx + 6, cy + 6)
    doc.fillColor('#111827').fontSize(9).font('Helvetica-Bold').text(String(item[1]), cx + 6, cy + 14)
  })

  doc.y = gridY + Math.ceil(infoItems.length / 2) * cellH + 16

  // Applicant list
  if (applications.length > 0) {
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#1e3a5f').text('Applicants', 50, doc.y + 10).moveDown(0.4)

    const colW   = [28, 140, 80, 55, 60, 60, 60]
    const hdrs   = ['#', 'Name', 'Roll No', 'Branch', 'CGPA', 'Backlogs', 'Status']
    let   tX     = 50
    const tTop   = doc.y

    doc.rect(50, tTop, colW.reduce((a, b) => a + b, 0), 18).fill('#2563eb')
    hdrs.forEach((h, i) => {
      doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold')
        .text(h, tX + 3, tTop + 5, { width: colW[i] - 6, align: 'center' })
      tX += colW[i]
    })

    let tY = tTop + 18
    applications.slice(0, 40).forEach((app, idx) => {
      if (tY > doc.page.height - 80) {
        doc.addPage()
        tY = 50
      }
      const profile = profileMap[app.studentId?._id?.toString()] || {}
      const fill    = idx % 2 === 0 ? '#f8fafc' : '#ffffff'
      tX = 50
      doc.rect(50, tY, colW.reduce((a, b) => a + b, 0), 16).fill(fill)

      const rowData = [
        idx + 1,
        (app.studentId?.name || '').slice(0, 22),
        profile.rollNumber || '',
        profile.branch     || '',
        profile.cgpa       || '',
        profile.activeBacklogs ?? '',
        app.status,
      ]

      rowData.forEach((val, i) => {
        const sColor = app.status === 'placed' && i === 6 ? '#16a34a' :
                       app.status === 'rejected' && i === 6 ? '#dc2626' : '#374151'
        doc.fillColor(sColor).fontSize(8)
          .font(i === 6 && app.status === 'placed' ? 'Helvetica-Bold' : 'Helvetica')
          .text(String(val), tX + 3, tY + 4, { width: colW[i] - 6, align: 'center' })
        tX += colW[i]
      })

      tY += 16
    })

    if (applications.length > 40) {
      doc.moveDown().fontSize(8).fillColor('#6b7280')
        .text(`... and ${applications.length - 40} more applicants`, { align: 'center' })
    }
  }

  // Footer
  doc.fontSize(8).fillColor('#9ca3af')
    .text('PlaceIQ Placement ERP — Confidential', 50, doc.page.height - 40, { align: 'center' })

  doc.end()
  return new Promise((resolve) => { doc.on('end', () => resolve(Buffer.concat(buffers))) })
}

module.exports = {
  generateStudentsExcel,
  generateDriveExcel,
  generatePlacementSummaryExcel,
  generateNAACExcel,
  generatePlacementSummaryPDF,
  generateDrivePDF,
}