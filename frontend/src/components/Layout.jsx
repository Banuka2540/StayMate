import { Icon } from './Icon'

const linkStyles =
  'text-[13px] font-medium text-[#78827f] transition hover:text-[#163e37]'

export function SiteHeader() {
  return (
    <header className="flex h-[66px] items-center justify-between gap-3 bg-white px-[18px] text-[#52635f] sm:h-[88px] sm:px-[max(44px,calc((100vw-1450px)/2))]">

      {/* Logo */}
      <a
        href="/"
        aria-label="StayMate home"
        className="flex items-center gap-2 text-lg font-extrabold tracking-[-.7px] text-[#163e37] sm:gap-2.5 sm:text-[22px]"
      >
        <span className="grid h-[31px] w-[31px] place-items-center rounded-[11px] bg-[#153f38] text-[#e8f1ed] sm:h-[35px] sm:w-[35px]">
          <Icon name="home" size={18} />
        </span>
        StayMate
      </a>

      {/* Main Navigation */}
      <nav
        className="flex h-full items-center gap-3 sm:ml-12 sm:gap-10"
        aria-label="Main navigation"
      >
        <a href="/search" className={`${linkStyles} font-bold text-[#173f38]`}>
          Explore
        </a>

        <a href="/booking" className={`${linkStyles} hidden sm:block`}>
          My bookings
        </a>

        <a href="/payments" className={`${linkStyles} hidden sm:block`}>
          Payments
        </a>
      </nav>

      {/* User Actions */}
      <div className="flex items-center gap-2 sm:gap-5">
        <a href="#provider" className={`${linkStyles} hidden md:block`}>
          List your hostel
        </a>

        <button
          type="button"
          aria-label="Notifications"
          className="grid place-items-center border-0 bg-transparent p-1 text-[#436760]"
        >
          <Icon name="bell" />
        </button>

        <button
          type="button"
          aria-label="Profile"
          className="grid h-[31px] w-[31px] place-items-center rounded-full border-0 bg-[#dfede7] text-[11px] font-extrabold text-[#214e46] sm:h-9 sm:w-9"
        >
          NP
        </button>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="bg-[#143f38] px-5 py-8 text-[#d8e6df] sm:px-11">

      {/* Footer Main Section */}
      <div className="mx-auto flex max-w-[1450px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        

        <span className="text-sm text-[#a8c0b5]">
          A place to belong. A better way to live.
        </span>

        <nav className="flex gap-4 text-sm">
          <a href="/search">About us</a>
          <a href="/search">Help centre</a>
          <a href="#provider">For providers</a>
        </nav>
      </div>

      {/* Footer Bottom Section */}
      <div className="mx-auto mt-6 flex max-w-[1450px] flex-col gap-3 border-t border-[#37655b] pt-4 text-xs text-[#a8c0b5] sm:flex-row sm:justify-between">
        <span>
          © 2026 StayMate · Made for student life in Sri Lanka
        </span>

        <div className="flex gap-4">
          <a href="/search"></a>
          <a href="/search"></a>
        </div>
      </div>
    </footer>
  )
}