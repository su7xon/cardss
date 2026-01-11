
import { Product, Testimonial, Booking } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Amethyst Cluster',
    price: 1250,
    description: 'Natural high-grade Amethyst from Brazil.',
    metaphysicalProperties: 'Calms the mind and provides spiritual protection. Ideal for meditation and reducing stress.',
    image: 'https://images.unsplash.com/photo-1567606101518-da622839257d?auto=format&fit=crop&q=80&w=600',
    category: 'Crystal',
    stock: 12
  },
  {
    id: '2',
    name: 'Rose Quartz Pendant',
    price: 850,
    description: '18k Gold plated Rose Quartz heart necklace.',
    metaphysicalProperties: 'The stone of universal love. It restores trust and harmony in relationships, encouraging unconditional love.',
    image: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&q=80&w=600',
    category: 'Jewelry',
    stock: 5
  }
];

// Starting with empty arrays for real user testing
export const INITIAL_TESTIMONIALS: Testimonial[] = [];
export const INITIAL_BOOKINGS: Booking[] = [];
