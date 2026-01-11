
import React, { useState } from 'react';
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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState<string | null>(null);

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

  const handleWhatsAppCheckout = () => {
    const orderDetails = cart.map(item => 
      `• ${item.product.name} x${item.quantity} = ₹${item.product.price * item.quantity}`
    ).join('\n');
    
    const message = encodeURIComponent(
      `🛒 *New Order from Healing Crystal Sutra*\n\n` +
      `${orderDetails}\n\n` +
      `*Total: ₹${cartTotal}*\n\n` +
      `Please confirm availability and payment details.`
    );
    
    window.open(`https://wa.me/917042620928?text=${message}`, '_blank');
  };

  const fetchWisdom = async (product: Product) => {
    setIsLoadingWisdom(true);
    setAiWisdom(null);
    const wisdom = await getCrystalWisdom(product.name, 'healing and grounding');
    setAiWisdom(wisdom);
    setIsLoadingWisdom(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-mystic text-rose-100 mb-4">Spiritual Shop</h1>
          <p className="text-slate-400 max-w-xl">Curated collection of high-vibration crystals and metaphysical tools, ethically sourced and energized by Pooja.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowCart(true)}
            className="relative bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl font-bold tracking-widest transition-all flex items-center gap-2"
          >
            🛒 CART
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-rose-500 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 mb-8">
        {['All', 'Crystal', 'Jewelry', 'Aura'].map(cat => (
          <button key={cat} className="px-6 py-2 rounded-full border border-rose-900/40 text-rose-200/60 hover:border-rose-400 hover:text-rose-100 transition-all whitespace-nowrap">
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {products.map(product => (
          <div key={product.id} className="group relative bg-slate-900/30 rounded-3xl overflow-hidden border border-slate-800 transition-all hover:border-rose-500/30">
            <div className="aspect-square overflow-hidden relative">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                <button 
                  onClick={() => {
                    setSelectedProduct(product);
                    fetchWisdom(product);
                  }}
                  className="w-full bg-white text-slate-950 py-3 rounded-xl font-bold tracking-widest text-sm"
                >
                  VIEW DETAILS
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-mystic text-xl text-rose-100">{product.name}</h3>
                <span className="text-rose-400 font-bold">₹{product.price}</span>
              </div>
              <p className="text-slate-400 text-sm line-clamp-2 mb-4">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-rose-300/50">{product.category}</span>
                <span className={`text-[10px] px-2 py-1 rounded ${product.stock > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {product.stock > 0 ? `${product.stock} IN STOCK` : 'OUT OF STOCK'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-rose-500/20 shadow-2xl relative">
            <button 
              onClick={() => {
                setSelectedProduct(null);
                setAiWisdom(null);
              }}
              className="absolute top-6 right-6 text-slate-400 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="grid md:grid-cols-2">
              <div className="p-8 md:p-12">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full aspect-square object-cover rounded-2xl shadow-xl gold-border" />
              </div>
              <div className="p-8 md:p-12 md:pl-0 flex flex-col">
                <span className="text-rose-400 text-xs font-bold tracking-widest uppercase mb-2">{selectedProduct.category}</span>
                <h2 className="text-3xl md:text-4xl font-mystic text-rose-100 mb-4">{selectedProduct.name}</h2>
                <p className="text-2xl text-rose-300 font-bold mb-6">₹{selectedProduct.price}</p>
                
                <div className="space-y-6 flex-grow">
                  <div>
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Description</h4>
                    <p className="text-slate-300 leading-relaxed">{selectedProduct.description}</p>
                  </div>

                  <div className="bg-rose-950/20 p-6 rounded-2xl border border-rose-900/30">
                    <h4 className="text-sm font-bold text-rose-300 uppercase tracking-widest mb-3 flex items-center gap-2">
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
                      <p className="text-rose-100/80 italic text-sm leading-relaxed">{aiWisdom || selectedProduct.metaphysicalProperties}</p>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <button 
                    onClick={() => {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                      setAiWisdom(null);
                    }}
                    disabled={selectedProduct.stock <= 0}
                    className="flex-grow bg-rose-500 hover:bg-rose-600 text-white py-4 rounded-xl font-bold tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {selectedProduct.stock <= 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
                  </button>
                  <button className="bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowCart(false)}></div>
          <div className="relative w-full max-w-md bg-slate-900 h-full overflow-y-auto border-l border-rose-500/20 shadow-2xl">
            <div className="sticky top-0 bg-slate-900 p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-2xl font-mystic text-rose-100">Your Cart</h2>
              <button onClick={() => setShowCart(false)} className="text-slate-400 hover:text-white text-2xl">✕</button>
            </div>
            
            <div className="p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-6xl mb-4">🛒</p>
                  <p className="text-slate-400">Your cart is empty</p>
                  <button 
                    onClick={() => setShowCart(false)}
                    className="mt-6 text-rose-400 hover:underline"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.product.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex gap-4">
                      <img src={item.product.image} alt={item.product.name} className="w-20 h-20 object-cover rounded-lg" />
                      <div className="flex-grow">
                        <h4 className="font-bold text-rose-100 text-sm">{item.product.name}</h4>
                        <p className="text-rose-400 font-bold">₹{item.product.price}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-8 h-8 bg-slate-800 rounded-lg text-white hover:bg-slate-700"
                          >
                            -
                          </button>
                          <span className="text-white w-8 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-8 h-8 bg-slate-800 rounded-lg text-white hover:bg-slate-700"
                          >
                            +
                          </button>
                          <button 
                            onClick={() => removeFromCart(item.product.id)}
                            className="ml-auto text-red-400 hover:text-red-300 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t border-slate-800 pt-4 mt-6">
                    <div className="flex justify-between text-lg mb-6">
                      <span className="text-slate-400">Total</span>
                      <span className="font-bold text-rose-400">₹{cartTotal}</span>
                    </div>
                    <button 
                      onClick={handleWhatsAppCheckout}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      CHECKOUT VIA WHATSAPP
                    </button>
                    <p className="text-center text-slate-500 text-xs mt-3">
                      Order will be confirmed via WhatsApp
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Added to Cart Toast */}
      {addedToCart && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg animate-fade-in">
          ✓ Added to cart!
        </div>
      )}
    </div>
  );
};

export default Shop;
