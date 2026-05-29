import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { ShoppingBag, Eye, Heart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
  onToggleWishlist?: (productId: string) => void;
  onViewDetails?: (product: Product) => void;
  onAddToCart?: () => void;
  isWishlisted?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onToggleWishlist, 
  onViewDetails,
  onAddToCart,
  isWishlisted = false 
}) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    if (onAddToCart) onAddToCart();
  };

  return (
    <div 
      onClick={() => {
        if (onViewDetails) onViewDetails(product);
        else navigate(`/product/${product.id}`);
      }}
      className="product-card group bg-white rounded-xl overflow-hidden flex flex-col h-full cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-lg transition-all duration-300"
    >
      <div className="relative w-full aspect-square bg-[#f9f7f0] p-3 sm:p-5 flex items-center justify-center overflow-hidden">
        {/* Simplified Badge matching astrotalk */}
        <div className="absolute top-0 left-0 bg-gradient-to-b from-yellow-300 to-yellow-500 px-2 py-1.5 rounded-br-xl shadow-sm z-10 flex flex-col items-center justify-center">
          <span className="text-[10px] sm:text-xs font-black text-gray-900 leading-none">PREMIUM</span>
          <span className="text-[7px] sm:text-[9px] font-bold text-gray-800 uppercase mt-0.5">CRYSTAL</span>
        </div>

        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain product-image"
          loading="lazy"
        />
        
        {/* Wishlist Button handled via onToggleWishlist if provided, otherwise standard Heart */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist && onToggleWishlist(product.id);
          }}
          className={`absolute top-2 right-2 p-1.5 sm:p-2 rounded-full transition-all duration-300 bg-white/60 backdrop-blur-sm hover:scale-110 z-10 ${
            isWishlisted 
              ? 'text-rose-500 bg-white/90 shadow-sm' 
              : 'text-gray-400 hover:text-rose-500'
          }`}
        >
          <Heart className={`w-4 h-4 sm:w-4 sm:h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>
      
      <div className="p-3 sm:p-4 flex flex-col flex-grow bg-white">
        <h3 className="text-xs sm:text-sm font-medium text-gray-800 line-clamp-2 h-8 sm:h-10 leading-snug">
          {product.name}
        </h3>
        
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm sm:text-base font-bold text-gray-900">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-[10px] sm:text-xs text-gray-400 line-through">₹{product.originalPrice}</span>
            )}
          </div>
          
          <button
            onClick={handleAddToCart}
            className="bg-black hover:bg-gray-800 text-white px-2.5 py-1.5 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-md text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
          >
            Shop Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

