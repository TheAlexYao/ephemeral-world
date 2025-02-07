export const MOCK_PARTICIPANTS = [
  { id: '1', name: 'Alex', avatar: '/avatars/alex.jpg', verified: true },
  { id: '2', name: 'Sarah', avatar: '/avatars/sarah.jpg', verified: true },
  { id: '3', name: 'Mike', avatar: '/avatars/mike.jpg', verified: true },
  { id: '4', name: 'Lisa', avatar: '/avatars/lisa.jpg', verified: true },
];

export const MOCK_RECEIPT = {
  restaurant: 'Jalan Alor Night Market',
  location: 'Kuala Lumpur, Malaysia',
  items: [
    { name: 'Char Kuey Teow', price: 15.50 },
    { name: 'Satay (10 pcs)', price: 25.00 },
    { name: 'Nasi Goreng', price: 14.00 },
    { name: 'Roti Canai', price: 8.00 },
    { name: 'Teh Tarik (4x)', price: 16.00 },
    { name: 'Grilled Stingray', price: 45.00 },
    { name: 'Coconut Water (4x)', price: 20.00 }
  ],
  subtotal: 143.50,
  tax: 25.00,
  serviceCharge: 20.00,
  total: 188.50,
  currency: 'MYR',
  usdRate: 0.21,
  date: new Date().toISOString()
} as const;
