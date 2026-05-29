import React from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import './CartDrawer.css';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      <div 
        className={`cart-drawer-overlay ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
      />
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-rose-600" />
            <h2 className="text-xl font-bold text-gray-900 font-cinzel">Your Cart</h2>
            <span className="bg-rose-100 text-rose-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {cart.length}
            </span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-10 h-10 text-rose-300" />
              </div>
              <p className="text-gray-500 font-medium mb-6">Your cart is empty</p>
              <button 
                onClick={onClose}
                className="text-rose-600 font-bold hover:underline"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-image" />
                <div className="flex-grow">
                  <h4 className="text-sm font-bold text-gray-900 mb-1 leading-tight">{item.name}</h4>
                  <div className="text-rose-600 font-bold text-sm mb-3">₹{item.price}</div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 px-2 hover:bg-gray-50 text-gray-500"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 text-xs font-bold text-gray-700">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 px-2 hover:bg-gray-50 text-gray-500"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-lg font-bold text-gray-900">₹{cartTotal}</span>
            </div>
            <p className="text-xs text-gray-400 mb-6">Shipping and taxes calculated at checkout</p>
            
            <button 
              onClick={handleCheckout}
              className="checkout-btn flex items-center justify-center gap-2"
            >
              Checkout Now
              <X className="w-4 h-4 rotate-45" /> {/* Use X rotated as an arrow/plus */}
            </button>
            
            <button 
              onClick={clearCart}
              className="w-full mt-3 text-xs text-gray-400 hover:text-rose-600 transition-colors"
            >
              Clear All Items
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
