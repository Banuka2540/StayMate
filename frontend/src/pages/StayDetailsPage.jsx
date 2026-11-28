import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Icon } from '../components/Icon'
import { ReportListingModal } from '../components/ReportListingModal'
import { getStayDetails, getStayImages, resultStays, stays } from '../data/stays'

const imageUrl = (image) =>
  `https://images.unsplash.com/${image}?auto=format&fit=crop&w=1200&q=85`

const formatPrice = (price) => `LKR ${Number(price).toLocaleString()}`

export function StayDetailsPage() {
  const { stayName } = useParams()
  const [reportOpen, setReportOpen] = useState(false)
  const listing = [...resultStays, ...stays].find(
    (stay) => stay.name === decodeURIComponent(stayName || ''),
  )

  if (!listing) {
    return (
      <main className="mx-auto max-w-[1100px] px-5 py-20 text-center">
        <h1 className="text-2xl font-bold text-[#17483e]">Residence not found</h1>
        <Link className="mt-5 inline-block font-bold text-[#17443b] underline" to="/search">
          Return to search
        </Link>
      </main>
    )
  }

  const stay = getStayDetails(listing)
  const images = getStayImages(stay)
  const amenities = [
    ['High-speed Wi-Fi', stay.wifi],
    ['24/7 security', stay.security],
    ['Shared kitchen', stay.kitchen],
    ['Quiet study lounge', true],
    ['Laundry facilities', true],
    ['Hot water', stay.bath],
  ]

  return (
    <main className="mx-auto max-w-[1450px] px-[18px] pb-16 pt-6 sm:px-11 sm:pt-8">
      <div className="mb-5 text-[10px] text-[#84918c]">
        <Link to="/">Home</Link> <span className="mx-2">/</span>
        <Link to="/search">Explore</Link> <span className="mx-2">/</span> {stay.name}
      </div>

      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[27px] font-extrabold tracking-[-1px] text-[#17483e] sm:text-[34px]">
            {stay.name}
          </h1>
          <p className="mt-1 text-[11px] text-[#718079]">
            {stay.place} · {stay.distance.toLowerCase()}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border border-[#dbe6e0] bg-white px-4 py-2.5 text-[11px] font-bold text-[#264e46]">
            <Icon name="arrow" size={14} /> Share
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-[#dbe6e0] bg-white px-4 py-2.5 text-[11px] font-bold text-[#264e46]">
            <Icon name="heart" size={14} /> Save
          </button>
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-[#dbe6e0] bg-white px-4 py-2.5 text-[11px] font-bold text-[#9b5b1c] hover:bg-[#fdf7f1]"
          >
            <Icon name="flag" size={14} /> Report
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3 text-[10px] text-[#718079]">
        <span className="rounded-full bg-[#dcece4] px-2.5 py-1.5 font-bold text-[#31594f]">HostelHub verified</span>
        <strong className="text-[#334e47]">★ {stay.rating} · 86 reviews</strong>
        <span>{stay.residence} · Hosted by {stay.host}</span>
      </div>

      <div className="grid gap-2 sm:grid-cols-[1.4fr_.8fr] sm:grid-rows-2">
        <img className="h-[270px] w-full rounded-[15px] object-cover sm:row-span-2 sm:h-[418px]" src={imageUrl(images[0])} alt={`${stay.name} exterior`} />
        {images.slice(1, 5).map((image, index) => (
          <img key={image} className="hidden h-[203px] w-full rounded-[15px] object-cover sm:block" src={imageUrl(image)} alt={`${stay.name} room ${index + 1}`} />
        ))}
      </div>

      <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="flex gap-7 border-b border-[#dbe4df] pb-3 text-[10px] font-semibold text-[#547268]">
            <span className="border-b-2 border-[#17443b] pb-3 text-[#17443b]">Overview</span>
            <span>Rooms</span><span>Location</span><span>Reviews</span>
          </div>
          <section className="border-b border-[#dbe4df] py-5">
            <h2 className="text-[16px] font-bold text-[#17483e]">A calm space for your busy campus life.</h2>
            <p className="mt-3 max-w-[760px] text-[11px] leading-5 text-[#788680]">{stay.description}</p>
            <div className="mt-4 flex flex-wrap gap-5 text-[10px] text-[#526860]">
              <span>{stay.rooms[0].beds}</span><span>4 student beds</span><span>{stay.residence}</span><span>Minimum stay: 3 months</span>
            </div>
          </section>

          <section className="border-b border-[#dbe4df] py-5">
            <h2 className="mb-4 text-[16px] font-bold text-[#17483e]">Everything you need, included</h2>
            <div className="grid grid-cols-2 gap-4 text-[10px] text-[#526860] sm:grid-cols-3">
              {amenities.map(([label, included]) => <span key={label} className={included ? '' : 'text-[#b0b9b4]'}>✓ {label}</span>)}
            </div>
          </section>

          <section className="border-b border-[#dbe4df] py-5">
            <h2 className="mb-4 text-[16px] font-bold text-[#17483e]">Choose your room</h2>
            <div className="grid gap-0 text-[10px] text-[#526860]">
              {stay.rooms.map((room) => (
                <div className="grid grid-cols-[1.5fr_1fr_.7fr_auto] items-center gap-2 border-b border-[#e8eeea] py-3" key={room.type}>
                  <span className="font-semibold text-[#264e46]">{room.type}</span>
                  <span>{formatPrice(room.rent)}</span><span>{room.beds}</span>
                  <button className="rounded-lg bg-[#17443b] px-3 py-2 text-[9px] font-bold text-white">{room.action}</button>
                </div>
              ))}
            </div>
          </section>

          <section className="py-5">
            <h2 className="text-[16px] font-bold text-[#17483e]">House rules, for a happy home</h2>
            <div className="mt-4 grid gap-3 text-[10px] text-[#526860] sm:grid-cols-2">
              <span>✓ Students only · University ID required</span><span>No smoking or alcohol</span>
              <span>✓ Quiet hours 10 pm – 6 am</span><span>No pets · No overnight guests</span>
              <span>✓ Visitors: 9 am – 7 pm in common areas</span><span>Check-in: 9 am – 6 pm</span>
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-[15px] border border-[#e0e8e3] bg-white p-4 shadow-[0_8px_24px_#0000000b]">
          <h2 className="text-[13px] font-bold text-[#304d45]">Make yourself at home</h2>
          <div className="mt-3 flex items-baseline gap-2"><strong className="text-[19px] text-[#17483e]">{formatPrice(stay.price)}</strong><span className="text-[10px] text-[#84918c]">/ month</span></div>
          <span className="mt-3 inline-block rounded-full bg-[#dcece4] px-2 py-1 text-[9px] font-bold text-[#31594f]">4 twin beds available</span>
          <div className="mt-4 grid gap-3 border-b border-[#e7ece9] pb-4 text-[10px] text-[#718079]">
            <span className="flex justify-between">Room type <b className="text-[#304d45]">{stay.room}</b></span>
            <span className="flex justify-between">Move-in <b className="text-[#304d45]">1 December 2026</b></span>
            <span className="flex justify-between">Duration <b className="text-[#304d45]">6 months</b></span>
          </div>
          <div className="grid gap-2 py-4 text-[10px] text-[#718079]"><span className="flex justify-between">Refundable advance <b>{formatPrice(15000)}</b></span><span className="flex justify-between">Service fee <b>LKR 750</b></span></div>
          <Link
            to={`/booking/reservation/${encodeURIComponent(stay.name)}`}
            className="block w-full rounded-lg bg-[#17443b] py-3 text-center text-[10px] font-bold text-white"
          >
            → Choose your room
          </Link>
          <p className="mt-3 text-[9px] leading-4 text-[#89958f]">You’ll review all details before payment. Monthly rent is paid separately.</p>
          <div className="mt-4 border-t border-[#e7ece9] pt-4 text-[10px]"><b>Meet your host</b><p className="mt-2 text-[#526860]">{stay.host} · Verified provider</p><p className="mt-1 text-[#89958f]">{stay.hostResponse}</p><button className="mt-3 w-full rounded-lg border border-[#dbe6e0] py-2 font-bold text-[#31594f]">Ask a question</button></div>
        </aside>
      </div>

      <ReportListingModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        defaultTargetName={stay.name}
        defaultTargetType="Hostel"
      />
    </main>
  )
}
