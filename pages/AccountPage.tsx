import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProductCard from '../components/ProductCard';
import { getUserProfile, updateUserProfile, getUserOrders } from '../services/databaseService';
import { UserProfile, Order, Product } from '../types';
import { User, MapPin, Package, LogOut, LogIn, Save, ChevronRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const AccountPage = ({ products }: { products: Product[] }) => {
  const { user, signInWithGoogle, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'address'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Recommended products (just taking the first 4 for demonstration)
  const recommendedProducts = (products || []).slice(0, 4);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const fetchedOrders = await getUserOrders(user.email || '');
          setOrders(fetchedOrders);
          
          const fetchedProfile = await getUserProfile(user.uid);
          if (fetchedProfile) {
            setProfile(fetchedProfile);
          } else {
            // Initialize with auth defaults if no profile exists
            setProfile({
              name: user.displayName || '',
              email: user.email || '',
              phone: '',
              address: '',
              pincode: ''
            });
          }
        } catch (error) {
          console.error("Error fetching account data:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const saveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateUserProfile(user.uid, profile);
      alert('Address saved successfully!');
    } catch (error) {
      console.error("Failed to save profile", error);
      alert('Failed to save address.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-32 pb-24 min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-3xl p-8 shadow-sm text-center mb-12">
            <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">My Account</h1>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Login to view your orders, manage your saved addresses, and experience faster checkouts.
            </p>
            <button 
              onClick={signInWithGoogle}
              className="inline-flex items-center justify-center gap-3 bg-rose-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200"
            >
              <LogIn className="w-5 h-5" />
              <span>Login with Google</span>
            </button>
          </div>

          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-rose-500" />
              Keep Shopping
            </h2>
            <Link to="/shop" className="text-sm font-semibold text-rose-600 flex items-center hover:text-rose-700">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommendedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 lg:pt-32 pb-24 min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Profile Header */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm mb-8 flex flex-col md:flex-row items-center md:justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 overflow-hidden shrink-0 shadow-sm border-4 border-white">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10" />
              )}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
                {user.displayName || 'Welcome Back'}
              </h1>
              <p className="text-slate-500 font-medium break-all">
                {user.email}
              </p>
            </div>
          </div>
            <button 
              onClick={logout}
              className="flex items-center gap-2 text-slate-500 hover:text-rose-600 font-medium px-4 py-2 rounded-xl hover:bg-rose-50 transition-colors w-full md:w-auto justify-center md:justify-start"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-2 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible no-scrollbar">
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors whitespace-nowrap ${
                  activeTab === 'orders' 
                    ? 'bg-rose-50 text-rose-700 font-semibold' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Package className="w-5 h-5" />
                <span>My Orders</span>
              </button>
              <button
                onClick={() => setActiveTab('address')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors whitespace-nowrap ${
                  activeTab === 'address' 
                    ? 'bg-rose-50 text-rose-700 font-semibold' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <MapPin className="w-5 h-5" />
                <span>Saved Addresses</span>
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 min-h-[400px]">
              
              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="animate-fade-in">
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Package className="w-6 h-6 text-rose-600" />
                    Past Orders
                  </h2>
                  
                  {orders.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag className="w-10 h-10 text-slate-300" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-700 mb-2">No orders yet</h3>
                      <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                        You haven't placed any orders. Start exploring our healing crystals collection!
                      </p>
                      <Link 
                        to="/shop"
                        className="inline-flex bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-rose-600 transition-colors"
                      >
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map(order => (
                        <div key={order.id} className="border border-slate-200 rounded-2xl p-5 hover:border-rose-200 hover:shadow-md transition-all">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-slate-100">
                            <div>
                              <span className="text-xs font-bold tracking-widest text-slate-400 block mb-1">ORDER ID</span>
                              <span className="font-mono text-sm text-slate-700 bg-slate-50 px-2 py-1 rounded-md">
                                {order.id.slice(0, 8).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <span className="text-xs font-bold tracking-widest text-slate-400 block mb-1">DATE</span>
                                <span className="text-sm font-medium text-slate-700">
                                  {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Recent'}
                                </span>
                              </div>
                              <div className="h-8 w-px bg-slate-200"></div>
                              <div className="text-right">
                                <span className="text-xs font-bold tracking-widest text-slate-400 block mb-1">STATUS</span>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                  order.status === 'Completed' || order.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                                  order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                  'bg-amber-100 text-amber-700'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-3 mb-4">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                                    {item.quantity}x
                                  </span>
                                  <span className="text-slate-700 font-medium">{item.name}</span>
                                </div>
                                <span className="text-slate-900 font-semibold">₹{item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                            <span className="text-sm font-semibold text-slate-500">Total Amount</span>
                            <span className="text-lg font-bold text-rose-600">₹{order.total}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Address Tab */}
              {activeTab === 'address' && (
                <div className="animate-fade-in max-w-2xl">
                  <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-rose-600" />
                    Saved Address
                  </h2>
                  <p className="text-slate-500 text-sm mb-8">
                    Save your shipping details here to enjoy a faster, seamless checkout experience.
                  </p>
                  
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold tracking-widest text-slate-500 mb-2">FULL NAME</label>
                        <input
                          type="text"
                          name="name"
                          value={profile.name || ''}
                          onChange={handleProfileChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all text-slate-900 font-medium"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold tracking-widest text-slate-500 mb-2">PHONE NUMBER</label>
                        <input
                          type="tel"
                          name="phone"
                          value={profile.phone || ''}
                          onChange={handleProfileChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all text-slate-900 font-medium"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold tracking-widest text-slate-500 mb-2">EMAIL (READ-ONLY)</label>
                      <input
                        type="email"
                        value={user.email || ''}
                        disabled
                        className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-slate-500 font-medium cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold tracking-widest text-slate-500 mb-2">SHIPPING ADDRESS</label>
                      <textarea
                        name="address"
                        value={profile.address || ''}
                        onChange={handleProfileChange}
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all text-slate-900 font-medium resize-none"
                        placeholder="House/Flat No., Building Name, Street, Area"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold tracking-widest text-slate-500 mb-2">PINCODE / POSTAL CODE</label>
                      <input
                        type="text"
                        name="pincode"
                        value={profile.pincode || ''}
                        onChange={handleProfileChange}
                        className="w-full md:w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all text-slate-900 font-medium"
                        placeholder="110001"
                      />
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <button
                        onClick={saveProfile}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-rose-600 transition-colors shadow-md shadow-slate-200 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isSaving ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Save className="w-5 h-5" />
                        )}
                        <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
