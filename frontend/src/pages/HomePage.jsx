
import { Link, useNavigate } from 'react-router-dom'

import { Icon } from '../components/Icon'
import { StayCard } from '../components/StayCard'
import { stays } from '../data/stays'

const wrap =
  'mx-auto w-[calc(100%-36px)] max-w-[1450px] sm:w-[calc(100%-88px)]'

const eyebrow =
  'inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[1.25px] text-[#578879]'

const button =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-0 bg-[#17443b] px-5 text-xs font-bold text-white transition hover:-translate-y-px hover:bg-[#246257]'

export function HomePage({
  university,
  setUniversity,
  moveIn,
  setMoveIn,
  budget,
  setBudget,
  favorites,
  toggleFavorite,
}) {
  const navigate = useNavigate()

  const explore = (event) => {
    event.preventDefault()
    navigate('/search')
  }

  return (
    <main id="top">

      {/* Hero Section */}
      <section className={`${wrap} grid items-center gap-6 py-11 sm:grid-cols-[.88fr_1.12fr] sm:gap-[60px] sm:py-10`}>
        <div>
          <span className={eyebrow}>
            <span className="h-2 w-2 rounded-full bg-[#d4aa64] shadow-[0_0_0_4px_#d4aa641f]" />
            A better way to find student housing
          </span>

          <h1 className="my-5 max-w-[600px] text-[clamp(43px,5.1vw,72px)] font-extrabold leading-[1.03] tracking-[-3.8px] text-[#17483e]">
            Find your student{' '}
            <span className="text-[#568c78]">accommodation.</span>
          </h1>

          <p className="max-w-[475px] text-base leading-[1.65] text-[#718079]">
            Discover trusted student hostels near your university. Find your
            space, book with confidence, and settle into Sabaragamuwa University
            student life.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-[11px] font-semibold text-[#527469]">
            <span><Icon name="check" size={15} /> Verified residences</span>
            <span><Icon name="check" size={15} /> Secure payments</span>
            <span><Icon name="check" size={15} /> Local support</span>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative h-[260px] overflow-hidden rounded-[19px] bg-[#27473c] sm:h-[360px] sm:rounded-[26px]">
          <img
            className="h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=88"
            alt="Welcoming tropical home surrounded by palm trees"
          />

          <span className="absolute left-3.5 top-3.5 inline-flex items-center gap-1 rounded-full bg-[#eaf4ef] px-2.5 py-2 text-[10px] font-extrabold text-[#26564c]">
            <Icon name="check" size={14} />
            HostelHub verified
          </span>

          <div className="absolute bottom-3.5 left-3.5 grid w-[calc(100%-28px)] gap-1 rounded-[15px] bg-white p-4 text-[11px] text-[#626f6b] shadow-xl sm:bottom-5 sm:left-5 sm:w-[300px]">
            <span>A place to make your own</span>
            <strong className="text-sm text-[#234d45]">
              Palm Grove · Moratuwa
            </strong>
            <div>
              From LKR 28,000 / month
              <span className="ml-3 text-[#c59848]">★ 4.9</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search Form */}
      <form
        className={`${wrap} grid gap-2 rounded-2xl border border-[#dbe7e1] bg-white p-3.5 shadow-[0_12px_40px_#0004] sm:grid-cols-[1.45fr_1.2fr_1.2fr_auto] sm:items-center sm:gap-4 sm:pl-6`}
        onSubmit={explore}
      >
        <label className="flex min-h-[53px] items-center gap-3 border-b border-[#edf0ee] text-[#52766e] sm:border-0">
          <Icon name="pin" />
          <span className="grid flex-1 gap-1">
            <b className="text-[11px] text-[#405652]">
              Where are you studying?
            </b>
            <input
              className="w-full border-0 bg-transparent text-xs text-[#84918c] outline-0"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              aria-label="University"
            />
          </span>
        </label>

        <label className="flex min-h-[53px] items-center gap-3 border-b border-[#edf0ee] text-[#52766e] sm:border-0">
          <Icon name="calendar" />
          <span className="grid flex-1 gap-1">
            <b className="text-[11px] text-[#405652]">Moving in</b>
            <input
              className="w-full border-0 bg-transparent text-xs text-[#84918c] outline-0"
              type="date"
              value={moveIn}
              onChange={(e) => setMoveIn(e.target.value)}
              aria-label="Moving in date"
            />
          </span>
        </label>

        <label className="flex min-h-[53px] items-center gap-3 text-[#52766e]">
          <Icon name="wallet" />
          <span className="grid flex-1 gap-1">
            <b className="text-[11px] text-[#405652]">
              Your monthly budget
            </b>
            <span className="flex gap-1 text-xs text-[#899690]">
              LKR
              <input
                className="w-full border-0 bg-transparent outline-0"
                type="number"
                min="0"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                aria-label="Monthly budget"
              />
            </span>
          </span>
        </label>

        <button className={button} type="submit">
          <Icon name="search" size={17} />
          Find my hostel
        </button>
      </form>

      {/* Statistics */}
      <div className={`${wrap} flex flex-wrap justify-center gap-x-5 gap-y-2 py-5 text-[10px] font-semibold text-[#527469] sm:justify-between`}>
        <span>✦ 1,140+ students</span>
        <span>30 verified residences</span>
        <span>★ 4.8 student ratings</span>
      </div>

      {/* Featured Hostels */}
      <section className={`${wrap} pt-14 sm:pt-24`} id="stays">
        <div className="mb-7 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <span className={eyebrow}>Your next chapter starts here</span>
            <h2 className="my-3 text-[29px] font-bold tracking-[-1.4px] text-[#17483e] sm:text-[34px]">
              Good places. Great beginnings.
            </h2>
            <p className="text-[13px] text-[#718079]">
              Thoughtfully chosen for you.
            </p>
          </div>

          <Link
            to="/search"
            className="inline-flex min-h-11 items-center gap-2 rounded-[11px] border border-[#dbe6e0] bg-white px-4 text-xs font-bold text-[#264e46] hover:bg-[#eaf4ef]"
          >
            <Icon name="arrow" size={16} />
            Explore all hostels
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
          {stays.map((stay) => (
            <StayCard
              key={stay.name}
              stay={stay}
              favorite={(favorites || []).includes(stay.name)}
              onFavorite={toggleFavorite}
            />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section
        className={`${wrap} my-14 grid gap-7 rounded-[22px] border border-[#e0e9e4] bg-[#f8fbf9] p-6 text-[#183f38] sm:my-20 sm:grid-cols-4 sm:p-9`}
        id="how-it-works"
      >
        <div className="sm:col-span-1">
          <span className={eyebrow}>A simple way to settle in</span>
          <h2 className="my-2 text-[27px] font-bold text-[#1b4840]">
            Less searching.<br />More settling in.
          </h2>
          <p className="max-w-[260px] text-xs leading-[1.55] text-[#7e8b85]">
            Your new boarding place is just three simple steps away.
          </p>
        </div>

        {[
          ['magnify', 'Find your fit', 'Explore verified places by university, budget, and the things that matter to you.'],
          ['calendar', 'Make it yours', 'Choose a room, send your details, and pay your advance securely online.'],
          ['home', 'Feel at home', 'Track your booking, meet your host, and manage monthly rent in one place.'],
        ].map(([icon, title, copy]) => (
          <div className="grid grid-cols-[35px_1fr] gap-x-3 sm:block" key={title}>
            <span className="row-span-2 text-[#4c786d] sm:block sm:h-9">
              <Icon name={icon} size={23} />
            </span>
            <b className="text-[13px] text-[#334f48]">{title}</b>
            <p className="text-[11px] leading-[1.55] text-[#7f8c86]">
              {copy}
            </p>
          </div>
        ))}
      </section>

      {/* Student Testimonial */}
      <section className={`${wrap} grid gap-6 pb-12 sm:grid-cols-2 sm:items-center`}>
        <img
          className="h-[230px] w-full rounded-[22px] object-cover sm:h-[310px]"
          src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1100&q=85"
          alt="Light-filled shared dining room"
        />

        <div>
          <span className={eyebrow}>More than a room</span>
          <blockquote className="my-4 text-[26px] font-bold leading-tight text-[#17483e]">
            “I found a safe place near campus — and a little community that feels like home.”
          </blockquote>
          <p className="text-xs text-[#718079]">
            Nethmi Perera · University of Sabaragamuwa
          </p>
          <div className="mt-3 text-xs text-[#c59848]">
            ★★★★★
            <span className="ml-2 text-[#718079]">
              Verified student resident
            </span>
          </div>
        </div>
      </section>

      {/* Provider Section */}
      <section
        className={`${wrap} mb-12 flex flex-col items-start justify-between gap-5 rounded-2xl bg-[#dcece4] p-6 sm:flex-row sm:items-center sm:p-8`}
        id="provider"
      >
        <div>
          <h2 className="text-xl font-bold text-[#1b4840]">
            Have a space students will love?
          </h2>
          <p className="mt-1 text-sm text-[#718079]">
            Join our trusted provider community. List your hostel and let good
            things move in.
          </p>
        </div>

        <a className={button} href="mailto:hello@staymate.lk">
          <Icon name="arrow" size={16} />
          Become a provider
        </a>
      </section>

    </main>
  )
}
