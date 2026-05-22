import { useState, useEffect }       from 'react'
import {
  getSummaryApi,
  getBranchWiseApi,
  getCompanyWiseApi,
  getDriveWiseApi,
  getMonthlyTrendApi,
  getCGPADistributionApi,
  getTopPerformersApi,
  getRecentActivityApi,
} from '../../api/analytics.api'
import { useAnalyticsStore }         from '../../store/analyticsStore'
import { useUiStore }                from '../../store/uiStore'
import KPICard                       from '../../features/analytics/KPICard'
import ChartCard                     from '../../features/analytics/ChartCard'
import BranchChart                   from '../../features/analytics/BranchChart'
import TrendChart                    from '../../features/analytics/TrendChart'
import CGPAChart                     from '../../features/analytics/CGPAChart'
import CompanyChart                  from '../../features/analytics/CompanyChart'
import PlacementDonut                from '../../features/analytics/PlacementDonut'
import DriveFunnel                   from '../../features/analytics/DriveFunnel'
import RecentActivity                from '../../features/analytics/RecentActivity'
import TopPerformers                 from '../../features/analytics/TopPerformers'
import Button                        from '../../components/ui/Button'

const iconStudents = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const iconDrive = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const iconMoney = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const iconApps = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
)

const iconCheck = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const iconCTC = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const DashboardPage = () => {
  const {
    summary, branchWise, companyWise, driveWise,
    monthlyTrend, cgpaDistrib, topPerformers, recentActivity,
    setSummary, setBranchWise, setCompanyWise, setDriveWise,
    setMonthlyTrend, setCGPADistrib, setTopPerformers,
    setRecentActivity, lastFetched, setLastFetched,
  } = useAnalyticsStore()

  const { showError }   = useUiStore()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchAll = async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)

    try {
      const [
        summaryRes, branchRes, companyRes, driveRes,
        trendRes, cgpaRes, topRes, activityRes,
      ] = await Promise.all([
        getSummaryApi(),
        getBranchWiseApi(),
        getCompanyWiseApi(),
        getDriveWiseApi(),
        getMonthlyTrendApi(),
        getCGPADistributionApi(),
        getTopPerformersApi(),
        getRecentActivityApi(),
      ])

      setSummary(summaryRes.data.data)
      setBranchWise(branchRes.data.data.branches)
      setCompanyWise(companyRes.data.data.companies)
      setDriveWise(driveRes.data.data.drives)
      setMonthlyTrend(trendRes.data.data.trend)
      setCGPADistrib(cgpaRes.data.data.distribution)
      setTopPerformers(topRes.data.data.performers)
      setRecentActivity(activityRes.data.data)
      setLastFetched()
    } catch {
      showError('Failed to load analytics data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const CACHE_MS = 5 * 60 * 1000
    if (!lastFetched || Date.now() - lastFetched > CACHE_MS) {
      fetchAll()
    } else {
      setLoading(false)
    }
  }, [])

  const s = summary

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="animate-spin h-10 w-10 rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-3" />
            <p className="text-sm text-gray-400">Loading analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Placement Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Real-time placement analytics overview
          </p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          loading={refreshing}
          onClick={() => fetchAll(true)}
        >
          Refresh
        </Button>
      </div>

      {/* Row 1 — KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        <KPICard
          label="Total Students"
          value={s?.totalStudents ?? 0}
          color="blue"
          icon={iconStudents}
        />
        <KPICard
          label="Placed"
          value={s?.totalPlaced ?? 0}
          sub={`${s?.placementPct ?? 0}% placement rate`}
          color="green"
          icon={iconCheck}
        />
        <KPICard
          label="Avg CTC"
          value={s?.avgCTC > 0 ? `₹${s.avgCTC}L` : '—'}
          sub={s?.highCTC > 0 ? `Highest ₹${s.highCTC}L` : ''}
          color="purple"
          icon={iconMoney}
        />
        <KPICard
          label="Total Drives"
          value={s?.totalDrives ?? 0}
          sub={`${s?.activeDrives ?? 0} active`}
          color="orange"
          icon={iconDrive}
        />
        <KPICard
          label="Applications"
          value={s?.totalApplications ?? 0}
          color="blue"
          icon={iconApps}
        />
        <KPICard
          label="Highest CTC"
          value={s?.highCTC > 0 ? `₹${s.highCTC}L` : '—'}
          color="green"
          icon={iconCTC}
        />
      </div>

      {/* Row 2 — Donut + Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <ChartCard
          title="Placement Overview"
          subtitle="Overall placement rate"
        >
          <PlacementDonut
            placed={s?.totalPlaced ?? 0}
            total={s?.totalStudents ?? 0}
          />
        </ChartCard>

        <ChartCard
          title="Monthly Trend"
          subtitle="Applications and placements over 12 months"
          className="lg:col-span-2"
        >
          <TrendChart data={monthlyTrend} />
        </ChartCard>
      </div>

      {/* Row 3 — Branch chart + Company chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard
          title="Branch-wise Placement"
          subtitle="Placed vs not placed by branch"
        >
          <BranchChart data={branchWise} />

          {/* Branch detail table */}
          {branchWise.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-1.5 text-gray-400 font-medium">Branch</th>
                    <th className="text-right py-1.5 text-gray-400 font-medium">Total</th>
                    <th className="text-right py-1.5 text-gray-400 font-medium">Placed</th>
                    <th className="text-right py-1.5 text-gray-400 font-medium">%</th>
                    <th className="text-right py-1.5 text-gray-400 font-medium">Avg CTC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {branchWise.map((b) => (
                    <tr key={b.branch}>
                      <td className="py-1.5 font-medium text-gray-700">{b.branch}</td>
                      <td className="py-1.5 text-right text-gray-500">{b.total}</td>
                      <td className="py-1.5 text-right text-green-600 font-medium">{b.placed}</td>
                      <td className="py-1.5 text-right">
                        <span className={`font-semibold ${
                          b.pct >= 70 ? 'text-green-600' :
                          b.pct >= 40 ? 'text-yellow-600' : 'text-red-500'
                        }`}>
                          {b.pct}%
                        </span>
                      </td>
                      <td className="py-1.5 text-right text-gray-500">
                        {b.avgCTC > 0 ? `₹${b.avgCTC}L` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Top Companies"
          subtitle="Students placed per company (top 10)"
        >
          <CompanyChart data={companyWise} />

          {/* Company detail list */}
          {companyWise.length > 0 && (
            <div className="mt-3 space-y-1.5 max-h-32 overflow-y-auto">
              {companyWise.slice(0, 8).map((c, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">
                      {c.company?.[0]?.toUpperCase()}
                    </span>
                    <span className="text-gray-700 truncate max-w-32">{c.company}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">{c.count} placed</span>
                    {c.avgCTC > 0 && (
                      <span className="text-green-600 font-medium">₹{c.avgCTC}L avg</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </div>

      {/* Row 4 — CGPA distribution + Drive funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard
          title="CGPA Distribution"
          subtitle="Student count by CGPA range"
        >
          <CGPAChart data={cgpaDistrib} />

          {cgpaDistrib.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {cgpaDistrib.map((d) => (
                <div key={d.label} className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-sm font-bold text-gray-800">{d.total}</p>
                  <p className="text-xs text-gray-400">CGPA {d.label}</p>
                  <p className="text-xs text-green-600 font-medium">{d.placed} placed</p>
                </div>
              ))}
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Drive Performance"
          subtitle="Applicants vs placements per drive"
        >
          <DriveFunnel drives={driveWise} />
        </ChartCard>
      </div>

      {/* Row 5 — Top performers + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard
          title="Top Performers by CTC"
          subtitle="Highest package placements"
        >
          <TopPerformers performers={topPerformers} />
        </ChartCard>

        <ChartCard
          title="Recent Activity"
          subtitle="Latest application status changes"
        >
          <RecentActivity
            applications={recentActivity?.recentApplications || []}
            drives={recentActivity?.recentDrives || []}
          />
        </ChartCard>
      </div>

      {/* Row 6 — Application status breakdown */}
      {s?.appByStatus && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">
            Application Pipeline Breakdown
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { key: 'applied',     label: 'Applied',     color: 'text-blue-600',   bg: 'bg-blue-50'   },
              { key: 'shortlisted', label: 'Shortlisted', color: 'text-yellow-600', bg: 'bg-yellow-50' },
              { key: 'in_rounds',   label: 'In Rounds',   color: 'text-purple-600', bg: 'bg-purple-50' },
              { key: 'placed',      label: 'Placed',      color: 'text-green-600',  bg: 'bg-green-50'  },
              { key: 'rejected',    label: 'Rejected',    color: 'text-red-500',    bg: 'bg-red-50'    },
              { key: 'withdrawn',   label: 'Withdrawn',   color: 'text-gray-500',   bg: 'bg-gray-50'   },
            ].map(({ key, label, color, bg }) => (
              <div key={key} className={`${bg} rounded-xl p-3 text-center`}>
                <p className={`text-2xl font-bold ${color}`}>
                  {s.appByStatus[key] ?? 0}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Row 7 — Drive status breakdown */}
      {s?.driveByStatus && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Drive Status Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { key: 'draft',    label: 'Draft',    color: 'text-gray-600',  bg: 'bg-gray-50'  },
              { key: 'upcoming', label: 'Upcoming', color: 'text-blue-600',  bg: 'bg-blue-50'  },
              { key: 'active',   label: 'Active',   color: 'text-green-600', bg: 'bg-green-50' },
              { key: 'closed',   label: 'Closed',   color: 'text-red-500',   bg: 'bg-red-50'   },
              { key: 'archived', label: 'Archived', color: 'text-gray-400',  bg: 'bg-gray-100' },
            ].map(({ key, label, color, bg }) => (
              <div key={key} className={`${bg} rounded-xl p-3 text-center`}>
                <p className={`text-2xl font-bold ${color}`}>
                  {s.driveByStatus[key] ?? 0}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage