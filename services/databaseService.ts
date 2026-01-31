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
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { Product, Booking, Testimonial, SiteSettings, Service, AboutContent, Order, BlogPost } from '../types';

// Collection references
const productsCollection = collection(db, 'products');
const bookingsCollection = collection(db, 'bookings');
const testimonialsCollection = collection(db, 'testimonials');
const ordersCollection = collection(db, 'orders');
const blogsCollection = collection(db, 'blogs');

// ============ IMAGE UPLOAD ============

export const uploadProductImage = async (file: File): Promise<string> => {
  const timestamp = Date.now();
  const fileName = `products/${timestamp}_${file.name}`;
  const storageRef = ref(storage, fileName);

  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  return downloadURL;
};

// ============ PRODUCTS ============

export const subscribeToProducts = (callback: (products: Product[]) => void) => {
  return onSnapshot(productsCollection, (snapshot) => {
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
    callback(products);
  });
};

export const addProduct = async (product: Omit<Product, 'id'>) => {
  const docRef = await addDoc(productsCollection, product);
  return docRef.id;
};

export const updateProduct = async (id: string, updates: Partial<Product>) => {
  const docRef = doc(db, 'products', id);
  await updateDoc(docRef, updates);
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
  });
};

export const addOrder = async (order: Omit<Order, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(ordersCollection, {
    ...order,
    createdAt: Timestamp.now()
  });
  return docRef.id;
};

export const updateOrderStatus = async (id: string, status: Order['status']) => {
  const docRef = doc(db, 'orders', id);
  await updateDoc(docRef, { status });
};

export const deleteOrder = async (id: string) => {
  const docRef = doc(db, 'orders', id);
  await deleteDoc(docRef);
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
      name: 'Mini Guidance Reading',
      category: 'Tarot Guidance',
      price: 599,
      duration: 'SHORT',
      icon: '🗒️',
      description: '1 specific question, Short & focused clarity.'
    },
    {
      id: '2',
      name: 'Detailed Tarot Reading',
      category: 'Tarot Guidance',
      price: 1499,
      duration: 'STANDARD',
      icon: '🔮',
      description: 'Career / Life guidance, In-depth insights.'
    },
    {
      id: '3',
      name: 'Complete Life Guidance Reading',
      category: 'Tarot Guidance',
      price: 2999,
      duration: 'EXTENDED',
      icon: '✨',
      description: 'Multiple areas, Deep clarity & direction.'
    },
    {
      id: '4',
      name: 'Emotional / Spiritual Counseling Session',
      category: 'Counseling & Healing',
      price: 1499,
      duration: '45-60 MINS',
      icon: '🫂',
      description: 'Stress, confusion, emotional support.'
    },
    {
      id: '5',
      name: 'Healing Guidance Session',
      category: 'Counseling & Healing',
      price: 2499,
      duration: 'STANDARD',
      icon: '🌿',
      description: 'Energy balancing & guidance, Personalized support.'
    },
    {
      id: '6',
      name: 'Monthly Healing Support Plan',
      category: 'Special Package',
      price: 5999,
      duration: '3 SESSIONS',
      icon: '🗓️',
      description: 'Continuous guidance & follow-up.'
    },
    {
      id: '7',
      name: 'Tarot + Counseling Combo',
      category: 'Special Package',
      price: 2999,
      duration: 'COMBO',
      icon: '🦋',
      description: 'Tarot insights + counseling support. Best for clarity & healing.'
    }
  ],
  serviceCategories: [
    { id: '1', name: 'Tarot Guidance', icon: '🔮', description: 'Deep insights into your past, present, and future through ancient wisdom.' },
    { id: '2', name: 'Counseling & Healing', icon: '🕊️', description: 'Compassionate spiritual counseling and energy healing for inner peace.' },
    { id: '3', name: 'Special Package', icon: '✨', description: 'Curated bundles of healing sessions and tools for complete transformation.' }
  ],
  productCategories: ['Crystal', 'Jewelry', 'Aura', 'Bracelet', 'Raw Stone', 'Charged Stone'],
  adminPassword: 'pooja.gupta001',
  heroImage: '/assets/hero_bg_final_2.png',
  heroVideo: undefined
};

export const subscribeToSettings = (callback: (settings: SiteSettings) => void) => {
  const settingsDoc = doc(db, 'settings', 'site');
  return onSnapshot(settingsDoc, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data() as any;

      // PARANOID MERGE: Ensure arrays are actually non-empty arrays
      const validServices = Array.isArray(data.services) && data.services.length > 0 ? data.services : DEFAULT_SETTINGS.services;

      // MIGRATION: Handle legacy string[] categories
      let validServiceCats = DEFAULT_SETTINGS.serviceCategories;
      if (Array.isArray(data.serviceCategories) && data.serviceCategories.length > 0) {
        if (typeof data.serviceCategories[0] === 'string') {
          // Convert string[] to ServiceCategory[]
          validServiceCats = (data.serviceCategories as string[]).map((name, i) => ({
            id: Date.now().toString() + i,
            name,
            icon: '✨', // Default icon
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
        services: validServices,
        serviceCategories: validServiceCats,
        productCategories: validProductCats,
      };
      callback(merged);
    } else {
      // Initialize with defaults if not exists
      setDoc(settingsDoc, DEFAULT_SETTINGS);
      callback(DEFAULT_SETTINGS);
    }
  });
};

export const updateAboutContent = async (about: AboutContent) => {
  const settingsDoc = doc(db, 'settings', 'site');
  await setDoc(settingsDoc, { about }, { merge: true });
};

export const updateServices = async (services: Service[]) => {
  const settingsDoc = doc(db, 'settings', 'site');
  await setDoc(settingsDoc, { services }, { merge: true });
};

export const updateServiceCategories = async (categories: import('../types').ServiceCategory[]) => {
  const settingsDoc = doc(db, 'settings', 'site');
  await setDoc(settingsDoc, { serviceCategories: categories }, { merge: true });
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

export const getDefaultSettings = () => DEFAULT_SETTINGS;

// ============ SEED DATA (for initial setup) ============

export const seedInitialData = async (products: Product[], testimonials: Testimonial[], blogs: BlogPost[]) => {
  // Check if products already exist
  const existingProducts = await getDocs(productsCollection);
  if (existingProducts.empty) {
    for (const product of products) {
      await setDoc(doc(db, 'products', product.id), product);
    }
    console.log('Seeded initial products');
  }

  // Check if testimonials already exist  
  const existingTestimonials = await getDocs(testimonialsCollection);
  if (existingTestimonials.empty && testimonials.length > 0) {
    for (const testimonial of testimonials) {
      await setDoc(doc(db, 'testimonials', testimonial.id), testimonial);
    }
    console.log('Seeded initial testimonials');
  }

  // Check and seed blogs if they don't exist
  const existingBlogs = await getDocs(blogsCollection);
  if (existingBlogs.empty && blogs.length > 0) {
    for (const blog of blogs) {
      const blogData = {
        ...blog,
        createdAt: blog.createdAt || serverTimestamp()
      };
      await setDoc(doc(db, 'blogs', blog.id), blogData);
    }
    console.log('Seeded initial blogs');
  }
};
