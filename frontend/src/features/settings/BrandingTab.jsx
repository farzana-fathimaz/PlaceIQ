import { useState, useRef } from 'react'
import { uploadLogoApi }    from '../../api/settings.api'
import { useUiStore }       from '../../store/uiStore'
import Input                from '../../components/ui/Input'
import Button               from '../../components/ui/Button'

const BrandingTab = ({ form, setForm, settings, onLogoUpdate }) => {
  const [uploading,  setUploading]  = useState(false)
  const { showSuccess, showError }  = useUiStore()
  const logoRef = useRef()

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('logo', file)
    setUploading(true)
    try {
      const res = await uploadLogoApi(fd)
      onLogoUpdate(res.data.data.logoUrl)
      showSuccess('Logo uploaded successfully')
    } catch (err) {
      showError(err.response?.data?.message || 'Logo upload failed')
    } finally {
      setUploading(false)
    }
  }

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const currentLogo = settings?.logo
    ? `http://localhost:5000${settings.logo}`
    : null

  return (
    <div className="space-y-5">
      {/* Logo upload */}
      <div>
        <label className="label mb-2 block">College Logo</label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden shrink-0">
            {currentLogo ? (
              <img
                src={currentLogo}
                alt="College logo"
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </div>
          <div>
            <input
              ref={logoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
            <Button
              variant="secondary"
              size="sm"
              loading={uploading}
              onClick={() => logoRef.current?.click()}
            >
              {currentLogo ? 'Replace Logo' : 'Upload Logo'}
            </Button>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG. Max 2MB.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="College Name"
          required
          value={form.collegeName || ''}
          placeholder="Shri Ram College of Engineering"
          onChange={(e) => set('collegeName', e.target.value)}
        />
        <Input
          label="College Code"
          value={form.collegeCode || ''}
          placeholder="SRCE"
          onChange={(e) => set('collegeCode', e.target.value)}
        />
      </div>

      <Input
        label="Address"
        value={form.address || ''}
        placeholder="123 College Road, Area"
        onChange={(e) => set('address', e.target.value)}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="City"
          value={form.city || ''}
          placeholder="Bengaluru"
          onChange={(e) => set('city', e.target.value)}
        />
        <Input
          label="State"
          value={form.state || ''}
          placeholder="Karnataka"
          onChange={(e) => set('state', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Website"
          value={form.website || ''}
          placeholder="https://college.edu.in"
          onChange={(e) => set('website', e.target.value)}
        />
        <Input
          label="NAAC Grade"
          value={form.naacGrade || ''}
          placeholder="A, A+, B++"
          onChange={(e) => set('naacGrade', e.target.value)}
        />
      </div>
    </div>
  )
}

export default BrandingTab