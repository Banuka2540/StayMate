import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Icon } from './Icon'
import { useNotifications } from '../context/useNotifications'

const linkStyles =
  'text-[13px] font-medium text-[#78827f] transition hover:text-[#163e37]'

const typeBadgeStyles = {
  reservation: 'bg-[#e3f1ea] text-[#1f6a4f]',
  payment: 'bg-[#e6f0f8] text-[#28557d]',
  payment_reminder: 'bg-[#fbf0d9] text-[#8a6116]',
  listing_approval: 'bg-[#ebe6f7] text-[#55398c]',
  report: 'bg-[#f8e3e3] text-[#a33d3d]',
  system: 'bg-[#edf2ef] text-[#45625a]',
}

const typeLabel = {
  reservation: 'Reservation',
  payment: 'Payment',
  payment_reminder: 'Rent reminder',
  listing_approval: 'Approval',
  report: 'Report',
  system: 'System',
}

function relativeTime(dateStr) {
  if (!dateStr) return ''
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export function SiteHeader() {
  const navigate = useNavigate()
  const notifCtx = useNotifications()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  const role = notifCtx?.role || 'Student'
  const unreadCount = notifCtx?.unreadCount || 0
  const recentNotifications = notifCtx?.recentNotifications || []
  const dropdownLoading = notifCtx?.dropdownLoading || false
  const backendConnected = notifCtx?.backendConnected ?? true

  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const toggleDropdown = () => {
    const next = !open
    setOpen(next)
    if (next && notifCtx?.loadRecent) {
      notifCtx.loadRecent(role)
    }
  }

  const handleOpenNotification = async (item) => {
    if (!item.isRead && notifCtx?.markRead) {
      await notifCtx.markRead(item._id).catch(() => {})
    }
    setOpen(false)
    navigate(item.actionUrl || '/notifications')
  }

  const navClass = ({ isActive }) =>
    `${linkStyles} ${isActive ? 'font-bold text-[#173f38]' : ''}`

  return (
    <header className="relative z-40 flex h-[66px] items-center justify-between gap-3 border-b border-[#eef2ef] bg-white px-[18px] text-[#52635f] sm:h-[88px] sm:px-[max(44px,calc((100vw-1450px)/2))] print:hidden">

      {/* Logo */}
      <Link
        to="/"
        aria-label="StayMate home"
        className="flex items-center gap-2 text-lg font-extrabold tracking-[-.7px] text-[#163e37] sm:gap-2.5 sm:text-[22px]"
      >
        <span className="grid h-[31px] w-[31px] place-items-center rounded-[11px] bg-[#153f38] text-[#e8f1ed] sm:h-[35px] sm:w-[35px]">
          <Icon name="home" size={18} />
        </span>
        StayMate
      </Link>

      {/* Main Navigation */}
      <nav
        className="flex h-full items-center gap-3 sm:ml-10 sm:gap-8"
        aria-label="Main navigation"
      >
        <NavLink to="/search" className={navClass}>
          Explore
        </NavLink>

        <NavLink to="/booking" className={({ isActive }) => `${navClass({ isActive })} hidden sm:block`}>
          My bookings
        </NavLink>

        <NavLink to="/payments" className={({ isActive }) => `${navClass({ isActive })} hidden sm:block`}>
          Payments
        </NavLink>

        <NavLink to="/notifications" className={navClass}>
          Notifications
          {unreadCount > 0 && (
            <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#17443b] px-1 text-[10px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </NavLink>

        <NavLink to="/reports" className={navClass}>
          Reports
        </NavLink>
      </nav>

      {/* User Actions */}
      <div className="flex items-center gap-2 sm:gap-4" ref={dropdownRef}>
        <Link to="/provider/create-account" className={`${linkStyles} hidden md:block`}>
          List your hostel
        </Link>

        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            aria-expanded={open}
            onClick={toggleDropdown}
            className="relative grid h-9 w-9 place-items-center rounded-full border border-transparent bg-[#f4f7f5] text-[#436760] transition hover:border-[#dce6e0] hover:bg-[#eaf4ef]"
          >
            <Icon name="bell" size={18} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#c64b4b] px-1 text-[9px] font-extrabold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2.5 w-[330px] overflow-hidden rounded-[18px] border border-[#dce4df] bg-white shadow-[0_18px_45px_#0f2a2524] sm:w-[375px]">
              <div className="border-b border-[#edf1ef] bg-[#f8fbf9] px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-extrabold text-[#17483e]">Notifications</h3>
                    <p className="text-[10px] text-[#718079]">
                      Viewing as <strong className="text-[#17483e]">{role}</strong> · {unreadCount} unread
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={() => notifCtx?.markAllRead?.()}
                      className="rounded-lg border border-[#dce6e0] bg-white px-2.5 py-1 text-[10px] font-bold text-[#17443b] hover:bg-[#eaf4ef]"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Role preview switcher */}
                <div className="mt-2.5 grid grid-cols-3 gap-1 rounded-xl bg-[#e9f0ec] p-1">
                  {['Student', 'Provider', 'Admin'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => notifCtx?.changeRole?.(r)}
                      className={`rounded-lg py-1 text-[10px] font-bold transition ${
                        role === r
                          ? 'bg-white text-[#17443b] shadow-xs'
                          : 'text-[#62756e] hover:text-[#17443b]'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="max-h-[320px] overflow-y-auto divide-y divide-[#f0f4f1]">
                {!backendConnected ? (
                  <div className="p-5 text-center text-xs text-[#718079]">
                    Backend server is offline. Start the backend to load live notifications.
                  </div>
                ) : dropdownLoading ? (
                  <div className="p-6 text-center text-xs text-[#718079]">Loading alerts...</div>
                ) : recentNotifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-xs font-semibold text-[#33504a]">All caught up</p>
                    <p className="mt-1 text-[11px] text-[#84918c]">
                      No notifications for {role} yet.
                    </p>
                  </div>
                ) : (
                  recentNotifications.map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => handleOpenNotification(item)}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-[#f7fbf9] ${
                        !item.isRead ? 'bg-[#f4faf7]' : 'bg-white'
                      }`}
                    >
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          !item.isRead ? 'bg-[#17443b]' : 'bg-transparent'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                              typeBadgeStyles[item.type] || typeBadgeStyles.system
                            }`}
                          >
                            {typeLabel[item.type] || 'Alert'}
                          </span>
                          <span className="text-[10px] text-[#8f9d96]">
                            {relativeTime(item.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs font-bold text-[#17483e]">
                          {item.title}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-[#6f7d77]">
                          {item.message}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="flex items-center justify-between border-t border-[#edf1ef] bg-[#f8fbf9] px-4 py-2.5">
                <Link
                  to="/notifications"
                  onClick={() => setOpen(false)}
                  className="text-xs font-bold text-[#17443b] hover:underline"
                >
                  Open notification center →
                </Link>
                <Link
                  to="/reports"
                  onClick={() => setOpen(false)}
                  className="text-[11px] font-semibold text-[#578879] hover:underline"
                >
                  System reports
                </Link>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          aria-label="Profile"
          title={`Active view: ${role}`}
          onClick={() => navigate('/notifications')}
          className="grid h-[31px] w-[31px] place-items-center rounded-full border-0 bg-[#dfede7] text-[11px] font-extrabold text-[#214e46] sm:h-9 sm:w-9"
        >
          {role === 'Admin' ? 'AD' : role === 'Provider' ? 'HP' : 'NP'}
        </button>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="bg-[#143f38] px-5 py-8 text-[#d8e6df] sm:px-11 print:hidden">

      {/* Footer Main Section */}
      <div className="mx-auto flex max-w-[1450px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-[#a8c0b5]">
          A place to belong. A better way to live.
        </span>

        <nav className="flex flex-wrap gap-4 text-sm">
          <Link to="/search">Explore hostels</Link>
          <Link to="/notifications">Notifications</Link>
          <Link to="/reports">System reports</Link>
          <Link to="/provider/create-account">For providers</Link>
        </nav>
      </div>

      {/* Footer Bottom Section */}
      <div className="mx-auto mt-6 flex max-w-[1450px] flex-col gap-3 border-t border-[#37655b] pt-4 text-xs text-[#a8c0b5] sm:flex-row sm:justify-between">
        <span>
          © 2026 StayMate · Made for student life in Sri Lanka
        </span>

        <div className="flex gap-4">
          <span>Sabaragamuwa University Community Project</span>
        </div>
      </div>
    </footer>
  )
}
