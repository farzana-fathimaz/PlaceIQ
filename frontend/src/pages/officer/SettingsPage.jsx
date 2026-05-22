import { useState, useEffect }     from 'react'
import {
  getSettingsApi,
  createSettingsApi,
  updateSettingsApi,
}                                  from '../../api/settings.api'
import { useSettingsStore }        from '../../store/settingsStore'
import { useUiStore }              from '../../store/uiStore'
import Button                      from '../../components/ui/Button'
import BrandingTab                 from '../../features/settings/BrandingTab'
import ContactTab                  from '../../features/settings/ContactTab'
import AcademicTab                 from '../../features/settings/AcademicTab'
import DefaultEligibilityTab       from '../../features/settings/DefaultEligibilityTab'
import { PageSpinner }             from '../../components/ui/Spinner'

const TABS = [
  { key: 'branding',     label: 'Branding & Identity' },
  { key: 'contact',      label: 'Contact & Officer'   },
  { key: 'academic',     label: 'Branches & Batches'  },
  { key: 'eligibility',  label: 'Default Eligibility' },
]

const defaultForm = {
  collegeName:          '',
  collegeCode:          '',
  address:              '',
  city:                 '',
  state:                '',
  contactEmail:         '',
  contactPhone:         '',
  website:              '',
  academicYear:         '',
  placementOfficerName: '',
  naacGrade:            '',
  branches:             [],
  defaultEligibility: {
    minCGPA:           6.0,
    maxBacklogs:       0,
    allowedBranches:   [],
    genderAllowed:     'All',
    tenthMin:          60,
    twelfthMin:        60,
    allowPlaced:       false,
  },
}

const SettingsPage = () => {
  const { settings, setSettings, updateSettings } = useSettingsStore()
  const { showSuccess, showError }                = useUiStore()

  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [activeTab,  setActiveTab]  = useState('branding')
  const [form,       setForm]       = useState(defaultForm)
  const [isDirty,    setIsDirty]    = useState(false)
  const [isNew,      setIsNew]      = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getSettingsApi()
        const s   = res.data.data.settings

        if (s) {
          setSettings(s, true)
          setForm({
            collegeName:          s.collegeName          || '',
            collegeCode:          s.collegeCode          || '',
            address:              s.address              || '',
            city:                 s.city                 || '',
            state:                s.state                || '',
            contactEmail:         s.contactEmail         || '',
            contactPhone:         s.contactPhone         || '',
            website:              s.website              || '',
            academicYear:         s.academicYear         || '',
            placementOfficerName: s.placementOfficerName || '',
            naacGrade:            s.naacGrade            || '',
            branches:             s.branches             || [],
            defaultEligibility:   s.defaultEligibility   || defaultForm.defaultEligibility,
          })
          setIsNew(false)
        } else {
          setIsNew(true)
        }
      } catch {
        setIsNew(true)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  // Track unsaved changes
  useEffect(() => {
    setIsDirty(true)
  }, [form])

  const handleSave = async () => {
    if (!form.collegeName?.trim()) {
      return showError('College name is required')
    }
    setSaving(true)
    try {
      let res
      if (isNew) {
        res = await createSettingsApi(form)
        setIsNew(false)
        showSuccess('Settings created successfully')
      } else {
        res = await updateSettingsApi(form)
        showSuccess('Settings saved successfully')
      }
      updateSettings(res.data.data.settings)
      setIsDirty(false)
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpdate = (logoUrl) => {
    updateSettings({ ...settings, logo: logoUrl })
  }

  const handleSettingsUpdate = (updated) => {
    updateSettings(updated)
  }

  if (loading) return <PageSpinner />

  return (
    <div className="page-wrapper max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">College Settings</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {isNew
              ? 'Complete your college setup to get started'
              : `Last updated: ${settings?.updatedAt
                  ? new Date(settings.updatedAt).toLocaleDateString('en-IN')
                  : '—'}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isDirty && !saving && (
            <span className="text-xs text-amber-500 font-medium">
              Unsaved changes
            </span>
          )}
          <Button onClick={handleSave} loading={saving}>
            {isNew ? 'Save Settings' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* First-time setup banner */}
      {isNew && (
        <div className="mb-5 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-800">First-time Setup</p>
              <p className="text-xs text-blue-600 mt-0.5">
                Configure your college information before using PlaceIQ. At minimum, fill in the College Name and save.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Settings card with tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        {/* Tab bar */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-6">
          {activeTab === 'branding' && (
            <BrandingTab
              form={form}
              setForm={setForm}
              settings={settings}
              onLogoUpdate={handleLogoUpdate}
            />
          )}
          {activeTab === 'contact' && (
            <ContactTab
              form={form}
              setForm={setForm}
            />
          )}
          {activeTab === 'academic' && (
            <AcademicTab
              form={form}
              setForm={setForm}
              settings={settings}
              onSettingsUpdate={handleSettingsUpdate}
            />
          )}
          {activeTab === 'eligibility' && (
            <DefaultEligibilityTab
              form={form}
              setForm={setForm}
            />
          )}
        </div>

        {/* Sticky save footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between rounded-b-xl">
          <div className="text-xs text-gray-400">
            {settings?.collegeName && (
              <span>
                <span className="font-medium text-gray-600">{settings.collegeName}</span>
                {settings.academicYear && ` · ${settings.academicYear}`}
                {settings.naacGrade && ` · NAAC ${settings.naacGrade}`}
              </span>
            )}
          </div>
          <Button onClick={handleSave} loading={saving} size="sm">
            {isNew ? 'Save Settings' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Current settings info card */}
      {settings && !isNew && (
        <div className="mt-4 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Current Configuration</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'College',       value: settings.collegeName    || '—' },
              { label: 'Academic Year', value: settings.academicYear   || '—' },
              { label: 'Branches',      value: `${(settings.branches || []).length} active` },
              { label: 'Batches',       value: `${(settings.batches  || []).length} configured` },
              { label: 'City',          value: settings.city           || '—' },
              { label: 'Contact Email', value: settings.contactEmail   || '—' },
              { label: 'NAAC Grade',    value: settings.naacGrade      || '—' },
              { label: 'Setup Status',  value: settings.isSetupComplete ? 'Complete' : 'Incomplete' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm font-medium text-gray-700 mt-0.5 truncate">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SettingsPage