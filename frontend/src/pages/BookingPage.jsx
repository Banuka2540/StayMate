import { Link, useLocation, useParams } from 'react-router-dom'
import { useState } from 'react'

import { Icon } from '../components/Icon'
import { getStayDetails, resultStays, stays } from '../data/stays'

const imageUrl = (image) =>
  `https://images.unsplash.com/${image}?auto=format&fit=crop&w=900&q=85`

const formatPrice = (price) => `LKR ${Number(price).toLocaleString()}`

export function BookingPage({ stage: stageProp }) {
  const { stayName } = useParams()
  const location = useLocation()
  const stage = stageProp || (location.pathname.includes('/payment/') ? 'payment' : 'reservation')
  const listing = [...resultStays, ...stays].find(
    (stay) => stay.name === decodeURIComponent(stayName || ''),
  )
  const stay = listing ? getStayDetails(listing) : getStayDetails(resultStays[0])
  const [paymentMethod, setPaymentMethod] = useState('card')
  const advance = 15000
  const fee = 750
  const total = advance + fee

  return (
    <main className="mx-auto max-w-[1450px] px-[18px] pb-16 pt-7 sm:px-11 sm:pt-9">
      <div className="mb-5 text-[10px] text-[#84918c]">
        <Link to="/">Home</Link> <span className="mx-2">/</span>
        <Link to="/search">Explore</Link> <span className="mx-2">/</span>
        {stage === 'payment' ? 'One step closer to home' : 'A new home, made simple'}
      </div>

      {stage === 'reservation' ? (
        <>
          <h1 className="text-[28px] font-extrabold tracking-[-1px] text-[#17483e] sm:text-[32px]">A new home, made simple.</h1>
          <p className="mt-1 text-[10px] text-[#718079]">Choose your room and tell us a little about yourself.</p>
        </>
      ) : (
        <>
          <h1 className="text-[28px] font-extrabold tracking-[-1px] text-[#17483e] sm:text-[32px]">One step closer to home.</h1>
          <p className="mt-1 text-[10px] text-[#718079]">Reserve your bed with a secure advance payment. All amounts are in LKR.</p>
        </>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2 text-[9px] font-bold text-[#789087]">
        <span className="flex items-center gap-1.5 text-[#17443b]"><b className="grid h-5 w-5 place-items-center rounded-full bg-[#17443b] text-[9px] text-white">1</b> Choose your room</span>
        <span className="text-[#9caaa4]">›</span>
        <span className={`flex items-center gap-1.5 ${stage === 'reservation' ? 'text-[#17443b]' : ''}`}><b className="grid h-5 w-5 place-items-center rounded-full bg-[#17443b] text-[9px] text-white">2</b> Reservation details</span>
        <span className="text-[#9caaa4]">›</span>
        <span className={`flex items-center gap-1.5 ${stage === 'payment' ? 'text-[#17443b]' : ''}`}><b className={`grid h-5 w-5 place-items-center rounded-full text-[9px] ${stage === 'payment' ? 'bg-[#17443b] text-white' : 'bg-[#dce5df] text-[#60766e]'}`}>3</b> Advance payment</span>
        <span className="text-[#9caaa4]">›</span>
        <span className="flex items-center gap-1.5"><b className="grid h-5 w-5 place-items-center rounded-full bg-[#dce5df] text-[9px] text-[#60766e]">4</b> Confirmation</span>
      </div>

      {stage === 'payment' && (
        <div className="mt-6 flex items-start gap-2 rounded-lg border border-[#f2bac1] bg-[#fff2f2] px-4 py-3 text-[9px] text-[#7e4a50]">
          <span className="text-[15px] leading-4">ⓘ</span>
          <div><b className="text-[#a64b55]">Your last payment wasn’t completed</b><p className="mt-1 text-[#a36b72]">No money was deducted. Check your card details or choose another card, then try again.</p></div>
        </div>
      )}

      <div className="mt-6 grid items-start gap-5 lg:grid-cols-[1fr_365px]">
        {stage === 'reservation' ? (
          <div className="space-y-4">
            <section className="rounded-[15px] border border-[#e1e8e4] bg-white p-5 shadow-[0_5px_18px_#00000008]">
              <h2 className="text-[13px] font-bold text-[#304d45]">Your room at {stay.place === 'Katubedda, Moratuwa' ? 'Palm Grove' : stay.name}</h2>
              <p className="mt-1 text-[9px] text-[#89958f]">Female residence · University of Moratuwa</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button type="button" className="rounded-xl border-2 border-[#5eaaa1] bg-[#f7fcfa] p-4 text-left">
                  <span className="flex items-center gap-2 text-[10px] font-bold text-[#31594f]"><b className="h-2 w-2 rounded-full bg-[#24594f]" /> Twin ensuite</span>
                  <p className="mt-3 text-[11px] font-extrabold text-[#17483e]">{formatPrice(stay.price)} / month</p>
                  <p className="mt-1 text-[9px] text-[#789087]">6,000 - 9,000 · 1 bed available</p>
                  <p className="mt-3 text-[9px] text-[#718079]"><Icon name="calendar" size={12} /> &nbsp;1 December 2026</p>
                </button>
                <button type="button" className="rounded-xl border border-[#e1e8e4] p-4 text-left">
                  <span className="flex items-center gap-2 text-[10px] font-bold text-[#31594f]"><b className="h-2 w-2 rounded-full border border-[#91a49d]" /> Single ensuite</span>
                  <p className="mt-3 text-[11px] font-extrabold text-[#17483e]">{formatPrice(stay.price + 14000)} / month</p>
                  <p className="mt-1 text-[9px] text-[#789087]">4,102 · 1 room available</p>
                  <p className="mt-3 text-[9px] text-[#718079]"><Icon name="calendar" size={12} /> &nbsp;31 May 2027</p>
                </button>
              </div>
              <span className="mt-3 inline-block rounded-full bg-[#e5f1eb] px-2 py-1 text-[8px] font-bold text-[#5b796f]">8 month stay · Your selected bed is available</span>
            </section>

            <section className="rounded-[15px] border border-[#e1e8e4] bg-white p-5 shadow-[0_5px_18px_#00000008]">
              <h2 className="text-[13px] font-bold text-[#304d45]">Student details</h2>
              <p className="mt-1 text-[9px] text-[#89958f]">Your host uses these details to confirm your reservation.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-[9px] font-bold text-[#526860]">Full name *<input className="mt-2 h-9 w-full rounded-md border border-[#e2e8e5] px-3 text-[10px] font-normal outline-none focus:border-[#79aaa0]" defaultValue="Nethmi Perera" /></label>
                <label className="text-[9px] font-bold text-[#526860]">Email address *<input className="mt-2 h-9 w-full rounded-md border border-[#e2e8e5] px-3 text-[10px] font-normal outline-none focus:border-[#79aaa0]" defaultValue="nethmi.perera@gmail.com" /></label>
                <label className="text-[9px] font-bold text-[#526860]">Mobile number *<input className="mt-2 h-9 w-full rounded-md border border-[#e2e8e5] px-3 text-[10px] font-normal outline-none focus:border-[#79aaa0]" defaultValue="+94 77 234 5678" /></label>
                <label className="text-[9px] font-bold text-[#526860]">NIC / Passport number *<input className="mt-2 h-9 w-full rounded-md border border-[#e2e8e5] px-3 text-[10px] font-normal outline-none focus:border-[#79aaa0]" defaultValue="201012345678" /></label>
                <label className="text-[9px] font-bold text-[#526860]">University *<input className="mt-2 h-9 w-full rounded-md border border-[#e2e8e5] px-3 text-[10px] font-normal outline-none focus:border-[#79aaa0]" defaultValue="University of Sabaragamuwa" /></label>
                <label className="text-[9px] font-bold text-[#526860]">Student ID *<input className="mt-2 h-9 w-full rounded-md border border-[#e2e8e5] px-3 text-[10px] font-normal outline-none focus:border-[#79aaa0]" defaultValue="22C1534" /></label>
                <label className="sm:col-span-2 text-[9px] font-bold text-[#526860]">Emergency contact *<input className="mt-2 h-9 w-full rounded-md border border-[#e2e8e5] px-3 text-[10px] font-normal outline-none focus:border-[#79aaa0]" defaultValue="Kumari Perera · +94 71 456 7890" /></label>
                <label className="sm:col-span-2 text-[9px] font-bold text-[#526860]">Anything you'd like your host to know?<textarea className="mt-2 h-20 w-full resize-none rounded-md border border-[#e2e8e5] px-3 py-2 text-[10px] font-normal outline-none focus:border-[#79aaa0]" defaultValue="I'll arrive around 10 am on 1 December. Please let me know what to bring for check-in." /></label>
              </div>
            </section>

            <section className="rounded-[15px] border border-[#e1e8e4] bg-white p-5 shadow-[0_5px_18px_#00000008]">
              <h2 className="text-[13px] font-bold text-[#304d45]">Before you continue</h2>
              <label className="mt-4 flex items-start gap-2 text-[9px] text-[#526860]"><input type="checkbox" defaultChecked className="mt-0.5 accent-[#17443b]" /> I have read the house rules and cancellation policy.</label>
              <label className="mt-3 flex items-start gap-2 text-[9px] text-[#526860]"><input type="checkbox" defaultChecked className="mt-0.5 accent-[#17443b]" /> I agree to HostelHub’s terms and consent to sharing these details with my host.</label>
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-[#d5e4df] bg-[#edf6f2] px-3 py-3 text-[8px] text-[#718079]">
                <span className="text-[12px]">ⓘ</span><p><b className="text-[#526860]">Hassle what happens next</b><br />Pay your advance securely. Your host will review your reservation within 24 hours, and you can track every step in My bookings.</p>
              </div>
              <div className="mt-4 flex justify-between">
                <Link to={`/stay/${encodeURIComponent(stay.name)}`} className="rounded-lg border border-[#dbe6e0] px-4 py-2.5 text-[9px] font-bold text-[#526860]">Back to hostel</Link>
                <Link to={`/booking/payment/${encodeURIComponent(stay.name)}`} className="rounded-lg bg-[#17443b] px-4 py-2.5 text-[9px] font-bold text-white">→ Continue to payment</Link>
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-4">
            <section className="rounded-[15px] border border-[#e1e8e4] bg-white p-5 shadow-[0_5px_18px_#00000008]">
              <h2 className="text-[13px] font-bold text-[#304d45]">Payment method</h2>
              <p className="mt-1 text-[9px] text-[#89958f]">Booking fee+ 250 · 1% · One step secure checkout</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setPaymentMethod('card')} className={`flex h-12 items-center gap-2 rounded-lg border px-3 text-[10px] font-bold ${paymentMethod === 'card' ? 'border-[#70aaa0] bg-[#f8fcfa]' : 'border-[#e1e8e4]'}`}><span>▣</span> Credit / debit card</button>
                <button type="button" onClick={() => setPaymentMethod('bank')} className={`flex h-12 items-center gap-2 rounded-lg border px-3 text-[10px] font-bold ${paymentMethod === 'bank' ? 'border-[#70aaa0] bg-[#f8fcfa]' : 'border-[#e1e8e4]'}`}><span>▦</span> Online banking</button>
              </div>
              {paymentMethod === 'card' ? (
                <div className="mt-4">
                  <div className="mb-3 flex gap-2 text-[8px] text-[#718079]"><span className="rounded-md border border-[#e1e8e4] px-2 py-1">VISA</span><span className="rounded-md border border-[#e1e8e4] px-2 py-1">Mastercard</span><span className="rounded-md border border-[#e1e8e4] px-2 py-1">Local &amp; international cards accepted</span></div>
                  <label className="text-[9px] font-bold text-[#526860]">Name on card<input className="mt-2 h-9 w-full rounded-md border border-[#e2e8e5] px-3 text-[10px] font-normal outline-none" defaultValue="NETHMI PERERA" /></label>
                  <div className="mt-4 grid grid-cols-[1fr_180px] gap-3">
                    <label className="text-[9px] font-bold text-[#526860]">Card number<input className="mt-2 h-9 w-full rounded-md border border-[#e2e8e5] px-3 text-[10px] font-normal outline-none" defaultValue="4242 4242 4242 4242" /></label>
                    <label className="text-[9px] font-bold text-[#526860]">Security code<input className="mt-2 h-9 w-full rounded-md border border-[#e2e8e5] px-3 text-[10px] font-normal outline-none" placeholder="•••" /></label>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <label className="text-[9px] font-bold text-[#526860]">Expiry date<input className="mt-2 h-9 w-full rounded-md border border-[#e2e8e5] px-3 text-[10px] font-normal outline-none" defaultValue="08 / 29" /></label>
                  </div>
                  <label className="mt-4 flex items-center gap-2 text-[9px] text-[#526860]"><input type="checkbox" defaultChecked className="accent-[#17443b]" /> Save this card securely for faster monthly payments</label>
                  <p className="mt-4 flex items-center gap-2 border-t border-[#edf1ef] pt-4 text-[9px] text-[#718079]"><span>♙</span> Encrypted payments. We never store your full card details.</p>
                </div>
              ) : (
                <div className="mt-5 rounded-lg bg-[#f4f8f6] p-5 text-[10px] text-[#526860]">Choose your Sri Lankan bank on the secure payment gateway.</div>
              )}
            </section>

            <section className="rounded-[15px] border border-[#e1e8e4] bg-white p-5 shadow-[0_5px_18px_#00000008]">
              <h2 className="text-[13px] font-bold text-[#304d45]">Billing details</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-[9px] font-bold text-[#526860]">Email for receipt<input className="mt-2 h-9 w-full rounded-md border border-[#e2e8e5] px-3 text-[10px] font-normal outline-none" defaultValue="nethmi.perera@gmail.com" /></label>
                <label className="text-[9px] font-bold text-[#526860]">Country<select className="mt-2 h-9 w-full rounded-md border border-[#e2e8e5] px-3 text-[10px] outline-none" defaultValue="Sri Lanka"><option>Sri Lanka</option><option>India</option><option>United Kingdom</option></select></label>
                <label className="sm:col-span-2 text-[9px] font-bold text-[#526860]">Billing address<input className="mt-2 h-9 w-full rounded-md border border-[#e2e8e5] px-3 text-[10px] font-normal outline-none" defaultValue="18, Kembiya Road, Panadura, 12500" /></label>
              </div>
            </section>
          </div>
        )}

        <aside className="rounded-[15px] border border-[#e1e8e4] bg-white p-5 shadow-[0_5px_18px_#00000008]">
          <h2 className="text-[13px] font-bold text-[#304d45]">Your stay, at a glance</h2>
          <img className="mt-4 h-[145px] w-full rounded-xl object-cover" src={imageUrl(stay.image)} alt={stay.name} />
          <h3 className="mt-3 text-[11px] font-extrabold text-[#31594f]">{stay.name}</h3>
          <p className="mt-1 text-[9px] text-[#89958f]">{stay.place}, Moratuwa · 8 · 40, 1B bed/check-in</p>
          <div className="mt-4 space-y-2 border-t border-[#edf1ef] pt-3 text-[9px] text-[#718079]">
            <p className="flex justify-between"><span>Room</span><b className="text-[#526860]">Twin ensuite · 9,000, bed A</b></p>
            <p className="flex justify-between"><span>Minimum</span><b className="text-[#526860]">1 December 2026</b></p>
            <p className="flex justify-between"><span>Move out</span><b className="text-[#526860]">31 May 2027</b></p>
            <p className="flex justify-between"><span>Monthly rent</span><b className="text-[#526860]">{formatPrice(stay.price)}</b></p>
            <p className="flex justify-between"><span>Security deposit</span><b className="text-[#526860]">{formatPrice(15000)}</b></p>
            <p className="flex justify-between"><span>Care-time service fee</span><b className="text-[#526860]">{formatPrice(fee)}</b></p>
          </div>
          <p className="mt-4 flex justify-between border-t border-[#edf1ef] pt-4 text-[13px] font-extrabold text-[#17483e]"><span>Due today</span><span>{formatPrice(total)}</span></p>
          {stage === 'payment' && (
            <button type="button" className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#17443b] text-[9px] font-bold text-white"><span>♙</span> Pay {formatPrice(total)} securely</button>
          )}
          <p className="mt-3 text-[8px] leading-4 text-[#89958f]">Free cancellation before 24 November 2026. Advance refunded according to the cancellation policy.</p>
        </aside>
      </div>

      {stage === 'payment' && (
        <div className="mt-5">
          <p className="text-[8px] text-[#89958f]">By paying, you accept the hostel’s cancellation policy. Your LKR 15,000 advance is refundable before 24 November 2026. The LKR 750 service fee is non-refundable once you’re confirmed.</p>
          <Link to={`/booking/reservation/${encodeURIComponent(stay.name)}`} className="mt-4 inline-block rounded-lg border border-[#dbe6e0] px-4 py-2.5 text-[9px] font-bold text-[#526860]">← Back to reservation</Link>
        </div>
      )}
    </main>
  )
}
