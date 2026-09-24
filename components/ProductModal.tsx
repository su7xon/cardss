import React from 'react';
import { X, ShoppingBag, Star, ShieldCheck, Truck, RefreshCcw } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  aiWisdom?: string | null;
  isLoadingWisdom?: boolean;
}

const ProductModal: React.FC<ProductModalProps> = ({ 
  product, 
  onClose, 
  aiWisdom, 
  isLoadingWisdom 
}) => {
  const { addToCart } = useCart();

  if (!product) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      <div 
        className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row animate-in fade-in zoom-in duration-300 max-h-[95dvh] md:max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full text-slate-900 shadow-md transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Section */}
        <div className="md:w-1/2 bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden group shrink-0 max-h-[35vh] md:max-h-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-rose-100/20 to-transparent"></div>
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-contain mix-blend-multiply transform transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute bottom-4 left-4">
            <span className="bg-rose-600 text-white text-[10px] font-black px-4 py-1 rounded-full tracking-[0.2em] shadow-lg">
              AUTHENTIC
            </span>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="md:w-1/2 p-6 md:p-12 overflow-y-auto flex-1">
          <h2 className="text-3xl font-mystic text-slate-900 mb-2">{product.name}</h2>
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-rose-600">₹{product.price}</span>
            {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
              <span className="text-lg text-slate-400 line-through font-medium">₹{product.originalPrice}</span>
            )}
            {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
              <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">SAVE ₹{Number(product.originalPrice) - Number(product.price)}</span>
            )}
          </div>

          <div className="bg-rose-50/50 rounded-2xl p-6 mb-8 border border-rose-100">
            <h4 className="text-xs font-black text-rose-900 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Star className="w-3 h-3 fill-rose-500" />
              Metaphysical Wisdom
            </h4>
            {isLoadingWisdom ? (
              <div className="flex gap-2 py-2">
                <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce delay-200"></div>
              </div>
            ) : (
              <p className="text-rose-800/80 text-sm leading-relaxed font-medium italic">
                {aiWisdom || product.description || "This sacred crystal serves as a powerful conduit for negative energy protection & emotional clarity."}
              </p>
            )}
          </div>

          {/* Quick Features */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-3 text-slate-600">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-rose-500">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold leading-tight uppercase tracking-wider text-slate-400">Lab<br/>Verified</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-rose-500">
                <Truck className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold leading-tight uppercase tracking-wider text-slate-400">Fast<br/>Delivery</span>
            </div>
          </div>

          <button 
            onClick={() => {
              addToCart(product);
              // We could also show a toast here
            }}
            className="w-full bg-slate-900 hover:bg-rose-600 text-white rounded-2xl py-5 font-black text-sm tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 group"
          >
            <ShoppingBag className="w-5 h-5 transition-transform group-hover:-translate-y-1" />
            ADD TO HEALING KIT
          </button>
          
          <p className="text-center mt-4 text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">
            Trusted by 5,000+ Seekers
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
