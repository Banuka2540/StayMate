import { useCallback, useEffect, useState } from 'react'
import {
  getActiveRole,
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  setDemoRole,
} from '../api/notificationApi'
import { NotificationContext } from './useNotifications'

export function NotificationProvider({ children }) {
  const [role, setRoleState] = useState(() => getActiveRole())
  const [unreadCount, setUnreadCount] = useState(0)
  const [recentNotifications, setRecentNotifications] = useState([])
  const [dropdownLoading, setDropdownLoading] = useState(false)
  const [backendConnected, setBackendConnected] = useState(true)

  const refreshUnread = useCallback(async (targetRole = role) => {
    try {
      const data = await getUnreadCount(targetRole)
      setUnreadCount(data.unreadCount || 0)
      setBackendConnected(true)
    } catch {
      setBackendConnected(false)
    }
  }, [role])

  const loadRecent = useCallback(async (targetRole = role) => {
    setDropdownLoading(true)
    try {
      const data = await getNotifications({ role: targetRole, limit: 6 })
      setRecentNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
      setBackendConnected(true)
    } catch {
      setBackendConnected(false)
    } finally {
      setDropdownLoading(false)
    }
  }, [role])

  const changeRole = useCallback((nextRole) => {
    setDemoRole(nextRole)
    setRoleState(nextRole)
    refreshUnread(nextRole)
    loadRecent(nextRole)
  }, [loadRecent, refreshUnread])

  const markRead = useCallback(async (id) => {
    await markNotificationRead(id)
    setRecentNotifications((items) =>
      items.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
    )
    setUnreadCount((count) => Math.max(0, count - 1))
  }, [])

  const markAllRead = useCallback(async () => {
    await markAllNotificationsRead(role)
    setRecentNotifications((items) => items.map((n) => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }, [role])

  useEffect(() => {
    let cancelled = false
    const sync = async () => {
      try {
        const data = await getUnreadCount(role)
        if (!cancelled) {
          setUnreadCount(data.unreadCount || 0)
          setBackendConnected(true)
        }
      } catch {
        if (!cancelled) setBackendConnected(false)
      }
    }
    sync()
    const timer = setInterval(sync, 30000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [role])

  return (
    <NotificationContext.Provider
      value={{
        role,
        changeRole,
        unreadCount,
        recentNotifications,
        dropdownLoading,
        backendConnected,
        refreshUnread,
        loadRecent,
        markRead,
        markAllRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
