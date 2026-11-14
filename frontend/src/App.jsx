import { useEffect, useState } from 'react'
import { SiteFooter, SiteHeader } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { SearchPage } from './pages/SearchPage'

function App() {
  const [university, setUniversity] = useState('Sabaragamuwa University')
  const [moveIn, setMoveIn] = useState('2026-12-01')
  const [duration, setDuration] = useState('6 months')
  const [budget, setBudget] = useState('15000')
  const [favorites, setFavorites] = useState([])
  const [page, setPage] = useState(window.location.pathname === '/search' ? 'search' : 'home')

  useEffect(() => {
    const syncPage = () => setPage(window.location.pathname === '/search' ? 'search' : 'home')
    window.addEventListener('popstate', syncPage)
    return () => window.removeEventListener('popstate', syncPage)
  }, [])

  const goToSearch = (event) => {
    event.preventDefault()
    window.history.pushState({}, '', '/search')
    setPage('search')
  }

  const toggleFavorite = (name) => {
    setFavorites((current) => current.includes(name)
      ? current.filter((item) => item !== name)
      : [...current, name])
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#f8f6f0] text-[#203f38]">
      <SiteHeader />
      {page === 'search' ? (
        <SearchPage
          university={university}
          setUniversity={setUniversity}
          moveIn={moveIn}
          setMoveIn={setMoveIn}
          duration={duration}
          setDuration={setDuration}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
        />
      ) : (
        <HomePage
          university={university}
          setUniversity={setUniversity}
          moveIn={moveIn}
          setMoveIn={setMoveIn}
          budget={budget}
          setBudget={setBudget}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          onSearch={goToSearch}
        />
      )}
      <SiteFooter />
    </div>
  )
}

export default App
