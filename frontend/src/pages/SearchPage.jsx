
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { StayCard } from '../components/StayCard'
import { filterGroups, resultStays } from '../data/stays'

const wrap =
  'mx-auto w-[calc(100%-36px)] max-w-[1450px] sm:w-[calc(100%-88px)]'

const button =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-0 bg-[#17443b] px-5 text-xs font-bold text-white transition hover:bg-[#246257]'

export function SearchPage({
  university,
  setUniversity,
  moveIn,
  setMoveIn,
  duration,
  setDuration,
  favorites,
  toggleFavorite,
}) {
  const [minimum, setMinimum] = useState('6000')
  const [maximum, setMaximum] = useState('35000')

  const [draftFilters, setDraftFilters] = useState([
    'Female students',
    'Twin sharing',
    'Wi-Fi included',
    'Private bathroom',
  ])

  const [activeFilters, setActiveFilters] = useState(draftFilters)
  const [distance, setDistance] = useState('Within 3 km')
  const [sort, setSort] = useState('Recommended')
  const [currentPage, setCurrentPage] = useState(1)
  const [message, setMessage] = useState('')

  // Toggle a filter
  const toggle = (value) => {
    setDraftFilters((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    )
  }

  // Filter and sort hostel results
  const filtered = resultStays
    .filter((stay) => {
      if (
        stay.price < Number(minimum || 0) ||
        stay.price > Number(maximum || 999999)
      ) {
        return false
      }

      if (distance === 'Within 3 km' && stay.km > 3) return false
      if (distance === 'Within 5 km' && stay.km > 5) return false

      if (
        activeFilters.some((f) =>
          filterGroups['Residence type'].includes(f)
        ) &&
        !activeFilters.includes(stay.residence)
      ) {
        return false
      }

      if (
        activeFilters.some((f) => filterGroups['Room type'].includes(f)) &&
        !activeFilters.includes(stay.room)
      ) {
        return false
      }

      return (
        (!activeFilters.includes('Wi-Fi included') || stay.wifi) &&
        (!activeFilters.includes('Private bathroom') || stay.bath) &&
        (!activeFilters.includes('Kitchen access') || stay.kitchen) &&
        (!activeFilters.includes('24/7 security') || stay.security)
      )
    })
    .sort((a, b) =>
      sort === 'Price: low to high'
        ? a.price - b.price
        : sort === 'Top rated'
          ? Number(b.rating) - Number(a.rating)
          : 0
    )

  // Pagination
  const pageCount = Math.max(1, Math.ceil(filtered.length / 4))

  const pageStays = filtered.slice(
    (currentPage - 1) * 4,
    currentPage * 4
  )

  // Update search
  const updateSearch = (event) => {
    event.preventDefault()

    setMessage(
      `Search updated for ${university || 'your campus'} · ${moveIn} · ${duration}`
    )

    setCurrentPage(1)
  }

  // Clear filters
  const clear = () => {
    setDraftFilters([])
    setActiveFilters([])
    setMinimum('0')
    setMaximum('35000')
    setDistance('Any distance')
    setCurrentPage(1)
  }

  return (
    <main className={`${wrap} py-7 sm:py-10`}>

      {/* Breadcrumb navigation */}
      <div className="flex gap-2 text-[10px] text-[#8f9d96] sm:text-xs">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/search">Explore</Link>
        <span>/</span>
        <span>Find your place near campus</span>
      </div>

      {/* Page heading */}
      <div className="my-6 sm:my-8">
        <h1 className="text-[29px] font-bold tracking-[-1.3px] text-[#17483e] sm:text-4xl">
          Find your place near campus
        </h1>

        <p className="mt-2 text-xs text-[#718079] sm:text-sm">
          Thoughtfully verified hostels. A little less commute, a lot more student life.
        </p>
      </div>

      {/* Search form */}
      <form
        className="grid gap-3 rounded-[18px] border border-[#e4eae6] bg-white p-4 sm:grid-cols-4 sm:items-end sm:gap-4 sm:p-5"
        onSubmit={updateSearch}
      >
        {[
          [
            'University or location',
            <input
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              aria-label="University or location"
            />,
          ],
          [
            'Move-in date',
            <input
              type="date"
              value={moveIn}
              onChange={(e) => setMoveIn(e.target.value)}
              aria-label="Move-in date"
            />,
          ],
          [
            'Stay duration',
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              aria-label="Stay duration"
            >
              <option>3 months</option>
              <option>6 months</option>
              <option>9 months</option>
              <option>12 months</option>
            </select>,
          ],
        ].map(([label, input], i) => (
          <label
            className="grid gap-2 text-xs font-bold text-[#45564f]"
            key={label}
          >
            {label}

            <span className="flex min-h-12 items-center gap-2 rounded-[11px] border border-[#dce4df] px-3 font-normal text-[#4e736a]">
              <Icon
                name={
                  i === 0 ? 'pin' : i === 1 ? 'calendar' : 'home'
                }
              />
              {input}
            </span>
          </label>
        ))}

        <button className={button} type="submit">
          <Icon name="search" size={17} />
          Update search
        </button>
      </form>

      {message && (
        <p
          className="mt-3 rounded-lg border border-[#24483e] bg-[#10201c] p-3 text-[13px] text-[#c5ded3]"
          role="status"
        >
          {message}
        </p>
      )}

      <div className="mt-6 grid items-start gap-5 lg:grid-cols-[285px_minmax(0,1fr)]">

        {/* Filter sidebar */}
        <aside className="rounded-[18px] border border-[#e1e7e3] bg-white p-4 text-[#40554e] sm:p-5">

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#485a53]">
              Make it your own
            </h2>

            <button
              type="button"
              className="text-xs text-[#487067]"
              onClick={clear}
            >
              Reset
            </button>
          </div>

          {/* Monthly budget */}
          <div className="border-t border-[#e8eeea] py-4">
            <h3 className="mb-3 text-[13px]">Monthly budget</h3>

            <p className="text-xs text-[#718079]">
              LKR {Number(minimum || 0).toLocaleString()} –{' '}
              {Number(maximum || 0).toLocaleString()}
            </p>

            <div className="my-4 h-1 bg-[#dceae3]" />

            <div className="grid grid-cols-2 gap-2">
              <label className="text-[11px] font-bold">
                Minimum
                <input
                  className="mt-2 h-10 w-full rounded-lg border border-[#e0e6e2] px-2 text-sm"
                  type="number"
                  value={minimum}
                  onChange={(e) => setMinimum(e.target.value)}
                />
              </label>

              <label className="text-[11px] font-bold">
                Maximum
                <input
                  className="mt-2 h-10 w-full rounded-lg border border-[#e0e6e2] px-2 text-sm"
                  type="number"
                  value={maximum}
                  onChange={(e) => setMaximum(e.target.value)}
                />
              </label>
            </div>
          </div>

          {/* Filter groups */}
          {Object.entries(filterGroups).map(([group, values]) => (
            <div
              className="border-t border-[#e8eeea] py-4"
              key={group}
            >
              <h3 className="mb-2 text-[13px]">{group}</h3>

              {values.map((value) => (
                <label
                  className="flex min-h-[34px] items-center gap-2 text-xs"
                  key={value}
                >
                  <input
                    className="h-[17px] w-[17px] accent-[#18483e]"
                    type="checkbox"
                    checked={draftFilters.includes(value)}
                    onChange={() => toggle(value)}
                  />
                  {value}
                </label>
              ))}
            </div>
          ))}

          {/* Distance */}
          <div className="border-t border-[#e8eeea] py-4">
            <h3 className="mb-2 text-[13px]">
              Distance to university
            </h3>

            <select
              className="h-10 w-full rounded-lg border border-[#e0e6e2] px-3 text-xs"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
            >
              <option>Within 3 km</option>
              <option>Within 5 km</option>
              <option>Any distance</option>
            </select>
          </div>

          <button
            type="button"
            className={`${button} w-full`}
            onClick={() => {
              setActiveFilters(draftFilters)
              setCurrentPage(1)
            }}
          >
            Apply filters
          </button>
        </aside>

        {/* Search results */}
        <section>

          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-[#17483e] sm:text-2xl">
                {filtered.length} places to call home
              </h2>

              <p className="text-xs text-[#718079]">
                Near {university || 'your university'} ·{' '}
                {new Date(`${moveIn}T00:00:00`).toLocaleDateString(
                  'en-GB',
                  {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  }
                )}
              </p>
            </div>

            <select
              className="h-10 rounded-lg border border-[#dce6e0] bg-white px-2 text-xs font-semibold"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option>Recommended</option>
              <option>Price: low to high</option>
              <option>Top rated</option>
            </select>
          </div>

          {/* Active filter tags */}
          <div className="flex min-h-12 flex-wrap gap-2 py-3">
            {activeFilters.map((filter) => (
              <button
                type="button"
                className="rounded-full bg-[#dcece4] px-2.5 py-1.5 text-[11px] font-bold text-[#31594f]"
                key={filter}
                onClick={() => {
                  setActiveFilters((current) =>
                    current.filter((item) => item !== filter)
                  )

                  setDraftFilters((current) =>
                    current.filter((item) => item !== filter)
                  )

                  setCurrentPage(1)
                }}
              >
                {filter} ×
              </button>
            ))}
          </div>

          {/* Hostel cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {pageStays.map((stay) => (
              <StayCard
                key={stay.name}
                stay={stay}
                result
                favorite={(favorites || []).includes(stay.name)}
                onFavorite={toggleFavorite}
              />
            ))}

            {!pageStays.length && (
              <div className="rounded-[18px] border border-[#dce4df] bg-white p-8 sm:col-span-2">
                <h3 className="font-bold">
                  No hostels match those filters
                </h3>

                <p className="my-3 text-sm text-[#798780]">
                  Try widening your budget or removing a filter.
                </p>

                <button
                  type="button"
                  className="rounded-lg border border-[#dbe6e0] px-4 py-2 text-xs font-bold"
                  onClick={clear}
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pageCount > 1 && (
            <nav
              className="flex justify-center gap-2 py-5"
              aria-label="Results pages"
            >
              {Array.from({ length: pageCount }, (_, index) => (
                <button
                  type="button"
                  className={`h-9 min-w-9 rounded-lg border px-3 text-xs font-bold ${
                    currentPage === index + 1
                      ? 'border-[#17443b] bg-[#17443b] text-white'
                      : 'border-[#dce7e1] bg-white text-[#345c52]'
                  }`}
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}

              <button
                type="button"
                className="rounded-lg border border-[#dce7e1] bg-white px-3 text-xs font-bold"
                onClick={() =>
                  setCurrentPage((page) =>
                    page === pageCount ? 1 : page + 1
                  )
                }
              >
                Next →
              </button>
            </nav>
          )}
        </section>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-[#8e9d95]">
        Every StayMate verified listing has been
        <br />
        reviewed by our local team.
      </p>
    </main>
  )
}
