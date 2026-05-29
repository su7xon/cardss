import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, Star, ShieldCheck, Truck, ArrowLeft, Zap, Lock, RefreshCcw, CheckCircle2 } from 'lucide-react';
import { Product, CrystalCombo } from '../types';
import { useCart } from '../contexts/CartContext';
import { subscribeToSettings } from '../services/databaseService';

import { HEALING_PRODUCTS } from '../data/products';

interface ProductDetailsProps {
  products: Product[];
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ products }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  

  const [addedToCart, setAddedToCart] = useState(false);
  const [crystalCombo, setCrystalCombo] = useState<CrystalCombo | null>(null);
  const [relatedPage, setRelatedPage] = useState(1);

  // Find the product from props, or fallback to HEALING_PRODUCTS
  const allProducts = products.length > 0 ? products : HEALING_PRODUCTS;
  const product = allProducts.find(p => p.id === id);

  // Check if it's a crystal combo
  useEffect(() => {
    if (id?.startsWith('combo_')) {
      const unsubscribe = subscribeToSettings((settings) => {
        if (settings.crystalCombos) {
          const comboId = id.replace('combo_', '');
          const combo = settings.crystalCombos.find(c => c.id === comboId);
          if (combo) {
            setCrystalCombo(combo);
          }
        }
      });
      return () => unsubscribe();
    }
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setRelatedPage(1); // Reset related products page on navigation
  }, [product, id]);

  if (!product && !crystalCombo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-serif text-slate-800 mb-4">Product not found</h2>
          <button 
            onClick={() => navigate('/shop')}
            className="text-sky-700 font-bold hover:underline"
          >
            Return to Shop
          </button>
        </div>
      </div>
    );
  }

  const handleBuyNow = () => {
    if (!product && !crystalCombo) return;
    
    const item: Product = product || {
      id: `combo_${crystalCombo!.id}`,
      name: crystalCombo!.title,
      price: crystalCombo!.price,
      originalPrice: crystalCombo!.originalPrice,
      description: `${crystalCombo!.subtitle} - ${crystalCombo!.description}`,
      image: crystalCombo!.image || '',
      category: 'Crystal Combo',
      tag: crystalCombo!.tag
    };
    
    // Pass item via navigate state for direct checkout without polluting the persistent cart
    navigate('/checkout', { state: { buyNowItem: item } });
  };

  const handleAddToCart = () => {
    if (!product && !crystalCombo) return;
    
    const item: Product = product || {
      id: `combo_${crystalCombo!.id}`,
      name: crystalCombo!.title,
      price: crystalCombo!.price,
      originalPrice: crystalCombo!.originalPrice,
      description: `${crystalCombo!.subtitle} - ${crystalCombo!.description}`,
      image: crystalCombo!.image || '',
      category: 'Crystal Combo',
      tag: crystalCombo!.tag
    };
    
    // Use CartContext — this updates navbar count and saves correct flat format
    addToCart(item);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // Process details
  const displayProduct = product || (crystalCombo ? {
    id: `combo_${crystalCombo.id}`,
    name: crystalCombo.title,
    price: crystalCombo.price,
    originalPrice: crystalCombo.originalPrice,
    description: crystalCombo.fullDescription || `${crystalCombo.subtitle} - ${crystalCombo.description}`,
    image: crystalCombo.image,
    category: 'Crystal Combo',
    tag: crystalCombo.tag
  } : null);

  if (!displayProduct) return null;
    
  const discount = displayProduct.originalPrice 
    ? Math.round(((displayProduct.originalPrice - displayProduct.price) / displayProduct.originalPrice) * 100) 
    : 10;
    
  const wisdomBullets = crystalCombo?.benefits || (displayProduct.description ? [displayProduct.description] : ["Details coming soon."]);

  // Reusable sub-components for better layout management
  const TitleAndRatings = () => (
    <>
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif tracking-tight text-slate-900 mb-2 leading-tight">
        {displayProduct.name}
      </h1>
      <button className="text-rose-600 hover:text-rose-700 hover:underline text-sm font-medium mb-2">
        Visit the Divine Guidance Store
      </button>
      <div className="md:hidden mt-3 mb-4">
        <h3 className="text-sm font-bold text-slate-900 mb-1 uppercase tracking-wide">About this item</h3>
        <ul className="list-disc pl-5 space-y-2 text-slate-800 text-xs">
          {wisdomBullets.map((bullet, idx) => (
            <li key={idx}>
              <span className="leading-relaxed">{bullet.trim()}{bullet.endsWith('.') ? '' : '.'}</span>
            </li>
          ))}
          <li><span className="font-semibold">Category: </span> {displayProduct.category}</li>
        </ul>
      </div>
    </>
  );

  const ServiceIcons = () => (
    <div className="flex justify-between md:justify-start md:gap-8 overflow-x-auto pb-4 mt-6 mb-2 scrollbar-hide">
      <div className="flex flex-col items-center text-center min-w-[75px] max-w-[85px] gap-2">
        <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mx-auto">
            <RefreshCcw className="w-5 h-5"/>
        </div>
        <span className="text-[10px] sm:text-xs text-rose-600 leading-tight">7 Days<br/>Replacement</span>
      </div>
      <div className="flex flex-col items-center text-center min-w-[75px] max-w-[85px] gap-2">
        <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mx-auto">
            <Truck className="w-5 h-5"/>
        </div>
        <span className="text-[10px] sm:text-xs text-rose-600 leading-tight">Free<br/>Delivery</span>
      </div>
      <div className="flex flex-col items-center text-center min-w-[75px] max-w-[85px] gap-2">
        <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mx-auto">
            <ShieldCheck className="w-5 h-5"/>
        </div>
        <span className="text-[10px] sm:text-xs text-rose-600 leading-tight">1 Year<br/>Warranty</span>
      </div>
      <div className="flex flex-col items-center text-center min-w-[75px] max-w-[85px] gap-2">
        <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mx-auto">
            <CheckCircle2 className="w-5 h-5"/>
        </div>
        <span className="text-[10px] sm:text-xs text-rose-600 leading-tight">Top<br/>Brand</span>
      </div>
    </div>
  );

  const BuyBoxContent = () => (
    <>
      <div className="text-slate-900 text-3xl font-semibold mb-2 flex items-start">
          <span className="text-lg mt-1 font-medium mr-1">₹</span>{displayProduct.price.toLocaleString('en-IN')}
      </div>
      
      {displayProduct.originalPrice && (
        <div className="flex items-center justify-between mb-4">
          <div className="text-slate-500 text-sm">
            M.R.P.: <span className="line-through">₹{displayProduct.originalPrice.toLocaleString('en-IN')}</span>
          </div>
          <div className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded">
            {discount}% OFF
          </div>
        </div>
      )}

      <div className="text-sm mb-4 leading-relaxed text-slate-700">
        <span className="text-rose-600 font-medium">FREE delivery</span>
      </div>
      
      <div className="flex items-center gap-2 text-emerald-700 text-lg font-semibold mb-4">
        In stock
      </div>
      
      <div className="flex flex-col gap-2 text-xs text-slate-600 mb-6">
        <div className="flex pb-1 border-b border-slate-100">
          <span className="w-24 font-medium">Ships from</span>
          <span className="text-slate-900 text-right flex-1">Divine Guidance</span>
        </div>
        <div className="flex pb-1 border-b border-slate-100">
          <span className="w-24 font-medium">Sold by</span>
          <span className="text-rose-600 hover:underline cursor-pointer text-right flex-1">Divine Guidance Studio</span>
        </div>
        <div className="flex pb-1 border-b border-slate-100">
          <span className="w-24 font-medium">Packaging</span>
          <span className="text-rose-600 hover:underline cursor-pointer text-right flex-1">Shows what's inside</span>
        </div>
      </div>

        <button 
          onClick={handleBuyNow}
          className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-full py-3 font-medium text-sm transition-colors shadow-md focus:ring-2 focus:ring-rose-500 focus:ring-offset-1 flex items-center justify-center gap-2 mb-2"
        >
          <ShoppingBag className="w-4 h-4" />
          Buy Now
        </button>
        <button 
          onClick={handleAddToCart}
          className="w-full bg-white border-2 border-rose-600 text-rose-600 hover:bg-rose-50 rounded-full py-2 font-medium text-sm transition-colors focus:ring-2 focus:ring-rose-500 focus:ring-offset-1 flex items-center justify-center gap-2"
        >
          Add to Cart
        </button>
      
      <div className="mt-4 flex items-center gap-2 text-sm text-rose-600 hover:text-rose-700 cursor-pointer justify-center md:justify-start">
        <Lock className="w-4 h-4 text-rose-600" /> 
        <span className="hover:underline">Secure transaction</span>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/20 to-white pb-24 font-sans text-slate-900">
      {/* Top Breadcrumb Nav */}
      <div className="bg-rose-50/40 border-b border-rose-100 py-3 px-4 sm:px-8 flex items-center shadow-sm text-sm text-slate-500">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to results
        </button>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-4 sm:py-6 md:py-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          
          {/* Mobile Title (above image) */}
          <div className="block lg:hidden w-full">
            <TitleAndRatings />
          </div>

          {/* Left Column: Product Image */}
          <div className="w-full lg:w-4/12 flex flex-col items-center">
            <div className="w-full aspect-square bg-slate-50 flex items-center justify-center rounded-2xl overflow-hidden relative border border-slate-200 p-8 group">
              <img 
                src={displayProduct.image} 
                alt={displayProduct.name} 
                className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110 cursor-zoom-in"
              />
            </div>
            <p className="text-slate-500 text-xs mt-4 text-center hidden sm:block">Roll over image to zoom in</p>
          </div>

          {/* Center Column: Details (Desktop) / Flow (Mobile) */}
          <div className="w-full lg:w-5/12 flex flex-col">
            {/* Desktop Title */}
            <div className="hidden lg:block mb-4">
              <TitleAndRatings />
            </div>

            <div className="hidden lg:block h-px w-full bg-slate-200 mb-4"></div>

            {/* Main Price Display for Desktop */}
            <div className="hidden lg:block mb-4">
              {displayProduct.originalPrice && (
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-rose-600 font-light text-3xl">-{discount}%</span>
                  <span className="text-4xl font-semibold text-slate-900 flex items-start">
                    <span className="text-xl mt-1 font-medium mr-1">₹</span>{displayProduct.price.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              {!displayProduct.originalPrice && (
                <span className="text-4xl font-semibold text-slate-900 flex items-start mb-1">
                  <span className="text-xl mt-1 font-medium mr-1">₹</span>{displayProduct.price.toLocaleString('en-IN')}
                </span>
              )}
              
              {displayProduct.originalPrice && (
                <div className="text-slate-500 text-sm flex items-center gap-1">
                  <span className="font-medium text-slate-600">M.R.P.:</span> 
                  <span className="line-through">₹{displayProduct.originalPrice.toLocaleString('en-IN')}</span>
                </div>
              )}
              <p className="text-sm text-slate-700 mt-1">Inclusive of all taxes</p>
            </div>

            {/* Mobile Buy Box placement (Under Image) */}
            <div className="block lg:hidden my-2 border border-slate-200 rounded-xl p-5 bg-white shadow-sm shadow-slate-200/50">
               <BuyBoxContent />
            </div>

            <ServiceIcons />

            <div className="hidden lg:block h-px w-full bg-slate-200 mb-6"></div>

            {/* About this item */}
            <div className="hidden lg:block mb-8 mt-4 lg:mt-0">
              <h3 className="text-lg font-bold text-slate-900 mb-4">About this item</h3>
                <ul className="list-disc pl-5 space-y-3 text-slate-800 text-sm sm:text-base">
                  {wisdomBullets.map((bullet, idx) => (
                    <li key={idx}>
                      <span className="leading-relaxed">{bullet.trim()}{bullet.endsWith('.') ? '' : '.'}</span>
                    </li>
                  ))}
                  <li><span className="font-semibold">Category: </span> {displayProduct.category}</li>
                </ul>
              <button className="text-rose-600 hover:text-rose-700 hover:underline text-sm mt-5 font-medium flex items-center gap-1">
                <Star className="w-4 h-4 fill-rose-600 text-rose-600" /> Report incorrect product information.
              </button>
            </div>
          </div>

          {/* Right Column: Buy Box (Desktop) */}
          <div className="hidden lg:block lg:w-3/12 shrink-0">
            <div className="border border-slate-200 rounded-xl p-5 sticky top-24 bg-white shadow-sm flex flex-col">
              <BuyBoxContent />
            </div>
          </div>

        </div>
      </div>

      {/* Success Toast */}
      {addedToCart && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[200] bg-slate-900/95 backdrop-blur text-white px-5 py-3 rounded-xl font-medium shadow-2xl flex items-center gap-3 max-w-[85vw]">
          <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
          <span className="text-sm font-bold whitespace-nowrap">Added to Cart!</span>
        </div>
      )}

      {/* ✨ You May Also Like Section */}
      {(() => {
        const related = allProducts
          .filter(p => p.id !== displayProduct.id)
          .sort((a, b) => {
            // Same category first
            const aMatch = a.category === displayProduct.category ? 0 : 1;
            const bMatch = b.category === displayProduct.category ? 0 : 1;
            return aMatch - bMatch;
          });

        const itemsPerPage = 8; // Shows 2 rows of 4 on desktop, 4 rows of 2 on mobile (which looks like 2 screens)
        // Adjust for a nice 2-row look on most devices
        
        const totalPages = Math.ceil(related.length / itemsPerPage);
        
        // Ensure page is within bounds
        const currentPage = Math.min(relatedPage, Math.max(1, totalPages));
        const startIndex = (currentPage - 1) * itemsPerPage;
        const visibleRelated = related.slice(startIndex, startIndex + itemsPerPage);

        return (
          <section className="border-t border-slate-100 mt-8 pt-8 pb-16 px-4 sm:px-8 max-w-[1400px] mx-auto">
            <h2 className="text-xl sm:text-2xl font-serif text-slate-900 mb-6">
              You may also like
            </h2>
            
            {/* 2 Rows Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {visibleRelated.map(rp => (
                <div
                  key={rp.id}
                  onClick={() => navigate(`/product/${rp.id}`)}
                  className="group cursor-pointer flex flex-col"
                >
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-50 border border-slate-100 mb-3 relative">
                    <img
                      src={rp.image}
                      alt={rp.name}
                      className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                    />
                    {rp.tag && (
                      <span className="absolute top-0 left-0 bg-rose-600 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg">
                        {rp.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-800 line-clamp-2 leading-snug mb-1.5 flex-grow">
                    {rp.name}
                  </p>
                  <div className="flex items-baseline gap-1.5 mt-auto">
                    <span className="text-sm font-bold text-slate-900">₹{Number(rp.price).toLocaleString('en-IN')}</span>
                    {rp.originalPrice && (
                      <span className="text-xs text-slate-400 line-through">₹{Number(rp.originalPrice).toLocaleString('en-IN')}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setRelatedPage(i + 1)}
                    className={`w-9 h-9 rounded-full text-sm font-bold transition-all ${
                      currentPage === i + 1 
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-200 scale-110' 
                        : 'bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-700'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </section>
        );
      })()}

    </div>
  );
};

export default ProductDetails;
