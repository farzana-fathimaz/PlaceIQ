import Input from '../../components/ui/Input'

const ContactTab = ({ form, setForm }) => {
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Placement Officer Name"
          value={form.placementOfficerName || ''}
          placeholder="Dr. Ramesh Kumar"
          onChange={(e) => set('placementOfficerName', e.target.value)}
        />
        <Input
          label="Academic Year"
          value={form.academicYear || ''}
          placeholder="2024-25"
          onChange={(e) => set('academicYear', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Contact Email"
          type="email"
          value={form.contactEmail || ''}
          placeholder="placement@college.edu.in"
          onChange={(e) => set('contactEmail', e.target.value)}
        />
        <Input
          label="Contact Phone"
          value={form.contactPhone || ''}
          placeholder="080-12345678"
          onChange={(e) => set('contactPhone', e.target.value)}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
        <p className="text-xs text-blue-700">
          <span className="font-medium">Note:</span> Contact information appears on exported PDF reports and NAAC documents.
        </p>
      </div>
    </div>
  )
}

export default ContactTab