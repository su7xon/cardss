
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  metaphysicalProperties: string;
  image: string;
  category: 'Crystal' | 'Jewelry' | 'Aura';
  stock: number;
}

export interface Booking {
  id: string;
  clientName: string;
  email: string;
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
  price: number;
  duration: string;
  icon: string;
}

export interface AboutContent {
  title: string;
  description: string;
  image: string;
  credentials: string[];
}

export interface SiteSettings {
  about: AboutContent;
  services: Service[];
}

export enum AdminView {
  DASHBOARD = 'DASHBOARD',
  INVENTORY = 'INVENTORY',
  APPOINTMENTS = 'APPOINTMENTS',
  MODERATION = 'MODERATION',
  SETTINGS = 'SETTINGS'
}
