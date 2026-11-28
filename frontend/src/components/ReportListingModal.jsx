import { useState } from 'react'
import { submitContentReport } from '../api/notificationApi'
import { Icon } from './Icon'

const REASONS = [
  'Inaccurate listing',
  'Fake or misleading photos',
  'Safety concern',
  'Pricing discrepancy',
  'Inappropriate content',
  'Other',
]

export function ReportListingModal({ open, onClose, defaultTargetName = '', defaultTargetType = 'Hostel', onSubmitted }) {
  const [targetType, setTargetType] = useState(defaultTargetType)
  const [targetName, setTargetName] = useState(defaultTargetName)
  const [reason, setReason] = useState(REASONS[0])
  const [description, setDescription] = useState('')
  const [reporterName, setReporterName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (!open) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!targetName.trim() || !description.trim()) {
      setError('Please enter the hostel/content name and describe the issue.')
      return
    }

    setSubmitting(true)
    try {
      const data = await submitContentReport({
        targetType,
        targetName: targetName.trim(),
        reason,
        description: description.trim(),
        reporterName: reporterName.trim() || undefined,
      })
      setSuccess('Report submitted. StayMate administrators have been notified.')
      setDescription('')
      if (onSubmitted) onSubmitted(data.report)
      setTimeout(() => {
        setSuccess('')
        onClose()
      }, 1200)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#0f2a25]/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Report listing or content"
        className="w-full max-w-[480px] rounded-[18px] border border-[#d8e0db] bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fdf1e6] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.8px] text-[#9b5b1c]">
              <Icon name="flag" size={12} /> Report issue
            </span>
            <h2 className="mt-2 text-lg font-extrabold text-[#17483e]">Report a listing or content</h2>
            <p className="mt-1 text-xs text-[#718079]">
              Help keep StayMate accurate and safe for students. Administrators review every report.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close report modal"
            className="grid h-8 w-8 place-items-center rounded-lg border border-[#e1e8e4] bg-white text-[#52635f] hover:bg-[#f4f7f5]"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-[11px] font-bold uppercase tracking-[.5px] text-[#6f7d77]">
              Content type
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-xl border border-[#d8e0db] bg-[#fbfaf7] px-3 text-xs font-medium text-[#203f38] outline-none focus:border-[#17443b]"
              >
                <option value="Hostel">Hostel</option>
                <option value="Review">Review</option>
                <option value="User">User</option>
              </select>
            </label>

            <label className="block text-[11px] font-bold uppercase tracking-[.5px] text-[#6f7d77]">
              Reason
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-xl border border-[#d8e0db] bg-[#fbfaf7] px-3 text-xs font-medium text-[#203f38] outline-none focus:border-[#17443b]"
              >
                {REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-[11px] font-bold uppercase tracking-[.5px] text-[#6f7d77]">
            Listing or target name *
            <input
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              placeholder="e.g. Sawbhagya Hostel"
              className="mt-1.5 h-10 w-full rounded-xl border border-[#d8e0db] bg-[#fbfaf7] px-3 text-xs font-medium text-[#203f38] outline-none focus:border-[#17443b]"
            />
          </label>

          <label className="block text-[11px] font-bold uppercase tracking-[.5px] text-[#6f7d77]">
            Your name (optional)
            <input
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              placeholder="Nethmi Perera"
              className="mt-1.5 h-10 w-full rounded-xl border border-[#d8e0db] bg-[#fbfaf7] px-3 text-xs font-medium text-[#203f38] outline-none focus:border-[#17443b]"
            />
          </label>

          <label className="block text-[11px] font-bold uppercase tracking-[.5px] text-[#6f7d77]">
            What happened? *
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Share details so our team can verify and take action..."
              className="mt-1.5 w-full resize-none rounded-xl border border-[#d8e0db] bg-[#fbfaf7] p-3 text-xs font-medium text-[#203f38] outline-none focus:border-[#17443b]"
            />
          </label>

          {error && (
            <p className="rounded-lg border border-[#f2bac1] bg-[#fff2f2] px-3 py-2 text-xs text-[#a33d3d]">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-lg border border-[#b8dccb] bg-[#e5f4ec] px-3 py-2 text-xs font-semibold text-[#1f6a4f]">
              {success}
            </p>
          )}

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-10 rounded-xl border border-[#d8e0db] bg-white px-4 text-xs font-bold text-[#33504a]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="min-h-10 rounded-xl border-0 bg-[#17443b] px-5 text-xs font-bold text-white transition hover:bg-[#246257] disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Submit report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
