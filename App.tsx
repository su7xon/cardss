import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Checkout from './pages/Checkout';
import BookingPage from './pages/BookingPage';
import BlogPage from './pages/BlogPage';
import AdminPanel from './pages/AdminPanel';
import ScrollToTop from './components/ScrollToTop';
import ProductCard from './components/ProductCard';
import ProductDetails from './pages/ProductDetails';
import CoursesPage from './pages/CoursesPage';
import AboutPage from './pages/AboutPage';
import AccountPage from './pages/AccountPage';
import { Product, Booking, Testimonial, SiteSettings, BlogPost } from './types';
import { INITIAL_PRODUCTS, INITIAL_TESTIMONIALS, INITIAL_BLOGS } from './constants';
import {
  subscribeToProducts,
  subscribeToBookings,
  subscribeToTestimonials,
  subscribeToSettings,
  seedInitialData,
  getDefaultSettings
} from './services/databaseService';

import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS || []);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(INITIAL_TESTIMONIALS || []);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(getDefaultSettings());
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  // Subscribe to Firebase real-time updates
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    // Timeout fallback - if Firebase doesn't respond in 5 seconds, use local data
    timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn('Firebase timeout - using local data');
        setIsLoading(false);
      }
    }, 5000);

    try {
      // Seed initial data if database is empty
      seedInitialData(INITIAL_PRODUCTS, INITIAL_TESTIMONIALS, INITIAL_BLOGS).catch(err => {
        console.error('Seed error:', err);
        setFirebaseError(err.message);
      });

      // Subscribe to real-time updates from Firestore
      const unsubProducts = subscribeToProducts((data) => {
        const liveProducts = Array.isArray(data) ? data : [];
        let deletedNameSet = new Set<string>();
        const importedNameSet = new Set(
          (INITIAL_PRODUCTS || [])
            .map((p) => (p.name || '').trim().toLowerCase())
            .filter(Boolean)
        );

        try {
          const deletedNamesRaw = localStorage.getItem('deleted_product_names');
          const deletedNames = deletedNamesRaw ? JSON.parse(deletedNamesRaw) : [];
          if (Array.isArray(deletedNames)) {
            deletedNameSet = new Set(
              deletedNames
                .filter((n) => typeof n === 'string')
                .map((n) => n.trim().toLowerCase())
            );
          }
        } catch (error) {
          console.warn('Failed to parse deleted product tombstones:', error);
        }

        const filteredLiveProducts = liveProducts.filter((p) => {
          const normalizedName = (p.name || '').trim().toLowerCase();
          return Boolean(normalizedName) && !deletedNameSet.has(normalizedName);
        });

        const mergedMap = new Map();
        
        // Add initial products first
        INITIAL_PRODUCTS.forEach((p) => {
          const normalizedName = (p.name || '').trim().toLowerCase();
          if (!deletedNameSet.has(normalizedName)) {
            mergedMap.set(normalizedName, p);
          }
        });
        
        // Overlay/add live products
        filteredLiveProducts.forEach((live) => {
          const normalizedName = (live.name || '').trim().toLowerCase();
          mergedMap.set(normalizedName, { ...mergedMap.get(normalizedName), ...live });
        });

        const getCreatedAtMs = (product: any) => {
          const createdAt = product?.createdAt;
          if (!createdAt) return 0;
          if (typeof createdAt?.toMillis === 'function') return createdAt.toMillis();
          if (typeof createdAt?.seconds === 'number') return createdAt.seconds * 1000;
          const parsed = Date.parse(createdAt);
          return Number.isNaN(parsed) ? 0 : parsed;
        };

        const merged = Array.from(mergedMap.values()).sort(
          (a: any, b: any) => getCreatedAtMs(b) - getCreatedAtMs(a)
        );
        setProducts(merged);

        setIsLoading(false);
        clearTimeout(timeoutId);
      });

      const unsubBookings = subscribeToBookings((data) => {
        setBookings(data);
      });

      const unsubTestimonials = subscribeToTestimonials((liveData) => {
        // Merge demo testimonials with live testimonials to ensure the wall is full
        const combined = [...INITIAL_TESTIMONIALS];
        liveData.forEach(live => {
          const index = combined.findIndex(c => c.id === live.id);
          if (index !== -1) {
            combined[index] = live; // Update if exists
          } else {
            combined.push(live); // Add if new
          }
        });
        setTestimonials(combined);
      });

      const unsubSettings = subscribeToSettings((data) => {
        setSiteSettings(data);
        setIsSettingsLoaded(true);
      });

      // Cleanup subscriptions on unmount
      return () => {
        clearTimeout(timeoutId);
        unsubProducts();
        unsubBookings();
        unsubTestimonials();
        unsubSettings();
      };
    } catch (error: any) {
      console.error('Firebase connection error:', error);
      setFirebaseError(error.message);
      setIsLoading(false);
    }
  }, []);

  // Floating WhatsApp Button
  const FloatingWhatsAppButton = () => (
    <a
      href="https://wa.me/916397832791"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 lg:bottom-6 right-6 z-50 bg-[#25D366] text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform hover:shadow-xl flex items-center justify-center"
      aria-label="Chat on WhatsApp"
    >
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
      </svg>
    </a>
  );

  // Inner component to use useLocation inside Router
  const AppContent = () => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';
    const isAdminRoute = location.pathname.startsWith('/admin');

    // Aggressive scroll-to-top on every route change and initial load
    useEffect(() => {
      // Immediate scroll
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Scroll after render
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      });
      
      // Double-check scroll position
      const timer = setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 50);
      
      return () => clearTimeout(timer);
    }, [location.pathname]);

    return (
      <>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-mystic-gradient">
          {!isAdminRoute && <Navbar products={products} services={siteSettings.services} />}
          <main className={`flex-grow ${isAdminRoute ? '' : 'pt-16'}`}>
            {isLoading ? (
              <div className="h-[60vh]" />
            ) : (
              <Routes>
                <Route path="/" element={<Home products={products} services={siteSettings.services} serviceCategories={siteSettings.serviceCategories} testimonials={testimonials} heroImage={siteSettings.heroImage} heroVideo={siteSettings.heroVideo} heroContent={siteSettings.heroContent} />} />
                <Route path="/shop" element={<Shop products={products} />} />
                <Route path="/product/:id" element={<ProductDetails products={products} />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/about" element={<AboutPage about={siteSettings.about} />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/account" element={<AccountPage products={products} />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/book" element={<Navigate to="/booking" />} />
                <Route path="/booking" element={<BookingPage services={siteSettings.services} testimonials={testimonials} />} />
                <Route
                  path="/admin/*"
                  element={
                    <AdminPanel
                      products={products}
                      setProducts={setProducts}
                      bookings={bookings}
                      setBookings={setBookings}
                      testimonials={testimonials}
                      setTestimonials={setTestimonials}
                    />
                  }
                />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            )}
          </main>
          {!isAdminRoute && <FloatingWhatsAppButton />}
          {isHomePage && <Footer footerSettings={siteSettings.footer} />}
        </div>
      </>
    );
  };

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
