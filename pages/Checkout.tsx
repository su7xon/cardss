
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Product } from '../types';
import { addOrder } from '../services/databaseService';

interface CartItem {
    product: Product;
    quantity: number;
}

const Checkout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [cart, setCart] = useState<CartItem[]>([]);

    const [checkoutForm, setCheckoutForm] = useState({
        name: '',
        phone: '',
        address: '',
        pincode: '',
        paymentMethod: 'UPI' as 'UPI' | 'COD' | 'WhatsApp'
    });

    useEffect(() => {
        if (location.state && location.state.cart) {
            setCart(location.state.cart);
        } else {
            // Redirect to shop if no cart data
            navigate('/shop');
        }
    }, [location, navigate]);

    const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isPlacingOrder) return;

        // Validate all required fields
        if (!checkoutForm.name.trim()) {
            alert('Please enter your name');
            return;
        }
        if (!checkoutForm.phone.trim()) {
            alert('Please enter your phone number');
            return;
        }
        if (!checkoutForm.address.trim()) {
            alert('Please enter your address');
            return;
        }
        if (!checkoutForm.pincode.trim()) {
            alert('Please enter your pincode');
            return;
        }

        setIsPlacingOrder(true);

        try {
            const orderItems = cart.map(item => ({
                productId: item.product.id,
                name: item.product.name,
                quantity: item.quantity,
                price: item.product.price
            }));

            await addOrder({
                customerName: checkoutForm.name,
                phone: checkoutForm.phone,
                address: checkoutForm.address,
                pincode: checkoutForm.pincode,
                items: orderItems,
                total: cartTotal,
                paymentMethod: checkoutForm.paymentMethod,
                status: 'Pending'
            });

            if (checkoutForm.paymentMethod === 'WhatsApp') {
                const orderDetails = cart.map(item =>
                    `• ${item.product.name} x${item.quantity} = ₹${item.product.price * item.quantity}`
                ).join('\n');

                const message = encodeURIComponent(
                    `🛒 *New Order from Divine Guidance Studio*\n\n` +
                    `*Customer Details:*\n` +
                    `Name: ${checkoutForm.name}\n` +
                    `Phone: ${checkoutForm.phone}\n` +
                    `Address: ${checkoutForm.address}\n` +
                    `Pincode: ${checkoutForm.pincode}\n` +
                    `Payment Mode: ${checkoutForm.paymentMethod}\n\n` +
                    `*Order Summary:*\n` +
                    `${orderDetails}\n\n` +
                    `*Total: ₹${cartTotal}*`
                );

                window.open(`https://wa.me/916397832791?text=${message}`, '_blank');
            } else {
                alert('Order placed successfully! We will contact you shortly.');
            }

            navigate('/shop');

        } catch (error: any) {
            console.error('Error placing order:', error);
            alert('Failed to place order: ' + (error?.message || error));
        } finally {
            setIsPlacingOrder(false);
        }
    };

    if (cart.length === 0) return null;

    return (
        <div className="min-h-screen bg-slate-50 pb-24 md:pb-12">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10 px-4 py-4 md:py-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link to="/shop" className="flex items-center gap-2 text-slate-500 hover:text-rose-500 transition-colors">
                        <span className="text-xl">←</span>
                        <span className="font-bold text-sm tracking-widest uppercase">Back to Shop</span>
                    </Link>
                    <h1 className="font-mystic text-xl md:text-2xl text-rose-900">Checkout</h1>
                    <div className="w-20"></div> {/* Spacer for center alignment */}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
                <div className="grid md:grid-cols-3 gap-6 md:gap-12">

                    {/* Left Column: Order Summary */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h2 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                                <span>📦</span> Order Summary
                            </h2>
                            <div className="space-y-4 divide-y divide-slate-100">
                                {cart.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 pt-4 first:pt-0">
                                        <div className="w-20 h-20 bg-slate-50 rounded-lg p-2 border border-slate-100 shrink-0">
                                            <img src={item.product.image} alt={item.product.name} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-slate-800 text-sm md:text-base">{item.product.name}</h4>
                                            <p className="text-xs text-slate-500 mb-1">{item.product.category}</p>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-xs font-bold bg-rose-50 text-rose-600 px-2 py-1 rounded">Qty: {item.quantity}</span>
                                                <span className="font-bold text-rose-600">₹{item.product.price * item.quantity}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-slate-100 mt-6 pt-4 flex justify-between items-center">
                                <span className="text-slate-500 font-bold">Total Amount</span>
                                <span className="text-2xl font-bold text-rose-600">₹{cartTotal}</span>
                            </div>
                        </div>

                        {/* Web Trust Badges */}
                        <div className="hidden md:grid grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
                                <div className="text-2xl mb-2">🔒</div>
                                <h4 className="font-bold text-xs text-slate-800">Secure Payment</h4>
                                <p className="text-[10px] text-slate-500">Encrypted Transactions</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
                                <div className="text-2xl mb-2">⚡</div>
                                <h4 className="font-bold text-xs text-slate-800">Fast Shipping</h4>
                                <p className="text-[10px] text-slate-500">Pan India Delivery</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
                                <div className="text-2xl mb-2">💎</div>
                                <h4 className="font-bold text-xs text-slate-800">Authentic</h4>
                                <p className="text-[10px] text-slate-500">100% Original Crystals</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Checkout Form */}
                    <div className="md:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
                            <h2 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
                                <span>🚚</span> Shipping Details
                            </h2>

                            <form onSubmit={handlePlaceOrder} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={checkoutForm.name}
                                        onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-rose-500 transition-all font-medium text-slate-800 placeholder:font-normal"
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Phone Number</label>
                                    <input
                                        required
                                        type="tel"
                                        value={checkoutForm.phone}
                                        onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-rose-500 transition-all font-medium text-slate-800 placeholder:font-normal"
                                        placeholder="+91 00000 00000"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Shipping Address</label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={checkoutForm.address}
                                        onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-rose-500 resize-none transition-all font-medium text-slate-800 placeholder:font-normal"
                                        placeholder="Flat/House No, Building, Street, Area"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Pincode</label>
                                    <input
                                        required
                                        type="number"
                                        value={checkoutForm.pincode}
                                        onChange={(e) => setCheckoutForm({ ...checkoutForm, pincode: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-rose-500 transition-all font-medium text-slate-800 placeholder:font-normal"
                                        placeholder="6-digit pincode"
                                    />
                                </div>

                                <div className="pt-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Payment Preference</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {['UPI', 'COD', 'WhatsApp'].map(method => (
                                            <label
                                                key={method}
                                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${checkoutForm.paymentMethod === method
                                                    ? 'bg-rose-50 border-rose-500 ring-1 ring-rose-500'
                                                    : 'bg-white border-slate-200 hover:border-rose-200'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    className="accent-rose-500 w-4 h-4"
                                                    checked={checkoutForm.paymentMethod === method}
                                                    onChange={() => setCheckoutForm({ ...checkoutForm, paymentMethod: method as any })}
                                                />
                                                <span className={`font-bold text-sm ${checkoutForm.paymentMethod === method ? 'text-rose-700' : 'text-slate-600'}`}>
                                                    {method}
                                                </span>
                                                {method === 'UPI' && <span className="ml-auto text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">FASTEST</span>}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Mobile Sticky Button Placeholder (for spacing) */}
                                <div className="hidden md:block pt-4">
                                    <button
                                        type="submit"
                                        disabled={isPlacingOrder}
                                        className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-70 disabled:cursor-wait text-white py-4 rounded-xl font-bold tracking-widest transition-all shadow-lg hover:shadow-rose-200 active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        {isPlacingOrder ? (
                                            <span>PLEASE WAIT...</span>
                                        ) : (
                                            <>
                                                <span>PLACE ORDER</span>
                                                <span className="text-rose-200">|</span>
                                                <span>₹{cartTotal}</span>
                                            </>
                                        )}
                                    </button>
                                    <p className="text-center text-[10px] text-slate-400 mt-3">
                                        Order confirmation will be sent via WhatsApp
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Mobile Action Button */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 shadow-2xl z-20">
                <button
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                    className="w-full bg-rose-500 text-white py-3.5 rounded-xl font-bold tracking-widest shadow-lg flex items-center justify-center gap-3 disabled:opacity-70"
                >
                    {isPlacingOrder ? 'PROCESSING...' : (
                        <>
                            <span>PLACE ORDER</span>
                            <span className="bg-rose-600 px-2 py-0.5 rounded text-white text-xs">₹{cartTotal}</span>
                        </>
                    )}
                </button>
            </div>

        </div>
    );
};

export default Checkout;
