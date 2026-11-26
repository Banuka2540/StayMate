// All calls from the frontend to the payment backend live here

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'

// TEMPORARY: login is not built yet, so we use a demo student id.
// When the team finishes login and saves the user in localStorage,
// the real logged-in user's id will be used automatically.
const DEMO_STUDENT_ID = '000000000000000000000001'

export function getCurrentStudentId() {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    return user?._id || user?.id || DEMO_STUDENT_ID
  } catch {
    return DEMO_STUDENT_ID
  }
}

async function request(path, options = {}) {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_URL}/api/payments${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong. Is the backend running?')
  }
  return data
}

// FR08 + FR09
export function makePayment(details) {
  return request('/', {
    method: 'POST',
    body: JSON.stringify({ ...details, studentId: getCurrentStudentId() }),
  })
}

// FR10
export function getMyPayments() {
  return request(`/my?studentId=${getCurrentStudentId()}`)
}

// FR24 (admin)
export function getAllPayments(filters = {}) {
  const query = new URLSearchParams(
    Object.entries(filters).filter(([, value]) => value !== '' && value != null)
  ).toString()
  return request(`/?${query}`)
}

export function updatePaymentStatus(id, status, note) {
  return request(`/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, note }),
  })
}