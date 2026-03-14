
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  metaphysicalProperties: string;
  image: string;
  category: string;
  stock: number;
}

export interface Booking {
  id: string;
  clientName: string;
  email: string;
  phone: string;
  service: string;
  price: number;
  date: string;
  time: string;
  status: 'Confirmed' | 'Pending' | 'Completed';
  birthDetails?: {
    dob: string;
    tob: string;
    pob: string;
  };
}

export interface Order {
  id: string;
  customerName: string;
  email?: string;
  phone: string;
  address: string;
  pincode: string;
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number
  }[];
  total: number;
  paymentMethod: 'UPI' | 'COD' | 'WhatsApp' | 'Razorpay';
  status: 'Pending' | 'Completed' | 'Cancelled' | 'Paid';
  transactionId?: string;
  createdAt: any; // Timestamp
}

export interface Testimonial {
  id: string;
  name: string;
  rating: number;
  text: string;
  isModerated: boolean;
  date: string;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: string;
  icon: string;
  image?: string;
  description?: string;
}

export interface AboutContent {
  title: string;
  description: string;
  image: string;
  credentials: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  image?: string;
  excerpt?: string;
  createdAt: any;
  slug: string;
}


export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  image?: string;
  description?: string;
}

export interface FooterSettings {
  aboutTitle: string;
  aboutDescription: string;
  servicesTitle: string;
  services: string[];
  contactTitle: string;
  instagramUrl: string;
  youtubeUrl: string;
  whatsappUrl: string;
  address: string;
  email: string;
  phone: string;
}

export interface HeroContent {
  heading: string;
  subheading: string;
  subtitle?: string; // New field
  primaryButtonText: string;
  secondaryButtonText: string;
}

export interface SiteSettings {
  about: AboutContent;
  services: Service[];
  serviceCategories: ServiceCategory[];
  productCategories: string[];
  adminPassword?: string;
  heroImage?: string;
  heroVideo?: string;
  heroContent: HeroContent;
  upiId?: string;
  footer?: FooterSettings;
}

export enum AdminView {
  DASHBOARD = 'DASHBOARD',
  INVENTORY = 'INVENTORY',
  SERVICES = 'SERVICES',
  ORDERS = 'ORDERS',
  BLOG = 'BLOG',
  APPOINTMENTS = 'APPOINTMENTS',
  MODERATION = 'MODERATION',
  SETTINGS = 'SETTINGS'
}

declare global {
  interface Window {
    Razorpay: any;
  }
}
