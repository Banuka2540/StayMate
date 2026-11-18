import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { SiteHeader, SiteFooter } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { SearchPage } from './pages/SearchPage'
import { PaymentsPage } from './pages/PaymentsPage' // ⭐ NEW
import { AdminPaymentsPage } from './pages/AdminPaymentsPage' // ⭐ NEW

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen overflow-hidden bg-[#f8f6f0] text-[#203f38]">

        <SiteHeader />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/payments" element={<PaymentsPage />} /> {/* ⭐ NEW */}
          <Route path="/admin/payments" element={<AdminPaymentsPage />} /> {/* ⭐ NEW */}
        </Routes>

        <SiteFooter />

      </div>
    </BrowserRouter>
  )
}

export default App