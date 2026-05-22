import { useState, useEffect }               from 'react'
import { useNavigate }                       from 'react-router-dom'
import { getStudentDashboardApi }            from '../../api/studentDashboard.api'
import { useAuthStore }                      from '../../store/authStore'
import { useUiStore }                        from '../../store/uiStore'
import { getInitials }                       from '../../utils/helpers'
import Button                               from '../../components/ui/Button'
import { PageSpinner }                      from '../../components/ui/Spinner'
import ProfileCompletionRing               from '../../features/studentDashboard/ProfileCompletionRing'
import ApplicationPipeline                 from '../../features/studentDashboard/ApplicationPipeline'
import EligibleDrivesWidget                from '../../features/studentDashboard/EligibleDrivesWidget'
import ActiveRoundsWidget                  from '../../features/studentDashboard/ActiveRoundsWidget'
import NotifSnippet                        from '../../features/studentDashboard/NotifSnippet'
import PlacedCard                          from '../../features/studentDashboard/PlacedCard'

const StatChip = ({ label, value, color = 'gray' }) => {
  const colors = {
    blue:   'bg-blue-50 text-blue-700',
    green:  'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    red:    'bg-red-50 text-red-600',
    gray:   'bg-gray-100 text-gray-600',
  }
  return (
    <div className={`rounded-xl p-3 text-center ${colors[color]}`}>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs mt-0.5 opacity-80">{label}</p>
    </div>
  )
}

const StudentDashboardPage = () => {
  const { user }                 = useAuthStore()
  const { showError }            = useUiStore()
  const navigate                 = useNavigate()

  const [data,      setData]      = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchDashboard = async (silent = false) => {
    if (silent) setRefreshing(true)
    else setLoading(true)

    try {
      const res = await getStudentDashboardApi()
      setData(res.data.data)
    } catch {
      showError('Failed to load dashboard')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchDashboard() }, [])

  if (loading) return <PageSpinner />

  const stats   = data?.stats
  const profile = data?.profile
  const isNew   = !data?.hasProfile

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Welcome back, {user?.name?.split(' ')[0] || 'Student'} 👋
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Here is your placement status at a glance
          </p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          loading={refreshing}
          onClick={() => fetchDashboard(true)}
        >
          Refresh
        </Button>
      </div>

      {/* No profile banner */}
      {isNew && (
        <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚠️</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">Profile not set up</p>
              <p className="text-xs text-amber-600 mt-1">
                Your profile hasn't been created yet. Ask the placement officer to add you to the system.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Placed student — show celebration card prominently */}
      {stats?.isPlaced && (
        <div className="mb-5">
          <PlacedCard
            company={stats.placedAt}
            ctc={stats.placedCTC}
          />
        </div>
      )}

      {/* Row 1 — Profile card + Stats */}
      {data?.hasProfile && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

          {/* Profile Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold">
                  {getInitials(user?.name)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
              {[
                ['Roll No',   profile?.rollNumber || '—'],
                ['Branch',    profile?.branch     || '—'],
                ['Batch',     profile?.batch      || '—'],
                ['CGPA',      profile?.cgpa       || '—'],
              ].map(([label, val]) => (
                <div key={label} className="bg-gray-50 rounded-lg p-2">
                  <p className="text-gray-400">{label}</p>
                  <p className="font-semibold text-gray-700 mt-0.5">{val}</p>
                </div>
              ))}
            </div>

            {/* Profile completion */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-0.5">Profile Completion</p>
                <p className="text-xs text-gray-400">
                  {stats?.profileCompletion < 80
                    ? 'Complete your profile to increase visibility'
                    : 'Profile looks good!'}
                </p>
                <button
                  onClick={() => navigate('/student/profile')}
                  className="text-xs text-blue-600 hover:underline mt-1"
                >
                  {stats?.profileCompletion < 100 ? 'Complete profile →' : 'View profile →'}
                </button>
              </div>
              <ProfileCompletionRing pct={stats?.profileCompletion || 0} size={72} />
            </div>

            {/* Resume status */}
            <div className={`mt-3 px-3 py-2 rounded-lg border text-xs flex items-center gap-2 ${
              profile?.resumeUrl
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-600'
            }`}>
              <span>{profile?.resumeUrl ? '✓' : '✗'}</span>
              <span>{profile?.resumeUrl ? 'Resume uploaded' : 'Resume not uploaded'}</span>
              {!profile?.resumeUrl && (
                <button
                  onClick={() => navigate('/student/profile')}
                  className="ml-auto font-medium hover:underline"
                >
                  Upload →
                </button>
              )}
            </div>
          </div>

          {/* Stats grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-3 gap-3 mb-3">
              <StatChip label="Applications"  value={stats?.totalApps     || 0} color="blue"   />
              <StatChip label="Shortlisted"   value={stats?.shortlisted   || 0} color="yellow" />
              <StatChip label="In Rounds"     value={stats?.inRoundsCount || 0} color="purple" />
            </div>

            {/* Placement status */}
            <div className={`rounded-xl p-5 border ${
              stats?.isPlaced
                ? 'bg-green-50 border-green-200'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                  stats?.isPlaced ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  {stats?.isPlaced ? '🏆' : '🎯'}
                </div>
                <div>
                  <p className={`text-sm font-bold ${stats?.isPlaced ? 'text-green-800' : 'text-blue-800'}`}>
                    {stats?.isPlaced ? 'Placed Successfully' : 'Placement Pending'}
                  </p>
                  {stats?.isPlaced ? (
                    <p className="text-xs text-green-600 mt-0.5">
                      {stats.placedAt}
                      {stats.placedCTC ? ` · ₹${stats.placedCTC} LPA` : ''}
                    </p>
                  ) : (
                    <p className="text-xs text-blue-500 mt-0.5">
                      Keep applying to eligible drives. You've got this!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Backlogs warning */}
            {profile?.activeBacklogs > 0 && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-2">
                <span className="text-red-500 text-sm mt-0.5">⚠</span>
                <div>
                  <p className="text-xs font-semibold text-red-700">
                    {profile.activeBacklogs} Active Backlog{profile.activeBacklogs > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-red-500 mt-0.5">
                    Active backlogs may restrict eligibility for some drives. Clear them to improve your chances.
                  </p>
                </div>
              </div>
            )}

            {/* Unread notifications chip */}
            {stats?.unreadNotifs > 0 && (
              <div
                className="mt-3 bg-blue-600 text-white rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-blue-700 transition-colors"
                onClick={() => navigate('/student/notifications')}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🔔</span>
                  <p className="text-sm font-medium">
                    {stats.unreadNotifs} unread notification{stats.unreadNotifs > 1 ? 's' : ''}
                  </p>
                </div>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Row 2 — Application pipeline + Eligible drives */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">My Applications</h3>
              <p className="text-xs text-gray-400 mt-0.5">Recent application pipeline</p>
            </div>
            <button
              onClick={() => navigate('/student/applications')}
              className="text-xs text-blue-600 hover:underline"
            >
              View all →
            </button>
          </div>
          <ApplicationPipeline applications={data?.applications || []} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Eligible Drives</h3>
              <p className="text-xs text-gray-400 mt-0.5">Open drives you haven't applied to</p>
            </div>
            <button
              onClick={() => navigate('/student/drives')}
              className="text-xs text-blue-600 hover:underline"
            >
              Browse all →
            </button>
          </div>
          <EligibleDrivesWidget drives={data?.eligibleDrives || []} />
        </div>
      </div>

      {/* Row 3 — Active rounds + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Active Rounds</h3>
              <p className="text-xs text-gray-400 mt-0.5">Rounds you are participating in</p>
            </div>
          </div>
          <ActiveRoundsWidget roundData={data?.roundData || []} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Recent Notifications</h3>
              <p className="text-xs text-gray-400 mt-0.5">Latest updates for you</p>
            </div>
            <button
              onClick={() => navigate('/student/notifications')}
              className="text-xs text-blue-600 hover:underline"
            >
              View all →
            </button>
          </div>
          <NotifSnippet notifications={data?.notifications || []} />
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-4 bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => navigate('/student/drives')}>
            Browse Drives
          </Button>
          <Button size="sm" variant="secondary" onClick={() => navigate('/student/applications')}>
            My Applications
          </Button>
          <Button size="sm" variant="secondary" onClick={() => navigate('/student/profile')}>
            Edit Profile
          </Button>
          <Button size="sm" variant="secondary" onClick={() => navigate('/student/notifications')}>
            Notifications {stats?.unreadNotifs > 0 ? `(${stats.unreadNotifs})` : ''}
          </Button>
          {profile?.resumeUrl && (
            
            <a href={`http://localhost:5000${profile.resumeUrl}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              View Resume
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentDashboardPage