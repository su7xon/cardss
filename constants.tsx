import { Product, Testimonial, Booking, BlogPost } from './types';

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
  },
  {
    id: '3',
    name: '7 Chakra Healing Bracelet',
    price: 550,
    description: 'Genuine semi-precious stones for balancing 7 chakras.',
    metaphysicalProperties: 'Realigns energy centers and promotes physical and emotional healing.',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=600',
    category: 'Bracelet',
    stock: 20
  },
  {
    id: '4',
    name: 'Raw Black Tourmaline',
    price: 450,
    description: 'High-energy raw protection stone.',
    metaphysicalProperties: 'Ultimate protection against negative energies and EMF radiation.',
    image: 'https://images.unsplash.com/photo-1596501047101-5764d73286df?auto=format&fit=crop&q=80&w=600',
    category: 'Raw Stone',
    stock: 15
  }
];

// Starting with empty arrays for real user testing
export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Anjali Sharma',
    text: 'Pooja mam ki reading bohot accurate thi. Sab kuch sach bataya aur solutions bhi bohot effective hain. Highly recommend!',
    rating: 5,
    date: '2024-03-15',
    isModerated: true
  },
  {
    id: 't2',
    name: 'Rahul Verma',
    text: 'Amazing experience! The energy healing session made me feel so light and peaceful. Bohot sukoon mila.',
    rating: 5,
    date: '2024-03-18',
    isModerated: true
  },
  {
    id: 't3',
    name: 'Meera Kapur',
    text: 'Crystals are genuine and high quality. Maine Amethyst mangwaya tha, packaging was great too!',
    rating: 5,
    date: '2024-03-20',
    isModerated: true
  },
  {
    id: 't4',
    name: 'Suresh Iyer',
    text: 'The tarot session provided much-needed clarity for my career. Thank you for the guidance.',
    rating: 4,
    date: '2024-03-22',
    isModerated: true
  },
  {
    id: 't5',
    name: 'Priya Das',
    text: 'Mera experience bohot badiya raha. Pooja ji helps you understand the root cause of problems clearly.',
    rating: 5,
    date: '2024-03-25',
    isModerated: true
  },
  {
    id: 't6',
    name: 'Amit Kumar',
    text: 'Counseling session was very helpful. Mind bohot calm feel kar raha hai ab. Thanks mam!',
    rating: 5,
    date: '2024-03-27',
    isModerated: true
  },
  {
    id: 't7',
    name: 'Sneha Reddy',
    text: 'The Rose Quartz pendant is beautiful. Positive energy feel hoti hai isse. Love it!',
    rating: 5,
    date: '2024-03-29',
    isModerated: true
  },
  {
    id: 't8',
    name: 'Vikram Singh',
    text: 'Life guidance session ne meri aankhen khol di. Proper path mil gaya hai ab focus karne ke liye.',
    rating: 4,
    date: '2024-04-01',
    isModerated: true
  },
  {
    id: 't9',
    name: 'Neha Malhotra',
    text: 'Accurate and compassionate readings. Pooja is a gifted spiritual guide.',
    rating: 5,
    date: '2024-04-03',
    isModerated: true
  },
  {
    id: 't10',
    name: 'Karan Mehra',
    text: 'Authentic crystals and deep spiritual knowledge. Best place for healing products in Delhi.',
    rating: 5,
    date: '2024-04-05',
    isModerated: true
  }
];
export const INITIAL_BOOKINGS: Booking[] = [];

export const INITIAL_BLOGS: BlogPost[] = [
  {
    id: 'b1',
    title: 'The Power of Amethyst: A Guide to Spiritual Clarity',
    content: 'Amethyst is one of the most popular and powerful crystals in the world of spiritual healing. Known for its stunning violet hue, this stone is more than just a beautiful gem. It is a tool for transformation, peace, and protection.\n\nIn this article, we explore how Amethyst can help you quiet a noisy mind, enhance your meditation practice, and create a protective shield around your aura. Whether you are a beginner or a seasoned collector, understanding the energy of Amethyst is essential for anyone on a spiritual journey.',
    image: 'https://images.unsplash.com/photo-1567606101518-da622839257d?auto=format&fit=crop&q=80&w=800',
    excerpt: 'Discover how Amethyst can help you quiet a noisy mind and enhance your meditation practice.',
    createdAt: null,
    slug: 'power-of-amethyst'
  },
  {
    id: 'b2',
    title: '5 Steps to Realign Your Chakras at Home',
    content: 'Feeling out of balance? Our chakras are the energy centers of our body, and when they are blocked, we can feel stuck, anxious, or physically tired. Realigning them doesn\'t always require a professional session; you can begin the process at home.\n\nFrom color therapy and sound healing to simple breathing exercises, these 5 steps will help you identify which chakra needs attention and how to bring it back into harmony. Start your healing journey today with these accessible techniques.',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800',
    excerpt: 'Learn 5 simple steps to identify which chakra needs attention and how to bring it back into harmony.',
    createdAt: null,
    slug: 'realign-chakras-at-home'
  },
  {
    id: 'b3',
    title: 'Rose Quartz: The Heart\'s Best Friend',
    content: 'Rose Quartz is the quintessence of love—for oneself, one\'s partner, children, family, friends, and the community. This soft pink crystal is a powerful healer of the heart chakra, helping to dissolve old wounds and open the soul to divine compassion.\n\nIn Pooja\'s guidance, we often use Rose Quartz to help clients manifest harmonious relationships and, most importantly, to cultivate a deep sense of self-worth. Learn how to cleanse and charge your Rose Quartz to keep its gentle vibrations flowing throughout your home.',
    image: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&q=80&w=800',
    excerpt: 'Explore the healing power of the stone of universal love and how it can transform your relationships.',
    createdAt: null,
    slug: 'rose-quartz-hearts-friend'
  },
  {
    id: 'b4',
    title: 'The Mystical Journey: Understanding Tarot Symbols',
    content: 'Tarot is more than just telling the future; it is a mirrors for the soul. Each card in the 78-card deck carries profound symbolism that speaks to our subconscious mind, offering clarity when our logic feels clouded.\n\nIn this insight, we break down the Major Arcana—the cards that represent life\'s big karmic lessons. Whether you draw The Fool or The World, understand that the Tarot is a tool for empowerment and self-reflection. Join Pooja as she decodes the hidden meanings behind the imagery.',
    image: 'https://images.unsplash.com/photo-1596501047101-5764d73286df?auto=format&fit=crop&q=80&w=800',
    excerpt: 'Take a deeper look at the symbolism of the Major Arcana and learn how Tarot acts as a mirror for your soul.',
    createdAt: null,
    slug: 'understanding-tarot-symbols'
  }
];
