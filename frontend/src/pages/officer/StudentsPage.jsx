import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getStudentsApi,
  toggleStudentActiveApi,
  exportStudentsApi,
} from '../../api/students.api'
import { useStudentStore } from '../../store/studentStore'
import { useUiStore } from '../../store/uiStore'
import { BRANCHES } from '../../utils/constants'
import { formatDate, downloadBlob, debounce } from '../../utils/helpers'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import AddStudentModal from '../../features/students/AddStudentModal'
import ImportStudentsModal from '../../features/students/ImportStudentsModal'

const branchOptions = BRANCHES.map((b) => ({ label: b, value: b }))
const statusOptions = [
  { label: 'Not Placed', value: 'not_placed' },
  { label: 'Placed', value: 'placed' },
]

const StudentsPage = () => {
  const { students, pagination, filters, setStudents, setFilters, resetFilters } = useStudentStore()
  const { showSuccess, showError } = useUiStore()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [showImport, setShowImport] = useState(false)

  const fetchStudents = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const res = await getStudentsApi({ ...filters, ...params })
      setStudents(res.data.data.students, res.data.data.pagination)
    } catch (err) {
      showError('Failed to load students')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchStudents()
  }, [])

  const debouncedSearch = useCallback(
    debounce((val) => {
      setFilters({ search: val })
      fetchStudents({ search: val })
    }, 500),
    []
  )

  const handleFilterChange = (key, value) => {
    setFilters({ [key]: value })
    fetchStudents({ [key]: value })
  }

  const handleReset = () => {
    resetFilters()
    fetchStudents({ search: '', branch: '', batch: '', placementStatus: '' })
  }

  const handleToggleActive = async (id, name) => {
    try {
      const res = await toggleStudentActiveApi(id)
      showSuccess(`${name} ${res.data.data.isActive ? 'activated' : 'deactivated'}`)
      fetchStudents()
    } catch {
      showError('Failed to update student status')
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await exportStudentsApi()
      downloadBlob(res.data, 'students.xlsx')
      showSuccess('Export downloaded successfully')
    } catch {
      showError('Export failed')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Students</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pagination?.total ?? 0} total students
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowImport(true)}>
            Import CSV
          </Button>
          <Button variant="secondary" onClick={handleExport} loading={exporting}>
            Export Excel
          </Button>
          <Button onClick={() => setShowAdd(true)}>
            + Add Student
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="col-span-2">
            <Input
              placeholder="Search name, email, roll number..."
              defaultValue={filters.search}
              onChange={(e) => debouncedSearch(e.target.value)}
            />
          </div>
          <Select
            placeholder="All Branches"
            options={branchOptions}
            value={filters.branch}
            onChange={(e) => handleFilterChange('branch', e.target.value)}
          />
          <Input
            placeholder="Batch e.g. 2021-2025"
            value={filters.batch}
            onChange={(e) => handleFilterChange('batch', e.target.value)}
          />
          <Select
            placeholder="Placement Status"
            options={statusOptions}
            value={filters.placementStatus}
            onChange={(e) => handleFilterChange('placementStatus', e.target.value)}
          />
          <Button variant="ghost" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card padding={false}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin h-6 w-6 rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : students.length === 0 ? (
          <EmptyState
            title="No students found"
            description="Add students manually or import via CSV"
            action={<Button onClick={() => setShowAdd(true)}>Add Student</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Student</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Roll No</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Branch</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Batch</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">CGPA</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Backlogs</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((s) => (
                  <tr
                    key={s._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold shrink-0">
                          {s.userId?.name?.[0]?.toUpperCase() || 'S'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{s.userId?.name}</p>
                          <p className="text-xs text-gray-400">{s.userId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{s.rollNumber}</td>
                    <td className="px-4 py-3">
                      <Badge variant="blue">{s.branch}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{s.batch}</td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${s.cgpa >= 7 ? 'text-green-600' : s.cgpa >= 6 ? 'text-yellow-600' : 'text-red-500'}`}>
                        {s.cgpa}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={s.activeBacklogs > 0 ? 'text-red-500 font-medium' : 'text-gray-400'}>
                        {s.activeBacklogs}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={s.placementStatus === 'placed' ? 'green' : 'default'}>
                        {s.placementStatus === 'placed' ? 'Placed' : 'Not Placed'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/officer/students/${s._id}`)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleToggleActive(s._id, s.userId?.name)}
                          className={`text-xs font-medium ${s.userId?.isActive ? 'text-red-500 hover:text-red-700' : 'text-green-600 hover:text-green-800'}`}
                        >
                          {s.userId?.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Page {pagination.page} of {pagination.totalPages} — {pagination.total} students
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={pagination.page <= 1}
                onClick={() => fetchStudents({ page: pagination.page - 1 })}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchStudents({ page: pagination.page + 1 })}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <AddStudentModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={fetchStudents}
      />

      <ImportStudentsModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onSuccess={fetchStudents}
      />
    </div>
  )
}

export default StudentsPage