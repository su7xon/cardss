import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  setDoc,
  where,
  serverTimestamp,
  deleteField
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { Product, Booking, Testimonial, SiteSettings, Service, AboutContent, Order, BlogPost, CourseEbook } from '../types';

// Collection references
const productsCollection = collection(db, 'products');
const bookingsCollection = collection(db, 'bookings');
const testimonialsCollection = collection(db, 'testimonials');
const ordersCollection = collection(db, 'orders');
const blogsCollection = collection(db, 'blogs');
const coursesEbooksCollection = collection(db, 'coursesEbooks');
const usersCollection = collection(db, 'users');

// ============ USER PROFILES ============

export const getUserProfile = async (userId: string) => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as import('../types').UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, data: Partial<import('../types').UserProfile>) => {
  try {
    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    return false;
  }
};

// ============ IMAGE UPLOAD ============

export const uploadCoursePdf = async (file: File): Promise<string> => {
  const timestamp = Date.now();
  const fileName = `courses-ebooks/pdfs/${timestamp}_${file.name}`;
  const storageRef = ref(storage, fileName);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

export const uploadCourseCover = async (file: File): Promise<string> => {
  const timestamp = Date.now();
  const fileName = `courses-ebooks/covers/${timestamp}_${file.name}`;
  const storageRef = ref(storage, fileName);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

// ============ PRODUCTS ============

export const subscribeToProducts = (callback: (products: Product[]) => void) => {
  return onSnapshot(productsCollection, (snapshot) => {
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
    callback(products);
  }, (error) => {
    console.error('Products subscription error:', error);
    callback([]);
  });
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
    return null;
  } catch (error) {
    console.error('Error fetching product by id:', error);
    return null;
  }
};

export const addProduct = async (product: Omit<Product, 'id'>) => {
  const docRef = await addDoc(productsCollection, {
    ...product,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const updateProduct = async (id: string, updates: Partial<Product>) => {
  const docRef = doc(db, 'products', id);
  // Remove undefined fields so they get cleared in Firestore
  const cleanUpdates: any = {};
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === null) {
      cleanUpdates[key] = deleteField();
    } else {
      cleanUpdates[key] = value;
    }
  }
  await setDoc(docRef, cleanUpdates, { merge: true });
};

export const deleteProduct = async (id: string) => {
  const docRef = doc(db, 'products', id);
  await deleteDoc(docRef);
};

// ============ BOOKINGS ============

export const subscribeToBookings = (callback: (bookings: Booking[]) => void) => {
  const q = query(bookingsCollection, orderBy('date', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Booking[];
    callback(bookings);
  }, (error) => {
    console.error('Bookings subscription error:', error);
    callback([]);
  });
};

export const addBooking = async (booking: Omit<Booking, 'id'>) => {
  const docRef = await addDoc(bookingsCollection, {
    ...booking,
    createdAt: Timestamp.now()
  });
  return docRef.id;
};

export const updateBooking = async (id: string, updates: Partial<Booking>) => {
  const docRef = doc(db, 'bookings', id);
  await updateDoc(docRef, updates);
};

export const deleteBooking = async (id: string) => {
  const docRef = doc(db, 'bookings', id);
  await deleteDoc(docRef);
};

// ============ TESTIMONIALS ============

export const subscribeToTestimonials = (callback: (testimonials: Testimonial[]) => void) => {
  return onSnapshot(testimonialsCollection, (snapshot) => {
    const testimonials = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Testimonial[];
    callback(testimonials);
  }, (error) => {
    console.error('Testimonials subscription error:', error);
    callback([]);
  });
};

export const addTestimonial = async (testimonial: Omit<Testimonial, 'id'>) => {
  const docRef = await addDoc(testimonialsCollection, {
    ...testimonial,
    createdAt: Timestamp.now()
  });
  return docRef.id;
};

export const updateTestimonial = async (id: string, updates: Partial<Testimonial>) => {
  const docRef = doc(db, 'testimonials', id);
  await updateDoc(docRef, updates);
};

export const deleteTestimonial = async (id: string) => {
  const docRef = doc(db, 'testimonials', id);
  await deleteDoc(docRef);
};

// ============ ORDERS ============

export const subscribeToOrders = (callback: (orders: Order[]) => void) => {
  const q = query(ordersCollection, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
    callback(orders);
  }, (error) => {
    console.error('Orders subscription error:', error);
    callback([]);
  });
};

export const addOrder = async (order: Omit<Order, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(ordersCollection, {
    ...order,
    createdAt: Timestamp.now()
  });
  return docRef.id;
};

export const updateOrderStatus = async (id: string, status: Order['status'], transactionId?: string) => {
  const docRef = doc(db, 'orders', id);
  const updates: any = { status };
  if (transactionId) updates.transactionId = transactionId;
  await updateDoc(docRef, updates);
};

export const deleteOrder = async (id: string) => {
  const docRef = doc(db, 'orders', id);
  await deleteDoc(docRef);
};

export const getUserOrders = async (email: string) => {
  try {
    const q = query(ordersCollection, where('email', '==', email), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return [];
  }
};

// ============ BLOGS ============

export const subscribeToBlogs = (callback: (blogs: BlogPost[]) => void) => {
  const q = query(blogsCollection, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const blogs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as BlogPost[];
    callback(blogs);
  }, (error) => {
    console.error("Blog subscription error:", error);
    callback([]); // Return empty on error to stop loading
  });
};

export const addBlog = async (blog: Omit<BlogPost, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(blogsCollection, {
    ...blog,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const updateBlog = async (id: string, updates: Partial<BlogPost>) => {
  const docRef = doc(db, 'blogs', id);
  await updateDoc(docRef, updates);
};

export const deleteBlog = async (id: string) => {
  const docRef = doc(db, 'blogs', id);
  await deleteDoc(docRef);
};

// ============ COURSES & EBOOKS ============

export const subscribeToCoursesEbooks = (callback: (items: CourseEbook[]) => void) => {
  const q = query(coursesEbooksCollection, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as CourseEbook[];
    callback(items);
  }, (error) => {
    console.error('Courses/Ebooks subscription error:', error);
    callback([]);
  });
};

export const addCourseEbook = async (item: Omit<CourseEbook, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(coursesEbooksCollection, {
    ...item,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const updateCourseEbook = async (id: string, updates: Partial<CourseEbook>) => {
  const docRef = doc(db, 'coursesEbooks', id);
  await setDoc(docRef, updates, { merge: true });
};

export const deleteCourseEbook = async (id: string) => {
  const docRef = doc(db, 'coursesEbooks', id);
  await deleteDoc(docRef);
};

// ============ SITE SETTINGS ============

const DEFAULT_SETTINGS: SiteSettings = {
  about: {
    title: 'ABOUT',
    description: 'Welcome to a sanctuary of healing. I am Pooja Gupta, dedicated to being your companion on the journey of spiritual and emotional well-being. My mission is to provide a complete spiritual healing & guidance platform where you can find clarity, balance, and trust.',
    image: '/assets/image121.jpeg',
    credentials: [
      'Certified Tarot Reader',
      'Spiritual & Emotional Counselor',
      'Energy Healing Practitioner',
      'Holistic Life Guide'
    ]
  },
  services: [
    {
      id: '1',
      name: 'Chat Tarot Consultation',
      category: 'Tarot Guidance',
      price: 555,
      duration: 'CHAT',
      icon: '',
      image: '',
      description: 'Detailed tarot reading + numerology guidance + remedies share'
    },
    {
      id: '2',
      name: 'Call Tarot Consultation',
      category: 'Tarot Guidance',
      price: 999,
      duration: 'CALL',
      icon: '',
      image: '',
      description: 'Detailed tarot reading + numerology guidance + remedies + follow up support via chat'
    },
    {
      id: '3',
      name: 'Video Tarot Consultation',
      category: 'Tarot Guidance',
      price: 1999,
      duration: 'VIDEO',
      icon: '',
      image: '',
      description: 'Detailed tarot reading + numerology guidance + unlimited questions + remedies follow up support via chat'
    },
    {
      id: '4',
      name: 'Emotional / Spiritual Counseling Session',
      category: 'Counseling & Healing',
      price: 1499,
      duration: '45-60 MINS',
      icon: '',
      description: 'Stress, confusion, emotional support.'
    },
    {
      id: '5',
      name: 'Healing Guidance Session',
      category: 'Counseling & Healing',
      price: 2499,
      duration: 'STANDARD',
      icon: '',
      description: 'Energy balancing & guidance, Personalized support.'
    },
    {
      id: '7',
      name: 'Tarot + Counseling Combo',
      category: 'Special Package',
      price: 2999,
      duration: 'COMBO',
      icon: '',
      description: 'Tarot insights + counseling support. Best for clarity & healing.'
    },
    {
      id: '8',
      name: 'Emotional & Mental Wellbeing',
      category: 'Counseling & Healing',
      price: 599,
      duration: '45 MINS',
      icon: '',
      description: 'Stress, anxiety, emotional clarity & mental peace.'
    },
    {
      id: '9',
      name: 'Relationship Counselling',
      category: 'Counseling & Healing',
      price: 699,
      duration: '60 MINS',
      icon: '',
      description: 'Love, relationships, partner dynamics & harmony.'
    },
    {
      id: '10',
      name: 'Family Guidance',
      category: 'Counseling & Healing',
      price: 599,
      duration: '45 MINS',
      icon: '',
      description: 'Family conflicts, parent-child issues, household harmony.'
    },
    {
      id: '11',
      name: 'Career Guidance',
      category: 'Counseling & Healing',
      price: 699,
      duration: '60 MINS',
      icon: '',
      description: 'Job clarity, career transitions, professional growth.'
    },
    {
      id: '12',
      name: 'Personal Growth & Life Direction',
      category: 'Counseling & Healing',
      price: 899,
      duration: '90 MINS',
      icon: '',
      description: 'Life purpose, personal growth, spiritual direction & transformation.'
    }
  ],
  serviceCategories: [
    { id: '1', name: 'Tarot Guidance', icon: '', description: 'Deep insights into your past, present, and future through ancient wisdom.' },
    { id: '2', name: 'Counseling & Healing', icon: '', description: 'Compassionate spiritual counseling and energy healing for inner peace.' },
    { id: '3', name: 'Special Package', icon: '', description: 'Curated bundles of healing sessions and tools for complete transformation.' },
    { id: '4', name: 'Crystal Combo', icon: '', description: 'Powerful crystal combinations curated for specific intentions and energy work.' }
  ],
  productCategories: ['Crystal', 'Jewelry', 'Aura', 'Bracelet', 'Raw Stone', 'Charged Stone'],
  adminPassword: 'pooja.gupta001',
  heroImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200',
  heroVideo: '',
  heroContent: {
    heading: 'Healing • Guidance • Tarot',
    subheading: 'Personalized tarot reading, healing guidance\n& authentic crystals for balance, clarity and growth.',
    primaryButtonText: 'BOOK A READING',
    secondaryButtonText: 'EXPLORE CRYSTALS'
  },
  footer: {
    aboutTitle: 'Pooja Gupta',
    aboutDescription: 'Helping you navigate the cosmos through the wisdom of stars and the healing energy of crystals. Based in Bhondsi, Gurgaon, serving globally.',
    servicesTitle: 'Services',
    services: ['Birth Chart Reading', 'Crystal Healing', 'Tarot Insights', 'Vastu Consultation'],
    contactTitle: 'Contact',
    instagramUrl: 'https://www.instagram.com/divine_guidance_studio?utm_source=qr&igsh=MW9nbmVsOXdzczA5ZQ==',
    youtubeUrl: 'https://youtube.com/@divineguidancestudio?si=1eDWWCfxg2uZbEBf',
    whatsappUrl: 'https://wa.me/916397832791',
    address: 'Block A, Gali No. 2, Rayan Enclave, Near Shiv Mandir, Bhondsi, Gurgaon, Haryana - 122102',
    addressLine1: 'Block A, Gali No. 2, Rayan Enclave',
    addressLine2: 'Near Shiv Mandir, Bhondsi',
    addressLine3: 'Gurgaon, Haryana - 122102',
    email: 'poojagupta14021994@gmail.com',
    phone: '+91 6397832791'
  },
  upiId: 'pooja.gupta639783@okhdfcbank',
  crystalCombos: [
    {
      id: 'combo1',
      title: 'Protection Combo',
      subtitle: 'Black Tourmaline + Red Jasper',
      description: 'Ultimate shield against negativity',
      image: '',
      gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 55%, #fbbf24 100%)',
      accentColor: 'amber',
      price: 1499,
      originalPrice: 1999,
      tag: 'BESTSELLER'
    },
    {
      id: 'combo2',
      title: 'Spiritual Growth Combo',
      subtitle: 'Amethyst + Clear Quartz',
      description: 'Amplify intuition & clarity',
      image: '',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 55%, #c084fc 100%)',
      accentColor: 'purple',
      price: 1299,
      originalPrice: 1799,
      tag: 'NEW'
    },
    {
      id: 'combo3',
      title: 'Love & Abundance Combo',
      subtitle: 'Rose Quartz + Pyrite',
      description: 'Attract love & prosperity',
      image: '',
      gradient: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 55%, #fb7185 100%)',
      accentColor: 'rose',
      price: 1399,
      originalPrice: 1899,
      tag: 'POPULAR'
    }
  ]
};

export const subscribeToSettings = (callback: (settings: SiteSettings) => void) => {
  const settingsDoc = doc(db, 'settings', 'site');
  return onSnapshot(settingsDoc, (snapshot) => {
    try {
    if (snapshot.exists()) {
      const data = snapshot.data() as any;

      // Respect Firestore services exactly as saved.
      // Do not auto-add DEFAULT services, otherwise deleted services reappear.
      let validServices = DEFAULT_SETTINGS.services;
      if (Array.isArray(data.services)) {
        validServices = data.services;
      }

      // MIGRATION: Handle legacy string[] categories
      let validServiceCats = DEFAULT_SETTINGS.serviceCategories;
      if (Array.isArray(data.serviceCategories) && data.serviceCategories.length > 0) {
        if (typeof data.serviceCategories[0] === 'string') {
          // Convert string[] to ServiceCategory[]
          validServiceCats = (data.serviceCategories as string[]).map((name, i) => ({
            id: Date.now().toString() + i,
            name,
            icon: '', // Default icon
            description: ''
          }));
        } else {
          validServiceCats = data.serviceCategories;
        }
      }

      const validProductCats = Array.isArray(data.productCategories) && data.productCategories.length > 0 ? data.productCategories : DEFAULT_SETTINGS.productCategories;

      const merged: SiteSettings = {
        ...DEFAULT_SETTINGS,
        ...data,
        about: { ...DEFAULT_SETTINGS.about, ...(data.about || {}) },
        heroContent: { ...DEFAULT_SETTINGS.heroContent, ...(data.heroContent || {}) },
        footer: { ...DEFAULT_SETTINGS.footer, ...(data.footer || {}) },
        services: validServices,
        serviceCategories: validServiceCats,
        productCategories: validProductCats,
        crystalCombos: Array.isArray(data.crystalCombos) && data.crystalCombos.length > 0 ? data.crystalCombos : DEFAULT_SETTINGS.crystalCombos,
      };
      callback(merged);
    } else {
      // Initialize with defaults if not exists
      setDoc(settingsDoc, DEFAULT_SETTINGS).catch(err => console.error('Failed to init settings:', err));
      callback(DEFAULT_SETTINGS);
    }
    } catch (e) {
      console.error('Settings subscription error:', e);
      callback(DEFAULT_SETTINGS);
    }
  }, (error) => {
    console.error('Settings subscription error:', error);
    callback(DEFAULT_SETTINGS);
  });
};

const stripUndefined = (value: any): any => {
  if (Array.isArray(value)) return value.map(stripUndefined);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, stripUndefined(v)])
    );
  }
  return value;
};

export const updateAboutContent = async (about: AboutContent) => {
  const settingsDoc = doc(db, 'settings', 'site');
  await setDoc(settingsDoc, { about: stripUndefined(about) }, { merge: true });
};

export const updateServices = async (services: Service[]) => {
  // Sanitize services to ensure all fields are present
  const sanitizedServices = services.map(service => ({
    id: service.id || '',
    name: service.name || '',
    category: service.category || '',
    price: Number(service.price) || 0,
    duration: service.duration || '',
    icon: service.icon || '',
    image: service.image || '',
    description: service.description || '',
    chatPrice: Number(service.chatPrice) || 0,
    callPrice: Number(service.callPrice) || 0,
    videoPrice: Number(service.videoPrice) || 0
  }));
  
  console.log('Saving services to database:', sanitizedServices);
  
  const settingsDoc = doc(db, 'settings', 'site');
  await setDoc(settingsDoc, { services: sanitizedServices }, { merge: true });
};

export const updateServiceCategories = async (categories: import('../types').ServiceCategory[]) => {
  // Ensure no undefined values - Firestore rejects them
  const sanitizedCategories = categories.map(cat => ({
    id: cat.id || '',
    name: cat.name || '',
    icon: cat.icon || '',
    image: cat.image || '',
    description: cat.description || '',
    features: cat.features || '',
    chatPrice: cat.chatPrice || 0,
    callPrice: cat.callPrice || 0,
    videoPrice: cat.videoPrice || 0
  }));
  
  const settingsDoc = doc(db, 'settings', 'site');
  await setDoc(settingsDoc, { serviceCategories: sanitizedCategories }, { merge: true });
};

export const updateProductCategories = async (categories: string[]) => {
  const settingsDoc = doc(db, 'settings', 'site');
  await setDoc(settingsDoc, { productCategories: categories }, { merge: true });
}; 

export const updateAdminPassword = async (password: string) => {
  const settingsDoc = doc(db, 'settings', 'site');
  await setDoc(settingsDoc, { adminPassword: password }, { merge: true });
};

export const updateHeroBackground = async (heroImage: string, heroVideo: string) => {
  const settingsDoc = doc(db, 'settings', 'site');
  await setDoc(settingsDoc, { heroImage, heroVideo }, { merge: true });
};

export const updateHeroContent = async (heroContent: SiteSettings['heroContent']) => {
  const settingsDoc = doc(db, 'settings', 'site');
  await setDoc(settingsDoc, { heroContent: stripUndefined(heroContent) }, { merge: true });
};

export const updateFooterSettings = async (footer: NonNullable<SiteSettings['footer']>) => {
  const settingsDoc = doc(db, 'settings', 'site');
  await setDoc(settingsDoc, { footer: stripUndefined(footer) }, { merge: true });
};

export const updateCrystalCombos = async (crystalCombos: import('../types').CrystalCombo[]) => {
  const settingsDoc = doc(db, 'settings', 'site');
  await setDoc(settingsDoc, { crystalCombos: stripUndefined(crystalCombos) }, { merge: true });
};

export const getDefaultSettings = () => DEFAULT_SETTINGS;

// ============ SEED DATA (for initial setup) ============

export const seedInitialData = async (products: Product[], testimonials: Testimonial[], blogs: BlogPost[]) => {
  try {
  // Check if seeding has already been completed before
  const settingsRef = doc(db, 'settings', 'site');
  const settingsDoc = await getDoc(settingsRef);
  const hasSeeded = settingsDoc.exists() && settingsDoc.data()?.seedCompleted === true;

  // Only seed products if NEVER seeded before AND collection is empty
  const existingProducts = await getDocs(productsCollection);
  if (existingProducts.empty && !hasSeeded) {
    for (const product of products) {
      await setDoc(doc(db, 'products', product.id), product);
    }
    console.log('Seeded initial products');
  }

  // Only seed testimonials if NEVER seeded before AND collection is empty
  const existingTestimonials = await getDocs(testimonialsCollection);
  if (existingTestimonials.empty && !hasSeeded && testimonials.length > 0) {
    for (const testimonial of testimonials) {
      await setDoc(doc(db, 'testimonials', testimonial.id), testimonial);
    }
    console.log('Seeded initial testimonials');
  }

  // Only seed blogs if NEVER seeded before AND collection is empty
  const existingBlogs = await getDocs(blogsCollection);
  if (existingBlogs.empty && !hasSeeded && blogs.length > 0) {
    for (const blog of blogs) {
      const blogData = {
        ...blog,
        createdAt: blog.createdAt || serverTimestamp()
      };
      await setDoc(doc(db, 'blogs', blog.id), blogData);
    }
    console.log('Seeded initial blogs');
  }

  // Mark seeding as completed (one-time flag)
  if (!hasSeeded) {
    await setDoc(settingsRef, { seedCompleted: true }, { merge: true });
    console.log('Marked seeding as completed');
  }
  } catch (error) {
    console.error('Seed data error:', error);
    throw error;
  }
};
