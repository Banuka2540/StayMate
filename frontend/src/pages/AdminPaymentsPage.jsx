// Admin payment records page
// FR24: administrators monitor payment records
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { getAllPayments, updatePaymentStatus } from '../api/paymentApi'
import { StatusBadge, ReceiptModal } from './PaymentsPage'

const wrap = 'mx-auto w-[calc(100%-36px)] max-w-[1450px] sm:w-[calc(100%-88px)]'
const card = 'rounded-[18px] border border-[#d8e0db] bg-white p-5 shadow-[0_8px_24px_#0000000d] sm:p-6'
const input =
  'h-11 rounded-xl border border-[#d8e0db] bg-[#fbfaf7] px-3.5 text-sm text-[#203f38] outline-none transition focus:border-[#17443b] focus:bg-white'

const money = (value) => `LKR ${Number(value || 0).toLocaleString()}`
const shortDate = (value) =>
  new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export function AdminPaymentsPage() {
  const [payments, setPayments] = useState([])
  const [summary, setSummary] = useState(null)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [paymentType, setPaymentType] = useState('')
  const [page, setPage] = useState(1)

  const [receipt, setReceipt] = useState(null)
  const [refunding, setRefunding] = useState(null) // payment being refunded
  const [refundNote, setRefundNote] = useState('')
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    try {
      const data = await getAllPayments({ search, status, paymentType, page, limit: 15 })
      setPayments(data.payments)
      setSummary(data.summary)
      setPages(data.pages)
      setTotal(data.total)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [search, status, paymentType, page])

  useEffect(() => {
    // small delay so we don't call the server on every key press in the search box
    const timer = setTimeout(load, 300)
    return () => clearTimeout(timer)
  }, [load])

  const changeFilter = (setter) => (event) => {
    setter(event.target.value)
    setPage(1)
  }

  const confirmRefund = async () => {
    try {
      await updatePaymentStatus(refunding._id, 'Refunded', refundNote || 'Refunded by admin')
      setMessage(`Payment ${refunding.transactionId} was marked as refunded`)
      setRefunding(null)
      setRefundNote('')
      load()
    } catch (err) {
      setMessage(err.message)
    }
  }

  return (
    <main className={`${wrap} py-7 sm:py-10`}>
      <div className="flex gap-2 text-[10px] text-[#8f9d96] sm:text-xs">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>Admin</span>
        <span>/</span>
        <span>Payment records</span>
      </div>

      <div className="my-6 sm:my-8">
        <h1 className="text-[29px] font-bold tracking-[-1.3px] text-[#17483e] sm:text-4xl">Payment records</h1>
        <p className="mt-2 text-xs text-[#718079] sm:text-sm">Monitor every advance and rent payment made on StayMate.</p>
      </div>

      {/* Summary */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile title="Total collected" value={money(summary?.totalCollected)} />
        <Tile title="Advance payments" value={money(summary?.advanceCollected)} />
        <Tile title="Monthly rent" value={money(summary?.monthlyCollected)} />
        <Tile
          title="Payments"
          value={`${summary?.paidCount ?? 0} paid`}
          hint={`${summary?.failedCount ?? 0} failed · ${summary?.refundedCount ?? 0} refunded`}
        />
      </section>

      <section className={`${card} mt-6`}>
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8f9d96]">
              <Icon name="search" size={17} />
            </span>
            <input className={`${input} w-full pl-10`} placeholder="Search hostel or reference" value={search} onChange={changeFilter(setSearch)} />
          </div>
          <select className={input} value={status} onChange={changeFilter(setStatus)} aria-label="Filter by status">
            <option value="">All statuses</option>
            <option>Paid</option>
            <option>Pending</option>
            <option>Failed</option>
            <option>Refunded</option>
          </select>
          <select className={input} value={paymentType} onChange={changeFilter(setPaymentType)} aria-label="Filter by type">
            <option value="">All types</option>
            <option value="Advance">Advance</option>
            <option value="Monthly">Monthly rent</option>
          </select>
        </div>

        {message && <p className="mt-4 rounded-xl bg-[#eef5f1] p-3 text-sm font-semibold text-[#1f6a4f]">{message}</p>}

        {loading ? (
          <p className="py-12 text-center text-sm text-[#8f9d96]">Loading payment records…</p>
        ) : error ? (
          <p className="mt-5 rounded-xl bg-[#f8e3e3] p-3.5 text-sm font-semibold text-[#a33d3d]">{error}</p>
        ) : payments.length === 0 ? (
          <p className="py-12 text-center text-sm text-[#8f9d96]">No payments match these filters.</p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#e7ece9] text-[11px] uppercase tracking-[.6px] text-[#8f9d96]">
                  <th className="py-2.5 pr-3 font-bold">Date</th>
                  <th className="py-2.5 pr-3 font-bold">Reference</th>
                  <th className="py-2.5 pr-3 font-bold">Student</th>
                  <th className="py-2.5 pr-3 font-bold">Hostel</th>
                  <th className="py-2.5 pr-3 font-bold">Type</th>
                  <th className="py-2.5 pr-3 font-bold">Amount</th>
                  <th className="py-2.5 pr-3 font-bold">Status</th>
                  <th className="py-2.5 font-bold" />
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id} className="border-b border-[#eef1ef] text-[#33504a] last:border-0">
                    <td className="py-3 pr-3 whitespace-nowrap">{shortDate(p.paidAt || p.createdAt)}</td>
                    <td className="py-3 pr-3 whitespace-nowrap text-xs">{p.transactionId}</td>
                    <td className="py-3 pr-3 text-xs text-[#78827f]">…{String(p.student).slice(-6)}</td>
                    <td className="py-3 pr-3 font-semibold text-[#1b463e]">{p.hostelName}</td>
                    <td className="py-3 pr-3 whitespace-nowrap">{p.paymentType === 'Advance' ? 'Advance' : `Rent · ${p.month}`}</td>
                    <td className="py-3 pr-3 font-bold whitespace-nowrap text-[#1c5045]">{money(p.amount)}</td>
                    <td className="py-3 pr-3"><StatusBadge status={p.status} /></td>
                    <td className="py-3 text-right whitespace-nowrap">
                      <button type="button" onClick={() => setReceipt(p)} className="border-0 bg-transparent px-2 text-xs font-bold text-[#17443b] hover:underline">View</button>
                      {p.status === 'Paid' && (
                        <button type="button" onClick={() => { setRefunding(p); setMessage('') }} className="border-0 bg-transparent px-2 text-xs font-bold text-[#a33d3d] hover:underline">Refund</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-5 flex items-center justify-between text-xs text-[#78827f]">
          <span>{total} payments</span>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border border-[#d8e0db] bg-white px-3 py-1.5 font-bold disabled:opacity-40">Previous</button>
            <span>Page {page} of {pages}</span>
            <button type="button" disabled={page >= pages} onClick={() => setPage(page + 1)} className="rounded-lg border border-[#d8e0db] bg-white px-3 py-1.5 font-bold disabled:opacity-40">Next</button>
          </div>
        </div>
      </section>

      {receipt && <ReceiptModal payment={receipt} onClose={() => setReceipt(null)} />}

      {/* Refund confirmation */}
      {refunding && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#0f2a25]/50 p-4" onClick={() => setRefunding(null)}>
          <div role="dialog" aria-modal="true" className="w-full max-w-[420px] rounded-[18px] bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#17483e]">Refund this payment?</h3>
            <p className="mt-1 text-sm text-[#78827f]">
              {refunding.transactionId} · {refunding.hostelName} · {money(refunding.amount)}
            </p>
            <input className={`${input} mt-4 w-full`} placeholder="Reason (optional)" value={refundNote} onChange={(e) => setRefundNote(e.target.value)} />
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <button type="button" onClick={() => setRefunding(null)} className="min-h-11 rounded-xl border border-[#d8e0db] bg-white text-sm font-bold text-[#33504a]">Cancel</button>
              <button type="button" onClick={confirmRefund} className="min-h-11 rounded-xl border-0 bg-[#a33d3d] text-sm font-bold text-white">Mark as refunded</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function Tile({ title, value, hint }) {
  return (
    <div className={card}>
      <span className="text-xs font-bold text-[#52635f]">{title}</span>
      <strong className="mt-2 block text-2xl tracking-[-.6px] text-[#17483e]">{value}</strong>
      {hint && <span className="mt-1 block text-xs text-[#8f9d96]">{hint}</span>}
    </div>
  )
}