import { useState, useEffect }          from 'react'
import { getDrivesApi }                 from '../../api/drives.api'
import {
  downloadStudentsExcelApi,
  downloadPlacementExcelApi,
  downloadPlacementPDFApi,
  downloadNAACExcelApi,
  downloadDriveExcelApi,
  downloadDrivePDFApi,
} from '../../api/reports.api'
import { useUiStore }                   from '../../store/uiStore'
import { downloadBlob }                 from '../../utils/helpers'
import Button                           from '../../components/ui/Button'
import Card, { CardHeader }             from '../../components/ui/Card'
import Select                           from '../../components/ui/Select'

const ReportCard = ({ title, description, reports, icon }) => (
  <Card>
    <div className="flex items-start gap-3 mb-4">
      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
    </div>
    <div className="space-y-2">
      {reports.map((r, i) => (
        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
          <div>
            <p className="text-sm text-gray-700">{r.label}</p>
            {r.note && <p className="text-xs text-gray-400">{r.note}</p>}
          </div>
          <div className="flex gap-2">
            {r.actions.map((action, j) => (
              <Button
                key={j}
                size="sm"
                variant={action.variant || 'secondary'}
                loading={action.loading}
                onClick={action.onClick}
                className={action.className || ''}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  </Card>
)

const ReportsPage = () => {
  const { showSuccess, showError } = useUiStore()
  const [drives,       setDrives]       = useState([])
  const [selectedDrive, setSelectedDrive] = useState('')
  const [loading,      setLoading]      = useState({})

  useEffect(() => {
    const fetchDrives = async () => {
      try {
        const res = await getDrivesApi({ limit: 100 })
        setDrives(res.data.data.drives || [])
      } catch {}
    }
    fetchDrives()
  }, [])

  const setLoad = (key, val) => setLoading((l) => ({ ...l, [key]: val }))

  const download = async (key, apiFn, filename, successMsg) => {
    setLoad(key, true)
    try {
      const res = await apiFn()
      downloadBlob(res.data, filename)
      showSuccess(successMsg || 'Report downloaded')
    } catch (err) {
      showError(err.response?.data?.message || 'Download failed')
    } finally {
      setLoad(key, false)
    }
  }

  const driveOptions = drives.map((d) => ({
    label: `${d.company} — ${d.title}`,
    value: d._id,
  }))

  const generalIcon = (
    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )

  const driveIcon = (
    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )

  const naacIcon = (
    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  )

  return (
    <div className="page-wrapper">
      <div className="mb-6">
        <h1 className="section-title">Reports & Exports</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Download placement data in Excel and PDF formats
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* General Reports */}
        <ReportCard
          title="General Reports"
          description="Student and placement data exports"
          icon={generalIcon}
          reports={[
            {
              label: 'All Students',
              note:  'Excel with CGPA, branch, placement status',
              actions: [
                {
                  label:   'Excel',
                  loading: loading.studentsXl,
                  onClick: () => download(
                    'studentsXl',
                    downloadStudentsExcelApi,
                    `students_${Date.now()}.xlsx`,
                    'Students Excel downloaded'
                  ),
                },
              ],
            },
            {
              label: 'Placement Summary',
              note:  'Overview, branch-wise, company-wise, placed students',
              actions: [
                {
                  label:   'Excel',
                  loading: loading.summaryXl,
                  onClick: () => download(
                    'summaryXl',
                    downloadPlacementExcelApi,
                    `placement_summary_${Date.now()}.xlsx`,
                    'Placement summary Excel downloaded'
                  ),
                },
                {
                  label:     'PDF',
                  variant:   'primary',
                  loading:   loading.summaryPdf,
                  onClick:   () => download(
                    'summaryPdf',
                    downloadPlacementPDFApi,
                    `placement_summary_${Date.now()}.pdf`,
                    'Placement summary PDF downloaded'
                  ),
                },
              ],
            },
          ]}
        />

        {/* NAAC Report */}
        <ReportCard
          title="NAAC Report"
          description="Criterion V — Student Support and Progression"
          icon={naacIcon}
          reports={[
            {
              label: 'NAAC 5.2.1 — Placement Data',
              note:  'Student-wise placement in NAAC-prescribed format',
              actions: [
                {
                  label:     'Download Excel',
                  variant:   'primary',
                  loading:   loading.naacXl,
                  className: 'bg-green-600 hover:bg-green-700 text-white border-green-600',
                  onClick:   () => download(
                    'naacXl',
                    downloadNAACExcelApi,
                    `naac_placement_${Date.now()}.xlsx`,
                    'NAAC report downloaded'
                  ),
                },
              ],
            },
          ]}
        />

        {/* Drive-wise Reports */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Drive-wise Reports"
            subtitle="Export detailed report for a specific placement drive"
            icon={driveIcon}
          />

          <div className="flex items-end gap-4 mb-5">
            <Select
              label="Select Drive"
              options={driveOptions}
              value={selectedDrive}
              onChange={(e) => setSelectedDrive(e.target.value)}
              placeholder="Choose a drive..."
              className="max-w-sm"
            />
          </div>

          {selectedDrive ? (
            <div className="space-y-3">
              {[
                {
                  label: 'Drive Applicants Report',
                  note:  '3 sheets — Drive info, all applicants with profile data, placed students list',
                  actions: [
                    {
                      label:   'Excel',
                      loading: loading.driveXl,
                      onClick: () => download(
                        'driveXl',
                        () => downloadDriveExcelApi(selectedDrive),
                        `drive_report_${Date.now()}.xlsx`,
                        'Drive Excel downloaded'
                      ),
                    },
                    {
                      label:   'PDF',
                      variant: 'primary',
                      loading: loading.drivePdf,
                      onClick: () => download(
                        'drivePdf',
                        () => downloadDrivePDFApi(selectedDrive),
                        `drive_report_${Date.now()}.pdf`,
                        'Drive PDF downloaded'
                      ),
                    },
                  ],
                },
              ].map((r, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm text-gray-700">{r.label}</p>
                    {r.note && <p className="text-xs text-gray-400 mt-0.5">{r.note}</p>}
                  </div>
                  <div className="flex gap-2">
                    {r.actions.map((action, j) => (
                      <Button
                        key={j}
                        size="sm"
                        variant={action.variant || 'secondary'}
                        loading={action.loading}
                        onClick={action.onClick}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <p className="text-sm text-gray-400">Select a drive above to download its report</p>
            </div>
          )}
        </Card>

        {/* Report descriptions */}
        <Card className="lg:col-span-2 bg-blue-50 border-blue-200">
          <CardHeader title="Report Contents Guide" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
            <div>
              <p className="font-semibold text-gray-700 mb-1">All Students Excel</p>
              <p className="leading-relaxed">Complete student roster with name, email, roll number, branch, batch, CGPA, backlogs, 10th/12th percentages, placement status, company placed at, and CTC.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700 mb-1">Placement Summary Excel</p>
              <p className="leading-relaxed">4 sheets — Overall KPIs, branch-wise statistics with placement percentage, company-wise drive summary, and all placed students sorted by CTC.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700 mb-1">NAAC 5.2.1 Report</p>
              <p className="leading-relaxed">Pre-formatted as per NAAC Criterion V requirements. Includes student name, programme, year of passing, employer, designation, pay package, and sector.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ReportsPage