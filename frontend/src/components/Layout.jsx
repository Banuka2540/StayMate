import { Icon } from './Icon'

const link = 'text-[13px] font-medium text-[#78827f] transition hover:text-[#163e37]'
export function SiteHeader() {
  return <header className="flex h-[66px] items-center justify-between gap-3 bg-white px-[18px] text-[#52635f] sm:h-[88px] sm:px-[max(44px,calc((100vw-1450px)/2))]">
    <a className="flex items-center gap-2 text-lg font-extrabold tracking-[-.7px] text-[#163e37] sm:gap-2.5 sm:text-[22px]" href="/" aria-label="StayMate home"><span className="grid h-[31px] w-[31px] place-items-center rounded-[11px] bg-[#153f38] text-[#e8f1ed] sm:h-[35px] sm:w-[35px]"><Icon name="home" size={18} /></span>StayMate</a>
    <nav className="flex h-full items-center gap-3 sm:ml-12 sm:gap-10" aria-label="Main navigation"><a className={`${link} font-bold text-[#173f38]`} href="/search">Explore</a><a className={`${link} hidden sm:block`} href="/search">My bookings</a><a className={`${link} hidden sm:block`} href="/search">Payments</a></nav>
    <div className="flex items-center gap-2 sm:gap-5"><a className={`${link} hidden md:block`} href="#provider">List your hostel</a><button className="grid place-items-center border-0 bg-transparent p-1 text-[#436760]" aria-label="Notifications"><Icon name="bell" /></button><button className="grid h-[31px] w-[31px] place-items-center rounded-full border-0 bg-[#dfede7] text-[11px] font-extrabold text-[#214e46] sm:h-9 sm:w-9" aria-label="Profile">NP</button></div>
  </header>
}

export function SiteFooter() {
  return <footer className="bg-[#143f38] px-5 py-8 text-[#d8e6df] sm:px-11"><div className="mx-auto flex max-w-[1450px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><a className="flex items-center gap-2 text-lg font-extrabold" href="/"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#e8f1ed] text-[#153f38]"><Icon name="home" size={17} /></span>StayMate</a><span className="text-sm text-[#a8c0b5]">A place to belong. A better way to live.</span><nav className="flex gap-4 text-sm"><a href="/search">About us</a><a href="/search">Help centre</a><a href="#provider">For providers</a></nav></div><div className="mx-auto mt-6 flex max-w-[1450px] flex-col gap-3 border-t border-[#37655b] pt-4 text-xs text-[#a8c0b5] sm:flex-row sm:justify-between"><span>© 2026 StayMate · Made for student life in Sri Lanka</span><div className="flex gap-4"><a href="/search">Privacy policy</a><a href="/search">Terms of service</a></div></div></footer>
}
