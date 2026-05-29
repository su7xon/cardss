import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HEALING_PRODUCTS, Product } from '../data/products';
import { useCart } from '../contexts/CartContext';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeleton';

interface ShopProps {
  products: Product[];
}

const Shop = ({ products }: ShopProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const displayProducts = products.length > 0 ? products : HEALING_PRODUCTS;
  const filteredByName = displayProducts.filter(p => 
    p.name?.toLowerCase() !== 'personalized energy bracelet' &&
    p.category?.toLowerCase() !== 'personalized energy bracelet'
  );
  const categories = [...new Set(filteredByName.map(p => p.category))].filter(cat => 
    cat?.toLowerCase() !== 'personalized energy bracelet' &&
    !cat?.toLowerCase().includes('personalized')
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return filteredByName;
    return filteredByName.filter(p => p.category === selectedCategory);
  }, [selectedCategory, filteredByName]);

  // Update loading state when products are available
  React.useEffect(() => {
    if (products && products.length > 0) {
      setIsLoading(false);
    }
  }, [products]);



  return (
    <div className="min-h-screen bg-[#fffcf9] pb-24">
      {/* Search & Category Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-rose-100 px-4 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('')}
              className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                selectedCategory === ''
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 scale-105'
                  : 'bg-rose-50 text-rose-400 hover:bg-rose-100'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                  selectedCategory === cat 
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 scale-105' 
                    : 'bg-rose-50 text-rose-400 hover:bg-rose-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 md:py-12">
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-8">
            {Array.from({ length: 12 }).map((_, index) => (
              <ProductCardSkeleton key={`skeleton-${index}`} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-8">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id}
                product={product}
                onAddToCart={() => {
                  addToCart(product);
                  setAddedToCart(true);
                  setTimeout(() => setAddedToCart(false), 2000);
                }}
              />
            ))}
          </div>
        )}
      </div>



      {addedToCart && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-lg font-medium shadow-xl animate-fade-in flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-emerald-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Added to cart
        </div>
      )}
    </div>
  );
};

export default Shop;
