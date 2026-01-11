import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { Product, Booking, Testimonial, SiteSettings, Service, AboutContent } from '../types';

// Collection references
const productsCollection = collection(db, 'products');
const bookingsCollection = collection(db, 'bookings');
const testimonialsCollection = collection(db, 'testimonials');

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

// ============ SITE SETTINGS ============

const DEFAULT_SETTINGS: SiteSettings = {
  about: {
    title: 'The Practitioner',
    description: 'Pooja Gupta is more than just an astrologer; she is a spiritual guide with over 15 years of experience in reading the stars and channeling earth energies. Her mission is to bring high-trust spiritual business to the modern world, helping individuals find their North Star.',
    image: '/assets/image121.jpeg',
    credentials: [
      'Certified Vedic Astrologer',
      'Advanced Crystal Healing Practitioner',
      'Master Tarot & Oracle Reader'
    ]
  },
  services: [
    { id: '1', name: 'Astrology Reading', price: 2100, duration: '60 mins', icon: '✨' },
    { id: '2', name: 'Crystal Consultation', price: 1500, duration: '45 mins', icon: '💎' },
    { id: '3', name: 'Tarot Session', price: 1100, duration: '30 mins', icon: '🃏' },
    { id: '4', name: 'Vastu Analysis', price: 5100, duration: '90 mins', icon: '🏠' }
  ]
};

export const subscribeToSettings = (callback: (settings: SiteSettings) => void) => {
  const settingsDoc = doc(db, 'settings', 'site');
  return onSnapshot(settingsDoc, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as SiteSettings);
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

export const getDefaultSettings = () => DEFAULT_SETTINGS;

// ============ SEED DATA (for initial setup) ============

export const seedInitialData = async (products: Product[], testimonials: Testimonial[]) => {
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
};
