
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import BookingPage from './pages/BookingPage';
import AdminPanel from './pages/AdminPanel';
import { Product, Booking, Testimonial, SiteSettings } from './types';
import { INITIAL_PRODUCTS, INITIAL_TESTIMONIALS } from './constants';
import { 
  subscribeToProducts, 
  subscribeToBookings, 
  subscribeToTestimonials,
  subscribeToSettings,
  seedInitialData,
  getDefaultSettings
} from './services/databaseService';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(INITIAL_TESTIMONIALS);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(getDefaultSettings());
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
      seedInitialData(INITIAL_PRODUCTS, INITIAL_TESTIMONIALS).catch(err => {
        console.error('Seed error:', err);
        setFirebaseError(err.message);
      });

      // Subscribe to real-time updates from Firestore
      const unsubProducts = subscribeToProducts((data) => {
        setProducts(data.length > 0 ? data : INITIAL_PRODUCTS);
        setIsLoading(false);
        clearTimeout(timeoutId);
      });

      const unsubBookings = subscribeToBookings((data) => {
        setBookings(data);
      });

      const unsubTestimonials = subscribeToTestimonials((data) => {
        setTestimonials(data);
      });

      const unsubSettings = subscribeToSettings((data) => {
        setSiteSettings(data);
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

  // Floating WhatsApp Component
  const WhatsAppButton = () => (
    <a 
      href="https://wa.me/917042620928" 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center animate-bounce"
    >
      <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </a>
  );

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-mystic-gradient">
        <Navbar />
        <main className="flex-grow pt-16">
          {isLoading ? (
            <div className="flex items-center justify-center h-[60vh]">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-rose-200">Loading...</p>
                {firebaseError && (
                  <p className="text-red-400 text-sm mt-2 max-w-md">
                    Firebase Error: {firebaseError}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<Home testimonials={testimonials} aboutContent={siteSettings.about} />} />
              <Route path="/shop" element={<Shop products={products} />} />
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
        <WhatsAppButton />
        <Footer />
      </div>
    </Router>
  );
};

export default App;
