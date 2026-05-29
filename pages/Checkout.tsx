
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Product } from '../types';
import { openPaymentModal, initializeRazorpay } from '../services/razorpayService';
import { addOrder, getUserProfile } from '../services/databaseService';
import { useAuth } from '../contexts/AuthContext';

interface CartItem extends Product {
    quantity: number;
}

const Checkout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    const [checkoutForm, setCheckoutForm] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        pincode: '',
        paymentMethod: 'Razorpay' as 'UPI' | 'COD' | 'WhatsApp' | 'Razorpay'
    });
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        // Priority 1: Check for Buy Now item in router state
        if (location.state?.buyNowItem) {
            const item = location.state.buyNowItem;
            setCart([{ ...item, quantity: 1 }]);
            setIsLoading(false);
            return;
        }

        // Priority 2: Read cart from localStorage (standard flow)
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                if (Array.isArray(parsedCart) && parsedCart.length > 0) {
                    setCart(parsedCart);
                    setIsLoading(false);
                } else {
                    navigate('/shop');
                }
            } catch {
                navigate('/shop');
            }
        } else {
            navigate('/shop');
        }
    }, [navigate, location.state]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (user) {
                const profile = await getUserProfile(user.uid);
                if (profile) {
                    setCheckoutForm(prev => ({
                        ...prev,
                        name: profile.name || prev.name || user.displayName || '',
                        email: profile.email || prev.email || user.email || '',
                        phone: profile.phone || prev.phone || '',
                        address: profile.address || prev.address || '',
                        pincode: profile.pincode || prev.pincode || ''
                    }));
                } else if (user.displayName || user.email) {
                    // Fallback to auth data if no profile saved yet
                    setCheckoutForm(prev => ({
                        ...prev,
                        name: prev.name || user.displayName || '',
                        email: prev.email || user.email || ''
                    }));
                }
            }
        };
        fetchUserProfile();
    }, [user]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-rose-500">Loading...</p>
                </div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-600 mb-4">Your cart is empty</p>
                    <Link to="/shop" className="bg-rose-500 text-white px-6 py-3 rounded-full font-bold">
                        Go to Shop
                    </Link>
                </div>
            </div>
        );
    }

    const cartTotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0);

    const handlePlaceOrder = async (e: React.FormEvent) => {
        if (e) e.preventDefault();
        
        // Validate form
        if (!checkoutForm.name || !checkoutForm.email || !checkoutForm.phone || !checkoutForm.address || !checkoutForm.pincode) {
            alert('Please fill in all required fields');
            return;
        }

        setIsProcessing(true);

        try {
            // Create order in database
            const orderData = {
                customerName: checkoutForm.name,
                email: checkoutForm.email,
                phone: checkoutForm.phone,
                address: checkoutForm.address,
                pincode: checkoutForm.pincode,
                items: cart.map(item => ({ 
                    productId: item.id, 
                    name: item.name, 
                    quantity: item.quantity,
                    price: Number(item.price) || 0
                })),
                total: cartTotal,
                paymentMethod: checkoutForm.paymentMethod,
                status: 'Pending' as const,
            };

            // If COD, process immediately
            if (checkoutForm.paymentMethod === 'COD') {
                try {
                    await addOrder(orderData);
                    alert('Order placed successfully! We will contact you soon for confirmation.');
                    if (!location.state?.buyNowItem) {
                        localStorage.removeItem('cart');
                    }
                    navigate('/shop');
                } catch (dbErr: any) {
                    console.error('Database error:', dbErr);
                    alert('Error saving order: ' + (dbErr.message || 'Please try again'));
                } finally {
                    setIsProcessing(false);
                }
                return;
            }

            // If WhatsApp, process order and redirect to WhatsApp
            if (checkoutForm.paymentMethod === 'WhatsApp') {
                try {
                    await addOrder(orderData);
                    
                    // Create formatted WhatsApp message
                    const cartItemsText = cart.map(item => `${item.quantity}x ${item.name} (- ₹${(Number(item.price) || 0) * item.quantity})`).join('%0a');
                    const message = `Hi! I would like to place an order.%0a%0a*Order Details:*%0a${cartItemsText}%0a*Total Amount:* ₹${cartTotal}%0a%0a*Customer Details:*%0aName: ${checkoutForm.name}%0aPhone: ${checkoutForm.phone}%0aEmail: ${checkoutForm.email}%0aAddress: ${checkoutForm.address}, Pincode: ${checkoutForm.pincode}%0a%0aThank you!`;
                    
                    if (!location.state?.buyNowItem) {
                        localStorage.removeItem('cart');
                    }
                    
                    // Use window.location.href instead of window.open to avoid mobile popup blockers after async await
                    window.location.href = `https://wa.me/916397832791?text=${message}`;
                } catch (dbErr: any) {
                    console.error('Database error:', dbErr);
                    alert('Error saving order: ' + (dbErr.message || 'Please try again'));
                } finally {
                    setIsProcessing(false);
                }
                return;
            }

            // Online Payment Flow (Razorpay)
            // Initialize Razorpay SDK
            await initializeRazorpay();

            // Open payment modal — order is ONLY saved after successful payment
            openPaymentModal(
                cartTotal,
                {
                    name: checkoutForm.name,
                    email: checkoutForm.email,
                    contact: checkoutForm.phone,
                    desc: `Order for ${checkoutForm.name}`
                },
                async (response: any) => {
                    // Payment SUCCESS — now save order to database
                    console.log('Payment Success:', response);
                    try {
                        await addOrder({
                            ...orderData,
                            status: 'Completed' as const,
                            transactionId: response.razorpay_payment_id || '',
                        });
                    } catch (dbErr) {
                        console.error('Order save error after payment:', dbErr);
                    }
                    alert('Payment successful! Thank you for your order. Order ID: ' + response.razorpay_payment_id);
                    if (!location.state?.buyNowItem) {
                        localStorage.removeItem('cart');
                    }
                    navigate('/shop');
                },
                (error: any) => {
                    // Payment FAILED or CLOSED — no order is saved
                    console.error('Payment Failed:', error);
                    setIsProcessing(false);
                }
            );
        } catch (err: any) {
            console.error('Checkout Error:', err);
            alert('Error processing order: ' + (err.message || 'Please try again'));
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24 md:pb-12 relative">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10 px-4 py-4 md:py-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link to="/shop" className="flex items-center gap-2 text-slate-500 hover:text-rose-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span className="font-bold text-sm tracking-widest uppercase">Back to Shop</span>
                    </Link>
                    <h1 className="font-mystic text-xl md:text-2xl text-rose-900">Checkout</h1>
                    <div className="w-20"></div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
                <div className="flex flex-col md:grid md:grid-cols-3 gap-6 md:gap-8 items-start">

                    {/* Order Summary */}
                    <div className="md:col-span-2 md:col-start-1 md:row-start-1 order-1 w-full bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-rose-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                            </svg> Order Summary
                        </h2>
                            <div className="space-y-4 divide-y divide-slate-100">
                                {cart.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 pt-4 first:pt-0">
                                        <div className="w-20 h-20 bg-slate-50 rounded-lg p-2 border border-slate-100 shrink-0">
                                            {item.image && (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-slate-800 text-sm md:text-base">{item.name}</h4>
                                            <p className="text-xs text-slate-500 mb-1">{item.category}</p>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-xs font-bold bg-rose-50 text-rose-600 px-2 py-1 rounded">Qty: {item.quantity}</span>
                                                <span className="font-bold text-rose-600">₹{(Number(item.price) || 0) * item.quantity}</span>
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

                    {/* Payment Method Selection */}
                    <div className="md:col-span-2 md:col-start-1 md:row-start-2 order-3 w-full">
                        <h3 className="text-[11px] font-bold text-slate-400 mb-3 tracking-wider uppercase">Payment Method</h3>
                        <div className="grid grid-cols-3 gap-3">
                                {/* Online */}
                                <div
                                    onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: 'Razorpay' })}
                                    className={`py-3 px-2 rounded-xl border cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${checkoutForm.paymentMethod === 'Razorpay' ? 'bg-[#0f172a] border-[#0f172a] text-white' : 'bg-white border-slate-300 text-slate-800 hover:border-slate-400'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75-10.5h16.5a1.5 1.5 0 011.5 1.5v10.5a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5V5.25a1.5 1.5 0 011.5-1.5z" />
                                    </svg>
                                    <span className="text-[11px] font-bold tracking-widest">ONLINE</span>
                                </div>
                                {/* COD */}
                                <div
                                    onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: 'COD' })}
                                    className={`py-3 px-2 rounded-xl border cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${checkoutForm.paymentMethod === 'COD' ? 'bg-[#0f172a] border-[#0f172a] text-white' : 'bg-white border-slate-300 text-slate-800 hover:border-slate-400'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <rect width="18" height="12" x="3" y="6" rx="2" ry="2" />
                                        <circle cx="12" cy="12" r="2" />
                                        <path d="M7 10h.01M17 10h.01M7 14h.01M17 14h.01" />
                                    </svg>
                                    <span className="text-[11px] font-bold tracking-widest">COD</span>
                                </div>
                                {/* WhatsApp */}
                                <div
                                    onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: 'WhatsApp' })}
                                    className={`py-3 px-2 rounded-xl border cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${checkoutForm.paymentMethod === 'WhatsApp' ? 'bg-[#0f172a] border-[#0f172a] text-white' : 'bg-white border-slate-300 text-slate-800 hover:border-slate-400'}`}
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.488-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                    </svg>
                                    <span className="text-[11px] font-bold tracking-widest">WHATSAPP</span>
                            </div>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="md:col-span-2 md:col-start-1 md:row-start-3 order-4 w-full bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
                        <div className="text-center flex flex-col items-center justify-center flex-1">
                            <div className="w-6 h-6 mb-1 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-600">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25Z" />
                                    </svg>
                                </div>
                                <h4 className="font-bold text-[9px] text-slate-800 leading-tight">Secure<br/>Payment</h4>
                            </div>
                            <div className="w-[1px] h-8 bg-slate-100 mx-1"></div>
                            <div className="text-center flex flex-col items-center justify-center flex-1">
                                <div className="w-6 h-6 mb-1 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-rose-500">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                                    </svg>
                                </div>
                                <h4 className="font-bold text-[9px] text-slate-800 leading-tight">Fast<br/>Shipping</h4>
                            </div>
                            <div className="w-[1px] h-8 bg-slate-100 mx-1"></div>
                            <div className="text-center flex flex-col items-center justify-center flex-1">
                                <div className="w-6 h-6 mb-1 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-purple-500">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                                    </svg>
                                </div>
                                <h4 className="font-bold text-[9px] text-slate-800 leading-tight">Authentic<br/>Product</h4>
                            </div>
                            <div className="w-[1px] h-8 bg-slate-100 mx-1"></div>
                            <div className="text-center flex flex-col items-center justify-center flex-1">
                                <div className="w-6 h-6 mb-1 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-500">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                                    </svg>
                                </div>
                            <h4 className="font-bold text-[9px] text-slate-800 leading-tight">Easy<br/>Returns</h4>
                        </div>
                    </div>

                    {/* Right Column: Checkout Form / Shipping Details */}
                    <div className="md:col-span-1 md:col-start-3 md:row-start-1 md:row-span-3 order-2 w-full">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
                            <h2 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-rose-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                </svg> Shipping Details
                            </h2>

                            <form onSubmit={handlePlaceOrder} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={checkoutForm.name}
                                        onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-rose-500 transition-all font-medium text-slate-800"
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        value={checkoutForm.email}
                                        onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-rose-500 transition-all font-medium text-slate-800"
                                        placeholder="example@gmail.com"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Phone Number</label>
                                    <input
                                        required
                                        type="tel"
                                        value={checkoutForm.phone}
                                        onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-rose-500 transition-all font-medium text-slate-800"
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
                                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-rose-500 resize-none transition-all font-medium text-slate-800"
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
                                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-rose-500 transition-all font-medium text-slate-800"
                                        placeholder="6-digit pincode"
                                    />
                                </div>

                                <div className="hidden md:block pt-4">
                                    <button
                                        type="submit"
                                        disabled={isProcessing}
                                        className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold tracking-widest transition-all shadow-lg hover:shadow-rose-200 active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <span>{checkoutForm.paymentMethod === 'WhatsApp' ? 'ORDER VIA WHATSAPP' : checkoutForm.paymentMethod === 'COD' ? 'PLACE ORDER (COD)' : 'PLACE ORDER'}</span>
                                                <span className="text-rose-200">|</span>
                                                <span>₹{cartTotal}</span>
                                            </>
                                        )}
                                    </button>
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
                    disabled={isProcessing}
                    className="w-full bg-rose-500 text-white py-3.5 rounded-xl font-bold tracking-widest shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isProcessing ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Processing...
                        </>
                    ) : (
                        <>
                            <span>{checkoutForm.paymentMethod === 'WhatsApp' ? 'ORDER VIA WHATSAPP' : checkoutForm.paymentMethod === 'COD' ? 'PLACE ORDER (COD)' : 'PLACE ORDER'}</span>
                            <span className="text-rose-200/50 font-light">|</span>
                            <span>₹{cartTotal}</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Checkout;
