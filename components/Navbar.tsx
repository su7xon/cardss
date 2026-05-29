import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import CartDrawer from './CartDrawer';
import { Home, Store, ShoppingBag, User, Search, X, ChevronRight } from 'lucide-react';
import { Product, Service } from '../types';

interface NavbarProps {
  products?: Product[];
  services?: Service[];
}

const Navbar: React.FC<NavbarProps> = ({ products = [], services = [] }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; type: 'product' | 'service'; image?: string }[]>([]);
  const { user, signInWithGoogle, logout } = useAuth();
  const { cartItemCount } = useCart();

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

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop" },
    { to: "/blog", label: "Blog" },
    { to: "/booking", label: "Services" },
    { to: "/about", label: "About" },
    { to: "/#contact", label: "Contact" },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    
    const filteredProducts = products
      .filter(p => p.name.toLowerCase().includes(lowerQuery) || p.description.toLowerCase().includes(lowerQuery))
      .slice(0, 5)
      .map(p => ({ id: p.id, name: p.name, type: 'product' as const, image: p.image }));

    const filteredServices = services
      .filter(s => s.name.toLowerCase().includes(lowerQuery) || s.description.toLowerCase().includes(lowerQuery))
      .slice(0, 3)
      .map(s => ({ id: s.id, name: s.name, type: 'service' as const, image: s.image }));

    setSearchResults([...filteredProducts, ...filteredServices]);
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-rose-200/50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 active:scale-95 transition-transform">
            <div className="relative">
              <img
                src="/assets/mystic-logo.png"
                alt="Shunyethra"
                className="h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-110"
              />
            </div>
            <span className="font-mystic text-base sm:text-lg md:text-2xl bg-gradient-to-r from-rose-900 to-rose-700 bg-clip-text text-transparent tracking-widest font-bold">
              Shunyethra
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex gap-8 text-sm uppercase tracking-widest font-semibold text-slate-600 items-center">
            {navLinks.map(link => (
              <Link 
                key={link.to} 
                to={link.to}
                className="hover:text-rose-600 transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-500 transition-all group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-slate-600 hover:text-rose-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </button>

            {/* Account (Desktop) */}
            <Link 
              to="/account"
              className="hidden lg:block p-2 text-slate-600 hover:text-rose-600 transition-colors"
            >
              <User className="w-5 h-5 md:w-6 md:h-6" />
            </Link>

            {/* Cart - Hidden on Mobile since it's in bottom nav */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="hidden lg:block relative p-2 text-slate-600 hover:text-rose-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600"
            >
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-rose-200 p-4 shadow-lg animate-fade-in z-50">
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search crystals, services..."
                  className="w-full bg-rose-50 border border-rose-200 rounded-full px-6 py-3 pr-12 outline-none focus:border-rose-500 transition-colors"
                  autoFocus
                />
                <button 
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-rose-100 overflow-hidden z-[60]">
                  <div className="py-2">
                    {searchResults.map((result) => (
                      <Link
                        key={`${result.type}-${result.id}`}
                        to={result.type === 'product' ? `/product/${result.id}` : '/booking'}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                        className="flex items-center gap-4 px-4 py-3 hover:bg-rose-50 transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-rose-100 overflow-hidden shrink-0">
                          {result.image ? (
                            <img src={result.image} alt={result.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-rose-500">
                              <Search className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <div className="text-sm font-semibold text-slate-900 group-hover:text-rose-600 transition-colors">
                            {result.name}
                          </div>
                          <div className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                            {result.type}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-rose-400" />
                      </Link>
                    ))}
                  </div>
                  <div className="bg-rose-50 p-3 text-center">
                    <Link 
                      to="/shop" 
                      onClick={() => setIsSearchOpen(false)}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 uppercase tracking-widest"
                    >
                      View All Products
                    </Link>
                  </div>
                </div>
              )}
              
              {searchQuery.length >= 2 && searchResults.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-rose-100 p-8 text-center z-[60]">
                  <p className="text-slate-500">No results found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white/98 backdrop-blur-md border-t border-rose-200/50 py-4 px-4 space-y-1 animate-fade-in shadow-xl">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 px-4 text-slate-700 hover:bg-rose-50 hover:text-rose-600 rounded-xl font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Mobile Bottom Navigation */}
      {!isAdmin && !['/checkout', '/booking'].includes(location.pathname) && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-[100] pb-safe">
          <div className="flex justify-around items-center h-16 px-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                isActive('/') ? 'text-rose-600' : 'text-slate-500 hover:text-rose-600'
              }`}
            >
              <Home className="w-6 h-6 mb-1" strokeWidth={isActive('/') ? 2.5 : 2} />
              <span className="text-[10px] font-medium tracking-widest">HOME</span>
            </Link>

            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                isActive('/shop') ? 'text-rose-600' : 'text-slate-500 hover:text-rose-600'
              }`}
            >
              <Store className="w-6 h-6 mb-1" strokeWidth={isActive('/shop') ? 2.5 : 2} />
              <span className="text-[10px] font-medium tracking-widest">SHOP</span>
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-rose-600 transition-colors relative"
            >
              <div className="relative mb-1">
                <ShoppingBag className="w-6 h-6" strokeWidth={2} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium tracking-widest">CART</span>
            </button>

            <Link
              to="/account"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                isActive('/account') ? 'text-rose-600' : 'text-slate-500 hover:text-rose-600'
              }`}
            >
              <User className="w-6 h-6 mb-1" strokeWidth={isActive('/account') ? 2.5 : 2} />
              <span className="text-[10px] font-medium tracking-widest">ACCOUNT</span>
            </Link>
          </div>
        </div>
      )}

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;