import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'

import { NotificationProvider } from './context/NotificationContext'
import { SiteHeader, SiteFooter } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { SearchPage } from './pages/SearchPage'
import { StayDetailsPage } from './pages/StayDetailsPage'
import { BookingPage } from './pages/BookingPage'
import { ProviderAuthPage } from './pages/ProviderAuthPage'
import { PaymentsPage } from './pages/PaymentsPage'
import { AdminPaymentsPage } from './pages/AdminPaymentsPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { ReportsPage } from './pages/ReportsPage'

function AppContent() {
  const { pathname } = useLocation()
  const isProviderAuth = pathname === '/provider/sign-in' || pathname === '/provider/create-account'

  return (
    <div className="min-h-screen overflow-hidden bg-[#f8f6f0] text-[#203f38]">
      {!isProviderAuth && <SiteHeader />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/stay/:stayName" element={<StayDetailsPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/booking/reservation/:stayName" element={<BookingPage stage="reservation" />} />
        <Route path="/booking/payment/:stayName" element={<BookingPage stage="payment" />} />
        <Route path="/provider/sign-in" element={<ProviderAuthPage mode="sign-in" />} />
        <Route path="/provider/create-account" element={<ProviderAuthPage mode="create-account" />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/admin/payments" element={<AdminPaymentsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Routes>

      {!isProviderAuth && <SiteFooter />}
    </div>
  )
}

function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </NotificationProvider>
  )
}

export default App
