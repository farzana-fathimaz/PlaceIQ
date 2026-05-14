import { useState, useRef } from 'react'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import { bulkImportStudentsApi } from '../../api/students.api'
import { useUiStore } from '../../store/uiStore'

const ImportStudentsModal = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef()
  const { showSuccess, showError } = useUiStore()

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
    setResult(null)
  }

  const handleImport = async () => {
    if (!file) return showError('Please select a CSV file')
    const formData = new FormData()
    formData.append('file', file)
    setLoading(true)
    try {
      const res = await bulkImportStudentsApi(formData)
      setResult(res.data.data)
      showSuccess(`Import done: ${res.data.data.created} students created`)
      onSuccess()
    } catch (err) {
      showError(err.response?.data?.message || 'Import failed')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setResult(null)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Bulk Import Students" size="md">
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-700 font-medium mb-1">CSV Format Required Columns:</p>
          <p className="text-xs text-blue-600 font-mono">
            name, email, rollNumber, branch, batch, cgpa, activeBacklogs, totalBacklogs, phone, gender, tenthPercent, twelfthPercent
          </p>
          <p className="text-xs text-blue-500 mt-1">Default password for all imported students: Student@123</p>
        </div>

        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />
          {file ? (
            <div>
              <p className="text-sm font-medium text-gray-700">{file.name}</p>
              <p className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div>
              <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-gray-500">Click to select CSV file</p>
            </div>
          )}
        </div>

        {result && (
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-2 divide-x divide-gray-200">
              <div className="p-3 text-center bg-green-50">
                <p className="text-2xl font-bold text-green-600">{result.created}</p>
                <p className="text-xs text-green-600">Created</p>
              </div>
              <div className="p-3 text-center bg-red-50">
                <p className="text-2xl font-bold text-red-500">{result.failed}</p>
                <p className="text-xs text-red-500">Failed</p>
              </div>
            </div>
            {result.errors?.length > 0 && (
              <div className="p-3 border-t border-gray-200 max-h-32 overflow-y-auto">
                {result.errors.map((e, i) => (
                  <p key={i} className="text-xs text-red-500">Row {e.row}: {e.error}</p>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={handleClose}>Close</Button>
          <Button onClick={handleImport} loading={loading} disabled={!file || loading}>
            Import Students
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ImportStudentsModal