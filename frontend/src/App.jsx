
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { SiteHeader, SiteFooter } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { SearchPage } from './pages/SearchPage'
import { StayDetailsPage } from './pages/StayDetailsPage'
import { BookingPage } from './pages/BookingPage'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen overflow-hidden bg-[#f8f6f0] text-[#203f38]">

        <SiteHeader />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/stay/:stayName" element={<StayDetailsPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/booking/reservation/:stayName" element={<BookingPage stage="reservation" />} />
          <Route path="/booking/payment/:stayName" element={<BookingPage stage="payment" />} />
          
        </Routes>

        <SiteFooter />

      </div>
    </BrowserRouter>
  )
}

export default App
