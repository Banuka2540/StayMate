import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getContentReports,
  getReportExportUrl,
  getSystemReportSummary,
  seedDemoNotificationsAndReports,
  updateContentReportStatus,
} from '../api/notificationApi'
import { Icon } from '../components/Icon'
import { ReportListingModal } from '../components/ReportListingModal'
import { useNotifications } from '../context/useNotifications'

const wrap = 'mx-auto w-[calc(100%-36px)] max-w-[1450px] sm:w-[calc(100%-88px)]'
const card = 'rounded-[18px] border border-[#d8e0db] bg-white p-5 shadow-[0_8px_24px_#00000008] sm:p-6'

const PERIODS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
]

const REPORT_STATUS_STYLE = {
  Pending: 'bg-[#fbf0d9] text-[#8a6116]',
  'Under Review': 'bg-[#e6f0f8] text-[#28557d]',
  Resolved: 'bg-[#e3f1ea] text-[#1f6a4f]',
  Dismissed: 'bg-[#edf2ef] text-[#52635f]',
}

const NOTIF_LABELS = {
  reservation: 'Reservation alerts',
  payment: 'Payment alerts',
  payment_reminder: 'Monthly rent reminders',
  listing_approval: 'Listing approvals',
  report: 'Content reports',
  system: 'System notices',
}

const money = (value) => `LKR ${Number(value || 0).toLocaleString()}`

const shortDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

export function ReportsPage() {
  const notifCtx = useNotifications()
  const [tab, setTab] = useState('system')
  const [period, setPeriod] = useState('30d')

  const [summary, setSummary] = useState(null)
  const [loadingSummary, setLoadingSummary] = useState(true)

  const [reports, setReports] = useState([])
  const [countsByStatus, setCountsByStatus] = useState({ Pending: 0, 'Under Review': 0, Resolved: 0, Dismissed: 0 })
  const [statusFilter, setStatusFilter] = useState('All')
  const [targetTypeFilter, setTargetTypeFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [totalReports, setTotalReports] = useState(0)
  const [loadingReports, setLoadingReports] = useState(true)

  const [error, setError] = useState('')
  const [banner, setBanner] = useState('')
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reviewing, setReviewing] = useState(null)
  const [nextStatus, setNextStatus] = useState('Resolved')
  const [adminNote, setAdminNote] = useState('')
  const [saving, setSaving] = useState(false)

  const loadSummary = useCallback(async () => {
    setLoadingSummary(true)
    try {
      const data = await getSystemReportSummary(period)
      setSummary(data)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingSummary(false)
    }
  }, [period])

  const loadContentReports = useCallback(async () => {
    setLoadingReports(true)
    try {
      const data = await getContentReports({
        status: statusFilter,
        targetType: targetTypeFilter,
        search: search.trim(),
        page,
        limit: 10,
      })
      setReports(data.reports || [])
      setCountsByStatus(data.countsByStatus || { Pending: 0, 'Under Review': 0, Resolved: 0, Dismissed: 0 })
      setTotalReports(data.total || 0)
      setPages(data.pages || 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingReports(false)
    }
  }, [page, search, statusFilter, targetTypeFilter])

  useEffect(() => {
    let cancelled = false
    getSystemReportSummary(period)
      .then((data) => {
        if (!cancelled) {
          setSummary(data)
          setError('')
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoadingSummary(false)
      })
    return () => {
      cancelled = true
    }
  }, [period])

  useEffect(() => {
    let cancelled = false
    getContentReports({
      status: statusFilter,
      targetType: targetTypeFilter,
      search: search.trim(),
      page,
      limit: 10,
    })
      .then((data) => {
        if (!cancelled) {
          setReports(data.reports || [])
          setCountsByStatus(data.countsByStatus || { Pending: 0, 'Under Review': 0, Resolved: 0, Dismissed: 0 })
          setTotalReports(data.total || 0)
          setPages(data.pages || 1)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoadingReports(false)
      })
    return () => {
      cancelled = true
    }
  }, [page, search, statusFilter, targetTypeFilter])

  const handleSeedDemo = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await seedDemoNotificationsAndReports()
      setBanner(res.message)
      await Promise.all([loadSummary(), loadContentReports()])
      notifCtx?.refreshUnread?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const openReviewModal = (item) => {
    setReviewing(item)
    setNextStatus(item.status === 'Pending' ? 'Under Review' : item.status)
    setAdminNote(item.adminNote || '')
  }

  const handleSaveModeration = async (e) => {
    e.preventDefault()
    if (!reviewing) return
    setSaving(true)
    setError('')
    try {
      const res = await updateContentReportStatus(reviewing._id, {
        status: nextStatus,
        adminNote,
      })
      setBanner(res.message)
      setReviewing(null)
      await Promise.all([loadSummary(), loadContentReports()])
      notifCtx?.refreshUnread?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const overview = summary?.overview || {}
  const payments = summary?.payments || {}
  const notifByType = summary?.notifications?.byType || {}
  const totalNotifs = summary?.notifications?.total || 0

  return (
    <main className={`${wrap} pb-16 pt-7 sm:pt-10`}>
      <div className="flex gap-2 text-[10px] text-[#8f9d96] sm:text-xs print:hidden">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>System Reports</span>
      </div>

      {/* Header */}
      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[1.25px] text-[#578879]">
            <span className="h-2 w-2 rounded-full bg-[#d4aa64]" />
            Module 9 · Reporting &amp; Analytics
          </span>
          <h1 className="mt-2 text-[29px] font-extrabold tracking-[-1.2px] text-[#17483e] sm:text-4xl">
            System Reports &amp; Moderation
          </h1>
          <p className="mt-1.5 text-xs text-[#718079] sm:text-sm">
            Monitor platform activity, payment summaries, notification delivery, and reported listings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 print:hidden">
          <select
            aria-label="Report period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="h-10 rounded-xl border border-[#d8e0db] bg-white px-3 text-xs font-bold text-[#17443b] outline-none"
          >
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#d8e0db] bg-white px-4 text-xs font-bold text-[#17443b] hover:bg-[#eaf4ef]"
          >
            <Icon name="printer" size={15} />
            Print report
          </button>

          <a
            href={getReportExportUrl('overview', period)}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#17443b] px-4 text-xs font-bold text-white transition hover:bg-[#246257]"
          >
            <Icon name="download" size={15} />
            Export CSV
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="inline-flex rounded-xl border border-[#d8e0db] bg-white p-1">
          <button
            type="button"
            onClick={() => setTab('system')}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
              tab === 'system' ? 'bg-[#17443b] text-white' : 'text-[#52635f] hover:text-[#17443b]'
            }`}
          >
            Basic system reports
          </button>
          <button
            type="button"
            onClick={() => setTab('moderation')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
              tab === 'moderation' ? 'bg-[#17443b] text-white' : 'text-[#52635f] hover:text-[#17443b]'
            }`}
          >
            Reported content
            {(countsByStatus.Pending || 0) > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  tab === 'moderation' ? 'bg-white/20 text-white' : 'bg-[#fdf1e6] text-[#9b5b1c]'
                }`}
              >
                {countsByStatus.Pending}
              </span>
            )}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={handleSeedDemo}
            className="rounded-xl border border-[#dce6e0] bg-white px-3.5 py-2 text-xs font-bold text-[#31594f] hover:bg-[#eaf4ef]"
          >
            Load sample data
          </button>
          <button
            type="button"
            onClick={() => setReportModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#dce6e0] bg-white px-3.5 py-2 text-xs font-bold text-[#9b5b1c] hover:bg-[#fdf7f1]"
          >
            <Icon name="flag" size={14} />
            Report listing
          </button>
        </div>
      </div>

      {banner && (
        <div
          role="status"
          className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-[#b8dccb] bg-[#e5f4ec] px-4 py-3 text-xs font-semibold text-[#1f6a4f] print:hidden"
        >
          <span>{banner}</span>
          <button type="button" onClick={() => setBanner('')} className="text-xs font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-xl border border-[#f2bac1] bg-[#fff2f2] px-4 py-3 text-xs text-[#a33d3d] print:hidden">
          {error}
        </div>
      )}

      {/* TAB 1: SYSTEM REPORTS */}
      {tab === 'system' ? (
        <div className="mt-6 space-y-6">
          {/* KPI Row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className={card}>
              <span className="text-xs font-bold text-[#52635f]">Revenue collected</span>
              <strong className="mt-2 block text-2xl text-[#17483e]">
                {loadingSummary ? '—' : money(overview.totalRevenueCollected)}
              </strong>
              <span className="mt-1 block text-xs text-[#8f9d96]">
                {overview.totalPaymentsPaid || 0} completed payment(s)
              </span>
            </div>

            <div className={card}>
              <span className="text-xs font-bold text-[#52635f]">Notifications dispatched</span>
              <strong className="mt-2 block text-2xl text-[#17483e]">
                {loadingSummary ? '—' : overview.totalNotifications || 0}
              </strong>
              <span className="mt-1 block text-xs text-[#8f9d96]">
                {overview.notificationReadRate || 0}% read · {overview.unreadNotifications || 0} unread
              </span>
            </div>

            <div className={card}>
              <span className="text-xs font-bold text-[#52635f]">Open content reports</span>
              <strong className="mt-2 block text-2xl text-[#9b5b1c]">
                {loadingSummary ? '—' : overview.openContentReports || 0}
              </strong>
              <span className="mt-1 block text-xs text-[#8f9d96]">
                {overview.totalContentReports || 0} total submitted
              </span>
            </div>

            <div className={card}>
              <span className="text-xs font-bold text-[#52635f]">Reservations &amp; hostels</span>
              <strong className="mt-2 block text-2xl text-[#17483e]">
                {loadingSummary ? '—' : `${overview.totalReservations || 0} / ${overview.totalHostels || 0}`}
              </strong>
              <span className="mt-1 block text-xs text-[#8f9d96]">
                {overview.totalUsers || 0} registered user(s)
              </span>
            </div>
          </div>

          {/* Detail Panels */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Notification Delivery Report */}
            <section className={card}>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-[#17483e]">Notification breakdown</h2>
                  <p className="text-xs text-[#718079]">Alerts sent and read rate by category</p>
                </div>
                <a
                  href={getReportExportUrl('notifications', period)}
                  className="rounded-lg border border-[#dce6e0] px-3 py-1.5 text-[11px] font-bold text-[#17443b] hover:bg-[#eaf4ef] print:hidden"
                >
                  CSV
                </a>
              </div>

              <div className="mt-5 space-y-3.5">
                {Object.entries(NOTIF_LABELS).map(([key, label]) => {
                  const row = notifByType[key] || { total: 0, read: 0, unread: 0 }
                  const pct = totalNotifs > 0 ? Math.round((row.total / totalNotifs) * 100) : 0
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-[#304d45]">{label}</span>
                        <span className="text-[#718079]">
                          <strong className="text-[#17483e]">{row.total}</strong> ({row.read} read · {row.unread} unread)
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#edf2ef]">
                        <div
                          className="h-full rounded-full bg-[#17443b] transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Payment & Revenue Report */}
            <section className={card}>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-[#17483e]">Payment &amp; revenue summary</h2>
                  <p className="text-xs text-[#718079]">Advance vs monthly rent collections</p>
                </div>
                <a
                  href={getReportExportUrl('payments', period)}
                  className="rounded-lg border border-[#dce6e0] px-3 py-1.5 text-[11px] font-bold text-[#17443b] hover:bg-[#eaf4ef] print:hidden"
                >
                  CSV
                </a>
              </div>

              {!payments.available || payments.paidCount + payments.failedCount + payments.refundedCount === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-[#dce4df] bg-[#f8fbf9] p-6 text-center">
                  <p className="text-xs font-bold text-[#304d45]">No payment records in this period</p>
                  <p className="mt-1 text-[11px] text-[#718079]">
                    Once advance or monthly rent payments are processed in the Payment module, revenue totals and hostel breakdowns appear here automatically.
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-[#f4faf7] p-3.5">
                      <span className="text-[11px] font-bold text-[#52635f]">Advance payments</span>
                      <strong className="mt-1 block text-lg text-[#17483e]">
                        {money(payments.advanceCollected)}
                      </strong>
                    </div>
                    <div className="rounded-xl bg-[#f4f8fb] p-3.5">
                      <span className="text-[11px] font-bold text-[#52635f]">Monthly rent</span>
                      <strong className="mt-1 block text-lg text-[#28557d]">
                        {money(payments.monthlyCollected)}
                      </strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="rounded-xl border border-[#e6ece8] p-2.5">
                      <strong className="block text-base text-[#1f6a4f]">{payments.paidCount}</strong>
                      <span className="text-[10px] text-[#718079]">Paid</span>
                    </div>
                    <div className="rounded-xl border border-[#e6ece8] p-2.5">
                      <strong className="block text-base text-[#8a6116]">{payments.pendingCount}</strong>
                      <span className="text-[10px] text-[#718079]">Pending</span>
                    </div>
                    <div className="rounded-xl border border-[#e6ece8] p-2.5">
                      <strong className="block text-base text-[#a33d3d]">{payments.failedCount}</strong>
                      <span className="text-[10px] text-[#718079]">Failed</span>
                    </div>
                    <div className="rounded-xl border border-[#e6ece8] p-2.5">
                      <strong className="block text-base text-[#3f5a78]">{payments.refundedCount}</strong>
                      <span className="text-[10px] text-[#718079]">Refunded</span>
                    </div>
                  </div>

                  {payments.byHostel?.length > 0 && (
                    <div className="border-t border-[#edf1ef] pt-3">
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-[.5px] text-[#6f7d77]">
                        Top hostels by collected revenue
                      </p>
                      <div className="space-y-2 text-xs">
                        {payments.byHostel.map((h) => (
                          <div key={h.hostelName} className="flex justify-between">
                            <span className="font-semibold text-[#304d45]">{h.hostelName}</span>
                            <span className="font-bold text-[#17483e]">{money(h.revenue)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* Content Reports & Exports Summary */}
          <section className={card}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-[#17483e]">Downloadable CSV reports</h2>
                <p className="text-xs text-[#718079]">
                  Export live StayMate datasets for supervisor reviews or monthly hostel accounting.
                </p>
              </div>
              <span className="text-[11px] text-[#8f9d96]">
                Generated {summary?.generatedAt ? shortDate(summary.generatedAt) : 'today'}
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 print:hidden">
              {[
                ['overview', 'System overview CSV', 'KPIs, revenue & module totals'],
                ['payments', 'Payments report CSV', 'Advance & monthly rent records'],
                ['notifications', 'Notification log CSV', 'Delivery, type & read status'],
                ['content-reports', 'Reported content CSV', 'Flagged listings & resolutions'],
              ].map(([type, title, desc]) => (
                <a
                  key={type}
                  href={getReportExportUrl(type, period)}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-[#dce4df] bg-[#fbfaf7] p-4 transition hover:border-[#17443b] hover:bg-[#f4faf7]"
                >
                  <div>
                    <strong className="block text-xs font-bold text-[#17483e]">{title}</strong>
                    <span className="mt-1 block text-[11px] text-[#718079]">{desc}</span>
                  </div>
                  <span className="text-[#17443b]">
                    <Icon name="download" size={16} />
                  </span>
                </a>
              ))}
            </div>
          </section>
        </div>
      ) : (
        /* TAB 2: REPORTED CONTENT MODERATION (FR25) */
        <section className={`${card} mt-6`}>
          <div className="flex flex-col gap-3 border-b border-[#edf1ef] pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {['All', 'Pending', 'Under Review', 'Resolved', 'Dismissed'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setStatusFilter(st)
                    setPage(1)
                  }}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                    statusFilter === st
                      ? 'bg-[#17443b] text-white'
                      : 'bg-[#f4f7f5] text-[#45625a] hover:bg-[#e5efe9]'
                  }`}
                >
                  {st}
                  {st !== 'All' && (
                    <span className="ml-1.5 opacity-80">({countsByStatus[st] || 0})</span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Filter by content type"
                value={targetTypeFilter}
                onChange={(e) => {
                  setTargetTypeFilter(e.target.value)
                  setPage(1)
                }}
                className="h-9 rounded-xl border border-[#d8e0db] bg-[#fbfaf7] px-3 text-xs font-semibold text-[#203f38]"
              >
                <option value="All">All types</option>
                <option value="Hostel">Hostel</option>
                <option value="Review">Review</option>
                <option value="User">User</option>
              </select>

              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                placeholder="Search listing or reason..."
                className="h-9 rounded-xl border border-[#d8e0db] bg-[#fbfaf7] px-3 text-xs text-[#203f38] outline-none focus:border-[#17443b]"
              />
            </div>
          </div>

          {loadingReports ? (
            <div className="py-12 text-center text-sm text-[#718079]">Loading reported content...</div>
          ) : reports.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-[#dce4df] bg-[#f8fbf9] px-6 py-12 text-center">
              <p className="text-sm font-bold text-[#17483e]">No reported content matches these filters</p>
              <p className="mt-1 text-xs text-[#718079]">
                Students can report listings from any hostel page, or you can load sample data to preview moderation.
              </p>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[780px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[#e7ece9] text-[11px] uppercase tracking-[.6px] text-[#8f9d96]">
                    <th className="py-3 pr-3 font-bold">Date</th>
                    <th className="py-3 pr-3 font-bold">Target</th>
                    <th className="py-3 pr-3 font-bold">Reason</th>
                    <th className="py-3 pr-3 font-bold">Details</th>
                    <th className="py-3 pr-3 font-bold">Reporter</th>
                    <th className="py-3 pr-3 font-bold">Status</th>
                    <th className="py-3 text-right font-bold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r._id} className="border-b border-[#eef1ef] text-[#33504a] last:border-0">
                      <td className="py-3.5 pr-3 whitespace-nowrap">{shortDate(r.createdAt)}</td>
                      <td className="py-3.5 pr-3">
                        <span className="block font-bold text-[#17483e]">{r.targetName}</span>
                        <span className="text-[10px] text-[#84918c]">{r.targetType}</span>
                      </td>
                      <td className="py-3.5 pr-3 font-semibold">{r.reason}</td>
                      <td className="max-w-[280px] py-3.5 pr-3 text-[#5c6d67]">
                        <p className="line-clamp-2">{r.description}</p>
                        {r.adminNote && (
                          <p className="mt-1 text-[10px] text-[#17443b]">Note: {r.adminNote}</p>
                        )}
                      </td>
                      <td className="py-3.5 pr-3 whitespace-nowrap">{r.reporterName || 'Student'}</td>
                      <td className="py-3.5 pr-3 whitespace-nowrap">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            REPORT_STATUS_STYLE[r.status] || ''
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openReviewModal(r)}
                          className="rounded-lg border border-[#dce6e0] bg-white px-3 py-1.5 text-[11px] font-bold text-[#17443b] hover:bg-[#eaf4ef]"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-5 flex items-center justify-between border-t border-[#edf1ef] pt-4 text-xs text-[#78827f]">
            <span>{totalReports} report(s)</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-[#d8e0db] bg-white px-3 py-1.5 font-bold disabled:opacity-40"
              >
                Previous
              </button>
              <span>Page {page} of {pages}</span>
              <button
                type="button"
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-[#d8e0db] bg-white px-3 py-1.5 font-bold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Submit Report Modal */}
      <ReportListingModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onSubmitted={() => {
          loadSummary()
          loadContentReports()
          notifCtx?.refreshUnread?.()
        }}
      />

      {/* Admin Moderation Modal */}
      {reviewing && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#0f2a25]/50 p-4"
          onClick={() => setReviewing(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[460px] rounded-[18px] bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-extrabold text-[#17483e]">Review reported content</h2>
            <p className="mt-1 text-xs text-[#718079]">
              {reviewing.targetType}: <strong>{reviewing.targetName}</strong> · {reviewing.reason}
            </p>
            <div className="mt-3 rounded-xl bg-[#f8fbf9] p-3 text-xs text-[#45625a]">
              {reviewing.description}
            </div>

            <form onSubmit={handleSaveModeration} className="mt-4 space-y-3">
              <label className="block text-[11px] font-bold text-[#52635f]">
                Moderation decision
                <select
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-[#d8e0db] px-3 text-xs outline-none focus:border-[#17443b]"
                >
                  <option value="Pending">Pending</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Dismissed">Dismissed</option>
                </select>
              </label>

              <label className="block text-[11px] font-bold text-[#52635f]">
                Administrator note
                <textarea
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Describe action taken or resolution notes..."
                  className="mt-1.5 w-full resize-none rounded-xl border border-[#d8e0db] p-3 text-xs outline-none focus:border-[#17443b]"
                />
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewing(null)}
                  className="min-h-10 rounded-xl border border-[#d8e0db] bg-white px-4 text-xs font-bold text-[#33504a]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="min-h-10 rounded-xl border-0 bg-[#17443b] px-5 text-xs font-bold text-white"
                >
                  {saving ? 'Saving...' : 'Save decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
