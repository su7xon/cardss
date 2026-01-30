
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { getCrystalWisdom } from '../services/geminiService';

interface CartItem {
  product: Product;
  quantity: number;
}

interface ShopProps {
  products: Product[];
}

const Shop: React.FC<ShopProps> = ({ products }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [aiWisdom, setAiWisdom] = useState<string | null>(null);
  const [isLoadingWisdom, setIsLoadingWisdom] = useState(false);
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert('This product is out of stock');
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    setAddedToCart(product.id);
    setTimeout(() => setAddedToCart(null), 2000);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item =>
      item.product.id === productId
        ? { ...item, quantity: Math.min(quantity, item.product.stock) }
        : item
    ));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckoutClick = () => {
    navigate('/checkout', { state: { cart } });
  };

  const fetchWisdom = async (product: Product) => {
    setIsLoadingWisdom(true);
    setAiWisdom(null);
    const wisdom = await getCrystalWisdom(product.name, 'healing and grounding');
    setAiWisdom(wisdom);
    setIsLoadingWisdom(false);
  };

  const filteredProducts = products.filter(p =>
    selectedCategory === 'All' || p.category === selectedCategory
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 md:py-12">
      <div className="flex flex-col md:flex-row justify-between items-end mb-4 md:mb-12 gap-6">
        <div>
          <h1 className="text-3xl md:text-6xl font-mystic text-rose-900 mb-2 md:mb-4">Spiritual Shop</h1>
          <p className="text-slate-600 max-w-xl text-sm md:text-base">Curated collection of high-vibration crystals and metaphysical tools, ethically sourced and energized by Pooja.</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowCart(true)}
            className="relative bg-rose-500 hover:bg-rose-600 text-white px-5 md:px-6 py-2.5 md:py-3 rounded-xl font-bold text-xs md:text-base tracking-widest transition-all flex items-center gap-2"
          >
            🛒 CART
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-rose-500 text-[10px] md:text-xs font-bold w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center shadow-md">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-2 md:gap-4 overflow-x-auto pb-4 mb-4 md:mb-8 no-scrollbar">
        {['All', 'Crystal', 'Jewelry', 'Bracelet', 'Raw Stone', 'Aura'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 md:px-6 py-1.5 md:py-2 rounded-full border text-[10px] md:text-sm transition-all whitespace-nowrap font-bold tracking-tight ${selectedCategory === cat
              ? 'bg-rose-500 text-white border-rose-500 shadow-md scale-105'
              : 'bg-white text-rose-700 border-rose-200 hover:border-rose-400'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
        {filteredProducts.map(product => (
          <div
            key={product.id}
            onClick={() => {
              setSelectedProduct(product);
              fetchWisdom(product);
            }}
            className="group relative bg-white rounded-2xl md:rounded-3xl overflow-hidden border border-rose-100 shadow-sm transition-all hover:border-rose-300 hover:shadow-lg cursor-pointer"
          >
            <div className="aspect-[4/5] overflow-hidden relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 md:group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 md:group-hover:opacity-100 transition-opacity flex items-end p-2 md:p-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProduct(product);
                    fetchWisdom(product);
                  }}
                  className="w-full bg-white text-slate-950 py-2 md:py-2.5 rounded-lg font-bold tracking-widest text-[10px] md:text-xs"
                >
                  VIEW DETAILS
                </button>
              </div>
            </div>
            <div className="p-2 md:p-4">
              <div className="space-y-1 text-left mb-2 md:mb-3">
                <h3 className="font-mystic text-[11px] md:text-sm text-rose-900 uppercase tracking-tight line-clamp-1 h-4 md:h-5">{product.name}</h3>
                <p className="text-rose-600 font-bold text-xs md:text-lg">₹{product.price}</p>
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[8px] md:text-[10px] uppercase tracking-widest text-slate-400 font-semibold truncate">{product.category}</span>
                <span className={`text-[7px] md:text-[9px] font-bold uppercase tracking-tighter ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {product.stock > 0 ? 'STOCK' : 'OUT'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center md:p-4 bg-slate-950/40 md:backdrop-blur-md">
          <div className="bg-white w-full h-full md:h-auto md:max-w-4xl md:max-h-[90vh] overflow-y-auto md:rounded-3xl shadow-2xl relative flex flex-col">
            <div className="sticky top-0 left-0 right-0 p-4 flex justify-between items-center bg-white/80 backdrop-blur-md z-20 md:hidden">
              <button
                onClick={() => { setSelectedProduct(null); setAiWisdom(null); }}
                className="p-2 -ml-2 text-slate-900"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h3 className="font-mystic text-rose-900 font-bold truncate px-4">{selectedProduct.name}</h3>
              <button
                onClick={() => setShowCart(true)}
                className="p-2 text-slate-900 relative"
              >
                🛒
                {cartItemCount > 0 && (
                  <span className="absolute top-0 right-0 bg-rose-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>

            <button
              onClick={() => {
                setSelectedProduct(null);
                setAiWisdom(null);
              }}
              className="hidden md:block absolute top-6 right-6 text-slate-400 hover:text-rose-600 z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex-grow">
              <div className="grid md:grid-cols-2">
                <div className="bg-white md:bg-rose-50/30 flex items-center justify-center p-0 md:p-12">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-auto aspect-square md:aspect-square object-contain md:rounded-2xl"
                  />
                </div>

                <div className="p-6 md:p-12 md:pl-0 flex flex-col">
                  <div className="mb-6">
                    <span className="text-rose-400 text-[10px] md:text-xs font-bold tracking-widest uppercase mb-1 block">{selectedProduct.category}</span>
                    <h2 className="text-2xl md:text-4xl font-mystic text-rose-900 mb-2">{selectedProduct.name}</h2>
                    <div className="flex items-center gap-3">
                      <p className="text-2xl md:text-3xl text-rose-600 font-bold">₹{selectedProduct.price}</p>
                      {selectedProduct.price > 1000 && (
                        <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded">Special Offer</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6 mb-24 md:mb-0">
                    <div className="border-t border-rose-50 md:border-none pt-4 md:pt-0">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">About Product</h4>
                      <p className="text-slate-600 leading-relaxed text-sm md:text-base">{selectedProduct.description}</p>
                    </div>

                    <div className="bg-rose-50/50 p-5 md:p-6 rounded-2xl border border-rose-100">
                      <h4 className="text-xs font-bold text-rose-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                        Metaphysical Wisdom
                      </h4>
                      {isLoadingWisdom ? (
                        <div className="flex gap-2 animate-pulse">
                          <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                          <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                          <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                        </div>
                      ) : (
                        <p className="text-rose-900/80 italic text-sm leading-relaxed">{aiWisdom || selectedProduct.metaphysicalProperties}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="fixed md:relative bottom-0 left-0 right-0 p-3 md:p-12 md:pt-0 bg-white border-t md:border-none flex gap-3 z-30">
              <button
                onClick={() => {
                  addToCart(selectedProduct);
                  if (window.innerWidth < 768) {
                    setSelectedProduct(null);
                  }
                }}
                disabled={selectedProduct.stock <= 0}
                className="flex-grow md:flex-none md:w-64 bg-white border-2 border-rose-500 text-rose-600 py-3 md:py-4 rounded-xl font-bold tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-xs md:text-sm"
              >
                ADD TO CART
              </button>
              <button
                onClick={() => {
                  addToCart(selectedProduct);
                  navigate('/checkout', { state: { cart: [{ product: selectedProduct, quantity: 1 }] } });
                  if (window.innerWidth < 768) {
                    setSelectedProduct(null); // Close the product view on mobile so modal is visible
                  }
                }}
                disabled={selectedProduct.stock <= 0}
                className="flex-grow md:flex-none md:w-64 bg-rose-500 hover:bg-rose-600 text-white py-3 md:py-4 rounded-xl font-bold tracking-widest transition-all disabled:opacity-50 shadow-lg text-xs md:text-sm"
              >
                BUY NOW
              </button>
            </div>
          </div>
        </div>
      )}

      {showCart && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setShowCart(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full overflow-y-auto border-l border-rose-100 shadow-2xl animate-slide-in">
            <div className="sticky top-0 bg-white p-6 border-b border-rose-100 flex justify-between items-center z-10">
              <h2 className="text-2xl font-mystic text-rose-900">Your Cart</h2>
              <button onClick={() => setShowCart(false)} className="text-slate-400 hover:text-rose-600 text-2xl">✕</button>
            </div>

            <div className="p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-6xl mb-4">🛒</p>
                  <p className="text-slate-400">Your cart is empty</p>
                  <button
                    onClick={() => setShowCart(false)}
                    className="mt-6 text-rose-500 font-bold hover:underline"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.product.id} className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 flex gap-4">
                      <img src={item.product.image} alt={item.product.name} className="w-20 h-20 object-contain bg-white rounded-lg border border-rose-100" />
                      <div className="flex-grow">
                        <h4 className="font-bold text-rose-900 text-sm">{item.product.name}</h4>
                        <p className="text-rose-500 font-bold">₹{item.product.price}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-8 h-8 bg-white border border-rose-100 rounded-lg text-rose-900 hover:bg-rose-50 font-bold"
                          >
                            -
                          </button>
                          <span className="text-rose-900 w-8 text-center font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-8 h-8 bg-white border border-rose-100 rounded-lg text-rose-900 hover:bg-rose-50 font-bold"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="ml-auto text-red-400 hover:text-red-500 text-xs font-bold uppercase tracking-tighter"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="border-t border-rose-100 pt-4 mt-6">
                    <div className="flex justify-between text-lg mb-6">
                      <span className="text-slate-500">Total Amount</span>
                      <span className="font-bold text-rose-600 text-2xl">₹{cartTotal}</span>
                    </div>
                    <button
                      onClick={handleCheckoutClick}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-green-100"
                    >
                      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      PROCEED TO CHECKOUT
                    </button>
                    <p className="text-center text-slate-400 text-[10px] mt-3 uppercase tracking-widest">
                      Order will be confirmed via WhatsApp
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {addedToCart && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg animate-fade-in">
          ✓ Added to cart!
        </div>
      )}

    </div>
  );
};

export default Shop;
