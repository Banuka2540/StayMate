// Student payments page
// FR08: advance payment · FR09: monthly rent · FR10: payment history
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { getMyPayments, makePayment } from '../api/paymentApi'

const wrap = 'mx-auto w-[calc(100%-36px)] max-w-[1450px] sm:w-[calc(100%-88px)]'
const card = 'rounded-[18px] border border-[#d8e0db] bg-white p-5 shadow-[0_8px_24px_#0000000d] sm:p-6'
const label = 'mb-1.5 block text-[11px] font-bold uppercase tracking-[.6px] text-[#6f7d77]'
const input =
  'h-12 w-full rounded-xl border border-[#d8e0db] bg-[#fbfaf7] px-3.5 text-sm text-[#203f38] outline-none transition focus:border-[#17443b] focus:bg-white'
const button =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-0 bg-[#17443b] px-5 text-sm font-bold text-white transition hover:bg-[#246257] disabled:cursor-not-allowed disabled:opacity-60'

// TEMPORARY demo bookings.
// TODO: replace with the student's real reservations when the Reservation API is ready.
const myBookings = [
  {
    key: 'palm-grove',
    reservation: undefined, // put the real reservation _id here later
    hostelName: 'Palm Grove Student Residence',
    roomType: 'Twin sharing',
    place: 'Katubedda, Moratuwa',
    rent: 8000,
    advance: 16000, // 2 months rent
    moveIn: '2026-12',
  },
  {
    key: 'palm-house',
    reservation: undefined,
    hostelName: 'The Palm House',
    roomType: 'Single room',
    place: 'Katubedda, Moratuwa',
    rent: 15000,
    advance: 30000,
    moveIn: '2027-01',
  },
]

// ---------- small helpers ----------

const money = (value) => `LKR ${Number(value || 0).toLocaleString()}`

const monthName = (value) => {
  if (!value) return '—'
  const [year, month] = value.split('-')
  return new Date(Number(year), Number(month) - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

const shortDate = (value) =>
  new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

const addMonth = (value) => {
  const [year, month] = value.split('-').map(Number)
  const next = new Date(year, month) // month is already +1 because JS months start at 0
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`
}

// First month (from move-in) that has no paid rent yet
const nextUnpaidMonth = (booking, payments) => {
  const paidMonths = payments
    .filter((p) => p.hostelName === booking.hostelName && p.paymentType === 'Monthly' && p.status === 'Paid')
    .map((p) => p.month)
  let month = booking.moveIn
  while (paidMonths.includes(month)) month = addMonth(month)
  return month
}

const formatCardNumber = (value) =>
  value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')

const formatExpiry = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
}

// Luhn check - the standard check that a card number is real-looking
const isValidCardNumber = (number) => {
  const digits = number.replace(/\D/g, '')
  if (digits.length < 13 || digits.length > 16) return false
  let sum = 0
  digits.split('').reverse().forEach((d, i) => {
    let n = Number(d)
    if (i % 2 === 1) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
  })
  return sum % 10 === 0
}

const isValidExpiry = (value) => {
  const match = value.match(/^(\d{2})\/(\d{2})$/)
  if (!match) return false
  const month = Number(match[1])
  const year = 2000 + Number(match[2])
  if (month < 1 || month > 12) return false
  const endOfMonth = new Date(year, month, 0, 23, 59, 59)
  return endOfMonth >= new Date()
}

const statusStyles = {
  Paid: 'bg-[#e3f1ea] text-[#1f6a4f]',
  Pending: 'bg-[#fbf0d9] text-[#8a6116]',
  Failed: 'bg-[#f8e3e3] text-[#a33d3d]',
  Refunded: 'bg-[#e6ecf3] text-[#3f5a78]',
}

export function StatusBadge({ status }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyles[status] || ''}`}>
      {status}
    </span>
  )
}

// ---------- page ----------

export function PaymentsPage() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [bookingKey, setBookingKey] = useState(myBookings[0].key)
  const [paymentType, setPaymentType] = useState('Advance')
  const [chosenMonth, setChosenMonth] = useState('')

  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [errors, setErrors] = useState({})

  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState(null) // { type: 'success' | 'error', text }
  const [historyFilter, setHistoryFilter] = useState('All')
  const [receipt, setReceipt] = useState(null)

  const loadPayments = useCallback(async () => {
    try {
      const data = await getMyPayments()
      setPayments(data.payments)
      setLoadError('')
    } catch (error) {
      setLoadError(error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPayments()
  }, [loadPayments])

  const booking = myBookings.find((b) => b.key === bookingKey)
  const advancePaid = payments.some(
    (p) => p.hostelName === booking.hostelName && p.paymentType === 'Advance' && p.status === 'Paid'
  )
  const nextDue = nextUnpaidMonth(booking, payments)
  const month = chosenMonth || nextDue
  const amount = paymentType === 'Advance' ? booking.advance : booking.rent

  const paidPayments = payments.filter((p) => p.status === 'Paid')
  const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0)
  const advanceTotal = paidPayments.filter((p) => p.paymentType === 'Advance').reduce((s, p) => s + p.amount, 0)

  const visiblePayments =
    historyFilter === 'All' ? payments : payments.filter((p) => p.paymentType === historyFilter)

  const chooseBooking = (key) => {
    setBookingKey(key)
    setChosenMonth('')
    setNotice(null)
  }

  const validate = () => {
    const found = {}
    if (cardName.trim().length < 3) found.cardName = 'Enter the name on the card'
    if (!isValidCardNumber(cardNumber)) found.cardNumber = 'Enter a valid card number'
    if (!isValidExpiry(expiry)) found.expiry = 'Enter a valid expiry date (MM/YY)'
    if (!/^\d{3,4}$/.test(cvv)) found.cvv = 'Enter the 3-digit CVV'
    if (paymentType === 'Monthly' && !month) found.month = 'Select a month'
    setErrors(found)
    return Object.keys(found).length === 0
  }

  const handlePay = async (event) => {
    event.preventDefault()
    setNotice(null)
    if (!validate()) return

    setSubmitting(true)
    try {
      // Only the last 4 digits leave the browser - never the full card number or CVV
      const data = await makePayment({
        reservation: booking.reservation,
        hostelName: booking.hostelName,
        roomType: booking.roomType,
        paymentType,
        month: paymentType === 'Monthly' ? month : undefined,
        amount,
        cardLast4: cardNumber.replace(/\D/g, '').slice(-4),
      })
      setNotice({ type: 'success', text: `Payment successful · Reference ${data.payment.transactionId}` })
      setReceipt(data.payment)
      setCardName('')
      setCardNumber('')
      setExpiry('')
      setCvv('')
      setChosenMonth('')
    } catch (error) {
      setNotice({ type: 'error', text: error.message })
    } finally {
      setSubmitting(false)
      loadPayments()
    }
  }

  return (
    <main className={`${wrap} py-7 sm:py-10`}>
      {/* Breadcrumb */}
      <div className="flex gap-2 text-[10px] text-[#8f9d96] sm:text-xs">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>Payments</span>
      </div>

      {/* Heading */}
      <div className="my-6 sm:my-8">
        <h1 className="text-[29px] font-bold tracking-[-1.3px] text-[#17483e] sm:text-4xl">Payments</h1>
        <p className="mt-2 text-xs text-[#718079] sm:text-sm">
          Pay your advance and monthly rent, and keep track of every payment in one place.
        </p>
      </div>

      {/* Summary */}
      <section className="grid gap-4 sm:grid-cols-3">
        <SummaryTile icon="wallet" title="Total paid" value={money(totalPaid)} hint={`${paidPayments.length} successful payments`} />
        <SummaryTile icon="check" title="Advance paid" value={money(advanceTotal)} hint="Paid when reserving rooms" />
        <SummaryTile
          icon="calendar"
          title="Next rent due"
          value={monthName(nextDue)}
          hint={`${booking.hostelName} · ${money(booking.rent)}`}
        />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
        {/* ---------- Make a payment ---------- */}
        <section className={card}>
          <h2 className="text-lg font-bold text-[#17483e]">Make a payment</h2>

          <form onSubmit={handlePay} className="mt-5 space-y-5" noValidate>
            {/* Booking */}
            <div>
              <span className={label}>Booking</span>
              <div className="grid gap-2.5">
                {myBookings.map((b) => (
                  <button
                    type="button"
                    key={b.key}
                    onClick={() => chooseBooking(b.key)}
                    className={`rounded-xl border p-3.5 text-left transition ${
                      b.key === bookingKey
                        ? 'border-[#17443b] bg-[#eef5f1]'
                        : 'border-[#d8e0db] bg-white hover:border-[#9db5ab]'
                    }`}
                  >
                    <span className="block text-sm font-bold text-[#1b463e]">{b.hostelName}</span>
                    <span className="mt-0.5 block text-xs text-[#78827f]">
                      {b.roomType} · {b.place} · {money(b.rent)} / month
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment type */}
            <div>
              <span className={label}>Payment type</span>
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#f1f0ea] p-1">
                {['Advance', 'Monthly'].map((type) => (
                  <button
                    type="button"
                    key={type}
                    onClick={() => setPaymentType(type)}
                    className={`h-10 rounded-[10px] border-0 text-sm font-bold transition ${
                      paymentType === type ? 'bg-white text-[#17443b] shadow-[0_2px_8px_#0001]' : 'bg-transparent text-[#78827f]'
                    }`}
                  >
                    {type === 'Advance' ? 'Advance payment' : 'Monthly rent'}
                  </button>
                ))}
              </div>
            </div>

            {paymentType === 'Monthly' && (
              <div>
                <label className={label} htmlFor="month">Rent for month</label>
                <input
                  id="month"
                  type="month"
                  className={input}
                  value={month}
                  min={booking.moveIn}
                  onChange={(e) => setChosenMonth(e.target.value)}
                />
                <FieldError text={errors.month} />
              </div>
            )}

            {/* Amount */}
            <div className="flex items-center justify-between rounded-xl bg-[#143f38] px-4 py-3.5 text-white">
              <span className="text-xs text-[#a8c0b5]">
                {paymentType === 'Advance' ? 'Advance (2 months rent)' : `Rent for ${monthName(month)}`}
              </span>
              <strong className="text-lg">{money(amount)}</strong>
            </div>

            {paymentType === 'Advance' && advancePaid ? (
              <p className="rounded-xl bg-[#e3f1ea] p-3.5 text-sm font-semibold text-[#1f6a4f]">
                ✓ The advance for this booking is already paid. Switch to “Monthly rent” to pay rent.
              </p>
            ) : (
              <>
                {/* Card details */}
                <div className="grid gap-4">
                  <div>
                    <label className={label} htmlFor="cardName">Name on card</label>
                    <input id="cardName" className={input} value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="N. Perera" autoComplete="cc-name" />
                    <FieldError text={errors.cardName} />
                  </div>
                  <div>
                    <label className={label} htmlFor="cardNumber">Card number</label>
                    <input id="cardNumber" className={input} value={cardNumber} onChange={(e) => setCardNumber(formatCardNumber(e.target.value))} placeholder="4242 4242 4242 4242" inputMode="numeric" autoComplete="cc-number" />
                    <FieldError text={errors.cardNumber} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={label} htmlFor="expiry">Expiry</label>
                      <input id="expiry" className={input} value={expiry} onChange={(e) => setExpiry(formatExpiry(e.target.value))} placeholder="MM/YY" inputMode="numeric" autoComplete="cc-exp" />
                      <FieldError text={errors.expiry} />
                    </div>
                    <div>
                      <label className={label} htmlFor="cvv">CVV</label>
                      <input id="cvv" type="password" className={input} value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="123" inputMode="numeric" autoComplete="cc-csc" />
                      <FieldError text={errors.cvv} />
                    </div>
                  </div>
                </div>

                <button type="submit" className={`${button} w-full`} disabled={submitting}>
                  <Icon name="wallet" size={17} />
                  {submitting ? 'Processing…' : `Pay ${money(amount)}`}
                </button>
              </>
            )}

            {notice && (
              <p className={`rounded-xl p-3.5 text-sm font-semibold ${notice.type === 'success' ? 'bg-[#e3f1ea] text-[#1f6a4f]' : 'bg-[#f8e3e3] text-[#a33d3d]'}`}>
                {notice.text}
              </p>
            )}

            <p className="text-[11px] leading-relaxed text-[#8f9d96]">
              Test mode: no real money is charged. Use 4242 4242 4242 4242 with any future expiry date.
              Use 4000 0000 0000 0002 to see a declined payment.
            </p>
          </form>
        </section>

        {/* ---------- Payment history ---------- */}
        <section className={card}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-[#17483e]">Payment history</h2>
            <div className="flex gap-1.5">
              {['All', 'Advance', 'Monthly'].map((f) => (
                <button
                  type="button"
                  key={f}
                  onClick={() => setHistoryFilter(f)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
                    historyFilter === f ? 'border-[#17443b] bg-[#17443b] text-white' : 'border-[#d8e0db] bg-white text-[#52635f]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="py-12 text-center text-sm text-[#8f9d96]">Loading payments…</p>
          ) : loadError ? (
            <p className="mt-5 rounded-xl bg-[#f8e3e3] p-3.5 text-sm font-semibold text-[#a33d3d]">{loadError}</p>
          ) : visiblePayments.length === 0 ? (
            <div className="py-14 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#eef5f1] text-[#17443b]">
                <Icon name="wallet" />
              </span>
              <p className="mt-3 text-sm font-semibold text-[#1b463e]">No payments yet</p>
              <p className="mt-1 text-xs text-[#8f9d96]">Your payments will show up here.</p>
            </div>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#e7ece9] text-[11px] uppercase tracking-[.6px] text-[#8f9d96]">
                    <th className="py-2.5 pr-3 font-bold">Date</th>
                    <th className="py-2.5 pr-3 font-bold">Hostel</th>
                    <th className="py-2.5 pr-3 font-bold">Type</th>
                    <th className="py-2.5 pr-3 font-bold">Amount</th>
                    <th className="py-2.5 pr-3 font-bold">Status</th>
                    <th className="py-2.5 font-bold" />
                  </tr>
                </thead>
                <tbody>
                  {visiblePayments.map((p) => (
                    <tr key={p._id} className="border-b border-[#eef1ef] text-[#33504a] last:border-0">
                      <td className="py-3 pr-3 whitespace-nowrap">{shortDate(p.paidAt || p.createdAt)}</td>
                      <td className="py-3 pr-3">
                        <span className="block font-semibold text-[#1b463e]">{p.hostelName}</span>
                        <span className="text-[11px] text-[#8f9d96]">{p.transactionId}</span>
                      </td>
                      <td className="py-3 pr-3 whitespace-nowrap">
                        {p.paymentType === 'Advance' ? 'Advance' : `Rent · ${monthName(p.month)}`}
                      </td>
                      <td className="py-3 pr-3 font-bold whitespace-nowrap text-[#1c5045]">{money(p.amount)}</td>
                      <td className="py-3 pr-3"><StatusBadge status={p.status} /></td>
                      <td className="py-3 text-right">
                        <button type="button" onClick={() => setReceipt(p)} className="border-0 bg-transparent text-xs font-bold text-[#17443b] underline-offset-2 hover:underline">
                          Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {receipt && <ReceiptModal payment={receipt} onClose={() => setReceipt(null)} />}
    </main>
  )
}

// ---------- small components ----------

function SummaryTile({ icon, title, value, hint }) {
  return (
    <div className={card}>
      <div className="flex items-center gap-2.5 text-[#52635f]">
        <span className="grid h-9 w-9 place-items-center rounded-[11px] bg-[#eef5f1] text-[#17443b]">
          <Icon name={icon} size={18} />
        </span>
        <span className="text-xs font-bold">{title}</span>
      </div>
      <strong className="mt-3 block text-2xl tracking-[-.6px] text-[#17483e]">{value}</strong>
      <span className="mt-1 block truncate text-xs text-[#8f9d96]">{hint}</span>
    </div>
  )
}

function FieldError({ text }) {
  return text ? <span className="mt-1 block text-xs font-semibold text-[#a33d3d]">{text}</span> : null
}

export function ReceiptModal({ payment, onClose }) {
  const rows = [
    ['Reference', payment.transactionId],
    ['Date', shortDate(payment.paidAt || payment.createdAt)],
    ['Hostel', payment.hostelName],
    ['Room', payment.roomType || '—'],
    ['Payment type', payment.paymentType === 'Advance' ? 'Advance payment' : `Monthly rent · ${monthName(payment.month)}`],
    ['Card', payment.cardLast4 ? `•••• ${payment.cardLast4}` : '—'],
    ['Status', payment.status],
    ['Amount', money(payment.amount)],
  ]
  if (payment.note) rows.push(['Note', payment.note])

  // Opens a clean window with just the receipt and prints it
  const print = () => {
    const win = window.open('', '_blank', 'width=480,height=640')
    if (!win) return
    win.document.write(`<html><head><title>StayMate receipt ${payment.transactionId}</title>
      <style>body{font-family:'Segoe UI',sans-serif;padding:32px;color:#203f38}h1{font-size:22px;margin:0 0 4px}
      p{color:#718079;margin:0 0 20px}td{padding:8px 0;border-bottom:1px solid #e7ece9}td:last-child{text-align:right;font-weight:600}
      table{width:100%;border-collapse:collapse}</style></head><body>
      <h1>StayMate</h1><p>Payment receipt</p><table>
      ${rows.map(([k, v]) => `<tr><td>${k}</td><td>${String(v).replace(/</g, '&lt;')}</td></tr>`).join('')}
      </table></body></html>`)
    win.document.close()
    win.focus()
    win.print()
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#0f2a25]/50 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Payment receipt" className="w-full max-w-[420px] rounded-[18px] bg-white p-6 shadow-[0_20px_60px_#0004]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#17483e]">Payment receipt</h3>
            <p className="text-xs text-[#8f9d96]">StayMate</p>
          </div>
          <StatusBadge status={payment.status} />
        </div>
        <dl className="mt-5">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-[#eef1ef] py-2.5 text-sm last:border-0">
              <dt className="text-[#78827f]">{k}</dt>
              <dd className="m-0 text-right font-semibold text-[#1b463e]">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <button type="button" onClick={onClose} className="min-h-11 rounded-xl border border-[#d8e0db] bg-white text-sm font-bold text-[#33504a]">Close</button>
          <button type="button" onClick={print} className={button}>Print</button>
        </div>
      </div>
    </div>
  )
}