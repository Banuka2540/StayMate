const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'

export function getActiveUser() {
  try {
    return JSON.parse(localStorage.getItem('user')) || null
  } catch {
    return null
  }
}

export function getActiveRole(overrideRole) {
  if (overrideRole) return overrideRole
  const user = getActiveUser()
  const raw = user?.role
  if (raw === 'User') return 'Student'
  if (['Student', 'Provider', 'Admin'].includes(raw)) return raw
  return localStorage.getItem('staymate_demo_role') || 'Student'
}

export function setDemoRole(role) {
  localStorage.setItem('staymate_demo_role', role)
}

async function request(basePath, path, options = {}) {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_URL}${basePath}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Could not reach the backend server.')
  }
  return data
}

// ---------- Notifications API ----------

export function getNotifications({ role, type, isRead, search, page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams()
  params.set('role', getActiveRole(role))
  if (type && type !== 'all') params.set('type', type)
  if (isRead !== undefined && isRead !== '') params.set('isRead', String(isRead))
  if (search) params.set('search', search)
  params.set('page', String(page))
  params.set('limit', String(limit))

  const user = getActiveUser()
  if (user?._id || user?.id) params.set('userId', user._id || user.id)

  return request('/api/notifications', `?${params.toString()}`)
}

export function getUnreadCount(role) {
  const params = new URLSearchParams({ role: getActiveRole(role) })
  const user = getActiveUser()
  if (user?._id || user?.id) params.set('userId', user._id || user.id)
  return request('/api/notifications', `/unread-count?${params.toString()}`)
}

export function sendNotificationEvent(payload) {
  return request('/api/notifications', '', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function triggerMonthlyReminders({ month, dueDay = 5, targets } = {}) {
  return request('/api/notifications', '/reminders/monthly', {
    method: 'POST',
    body: JSON.stringify({ month, dueDay, targets }),
  })
}

export function markNotificationRead(id) {
  return request('/api/notifications', `/${id}/read`, {
    method: 'PATCH',
  })
}

export function markAllNotificationsRead(role) {
  const params = new URLSearchParams({ role: getActiveRole(role) })
  const user = getActiveUser()
  if (user?._id || user?.id) params.set('userId', user._id || user.id)
  return request('/api/notifications', `/read-all?${params.toString()}`, {
    method: 'PATCH',
  })
}

export function deleteNotificationById(id) {
  return request('/api/notifications', `/${id}`, {
    method: 'DELETE',
  })
}

export function seedDemoNotificationsAndReports() {
  return request('/api/notifications', '/seed-demo', {
    method: 'POST',
  })
}

// ---------- Reports API ----------

export function getSystemReportSummary(period = '30d') {
  return request('/api/reports', `/summary?period=${encodeURIComponent(period)}`)
}

export function getReportExportUrl(type = 'overview', period = '30d') {
  return `${API_URL}/api/reports/export?type=${encodeURIComponent(type)}&period=${encodeURIComponent(period)}`
}

export function getContentReports({ status, targetType, search, page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams()
  if (status && status !== 'All') params.set('status', status)
  if (targetType && targetType !== 'All') params.set('targetType', targetType)
  if (search) params.set('search', search)
  params.set('page', String(page))
  params.set('limit', String(limit))

  return request('/api/reports', `/content?${params.toString()}`)
}

export function submitContentReport(payload) {
  const user = getActiveUser()
  return request('/api/reports', '/content', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      reporterId: user?._id || user?.id,
      reporterName: payload.reporterName || user?.name || 'Nethmi Perera',
      reporterEmail: payload.reporterEmail || user?.email,
    }),
  })
}

export function updateContentReportStatus(id, { status, adminNote }) {
  return request('/api/reports', `/content/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, adminNote }),
  })
}
