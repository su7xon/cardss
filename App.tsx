
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Checkout from './pages/Checkout';
import BookingPage from './pages/BookingPage';
import BlogPage from './pages/BlogPage';
import AdminPanel from './pages/AdminPanel';
import AssistChat from './components/AssistChat';
import ScrollToTop from './components/ScrollToTop';
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

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS || []);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(INITIAL_TESTIMONIALS || []);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(getDefaultSettings());
  const [isLoading, setIsLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [showAssist, setShowAssist] = useState(false);

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
        setProducts(data.length > 0 ? data : INITIAL_PRODUCTS);
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

  // Floating AI Assistant Button
  const FloatingAssistButton = () => (
    <button
      onClick={() => setShowAssist(true)}
      className="fixed bottom-6 right-6 z-50 hover:scale-110 transition-transform animate-bounce drop-shadow-2xl"
    >
      <img src="/assets/ai_assist_icon.png" alt="AI Assistant" className="w-16 h-16 object-contain" />
    </button>
  );

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-mystic-gradient">
        <Navbar onOpenAssist={() => setShowAssist(true)} />
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
              <Route path="/" element={<Home services={siteSettings.services} serviceCategories={siteSettings.serviceCategories} testimonials={testimonials} aboutContent={siteSettings.about} heroImage={siteSettings.heroImage} heroVideo={siteSettings.heroVideo} />} />
              <Route path="/shop" element={<Shop products={products} />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/checkout" element={<Checkout />} />
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
        <FloatingAssistButton />
        <AssistChat isOpen={showAssist} onClose={() => setShowAssist(false)} />
        <Footer />
      </div>
    </Router>
  );
};

export default App;
