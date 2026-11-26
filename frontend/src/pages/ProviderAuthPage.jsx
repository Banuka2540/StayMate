import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'

export function ProviderAuthPage({ mode }) {
  const isCreate = mode === 'create-account'
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState(isCreate ? '********' : '********')
  const [confirmPassword, setConfirmPassword] = useState('********')
  const [agreed, setAgreed] = useState(true)

  const submit = (event) => {
    event.preventDefault()
    if (isCreate && password !== confirmPassword) return
    navigate('/')
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1fr_1fr]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#17443b] px-[48px] py-11 text-white lg:flex lg:flex-col">
        <Link to="/" className="flex items-center gap-2.5 text-[22px] font-extrabold">
          <span className="grid h-[35px] w-[35px] place-items-center rounded-[11px] bg-[#f3ad4c] text-[#17443b]">
            <Icon name="home" size={19} />
          </span>
          StayMate
        </Link>

        <div className="mt-[82px]">
          <h1 className="text-[44px] font-extrabold leading-[1.12] tracking-[-1.8px]">
            Good spaces.<br />Better student lives.
          </h1>
          <p className="mt-7 max-w-[490px] text-[15px] leading-[1.65] text-[#e4eeea]">
            Welcome students to a place they can call home. We'll help you
            take care of the rest.
          </p>
        </div>

        <img
          className="mt-8 h-[400px] w-full rounded-[5px] object-cover"
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1100&q=88"
          alt="A welcoming residence surrounded by palm trees"
        />
      </section>

      <section className="flex min-h-screen items-start justify-center px-5 py-7 sm:px-12 lg:px-[72px] lg:pt-12">
        <div className="w-full max-w-[620px]">
          <div className="mb-10 flex items-center justify-between lg:mb-12">
            <Link to="/" className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#718079]">
              <Icon name="back" size={16} />
              Back to HostelHub
            </Link>
            <Link to="/" className="flex items-center gap-2 text-[16px] font-extrabold text-[#163e37] lg:hidden">
              <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-[#f3ad4c]">
                <Icon name="home" size={17} />
              </span>
              StayMate
            </Link>
          </div>

          <h2 className="text-[30px] font-extrabold tracking-[-1px] text-[#17483e]">
            {isCreate ? 'Make room for new beginnings.' : 'Welcome back, host.'}
          </h2>
          <p className="mt-2 text-[13px] text-[#8a9691]">
            {isCreate
              ? 'Create your provider account and join our trusted community.'
              : 'Your residences, reservations, and community are right here.'}
          </p>

          <form className="mt-8" onSubmit={submit}>
            {isCreate && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <AuthField label="First name *" placeholder="Saman" />
                  <AuthField label="Last name *" placeholder="Fernando" />
                </div>
                <div className="mt-5">
                  <AuthField label="Business / hostel group name *" placeholder="Palm Grove Residences" />
                </div>
              </>
            )}

            <div className={isCreate ? 'mt-5' : 'mt-7'}>
              <AuthField
                label="Email address"
                type="email"
                placeholder={isCreate ? 'saman@palmgrove.lk' : 'saman@palmgrove.lk'}
                icon="mail"
                required
              />
            </div>

            {isCreate && (
              <div className="mt-5">
                <AuthField label="Mobile number *" type="tel" placeholder="+94 77 456 1234" icon="phone" required />
              </div>
            )}

            <div className="mt-5">
              <label className="grid gap-2 text-[11px] font-bold text-[#526860]">
                Password *
                <span className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#668078]">
                    <Icon name="lock" size={16} />
                  </span>
                  <input
                    className="h-[50px] w-full rounded-[7px] border border-[#dfe6e3] px-10 pr-11 text-[13px] outline-none transition focus:border-[#78a89e]"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 border-0 bg-transparent p-1 text-[#668078]"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Icon name="eyeOff" size={16} />
                  </button>
                </span>
              </label>
            </div>

            {isCreate ? (
              <>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-[#6d7e78]">
                  <span className="text-[#4d776b]">✓ At least 8 characters</span>
                  <span className={password.length >= 8 ? 'text-[#4d776b]' : ''}>✓ Number</span>
                  <span className="text-[#4d776b]">✓ Special character</span>
                </div>
                <div className="mt-5">
                  <label className="grid gap-2 text-[11px] font-bold text-[#526860]">
                    Confirm password *
                    <span className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#668078]">
                        <Icon name="lock" size={16} />
                      </span>
                      <input
                        className="h-[50px] w-full rounded-[7px] border border-[#dfe6e3] px-10 pr-11 text-[13px] outline-none transition focus:border-[#78a89e]"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 border-0 bg-transparent p-1 text-[#668078]"
                        onClick={() => setShowConfirmPassword((value) => !value)}
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      >
                        <Icon name="eyeOff" size={16} />
                      </button>
                    </span>
                  </label>
                </div>
                <label className="mt-5 flex items-start gap-2 text-[10px] text-[#526860]">
                  <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="mt-px accent-[#17443b]" />
                  I agree to the provider terms and privacy policy.
                </label>
              </>
            ) : (
              <div className="mt-5 flex items-center justify-between text-[10px]">
                <label className="flex items-center gap-2 text-[#526860]">
                  <input type="checkbox" defaultChecked className="accent-[#17443b]" />
                  Remember me
                </label>
                <a href="mailto:support@hostelhub.lk" className="font-bold text-[#285f55]">Forgot password?</a>
              </div>
            )}

            <button
              type="submit"
              disabled={isCreate && !agreed}
              className="mt-5 flex h-[52px] w-full items-center justify-center gap-2 rounded-[7px] border-0 bg-[#17443b] text-[12px] font-bold text-white transition hover:bg-[#246257] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreate ? '→ Create provider account' : '→ Sign in to your workspace'}
            </button>
          </form>

          {isCreate ? (
            <p className="mt-7 text-[10px] text-[#718079]">
              Already a provider? <Link to="/provider/sign-in" className="font-bold text-[#285f55]">Sign in</Link>
            </p>
          ) : (
            <p className="mt-7 text-[10px] text-[#718079]">
              New to HostelHub? <Link to="/provider/create-account" className="font-bold text-[#285f55]">Become a provider</Link>
            </p>
          )}

          <div className="mt-6 flex items-start gap-3 rounded-[9px] border border-[#dfe7e3] bg-[#f7faf8] p-4">
            <span className="mt-0.5 text-[#4d766b]">
              {isCreate ? <Icon name="shield" size={18} /> : <Icon name="phone" size={18} />}
            </span>
            <div>
              <b className="text-[11px] text-[#35574e]">
                {isCreate ? 'A trusted community starts here' : 'A real team, on your side.'}
              </b>
              <p className="mt-1 text-[9px] leading-[1.6] text-[#718079]">
                {isCreate
                  ? "We'll verify your email and review your first listing before it goes live. There's no fee to create an account."
                  : 'Need help accessing your account? Contact support@hostelhub.lk or +94 11 234 5678.'}
              </p>
            </div>
          </div>

          <p className="mt-7 text-[9px] text-[#9aa49f]">
            Protected by secure encryption. Your information stays private.
          </p>
        </div>
      </section>
    </main>
  )
}

function AuthField({ label, placeholder, type = 'text', icon, required = false }) {
  return (
    <label className="grid gap-2 text-[11px] font-bold text-[#526860]">
      {label}
      <span className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#668078]">
            <Icon name={icon} size={16} />
          </span>
        )}
        <input
          type={type}
          placeholder={placeholder}
          required={required}
          className={`h-[50px] w-full rounded-[7px] border border-[#dfe6e3] ${icon ? 'px-10' : 'px-3'} text-[13px] font-normal outline-none transition placeholder:text-[#6d7d77] focus:border-[#78a89e]`}
        />
      </span>
    </label>
  )
}
