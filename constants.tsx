import { Product, Testimonial, Booking, BlogPost } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'BLACK TOURMALINE HANGING',
    price: 799,
    originalPrice: 1119,
    description: 'Carry powerful shielding energy wherever you go. This raw Black Tourmaline keychain absorbs negativity and electromagnetic stress while keeping your aura clear and grounded.',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800',
    category: 'Keychain',
    stock: 20,
    rating: 4.8,
    reviews: 80
  },
  {
    id: '2',
    name: 'PYRITE KEY CHAIN',
    price: 799,
    originalPrice: 1119,
    description: 'Your pocket-sized prosperity magnet. Pyrite\'s golden shimmer channels the energy of abundance, ambition, and financial flow - perfect for manifesting wealth on the go.',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800',
    category: 'Keychain',
    stock: 20,
    rating: 4.8,
    reviews: 85
  },
  {
    id: '3',
    name: 'AMETHYST KEY CHAIN',
    price: 799,
    originalPrice: 1119,
    description: 'Turn every hectic moment into a breath of calm. This Amethyst keychain radiates soothing, high-vibrational energy that quiets mental chatter and invites deep peace into your daily routine.',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800',
    category: 'Keychain',
    stock: 20,
    rating: 4.8,
    reviews: 90
  },
  {
    id: '4',
    name: 'CLEAR QUARTZ KEY CHAIN',
    price: 799,
    originalPrice: 1119,
    description: 'The ultimate clarity companion. Clear Quartz amplifies your intentions and sharpens focus - a must-have for students, decision-makers, and anyone seeking mental clarity on the go.',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800',
    category: 'Keychain',
    stock: 20,
    rating: 4.8,
    reviews: 95
  },
  {
    id: '5',
    name: 'SEVEN CHAKRA REIKI SET',
    price: 799,
    originalPrice: 1119,
    description: 'A complete energy healing toolkit. Seven carefully selected crystals correspond to each chakra - from root to crown - helping you restore balance, release blockages, and align your entire energetic system.',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800',
    category: 'Healing',
    stock: 20,
    rating: 4.8,
    reviews: 100
  },
  {
    id: '6',
    name: 'SELENITE PLATE CARVING',
    price: 799,
    originalPrice: 1119,
    description: 'Your space\'s energetic reset button. Selenite naturally cleanses and charges other crystals, purifies room energy, and brings serene clarity wherever it\'s placed. Self-clearing - no charging needed.',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800',
    category: 'Healing',
    stock: 20,
    rating: 4.8,
    reviews: 105
  },
  {
    id: '7',
    name: 'ROSE QUARTZ PALM STONE',
    price: 799,
    originalPrice: 1119,
    description: 'Smooth, warm, and comforting in the hand. This polished Rose Quartz palm stone is perfect for meditation, anxiety relief, or holding during stressful moments to invite healing and heart-centred calm.',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800',
    category: 'Healing',
    stock: 20,
    rating: 4.8,
    reviews: 110
  },
  {
    id: '8',
    name: 'PYRITE DUST FRAME HOURSE',
    price: 799,
    originalPrice: 1119,
    description: 'Where art meets abundance. This stunning Pyrite-dusted decorative frame features a horse motif symbolising speed, freedom, and unstoppable momentum - a beautiful statement for any home or office.',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800',
    category: 'Decor',
    stock: 20,
    rating: 4.8,
    reviews: 115
  },
  {
    id: '9',
    name: 'PYRITE ANKET 2MM',
    price: 799,
    originalPrice: 1119,
    description: 'Step into abundance. This delicate Pyrite anklet channels bold, money-drawing energy through every stride, subtly boosting your confidence and magnetic pull toward prosperity.',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800',
    category: 'Bracelet',
    stock: 20,
    rating: 4.8,
    reviews: 120
  },
  {
    id: '10',
    name: 'EMOTIONAL PROTECTION BRACELET',
    price: 799,
    originalPrice: 1119,
    description: 'A wearable shield for the heart. Crafted with stones for emotional resilience, this bracelet helps you set energetic boundaries, recover from stress, and stay centred even in turbulent times.',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800',
    category: 'Bracelet',
    stock: 20,
    rating: 4.8,
    reviews: 125
  },
  {
    id: '11',
    name: 'SHARE MARKET BROKER BRACELET',
    price: 799,
    originalPrice: 1119,
    description: 'Built for sharp minds under pressure. This specially curated bracelet supports laser focus, quick decision-making, and mental stamina - everything a trader or investor needs when the stakes are high.',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800',
    category: 'Bracelet',
    stock: 20,
    rating: 4.8,
    reviews: 130
  },
  {
    id: '12',
    name: 'VICTORY OVER ENEMIES BRACELET',
    price: 799,
    originalPrice: 1119,
    description: 'Stand your ground with confidence. This protective combination creates an energetic barrier against negativity, jealousy, and opposition, empowering you to move forward without fear.',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800',
    category: 'Bracelet',
    stock: 20,
    rating: 4.8,
    reviews: 135
  },
  {
    id: '13',
    name: 'TIGER EYE BRACELET AAA 8MM',
    price: 799,
    originalPrice: 1119,
    description: 'Wear the power of the tiger. Premium AAA-grade Tiger Eye beads ignite self-confidence, courage, and willpower - a bold statement for anyone stepping into their strength.',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800',
    category: 'Bracelet',
    stock: 20,
    rating: 4.8,
    reviews: 140
  },
  {
    id: '14',
    name: 'GREEN AVENTURINE BRACELET 8MM',
    price: 799,
    originalPrice: 1119,
    description: 'Known as the \'stone of opportunity,\' Green Aventurine is your lucky charm in bracelet form. Wear it to attract good fortune, open new doors, and welcome unexpected blessings.',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800',
    category: 'Bracelet',
    stock: 20,
    rating: 4.8,
    reviews: 145
  },
  {
    id: '15',
    name: 'ROSE QUARTZ BRACELET 8MM',
    price: 799,
    originalPrice: 1119,
    description: 'Open your heart to love in all its forms. Rose Quartz gently nurtures self-love, deepens relationships, and creates a warm, compassionate energy field around you throughout the day.',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800',
    category: 'Bracelet',
    stock: 20,
    rating: 4.8,
    reviews: 150
  },
  {
    id: '16',
    name: 'PYRITE BRACELET 8MM',
    price: 799,
    originalPrice: 1119,
    description: 'Bold, golden, and unapologetically abundant. This chunky Pyrite bracelet is a powerhouse for manifesting wealth, business success, and a prosperity mindset.',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800',
    category: 'Bracelet',
    stock: 20,
    rating: 4.8,
    reviews: 155
  },
  {
    id: '17',
    name: 'AMETHYST BRACELET AAA 8MM',
    price: 799,
    originalPrice: 1119,
    description: 'Premium-grade Amethyst beads deliver a steady stream of calming, stress-relieving energy. Perfect for overthinkers and creatives seeking a serene mental space amid daily chaos.',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800',
    category: 'Bracelet',
    stock: 20,
    rating: 4.8,
    reviews: 160
  },
  {
    id: '18',
    name: 'CLEAR QUARTZ BRACELET 8MM',
    price: 799,
    originalPrice: 1119,
    description: 'The master healer and amplifier. Clear Quartz supercharges every intention you set, making this bracelet a versatile tool for any spiritual or personal growth goal.',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800',
    category: 'Bracelet',
    stock: 20,
    rating: 4.8,
    reviews: 165
  },
  {
    id: '19',
    name: 'LABRADORITE BRACELET 8MM',
    price: 799,
    originalPrice: 1119,
    description: 'Embrace change with grace. Labradorite\'s mystical iridescence mirrors its power - supporting transformation, enhancing intuition, and protecting your energy during periods of growth.',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800',
    category: 'Bracelet',
    stock: 20,
    rating: 4.8,
    reviews: 170
  },
  {
    id: '20',
    name: 'RED JASPER BRACELET 8MM',
    price: 799,
    originalPrice: 1119,
    description: 'Ground yourself in raw, earthy strength. Red Jasper provides a steady flow of vitality and endurance, ideal for physical stamina and emotional stability in demanding seasons of life.',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800',
    category: 'Bracelet',
    stock: 20,
    rating: 4.8,
    reviews: 175
  },
  {
    id: '21',
    name: 'BLACK TOURMALINE BRACELET 8MM',
    price: 799,
    originalPrice: 1119,
    description: 'Your daily armour against negativity. Black Tourmaline creates a powerful protective shield around your energy field, repelling psychic intrusion, stress, and toxic environments.',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800',
    category: 'Bracelet',
    stock: 20,
    rating: 4.8,
    reviews: 180
  },
  {
    id: '22',
    name: 'HEMETITE 8MM BRACELET',
    price: 799,
    originalPrice: 1119,
    description: 'Feel anchored in the present moment. Hematite\'s dense, grounding energy draws scattered thoughts back to earth - perfect for anyone who needs to feel calm, focused, and rooted.',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800',
    category: 'Bracelet',
    stock: 20,
    rating: 4.8,
    reviews: 185
  },
  {
    id: '23',
    name: 'BLACK TOURMALINE + RED JASPER BRACELET 8MM',
    price: 799,
    originalPrice: 1119,
    description: 'A dynamic duo for body and soul. Black Tourmaline shields against external negativity while Red Jasper fuels inner strength - together, offering complete protection and resilience.',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800',
    category: 'Bracelet',
    stock: 20,
    rating: 4.8,
    reviews: 190
  },
  {
    id: '24',
    name: 'MULTI CHIPS',
    price: 799,
    originalPrice: 1119,
    description: 'A colourful mix of crystal chips bursting with diverse energies. Use them in plant pots, jars, DIY jewellery, or as decor accents to sprinkle healing vibrations anywhere in your life.',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800',
    category: 'Other',
    stock: 20,
    rating: 4.8,
    reviews: 195
  },
  {
    id: '25',
    name: 'BLACK AGATE PROTECTION COIN',
    price: 799,
    originalPrice: 1119,
    description: 'A timeless token of protection. This polished Black Agate coin guards against negativity and ill intent. Keep it in your wallet, on your desk, or by your front door as a steadfast energetic guardian.',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800',
    category: 'Other',
    stock: 20,
    rating: 4.8,
    reviews: 200
  },
  {
    id: '26',
    name: 'AMETHYST HEART PENDANT',
    price: 799,
    originalPrice: 1119,
    description: 'Wear your peace close to your heart. This dainty carved Amethyst heart pendant carries gentle, calming energy that soothes the mind and uplifts the spirit - a thoughtful gift or personal talisman.',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800',
    category: 'Pendant',
    stock: 20,
    rating: 4.8,
    reviews: 205
  },
  {
    id: '27',
    name: 'SEVEN CHAKRA TREE 300 BEADS',
    price: 799,
    originalPrice: 1119,
    description: 'A stunning centrepiece with deep spiritual meaning. Each branch is adorned with beads representing the seven chakras, creating a beautiful reminder of balance and harmony in your living space.',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800',
    category: 'Decor',
    stock: 20,
    rating: 4.8,
    reviews: 210
  },
  {
    id: '28',
    name: 'AMETHYST TREE 300 BEADS',
    price: 799,
    originalPrice: 1119,
    description: 'Bring the tranquility of Amethyst into your home. With 300 lush purple beads, this gemstone tree radiates calming, peaceful energy while doubling as a sophisticated decorative accent.',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800',
    category: 'Decor',
    stock: 20,
    rating: 4.8,
    reviews: 215
  },
  {
    id: '29',
    name: 'CLEAR QUARTZ TREE 300 BEADS',
    price: 799,
    originalPrice: 1119,
    description: 'The crown jewel of crystal decor. This magnificent Clear Quartz tree with 300 shimmering beads fills your space with amplified, high-vibrational clarity energy - a statement piece that transforms any room.',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800',
    category: 'Decor',
    stock: 20,
    rating: 4.8,
    reviews: 220
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
