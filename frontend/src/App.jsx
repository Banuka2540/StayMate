import { useEffect, useState } from 'react'
import './App.css'

const stays = [
  { name: 'Sawbhagya Hostel', place: 'pabahinna', distance: '8 min to University of Sabaragamuwa', price: '10,000', rating: '4.9', tag: 'Student favourite', image: 'photo-1600585154340-be6161a56a0c', alt: 'Tropical residence surrounded by palms' },
  { name: 'Shan Boarding House', place: 'Nugegoda, Colombo', distance: '12 min to University of Sabaragamuwa', price: '10,000', rating: '4.8', tag: 'Only 3 beds left', image: 'photo-1600607687939-ce8a6c25118c', alt: 'Warm courtyard of a boarding house' },
  { name: 'Samanala lodge', place: 'Peradeniya, Kandy', distance: '10 min to University of Sabaragamuwa', price: '9,000', rating: '4.8', tag: 'Great value', image: 'photo-1600047550580-0d1d2db913b9', alt: 'Quiet home in a green garden' },
]

function Icon({ name, size = 19 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  const paths = {
    home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v12h14V9M9 21v-7h6v7"/></>,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    wallet: <><rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 9h18M16 15h2"/></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></>,
    arrow: <><path d="M7 17 17 7M8 7h9v9"/></>,
    heart: <path d="M20.8 8.8c0 4.2-8.8 10-8.8 10S3.2 13 3.2 8.8A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.8 2.4Z"/>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    magnify: <><circle cx="10.5" cy="10.5" r="7.5"/><path d="m16 16 5 5"/></>,
  }
  return <svg {...common}>{paths[name]}</svg>
}

function SiteHeader() {
  return <header className="topbar">
    <a className="brand" href="/" aria-label="StayMate home"><span className="brand-mark"><Icon name="home" size={18}/></span><span>StayMate</span></a>
    <nav className="main-nav" aria-label="Main navigation"><a className="active" href="/search">Explore</a><a href="/search">My bookings</a><a href="/search">Payments</a></nav>
    <div className="top-actions"><a href="#provider">List your hostel</a><button className="icon-button" aria-label="Notifications"><Icon name="bell"/></button><button className="avatar" aria-label="Profile">NP</button></div>
  </header>
}

function SiteFooter() {
  return <footer className="footer"><div className="footer-main wrap"><a className="brand footer-brand" href="/"><span className="brand-mark"><Icon name="home" size={17}/></span><span>StayMate</span></a><span>A place to belong. A better way to live.</span><nav><a href="/search">About us</a><a href="/search">Help centre</a><a href="#provider">For providers</a></nav></div><div className="footer-bottom wrap"><span>© 2026 StayMate · Made for student life in Sri Lanka</span><div><a href="/search">Privacy policy</a><a href="/search">Terms of service</a></div></div></footer>
}

const resultStays = [
  { name: 'Palm Grove Student Residence', place: 'Katubedda, Moratuwa', distance: '8 min to University of Sabaragamuwa', km: 1.8, price: 8000, rating: '4.9', tag: 'Student favourite', image: 'photo-1600585154340-be6161a56a0c', residence: 'Female students', room: 'Twin sharing', wifi: true, bath: true, kitchen: true, security: true },
  { name: 'Courtyard Annex', place: 'Rawathawatta, Moratuwa', distance: '2.4 km to University of Sabaragamuwa', km: 2.4, price: 9000, rating: '4.8', tag: 'Verified residence', image: 'photo-1600607687939-ce8a6c25118c', residence: 'Female students', room: 'Twin sharing', wifi: true, bath: true, kitchen: true, security: true },
  { name: 'Campus Lane Student House', place: 'Katubedda, Moratuwa', distance: '12 min to University of Sabaragamuwa', km: 2.7, price: 6000, rating: '4.7', tag: 'Great value', image: 'photo-1600047550580-0d1d2db913b9', residence: 'Female students', room: 'Twin sharing', wifi: true, bath: true, kitchen: true, security: true },
  { name: 'Greenview Boarding', place: 'Moratuwa, Colombo', distance: '2.8 km to University of Sabaragamuwa', km: 2.8, price: 12000, rating: '4.8', tag: 'Quiet surroundings', image: 'photo-1600566753086-00f18fb6b3ea', residence: 'Male students', room: 'Twin sharing', wifi: true, bath: true, kitchen: false, security: true },
  { name: 'The Palm House', place: 'Katubedda, Moratuwa', distance: '10 min to University of Sabaragamuwa', km: 1.9, price: 15000, rating: '4.9', tag: 'Popular choice', image: 'photo-1600607687920-4e2a09cf159d', residence: 'Female students', room: 'Single room', wifi: true, bath: true, kitchen: true, security: true },
  { name: 'University View Lodge', place: 'Piliyandala, Colombo', distance: '3 km to University of Sabaragamuwa', km: 3, price: 7000, rating: '4.6', tag: 'Great value', image: 'photo-1600210492486-724fe5c67fb0', residence: 'Mixed residence', room: 'Triple sharing', wifi: true, bath: false, kitchen: true, security: false },
  { name: 'Samanala Student Villa', place: 'Moratuwa, Colombo', distance: '14 min to University of Sabaragamuwa', km: 2.3, price: 18000, rating: '4.9', tag: 'Verified residence', image: 'photo-1600566753190-17f0baa2a6c3', residence: 'Female students', room: 'Twin sharing', wifi: true, bath: true, kitchen: true, security: true },
  { name: 'Lake Road Rooms', place: 'Borupana, Moratuwa', distance: '2.1 km to University of Sabaragamuwa', km: 2.1, price: 11000, rating: '4.7', tag: 'New listing', image: 'photo-1600607687939-ce8a6c25118c', residence: 'Male students', room: 'Single room', wifi: true, bath: true, kitchen: false, security: true },
  { name: 'Garden Court Boarding', place: 'Rawathawatta, Moratuwa', distance: '9 min to University of Sabaragamuwa', km: 2.5, price: 9500, rating: '4.8', tag: 'Student favourite', image: 'photo-1600585154340-be6161a56a0c', residence: 'Mixed residence', room: 'Twin sharing', wifi: true, bath: true, kitchen: true, security: true },
]

const filterGroups = {
  'Residence type': ['Female students', 'Male students', 'Mixed residence'],
  'Room type': ['Twin sharing', 'Single room', 'Triple sharing'],
  'The essentials': ['Wi-Fi included', 'Private bathroom', 'Kitchen access', '24/7 security'],
}

function SearchResults({ university, setUniversity, moveIn, setMoveIn, duration, setDuration, favorites, toggleFavorite }) {
  const [minimum, setMinimum] = useState('6000')
  const [maximum, setMaximum] = useState('35000')
  const [draftFilters, setDraftFilters] = useState(['Female students', 'Twin sharing', 'Wi-Fi included', 'Private bathroom'])
  const [activeFilters, setActiveFilters] = useState(['Female students', 'Twin sharing', 'Wi-Fi included', 'Private bathroom'])
  const [distance, setDistance] = useState('Within 3 km')
  const [sort, setSort] = useState('Recommended')
  const [currentPage, setCurrentPage] = useState(1)
  const [searchMessage, setSearchMessage] = useState('')

  const toggle = (value) => setDraftFilters((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value])
  const filteredStays = resultStays.filter((stay) => {
    if (stay.price < Number(minimum || 0) || stay.price > Number(maximum || 999999)) return false
    if (distance === 'Within 3 km' && stay.km > 3) return false
    if (distance === 'Within 5 km' && stay.km > 5) return false
    if (activeFilters.some((filter) => filterGroups['Residence type'].includes(filter)) && !activeFilters.includes(stay.residence)) return false
    if (activeFilters.some((filter) => filterGroups['Room type'].includes(filter)) && !activeFilters.includes(stay.room)) return false
    if (activeFilters.includes('Wi-Fi included') && !stay.wifi) return false
    if (activeFilters.includes('Private bathroom') && !stay.bath) return false
    if (activeFilters.includes('Kitchen access') && !stay.kitchen) return false
    if (activeFilters.includes('24/7 security') && !stay.security) return false
    return true
  }).sort((a, b) => sort === 'Price: low to high' ? a.price - b.price : sort === 'Top rated' ? Number(b.rating) - Number(a.rating) : 0)
  const pageCount = Math.max(1, Math.ceil(filteredStays.length / 3))
  const pageStays = filteredStays.slice((currentPage - 1) * 3, currentPage * 3)
  const removeFilter = (filter) => {
    setDraftFilters((current) => current.filter((item) => item !== filter))
    setActiveFilters((current) => current.filter((item) => item !== filter))
    setCurrentPage(1)
  }
  const updateSearch = (event) => {
    event.preventDefault()
    setCurrentPage(1)
    setSearchMessage(`Search updated for ${university || 'your campus'} · ${moveIn} · ${duration}`)
  }

  return <main className="results-page" id="results">
    <div className="wrap">
      <div className="breadcrumbs"><a href="/">Home</a><span>/</span><a href="/search">Explore</a><span>/</span><span>Find your place near campus</span></div>
      <div className="results-title"><h1>Find your place near campus</h1><p>Thoughtfully verified hostels. A little less commute, a lot more student life.</p></div>
      <form className="results-search" onSubmit={updateSearch}>
        <label><b>University or location</b><span className="result-input"><Icon name="pin"/><input value={university} onChange={(event) => setUniversity(event.target.value)} aria-label="University or location"/></span></label>
        <label><b>Move-in date</b><span className="result-input"><Icon name="calendar"/><input type="date" value={moveIn} onChange={(event) => setMoveIn(event.target.value)} aria-label="Move-in date"/></span></label>
        <label><b>Stay duration</b><span className="result-input"><select value={duration} onChange={(event) => setDuration(event.target.value)} aria-label="Stay duration"><option>3 months</option><option>6 months</option><option>9 months</option><option>12 months</option></select></span></label>
        <button className="primary-button"><Icon name="search" size={17}/> Update search</button>
      </form>
      {searchMessage && <p className="search-notice results-notice" role="status">{searchMessage}</p>}
      <div className="results-layout">
        <aside className="filter-sidebar">
          <div className="filter-title"><h2>Make it your own</h2><button onClick={() => { setDraftFilters([]); setActiveFilters([]); setMinimum('0'); setMaximum('35000'); setCurrentPage(1) }}>Reset</button></div>
          <div className="filter-block"><h3>Monthly budget</h3><p className="budget-range">LKR {Number(minimum || 0).toLocaleString()} – {Number(maximum || 0).toLocaleString()}</p><div className="range-track"><span/></div><div className="range-inputs"><label>Minimum<input type="number" value={minimum} min="0" onChange={(event) => setMinimum(event.target.value)}/></label><label>Maximum<input type="number" value={maximum} min="0" onChange={(event) => setMaximum(event.target.value)}/></label></div></div>
          {Object.entries(filterGroups).map(([group, values]) => <div className="filter-block" key={group}><h3>{group}</h3>{values.map((value) => <label className="check-row" key={value}><input type="checkbox" checked={draftFilters.includes(value)} onChange={() => toggle(value)}/><span>{value}</span></label>)}</div>)}
          <div className="filter-block"><h3>Distance to university</h3><select className="distance-select" value={distance} onChange={(event) => setDistance(event.target.value)}><option>Within 3 km</option><option>Within 5 km</option><option>Any distance</option></select></div>
          <button className="primary-button apply-filters" onClick={() => { setActiveFilters(draftFilters); setCurrentPage(1) }}>Apply filters</button>
        </aside>
        <section className="result-listings">
          <div className="results-heading"><div><h2>{filteredStays.length} places to call home</h2><p>Near {university || 'your university'} · {new Date(`${moveIn}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div><select value={sort} onChange={(event) => { setSort(event.target.value); setCurrentPage(1) }} aria-label="Sort listings"><option>Recommended</option><option>Price: low to high</option><option>Top rated</option></select></div>
          <div className="active-chips">{activeFilters.map((filter) => <button key={filter} onClick={() => removeFilter(filter)}>{filter} <span>×</span></button>)}</div>
          <div className="results-grid">{pageStays.map((stay) => <article className="result-card" key={stay.name}><div className="result-photo"><img src={`https://images.unsplash.com/${stay.image}?auto=format&fit=crop&w=1000&q=85`} alt={`${stay.name} exterior`}/><span className="stay-tag">{stay.tag}</span><button className={`favorite ${favorites.includes(stay.name) ? 'selected' : ''}`} onClick={() => toggleFavorite(stay.name)} aria-label={`${favorites.includes(stay.name) ? 'Remove' : 'Save'} ${stay.name}`}><Icon name="heart" size={19}/></button></div><div className="result-card-content"><div className="stay-meta"><span>{stay.place}</span><strong>★ {stay.rating}</strong></div><h3>{stay.name}</h3><p className="distance">{stay.distance}</p><div className="amenities"><span>Wi-Fi</span><span>Furnished</span><span>Security</span></div><div className="price"><strong>LKR {stay.price.toLocaleString()}</strong><span>/ month</span></div></div></article>)}
            {pageStays.length > 0 && <article className="guidance-card"><span className="eyebrow">Prefer a little guidance?</span><span className="guidance-icon">♧</span><h3>Your perfect fit is out there.</h3><p>Tell our local team about your university, budget, and move-in plans. We’ll help you shortlist the right places.</p><a className="outline-button" href="mailto:hello@staymate.lk">Talk to our team</a><small>Mon–Sat · 9 am–6 pm · Sinhala, Tamil &amp; English</small></article>}
            {pageStays.length === 0 && <div className="empty-results"><h3>No hostels match those filters</h3><p>Try widening your budget or removing a filter.</p><button className="outline-button" onClick={() => { setDraftFilters([]); setActiveFilters([]); setMinimum('0'); setMaximum('35000') }}>Clear filters</button></div>}
          </div>
          {pageCount > 1 && <nav className="pagination" aria-label="Results pages">{Array.from({ length: pageCount }, (_, index) => <button className={currentPage === index + 1 ? 'current' : ''} key={index} onClick={() => setCurrentPage(index + 1)}>{index + 1}</button>)}<button className="next-page" onClick={() => setCurrentPage((page) => page === pageCount ? 1 : page + 1)}>Next →</button></nav>}
        </section>
      </div>
      <p className="verified-note">Every StayMate verified listing has been<br/> reviewed by our local team.</p>
    </div>
  </main>
}

function App() {
  const [university, setUniversity] = useState('Sabaragamuwa University')
  const [moveIn, setMoveIn] = useState('2026-12-01')
  const [duration, setDuration] = useState('6 months')
  const [budget, setBudget] = useState('15000')
  const [favorites, setFavorites] = useState([])
  const [notice, setNotice] = useState('')
  const [page, setPage] = useState(window.location.pathname === '/search' ? 'results' : 'home')

  useEffect(() => {
    const syncPage = () => setPage(window.location.pathname === '/search' ? 'results' : 'home')
    window.addEventListener('popstate', syncPage)
    return () => window.removeEventListener('popstate', syncPage)
  }, [])

  const search = (event) => {
    event.preventDefault()
    window.history.pushState({}, '', '/search')
    setPage('results')
  }

  const toggleFavorite = (name) => setFavorites((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name])

  if (page === 'results') return <div className="site-shell"><SiteHeader/><SearchResults university={university} setUniversity={setUniversity} moveIn={moveIn} setMoveIn={setMoveIn} duration={duration} setDuration={setDuration} favorites={favorites} toggleFavorite={toggleFavorite}/><SiteFooter/></div>

  return <div className="site-shell">
    <SiteHeader/>

    <main id="top">
      <section className="hero wrap">
        <div className="hero-copy">
          <span className="eyebrow"><span className="live-dot"/> A better way to find student housing</span>
          <h1>Find your student <span>accommodation.</span></h1>
          <p className="hero-lede">Discover trusted student hostels near your university. Find your space, book with confidence, and settle into Sabaragamuwa University student life.</p>
          <div className="trust-points"><span><Icon name="check" size={15}/> Verified residences</span><span><Icon name="check" size={15}/> Secure payments</span><span><Icon name="check" size={15}/> Local support</span></div>
        </div>
        <div className="hero-visual">
          <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=88" alt="Welcoming tropical home surrounded by palm trees"/>
          <span className="verified-pill"><Icon name="check" size={14}/> HostelHub verified</span>
          <div className="hero-property"><span>A place to make your own</span><strong>Palm Grove · Moratuwa</strong><div>From LKR 28,000 / month <span className="star">★</span> 4.9</div></div>
        </div>
      </section>

      <form className="search-panel wrap" onSubmit={search}>
        <label className="search-field university-field"><Icon name="pin"/><span><b>Where are you studying?</b><input value={university} onChange={(event) => setUniversity(event.target.value)} aria-label="University"/></span></label>
        <label className="search-field"><Icon name="calendar"/><span><b>Moving in</b><input type="date" value={moveIn} onChange={(event) => setMoveIn(event.target.value)} aria-label="Moving in date"/></span></label>
        <label className="search-field"><Icon name="wallet"/><span><b>Your monthly budget</b><span className="budget-input"><span>LKR</span><input type="number" min="0" step="1000" value={budget} onChange={(event) => setBudget(event.target.value)} aria-label="Monthly budget"/></span></span></label>
        <button className="primary-button" type="submit"><Icon name="search" size={17}/> Find my hostel</button>
      </form>
      <div className="proof-row wrap"><span>✦ 1,140+ students</span><span>30 verified residences</span><span>★ 4.8 student ratings</span></div>

      <section className="featured wrap" id="stays">
        <div className="section-heading"><div><span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span><h2>Good places. Great beginnings.</h2><p>Thoughtfully chosen for you.</p></div><a className="outline-button" href="#stays"><Icon name="arrow" size={16}/> Explore all hostels</a></div>
        {notice && <p className="search-notice" role="status">{notice}</p>}
        <div className="stay-grid">{stays.map((stay) => <article className="stay-card" key={stay.name}>
          <div className="stay-photo"><img src={`https://images.unsplash.com/${stay.image}?auto=format&fit=crop&w=1000&q=85`} alt={stay.alt}/><span className="stay-tag">{stay.tag}</span><button className={`favorite ${favorites.includes(stay.name) ? 'selected' : ''}`} onClick={() => toggleFavorite(stay.name)} aria-label={`${favorites.includes(stay.name) ? 'Remove' : 'Save'} ${stay.name}`}><Icon name="heart" size={19}/></button></div>
          <div className="stay-content"><div className="stay-meta"><span>{stay.place}</span><strong>★ {stay.rating}</strong></div><h3>{stay.name}</h3><p className="distance">{stay.distance}</p><div className="amenities"><span>Wi-Fi</span><span>Furnished</span><span>Security</span></div><div className="price"><strong>LKR {stay.price}</strong><span>/ month</span></div></div>
        </article>)}</div>
      </section>

      <section className="steps-panel wrap" id="how-it-works"><div className="steps-intro"><span className="eyebrow">A SIMPLE WAY TO SETTLE IN</span><h2>Less searching.<br/>More settling in.</h2><p>Your new boarding place is just three simple steps away.</p></div><div className="step"><span className="step-icon"><Icon name="magnify" size={23}/></span><b>Find your fit</b><p>Explore verified places by university, budget, and the things that matter to you.</p></div><div className="step"><span className="step-icon"><Icon name="calendar" size={23}/></span><b>Make it yours</b><p>Choose a room, send your details, and pay your advance securely online.</p></div><div className="step"><span className="step-icon"><Icon name="home" size={23}/></span><b>Feel at home</b><p>Track your booking, meet your host, and manage monthly rent in one place.</p></div></section>

      <section className="testimonial wrap"><img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1100&q=85" alt="Light-filled shared dining room with a view of a leafy garden"/><div className="quote"><span className="eyebrow">MORE THAN A ROOM</span><blockquote>“I found a safe place near campus — and a little community that feels like home.”</blockquote><p>Nethmi Perera · University of Sabaragamuwa</p><div className="quote-rating"><span>★★★★★</span> Verified student resident</div></div></section>

      <section className="provider-banner wrap" id="provider"><div><h2>Have a space students will love?</h2><p>Join our trusted provider community. List your hostel and let good things move in.</p></div><a className="primary-button" href="mailto:hello@staymate.lk"><Icon name="arrow" size={16}/> Become a provider</a></section>
    </main>

    <SiteFooter/>
  </div>
}

export default App
