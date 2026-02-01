import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  onOpenAssist: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenAssist }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signInWithGoogle, logout } = useAuth();

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      setMobileMenuOpen(false);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-rose-200/50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/assets/WhatsApp Image 2026-01-11 at 5.22.39 PM.jpeg"
              alt="Divine Guidance Studio Logo"
              className="w-10 h-10 rounded-full object-cover shadow-lg rose-gold-glow"
            />
            <span className="font-mystic text-xs md:text-xl font-bold tracking-tight md:tracking-widest text-rose-900 whitespace-nowrap">
              Divine Guidance Studio
            </span>
          </Link>

          <div className="hidden md:flex gap-6 text-sm uppercase tracking-widest font-semibold text-slate-600 items-center">
            <Link to="/" className="hover:text-rose-600 transition-colors">Home</Link>
            <Link to="/shop" className="text-slate-600 hover:text-rose-500 font-medium transition-colors">SHOP</Link>
            <Link to="/blog" className="text-slate-600 hover:text-rose-500 font-medium transition-colors">BLOG</Link>
            <Link to="/booking" className="text-slate-600 hover:text-rose-500 font-medium transition-colors">BOOK</Link>
            <button
              onClick={onOpenAssist}
              className="hover:text-rose-600 transition-colors flex items-center gap-1"
            >
              <span>🔮</span> Assist
            </button>
            <Link to="/admin" className="hover:text-rose-600 transition-colors border border-rose-500/30 px-3 py-1 rounded">Admin</Link>

            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 hover:text-rose-600 transition-colors">
                  <img src={user.photoURL || '/assets/default-avatar.png'} alt="User" className="w-8 h-8 rounded-full border border-rose-200" />
                  <span className="max-w-[100px] truncate">{user.displayName?.split(' ')[0]}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-rose-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right">
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 rounded-xl">Logout</button>
                </div>
              </div>
            ) : (
              <button onClick={handleLogin} className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-1.5 rounded-full transition-colors shadow-md">
                LOGIN
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 md:hidden">
            {user ? (
              <img
                src={user.photoURL || '/assets/default-avatar.png'}
                alt="User"
                className="w-8 h-8 rounded-full border border-rose-200"
              />
            ) : (
              <button
                onClick={handleLogin}
                className="text-rose-900 p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A 17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-rose-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-rose-200/50 py-4 px-4 space-y-3 animate-fade-in shadow-xl">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600 hover:text-rose-600">Home</Link>
            <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-lg font-bold text-slate-700 hover:text-rose-500 transition-colors">SHOP</Link>
            <Link to="/blog" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-lg font-bold text-slate-700 hover:text-rose-500 transition-colors">BLOG</Link>
            <Link to="/booking" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-lg font-bold text-slate-700 hover:text-rose-500 transition-colors">BOOK</Link>
            <button
              onClick={() => { onOpenAssist(); setMobileMenuOpen(false); }}
              className="block py-2 text-slate-600 hover:text-rose-600 flex items-center gap-1"
            >
              <span>🔮</span> Assist
            </button>
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-800 font-bold hover:text-rose-600 border-t border-rose-100 pt-4">Admin Panel</Link>

            {user && (
              <div className="pt-4 border-t border-rose-100">
                <div className="flex items-center gap-3 mb-3">
                  <img src={user.photoURL || '/assets/default-avatar.png'} alt="User" className="w-10 h-10 rounded-full border border-rose-200" />
                  <span className="font-bold text-rose-900">{user.displayName}</span>
                </div>
                <button onClick={handleLogout} className="w-full text-left py-2 text-red-500 font-bold">LOGOUT</button>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;