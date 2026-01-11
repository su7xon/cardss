import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AssistChat from './AssistChat';

const Navbar: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const [showAssist, setShowAssist] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-rose-900/20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/assets/WhatsApp Image 2026-01-11 at 5.22.39 PM.jpeg" 
              alt="Healing Crystal Sutra Logo" 
              className="w-10 h-10 rounded-full object-cover shadow-lg rose-gold-glow"
            />
            <span className="font-mystic text-lg md:text-xl font-bold tracking-widest text-rose-100">
              Healing Crystal Sutra
            </span>
          </Link>

          <div className="hidden md:flex gap-6 text-sm uppercase tracking-widest font-semibold text-rose-200/70 items-center">
            <Link to="/" className="hover:text-rose-400 transition-colors">Home</Link>
            <Link to="/shop" className="hover:text-rose-400 transition-colors">Shop</Link>
            <Link to="/booking" className="hover:text-rose-400 transition-colors">Book</Link>
            <button 
              onClick={() => setShowAssist(true)}
              className="hover:text-rose-400 transition-colors flex items-center gap-1"
            >
              <span>🔮</span> Assist
            </button>
            <Link to="/admin" className="hover:text-rose-400 transition-colors border border-rose-500/30 px-3 py-1 rounded">Admin</Link>
          </div>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-rose-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-950/95 backdrop-blur-md border-t border-rose-900/20 py-4 px-4 space-y-3 animate-fade-in">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-rose-200 hover:text-rose-400">Home</Link>
            <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-rose-200 hover:text-rose-400">Shop</Link>
            <Link to="/booking" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-rose-200 hover:text-rose-400">Book</Link>
            <button 
              onClick={() => { setShowAssist(true); setMobileMenuOpen(false); }}
              className="block py-2 text-rose-200 hover:text-rose-400 flex items-center gap-1"
            >
              <span>🔮</span> Assist
            </button>
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-rose-200 hover:text-rose-400 border-t border-slate-800 pt-4">Admin Panel</Link>
          </div>
        )}
      </nav>

      {/* AI Chat Modal */}
      <AssistChat isOpen={showAssist} onClose={() => setShowAssist(false)} />
    </>
  );
};

export default Navbar;