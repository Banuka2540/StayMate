import { Icon } from './Icon'
import { Link } from 'react-router-dom'

export function StayCard({ stay, favorite, onFavorite, result = false }) {
  return <article className="overflow-hidden rounded-[18px] border border-[#d8e0db] bg-white text-[#183c35] shadow-[0_8px_24px_#0002] transition hover:-translate-y-1 hover:shadow-[0_16px_36px_#0004]">
    <Link to={`/stay/${encodeURIComponent(stay.name)}`} aria-label={`View details for ${stay.name}`}>
    <div className={`${result ? 'h-[225px]' : 'h-[230px]'} relative overflow-hidden bg-[#dfe7e1]`}><img className="h-full w-full object-cover transition duration-500 hover:scale-[1.035]" src={`https://images.unsplash.com/${stay.image}?auto=format&fit=crop&w=1000&q=85`} alt={stay.alt || `${stay.name} exterior`} /><span className="absolute left-3.5 top-3.5 rounded-full bg-[#eaf4ef] px-2.5 py-1.5 text-[10px] font-extrabold text-[#26564c]">{stay.tag}</span><button className={`absolute right-3 top-3 grid h-[35px] w-[35px] place-items-center rounded-full border-0 bg-white text-[#45625a] shadow-[0_3px_12px_#0002] ${favorite ? 'text-[#bc5b63]' : ''}`} onClick={(event) => { event.preventDefault(); event.stopPropagation(); onFavorite(stay.name) }} aria-label={`${favorite ? 'Remove' : 'Save'} ${stay.name}`}><Icon name="heart" size={19} /></button></div>
    <div className="p-4 pb-3.5"><div className="flex justify-between gap-2 text-[10px] text-[#89958f]"><span>{stay.place}</span><strong className="whitespace-nowrap text-[#324c45]">★ {stay.rating}</strong></div><h3 className="my-2 text-[17px] tracking-[-.2px] text-[#1b463e]">{stay.name}</h3><p className="text-[11px] text-[#89958f]">{stay.distance}</p><div className="flex gap-3.5 border-b border-[#e7ece9] py-3 text-[10px] text-[#526860]"><span>Wi-Fi</span><span>Furnished</span><span>Security</span></div><div className="flex items-baseline justify-between pt-3"><strong className="text-[15px] text-[#1c5045]">LKR {typeof stay.price === 'number' ? stay.price.toLocaleString() : stay.price}</strong><span className="text-[10px] text-[#8c9692]">/ month</span></div></div>
    </Link>
  </article>
}
