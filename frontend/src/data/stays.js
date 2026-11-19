export const stays = [
  { name: 'Sawbhagya Hostel', place: 'pabahinna', distance: '8 min to University of Sabaragamuwa', price: '10,000', rating: '4.9', tag: 'Student favourite', image: 'photo-1600585154340-be6161a56a0c', alt: 'Tropical residence surrounded by palms' },
  { name: 'Shan Boarding House', place: 'Nugegoda, Colombo', distance: '12 min to University of Sabaragamuwa', price: '10,000', rating: '4.8', tag: 'Only 3 beds left', image: 'photo-1600607687939-ce8a6c25118c', alt: 'Warm courtyard of a boarding house' },
  { name: 'Samanala lodge', place: 'Peradeniya, Kandy', distance: '10 min to University of Sabaragamuwa', price: '9,000', rating: '4.8', tag: 'Great value', image: 'photo-1600047550580-0d1d2db913b9', alt: 'Quiet home in a green garden' },
]

export const resultStays = [
  { name: 'Palm Grove Student Residence', place: 'Katubedda, Moratuwa', distance: '8 min to University of Sabaragamuwa', km: 1.8, price: 8000, rating: '4.9', tag: 'Student favourite', image: 'photo-1600585154340-be6161a56a0c', residence: 'Female students', room: 'Twin sharing', wifi: true, bath: true, kitchen: true, security: true },
  { name: 'Courtyard Annex', place: 'Rawathawatta, Moratuwa', distance: '2.4 km to University of Sabaragamuwa', km: 2.4, price: 9000, rating: '4.8', tag: 'Verified residence', image: 'photo-1600607687939-ce8a6c25118c', residence: 'Female students', room: 'Twin sharing', wifi: true, bath: true, kitchen: true, security: true },
  { name: 'Campus Lane Student House', place: 'Katubedda, Moratuwa', distance: '12 min to University of Sabaragamuwa', km: 2.7, price: 6000, rating: '4.7', tag: 'Great value', image: 'photo-1600047550580-0d1d2db913b9', residence: 'Female students', room: 'Twin sharing', wifi: true, bath: true, kitchen: true, security: true },
  { name: 'Greenview Boarding', place: 'Moratuwa, Colombo', distance: '2.8 km to University of Sabaragamuwa', km: 2.8, price: 12000, rating: '4.8', tag: 'Quiet surroundings', image: 'photo-1600566753086-00f18fb6b3ea', residence: 'Male students', room: 'Twin sharing', wifi: true, bath: true, kitchen: false, security: true },
  { name: 'The Palm House', place: 'Katubedda, Moratuwa', distance: '10 min to University of Sabaragamuwa', km: 1.9, price: 15000, rating: '4.9', tag: 'Popular choice', image: 'photo-1600607687920-4e2a09cf159d', residence: 'Female students', room: 'Single room', wifi: true, bath: true, kitchen: true, security: true },
  { name: 'University View Lodge', place: 'Piliyandala, Colombo', distance: '3 km to University of Sabaragamuwa', km: 3, price: 7000, rating: '4.6', tag: 'Great value', image: 'photo-1600210492486-724fe5c67fb0', residence: 'Mixed residence', room: 'Triple sharing', wifi: true, bath: false, kitchen: true, security: false },
]

export const filterGroups = {
  'Residence type': ['Female students', 'Male students', 'Mixed residence'],
  'Room type': ['Twin sharing', 'Single room', 'Triple sharing'],
  'The essentials': ['Wi-Fi included', 'Private bathroom', 'Kitchen access', '24/7 security'],
}

export const getStayImages = (stay) => [
  stay.image,
  'photo-1600210492486-724fe5c67fb0',
  'photo-1600566753086-00f18fb6b3ea',
  'photo-1600607687920-4e2a09cf159d',
  'photo-1600047550580-0d1d2db913b9',
]

export const getStayDetails = (stay) => ({
  ...stay,
  price: typeof stay.price === 'string'
    ? Number(stay.price.replaceAll(',', ''))
    : stay.price,
  residence: stay.residence || 'Mixed residence',
  room: stay.room || 'Twin sharing',
  wifi: stay.wifi ?? true,
  bath: stay.bath ?? true,
  kitchen: stay.kitchen ?? true,
  security: stay.security ?? true,
  description: `Settle into a bright, thoughtfully furnished residence close to campus. ${stay.name} offers study-friendly spaces, a shared kitchen, and a welcoming student community.`,
  host: 'Saman Fernando',
  hostResponse: 'Usually replies within 2 hours',
  rooms: [
    { type: 'Twin ensuite · 2 students', rent: (typeof stay.price === 'string' ? Number(stay.price.replaceAll(',', '')) : stay.price) || 28000, beds: '4 beds', action: 'Select twin' },
    { type: 'Single ensuite · 1 student', rent: ((typeof stay.price === 'string' ? Number(stay.price.replaceAll(',', '')) : stay.price) || 28000) + 14000, beds: '1 room', action: 'Select single' },
    { type: 'Triple sharing · 3 students', rent: ((typeof stay.price === 'string' ? Number(stay.price.replaceAll(',', '')) : stay.price) || 28000) - 5500, beds: 'Fully booked', action: 'Join waitlist' },
  ],
})
