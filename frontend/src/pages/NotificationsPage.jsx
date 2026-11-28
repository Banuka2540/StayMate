import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  deleteNotificationById,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  seedDemoNotificationsAndReports,
  sendNotificationEvent,
  triggerMonthlyReminders,
} from '../api/notificationApi'
import { Icon } from '../components/Icon'
import { useNotifications } from '../context/useNotifications'

const wrap = 'mx-auto w-[calc(100%-36px)] max-w-[1450px] sm:w-[calc(100%-88px)]'
const card = 'rounded-[18px] border border-[#d8e0db] bg-white p-5 shadow-[0_8px_24px_#00000008]'

const CATEGORIES = [
  { key: 'all', label: 'All notifications' },
  { key: 'reservation', label: 'Reservations' },
  { key: 'payment', label: 'Payments' },
  { key: 'payment_reminder', label: 'Rent reminders' },
  { key: 'listing_approval', label: 'Listing approvals' },
  { key: 'report', label: 'Reports & alerts' },
]

const TYPE_STYLES = {
  reservation: { badge: 'bg-[#e3f1ea] text-[#1f6a4f]', label: 'Reservation' },
  payment: { badge: 'bg-[#e6f0f8] text-[#28557d]', label: 'Payment' },
  payment_reminder: { badge: 'bg-[#fbf0d9] text-[#8a6116]', label: 'Monthly reminder' },
  listing_approval: { badge: 'bg-[#ebe6f7] text-[#55398c]', label: 'Listing approval' },
  report: { badge: 'bg-[#f8e3e3] text-[#a33d3d]', label: 'Content report' },
  system: { badge: 'bg-[#edf2ef] text-[#45625a]', label: 'System' },
}

const PRIORITY_DOT = {
  high: 'bg-[#c64b4b]',
  normal: 'bg-[#17443b]',
  low: 'bg-[#8fa39b]',
}

function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function NotificationsPage() {
  const notifCtx = useNotifications()
  const role = notifCtx?.role || 'Student'

  const [notifications, setNotifications] = useState([])
  const [countsByType, setCountsByType] = useState({})
  const [unreadCount, setUnreadCount] = useState(0)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [banner, setBanner] = useState('')

  const [activeType, setActiveType] = useState('all')
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [search, setSearch] = useState('')

  // Modals / tools
  const [composerOpen, setComposerOpen] = useState(false)
  const [reminderOpen, setReminderOpen] = useState(false)
  const [reminderMonth, setReminderMonth] = useState(() => new Date().toISOString().slice(0, 7))
  const [reminderDueDay, setReminderDueDay] = useState('5')
  const [reminderHostel, setReminderHostel] = useState('Sawbhagya Hostel')
  const [reminderAmount, setReminderAmount] = useState('10000')
  const [busy, setBusy] = useState(false)

  // Event simulator / notification sender state
  const [eventKind, setEventKind] = useState('reservation')
  const [hostelName, setHostelName] = useState('Sawbhagya Hostel')
  const [roomType, setRoomType] = useState('Twin sharing')
  const [eventStatus, setEventStatus] = useState('Confirmed')
  const [paymentType, setPaymentType] = useState('Advance')
  const [amount, setAmount] = useState('15000')
  const [customRole, setCustomRole] = useState('Student')
  const [customTitle, setCustomTitle] = useState('')
  const [customMessage, setCustomMessage] = useState('')

  const refreshUnreadRef = notifCtx?.refreshUnread

  const fetchNotificationsData = useCallback(async () => {
    const data = await getNotifications({
      role,
      type: activeType,
      isRead: unreadOnly ? 'false' : '',
      search: search.trim(),
      page,
      limit: 12,
    })
    return data
  }, [activeType, page, role, search, unreadOnly])

  const loadNotifications = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchNotificationsData()
      setNotifications(data.notifications || [])
      setCountsByType(data.countsByType || {})
      setUnreadCount(data.unreadCount || 0)
      setTotal(data.total || 0)
      setPages(data.pages || 1)
      refreshUnreadRef?.(role)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [fetchNotificationsData, refreshUnreadRef, role])

  useEffect(() => {
    let cancelled = false
    fetchNotificationsData()
      .then((data) => {
        if (cancelled) return
        setNotifications(data.notifications || [])
        setCountsByType(data.countsByType || {})
        setUnreadCount(data.unreadCount || 0)
        setTotal(data.total || 0)
        setPages(data.pages || 1)
        setError('')
        refreshUnreadRef?.(role)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [fetchNotificationsData, refreshUnreadRef, role])

  const handleRoleSwitch = (nextRole) => {
    setPage(1)
    notifCtx?.changeRole?.(nextRole)
  }

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id)
      setBanner('Notification marked as read.')
      await loadNotifications()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead(role)
      setBanner(`All ${role.toLowerCase()} notifications marked as read.`)
      await loadNotifications()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteNotificationById(id)
      setBanner('Notification removed.')
      await loadNotifications()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSeedDemo = async () => {
    setBusy(true)
    setError('')
    try {
      const res = await seedDemoNotificationsAndReports()
      setBanner(res.message)
      await loadNotifications()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const handleSendMonthlyReminders = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await triggerMonthlyReminders({
        month: reminderMonth,
        dueDay: Number(reminderDueDay) || 5,
        targets: reminderHostel.trim()
          ? [{ hostelName: reminderHostel.trim(), roomType: 'Twin sharing', amount: Number(reminderAmount) || 10000 }]
          : undefined,
      })
      setBanner(res.message)
      setReminderOpen(false)
      await loadNotifications()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const handleDispatchEvent = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      let payload
      if (eventKind === 'reservation') {
        payload = {
          event: 'reservation',
          hostelName,
          roomType,
          status: eventStatus,
          studentName: 'Nethmi Perera',
          moveInDate: '2026-12-01',
        }
      } else if (eventKind === 'payment') {
        payload = {
          event: 'payment',
          hostelName,
          paymentType,
          month: paymentType === 'Monthly' ? reminderMonth : undefined,
          amount: Number(amount) || 10000,
          status: eventStatus === 'Failed' || eventStatus === 'Refunded' ? eventStatus : 'Paid',
          transactionId: `SM-${Date.now().toString().slice(-6)}`,
        }
      } else if (eventKind === 'listing_approval') {
        payload = {
          event: 'listing_approval',
          hostelName,
          status: ['Approved', 'Rejected', 'Pending'].includes(eventStatus) ? eventStatus : 'Approved',
        }
      } else {
        payload = {
          recipientRole: customRole,
          type: 'system',
          title: customTitle,
          message: customMessage,
        }
      }

      const res = await sendNotificationEvent(payload)
      setBanner(res.message || 'Notification dispatched.')
      setComposerOpen(false)
      setCustomTitle('')
      setCustomMessage('')
      await loadNotifications()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const totalAllForRole = Object.values(countsByType).reduce((acc, c) => acc + (c.total || 0), 0)
  const reminderUnread = countsByType.payment_reminder?.unread || 0
  const reservationTotal = countsByType.reservation?.total || 0
  const approvalTotal = countsByType.listing_approval?.total || 0

  return (
    <main className={`${wrap} pb-16 pt-7 sm:pt-10`}>
      <div className="flex gap-2 text-[10px] text-[#8f9d96] sm:text-xs">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>Notification Center</span>
      </div>

      {/* Page Header */}
      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[1.25px] text-[#578879]">
            <span className="h-2 w-2 rounded-full bg-[#d4aa64]" />
            Module 9 · Notification &amp; Reporting
          </span>
          <h1 className="mt-2 text-[29px] font-extrabold tracking-[-1.2px] text-[#17483e] sm:text-4xl">
            Notification Center
          </h1>
          <p className="mt-1.5 text-xs text-[#718079] sm:text-sm">
            Stay updated on room reservations, advance and monthly payments, rent reminders, and listing approvals.
          </p>
        </div>

        {/* Role switcher + Quick actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex rounded-xl border border-[#d8e0db] bg-white p-1">
            {['Student', 'Provider', 'Admin'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRoleSwitch(r)}
                className={`rounded-lg px-3.5 py-2 text-xs font-bold transition ${
                  role === r
                    ? 'bg-[#17443b] text-white'
                    : 'text-[#52635f] hover:text-[#17443b]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setReminderOpen(true)}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#d8e0db] bg-white px-4 text-xs font-bold text-[#17443b] transition hover:bg-[#eaf4ef]"
          >
            <Icon name="clock" size={15} />
            Monthly rent reminders
          </button>

          <button
            type="button"
            onClick={() => setComposerOpen(true)}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border-0 bg-[#17443b] px-4 text-xs font-bold text-white transition hover:bg-[#246257]"
          >
            <Icon name="send" size={15} />
            Trigger notification
          </button>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className={card}>
          <span className="text-xs font-bold text-[#52635f]">Unread alerts ({role})</span>
          <strong className="mt-2 block text-2xl text-[#17483e]">{unreadCount}</strong>
          <span className="mt-1 block text-xs text-[#8f9d96]">{totalAllForRole} total alerts for {role}</span>
        </div>
        <div className={card}>
          <span className="text-xs font-bold text-[#52635f]">Reservation updates</span>
          <strong className="mt-2 block text-2xl text-[#17483e]">{reservationTotal}</strong>
          <span className="mt-1 block text-xs text-[#8f9d96]">Bookings, confirmations &amp; cancellations</span>
        </div>
        <div className={card}>
          <span className="text-xs font-bold text-[#52635f]">Unread rent reminders</span>
          <strong className="mt-2 block text-2xl text-[#8a6116]">{reminderUnread}</strong>
          <span className="mt-1 block text-xs text-[#8f9d96]">Monthly rental due reminders</span>
        </div>
        <div className={card}>
          <span className="text-xs font-bold text-[#52635f]">Listing approval notices</span>
          <strong className="mt-2 block text-2xl text-[#17483e]">{approvalTotal}</strong>
          <span className="mt-1 block text-xs text-[#8f9d96]">Hostel verification status updates</span>
        </div>
      </div>

      {banner && (
        <div
          role="status"
          className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-[#b8dccb] bg-[#e5f4ec] px-4 py-3 text-xs font-semibold text-[#1f6a4f]"
        >
          <span>{banner}</span>
          <button type="button" onClick={() => setBanner('')} className="text-xs font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#f2bac1] bg-[#fff2f2] px-4 py-3 text-xs text-[#a33d3d]">
          <span>{error}</span>
          <button
            type="button"
            onClick={loadNotifications}
            className="rounded-lg bg-white px-3 py-1 font-bold text-[#a33d3d] shadow-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Content */}
      <section className={`${card} mt-6`}>
        {/* Category tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf1ef] pb-4">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const catStats = countsByType[cat.key]
              const countBadge =
                cat.key === 'all' ? totalAllForRole : catStats?.total || 0
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => {
                    setActiveType(cat.key)
                    setPage(1)
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition ${
                    activeType === cat.key
                      ? 'bg-[#17443b] text-white'
                      : 'bg-[#f4f7f5] text-[#45625a] hover:bg-[#e5efe9]'
                  }`}
                >
                  {cat.label}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                      activeType === cat.key
                        ? 'bg-white/20 text-white'
                        : 'bg-white text-[#31594f]'
                    }`}
                  >
                    {countBadge}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={handleSeedDemo}
              className="rounded-xl border border-[#dce6e0] bg-[#f8fbf9] px-3.5 py-2 text-xs font-bold text-[#31594f] hover:bg-[#eaf4ef]"
            >
              Load sample alerts
            </button>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="rounded-xl border border-[#dce6e0] bg-white px-3.5 py-2 text-xs font-bold text-[#17443b] hover:bg-[#eaf4ef]"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Search + Unread filter */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-[380px]">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718079]">
              <Icon name="search" size={16} />
            </span>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search by hostel, message, or receipt..."
              className="h-10 w-full rounded-xl border border-[#d8e0db] bg-[#fbfaf7] pl-10 pr-3 text-xs text-[#203f38] outline-none focus:border-[#17443b] focus:bg-white"
            />
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-[#45625a]">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => {
                setUnreadOnly(e.target.checked)
                setPage(1)
              }}
              className="h-4 w-4 accent-[#17443b]"
            />
            Show unread only
          </label>
        </div>

        {/* Notification List */}
        <div className="mt-5 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-sm text-[#718079]">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#dce4df] bg-[#f8fbf9] px-6 py-12 text-center">
              <p className="text-sm font-bold text-[#17483e]">No notifications found</p>
              <p className="mt-1 text-xs text-[#718079]">
                Try switching roles ({role}), clearing filters, or click “Load sample alerts” to populate demo data.
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={handleSeedDemo}
                className="mt-4 rounded-xl bg-[#17443b] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#246257]"
              >
                Load sample StayMate alerts
              </button>
            </div>
          ) : (
            notifications.map((item) => {
              const badge = TYPE_STYLES[item.type] || TYPE_STYLES.system
              return (
                <article
                  key={item._id}
                  className={`flex flex-col justify-between gap-4 rounded-2xl border p-4 transition sm:flex-row sm:items-center ${
                    !item.isRead
                      ? 'border-[#b9d7ca] bg-[#f4faf7]'
                      : 'border-[#e6ece8] bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <span
                      title={item.isRead ? 'Read' : 'Unread'}
                      className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                        !item.isRead ? PRIORITY_DOT[item.priority] || PRIORITY_DOT.normal : 'bg-[#d0dbd5]'
                      }`}
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${badge.badge}`}>
                          {badge.label}
                        </span>
                        {item.priority === 'high' && (
                          <span className="rounded-full bg-[#fdf1e6] px-2 py-0.5 text-[10px] font-bold text-[#9b5b1c]">
                            Priority
                          </span>
                        )}
                        <span className="text-[11px] text-[#84918c]">
                          {formatDateTime(item.createdAt)}
                        </span>
                      </div>

                      <h3 className="mt-1.5 text-sm font-bold text-[#17483e]">{item.title}</h3>
                      <p className="mt-1 max-w-[780px] text-xs leading-5 text-[#5c6d67]">{item.message}</p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2 pl-6 sm:pl-0">
                    {item.actionUrl && (
                      <Link
                        to={item.actionUrl}
                        onClick={() => {
                          if (!item.isRead) handleMarkRead(item._id)
                        }}
                        className="rounded-lg border border-[#dce6e0] bg-white px-3 py-1.5 text-xs font-bold text-[#17443b] hover:bg-[#eaf4ef]"
                      >
                        Open →
                      </Link>
                    )}

                    {!item.isRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(item._id)}
                        className="rounded-lg bg-[#17443b] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#246257]"
                      >
                        Mark read
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(item._id)}
                      aria-label="Delete notification"
                      className="grid h-8 w-8 place-items-center rounded-lg border border-[#e6ece8] bg-white text-[#7f8c86] hover:border-[#f2bac1] hover:text-[#a33d3d]"
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                </article>
              )
            })
          )}
        </div>

        {/* Pagination */}
        <div className="mt-5 flex items-center justify-between border-t border-[#edf1ef] pt-4 text-xs text-[#78827f]">
          <span>{total} notification(s)</span>
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

      {/* Monthly Rent Reminders Modal */}
      {reminderOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#0f2a25]/50 p-4" onClick={() => setReminderOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[440px] rounded-[18px] bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-extrabold text-[#17483e]">Send monthly payment reminders</h2>
            <p className="mt-1 text-xs text-[#718079]">
              Automatically skips students who already paid for the selected month or already received a reminder.
            </p>
            <form onSubmit={handleSendMonthlyReminders} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="text-[11px] font-bold text-[#52635f]">
                  Billing month
                  <input
                    type="month"
                    value={reminderMonth}
                    onChange={(e) => setReminderMonth(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-xl border border-[#d8e0db] px-3 text-xs outline-none focus:border-[#17443b]"
                  />
                </label>
                <label className="text-[11px] font-bold text-[#52635f]">
                  Due day of month
                  <input
                    type="number"
                    min="1"
                    max="28"
                    value={reminderDueDay}
                    onChange={(e) => setReminderDueDay(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-xl border border-[#d8e0db] px-3 text-xs outline-none focus:border-[#17443b]"
                  />
                </label>
              </div>
              <label className="block text-[11px] font-bold text-[#52635f]">
                Hostel name
                <input
                  value={reminderHostel}
                  onChange={(e) => setReminderHostel(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-[#d8e0db] px-3 text-xs outline-none focus:border-[#17443b]"
                />
              </label>
              <label className="block text-[11px] font-bold text-[#52635f]">
                Monthly rent (LKR)
                <input
                  type="number"
                  min="1"
                  value={reminderAmount}
                  onChange={(e) => setReminderAmount(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-[#d8e0db] px-3 text-xs outline-none focus:border-[#17443b]"
                />
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReminderOpen(false)}
                  className="min-h-10 rounded-xl border border-[#d8e0db] bg-white px-4 text-xs font-bold text-[#33504a]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="min-h-10 rounded-xl border-0 bg-[#17443b] px-5 text-xs font-bold text-white"
                >
                  {busy ? 'Sending...' : 'Dispatch reminders'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trigger / Send Notification Modal */}
      {composerOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#0f2a25]/50 p-4" onClick={() => setComposerOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[480px] rounded-[18px] bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-extrabold text-[#17483e]">Dispatch notification event</h2>
            <p className="mt-1 text-xs text-[#718079]">
              Send a reservation, payment, listing approval, or custom system notification.
            </p>
            <form onSubmit={handleDispatchEvent} className="mt-4 space-y-3">
              <label className="block text-[11px] font-bold text-[#52635f]">
                Notification event
                <select
                  value={eventKind}
                  onChange={(e) => setEventKind(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-[#d8e0db] bg-[#fbfaf7] px-3 text-xs outline-none focus:border-[#17443b]"
                >
                  <option value="reservation">Reservation notification</option>
                  <option value="payment">Payment notification</option>
                  <option value="listing_approval">Listing approval notification</option>
                  <option value="custom">Custom system alert</option>
                </select>
              </label>

              {eventKind !== 'custom' ? (
                <>
                  <label className="block text-[11px] font-bold text-[#52635f]">
                    Hostel name
                    <input
                      value={hostelName}
                      onChange={(e) => setHostelName(e.target.value)}
                      className="mt-1.5 h-10 w-full rounded-xl border border-[#d8e0db] px-3 text-xs outline-none focus:border-[#17443b]"
                    />
                  </label>

                  {eventKind === 'reservation' && (
                    <div className="grid grid-cols-2 gap-3">
                      <label className="text-[11px] font-bold text-[#52635f]">
                        Room type
                        <input
                          value={roomType}
                          onChange={(e) => setRoomType(e.target.value)}
                          className="mt-1.5 h-10 w-full rounded-xl border border-[#d8e0db] px-3 text-xs"
                        />
                      </label>
                      <label className="text-[11px] font-bold text-[#52635f]">
                        Status
                        <select
                          value={eventStatus}
                          onChange={(e) => setEventStatus(e.target.value)}
                          className="mt-1.5 h-10 w-full rounded-xl border border-[#d8e0db] px-3 text-xs"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </label>
                    </div>
                  )}

                  {eventKind === 'payment' && (
                    <div className="grid grid-cols-3 gap-2.5">
                      <label className="text-[11px] font-bold text-[#52635f]">
                        Type
                        <select
                          value={paymentType}
                          onChange={(e) => setPaymentType(e.target.value)}
                          className="mt-1.5 h-10 w-full rounded-xl border border-[#d8e0db] px-2 text-xs"
                        >
                          <option value="Advance">Advance</option>
                          <option value="Monthly">Monthly</option>
                        </select>
                      </label>
                      <label className="text-[11px] font-bold text-[#52635f]">
                        Amount (LKR)
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="mt-1.5 h-10 w-full rounded-xl border border-[#d8e0db] px-2 text-xs"
                        />
                      </label>
                      <label className="text-[11px] font-bold text-[#52635f]">
                        Status
                        <select
                          value={eventStatus}
                          onChange={(e) => setEventStatus(e.target.value)}
                          className="mt-1.5 h-10 w-full rounded-xl border border-[#d8e0db] px-2 text-xs"
                        >
                          <option value="Paid">Paid</option>
                          <option value="Failed">Failed</option>
                          <option value="Refunded">Refunded</option>
                        </select>
                      </label>
                    </div>
                  )}

                  {eventKind === 'listing_approval' && (
                    <label className="block text-[11px] font-bold text-[#52635f]">
                      Approval status
                      <select
                        value={eventStatus}
                        onChange={(e) => setEventStatus(e.target.value)}
                        className="mt-1.5 h-10 w-full rounded-xl border border-[#d8e0db] px-3 text-xs"
                      >
                        <option value="Approved">Approved</option>
                        <option value="Pending">Pending</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </label>
                  )}
                </>
              ) : (
                <>
                  <label className="block text-[11px] font-bold text-[#52635f]">
                    Recipient role
                    <select
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      className="mt-1.5 h-10 w-full rounded-xl border border-[#d8e0db] px-3 text-xs"
                    >
                      <option value="Student">Student</option>
                      <option value="Provider">Provider</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </label>
                  <label className="block text-[11px] font-bold text-[#52635f]">
                    Title
                    <input
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="Scheduled maintenance notice"
                      className="mt-1.5 h-10 w-full rounded-xl border border-[#d8e0db] px-3 text-xs"
                    />
                  </label>
                  <label className="block text-[11px] font-bold text-[#52635f]">
                    Message
                    <textarea
                      rows={3}
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Write notification message..."
                      className="mt-1.5 w-full rounded-xl border border-[#d8e0db] p-3 text-xs"
                    />
                  </label>
                </>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setComposerOpen(false)}
                  className="min-h-10 rounded-xl border border-[#d8e0db] bg-white px-4 text-xs font-bold text-[#33504a]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="min-h-10 rounded-xl border-0 bg-[#17443b] px-5 text-xs font-bold text-white"
                >
                  {busy ? 'Sending...' : 'Send notification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
