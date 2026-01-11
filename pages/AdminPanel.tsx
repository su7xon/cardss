
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Product, Booking, Testimonial, AdminView, SiteSettings, Service, AboutContent } from '../types';
import { 
  updateBooking as updateBookingInDB, 
  deleteBooking as deleteBookingFromDB,
  updateTestimonial as updateTestimonialInDB,
  deleteTestimonial as deleteTestimonialFromDB,
  addProduct as addProductToDB,
  updateProduct as updateProductInDB,
  deleteProduct as deleteProductFromDB,
  subscribeToSettings,
  updateAboutContent,
  updateServices,
  getDefaultSettings
} from '../services/databaseService';
import { uploadImage } from '../services/imageUpload';

interface AdminPanelProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  testimonials: Testimonial[];
  setTestimonials: React.Dispatch<React.SetStateAction<Testimonial[]>>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  products, setProducts, 
  bookings, setBookings, 
  testimonials, setTestimonials 
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [view, setView] = useState<AdminView>(AdminView.DASHBOARD);
  
  // Product form state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [productForm, setProductForm] = useState({
    name: '',
    price: 0,
    description: '',
    metaphysicalProperties: '',
    image: '',
    category: 'Crystal' as 'Crystal' | 'Jewelry' | 'Aura',
    stock: 0
  });

  // Settings state
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(getDefaultSettings());
  const [aboutForm, setAboutForm] = useState<AboutContent>(getDefaultSettings().about);
  const [servicesForm, setServicesForm] = useState<Service[]>(getDefaultSettings().services);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [aboutImageFile, setAboutImageFile] = useState<File | null>(null);
  const [aboutImagePreview, setAboutImagePreview] = useState<string | null>(null);
  const aboutFileInputRef = useRef<HTMLInputElement>(null);

  // Load settings from Firebase
  useEffect(() => {
    const unsubscribe = subscribeToSettings((settings) => {
      setSiteSettings(settings);
      setAboutForm(settings.about);
      setServicesForm(settings.services);
    });
    return () => unsubscribe();
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      price: 0,
      description: '',
      metaphysicalProperties: '',
      image: '',
      category: 'Crystal',
      stock: 0
    });
    setEditingProduct(null);
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      let imageUrl = productForm.image;
      
      // Upload new image if selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }
      
      if (!imageUrl && !editingProduct) {
        alert('Please add a product image');
        setIsUploading(false);
        return;
      }
      
      const productData = { ...productForm, image: imageUrl };
      
      if (editingProduct) {
        await updateProductInDB(editingProduct.id, productData);
      } else {
        await addProductToDB(productData);
      }
      setShowProductModal(false);
      resetProductForm();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product. Check your ImgBB API key.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Delete this product?')) {
      try {
        await deleteProductFromDB(id);
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      }
    }
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price,
      description: product.description,
      metaphysicalProperties: product.metaphysicalProperties,
      image: product.image,
      category: product.category,
      stock: product.stock
    });
    setShowProductModal(true);
  };

  // Dynamic Analytics Calculations
  const analytics = useMemo(() => {
    const totalSales = bookings
      .filter(b => b.status !== 'Pending') // Assuming only confirmed/completed count as revenue
      .reduce((sum, b) => sum + (b.price || 0), 0);
    
    const pendingCount = bookings.filter(b => b.status === 'Pending').length;
    
    // Calculate most booked slots
    const slotCounts: Record<string, number> = {};
    bookings.forEach(b => {
      slotCounts[b.time] = (slotCounts[b.time] || 0) + 1;
    });
    const sortedSlots = Object.entries(slotCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    return { totalSales, pendingCount, sortedSlots };
  }, [bookings]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'pooja.gupta001') { 
      setIsLoggedIn(true);
    } else {
      alert('Incorrect Password');
    }
  };

  const updateBookingStatus = async (id: string, newStatus: 'Confirmed' | 'Completed') => {
    try {
      await updateBookingInDB(id, { status: newStatus });
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking status');
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (window.confirm('Delete this booking?')) {
      try {
        await deleteBookingFromDB(id);
      } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Failed to delete booking');
      }
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-slate-900 p-10 rounded-3xl border border-rose-900/30 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-rose-500/20 text-rose-300 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-mystic text-rose-100 mb-8">Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="password" 
              placeholder="Enter Admin Password" 
              className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none focus:border-rose-500 text-center"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="w-full bg-rose-500 py-4 rounded-xl font-bold tracking-widest text-white shadow-lg">
              LOG IN
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-64 space-y-2">
        <h2 className="font-mystic text-rose-300 text-xl px-4 mb-6">Pooja's Dashboard</h2>
        {[
          { id: AdminView.DASHBOARD, name: 'Analytics', icon: '📊' },
          { id: AdminView.APPOINTMENTS, name: 'Bookings', icon: '📅' },
          { id: AdminView.INVENTORY, name: 'Inventory', icon: '📦' },
          { id: AdminView.MODERATION, name: 'Reviews', icon: '⭐' },
          { id: AdminView.SETTINGS, name: 'Settings', icon: '⚙️' },
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${view === item.id ? 'bg-rose-500 text-white font-bold shadow-lg' : 'text-slate-400 hover:bg-slate-900 hover:text-rose-200'}`}
          >
            <span>{item.icon}</span>
            {item.name}
          </button>
        ))}
        <button onClick={() => setIsLoggedIn(false)} className="w-full flex items-center gap-4 px-6 py-4 rounded-xl text-red-400 hover:bg-red-500/10 mt-10">
          <span>🚪</span> Logout
        </button>
      </aside>

      <main className="flex-grow bg-slate-900/30 border border-slate-800 rounded-3xl p-8 min-h-[600px]">
        {view === AdminView.DASHBOARD && (
          <div className="space-y-8 animate-fade-in">
            <h3 className="text-2xl font-mystic text-rose-100">Business Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                <p className="text-slate-500 text-xs uppercase font-bold tracking-widest mb-2">Total Revenue</p>
                <p className="text-4xl font-mystic text-rose-400">₹{analytics.totalSales.toLocaleString()}</p>
              </div>
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                <p className="text-slate-500 text-xs uppercase font-bold tracking-widest mb-2">Pending Sessions</p>
                <p className="text-4xl font-mystic text-rose-400">{analytics.pendingCount}</p>
              </div>
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                <p className="text-slate-500 text-xs uppercase font-bold tracking-widest mb-2">Active Inventory</p>
                <p className="text-4xl font-mystic text-rose-400">{products.length}</p>
              </div>
            </div>
            
            <div className="mt-10">
              <h4 className="text-rose-200 font-bold mb-4">Most Booked Slots</h4>
              <div className="space-y-3">
                {analytics.sortedSlots.length > 0 ? analytics.sortedSlots.map(([slot, count]) => (
                  <div key={slot} className="bg-slate-950 h-12 rounded-lg flex items-center px-4 overflow-hidden relative">
                    <div className="absolute left-0 top-0 bottom-0 bg-rose-500/20" style={{ width: `${(count / bookings.length) * 100}%` }}></div>
                    <span className="relative z-10 text-slate-300 text-sm font-bold">{slot}</span>
                    <span className="relative z-10 ml-auto text-rose-400 text-xs">{count} bookings</span>
                  </div>
                )) : (
                  <p className="text-slate-500 text-sm">No bookings recorded yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {view === AdminView.APPOINTMENTS && (
          <div className="space-y-8 animate-fade-in">
            <h3 className="text-2xl font-mystic text-rose-100">Appointment Dashboard</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-widest">
                    <th className="py-4 font-bold">Client</th>
                    <th className="py-4 font-bold">Service</th>
                    <th className="py-4 font-bold">Date/Time</th>
                    <th className="py-4 font-bold">Status</th>
                    <th className="py-4 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {bookings.length > 0 ? bookings.map(booking => (
                    <tr key={booking.id} className="border-b border-slate-800/50 hover:bg-slate-950/40 transition-colors">
                      <td className="py-4 pr-4">
                        <p className="font-bold text-rose-100">{booking.clientName}</p>
                        <p className="text-xs text-slate-500">{booking.email}</p>
                      </td>
                      <td className="py-4 text-slate-300">
                        {booking.service}
                        <p className="text-[10px] text-rose-400 font-bold">₹{booking.price}</p>
                      </td>
                      <td className="py-4 text-slate-300">{booking.date} @ {booking.time}</td>
                      <td className="py-4">
                        <select 
                          value={booking.status}
                          onChange={(e) => updateBookingStatus(booking.id, e.target.value as any)}
                          className={`bg-slate-950 border border-slate-800 text-[10px] uppercase font-bold p-1 rounded ${booking.status === 'Confirmed' ? 'text-green-400' : 'text-yellow-400'}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                      <td className="py-4 flex gap-2">
                         {booking.birthDetails && <button title="View Birth Info" className="text-rose-400 hover:scale-110 transition-transform">📜</button>}
                         <button onClick={() => handleDeleteBooking(booking.id)} title="Delete" className="text-red-400 hover:scale-110 transition-transform">🗑️</button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-500">No bookings found. Try booking a session first!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === AdminView.INVENTORY && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-mystic text-rose-100">Inventory Management</h3>
              <button 
                onClick={() => { resetProductForm(); setShowProductModal(true); }}
                className="bg-rose-500 text-white px-6 py-2 rounded-xl font-bold text-sm tracking-widest hover:bg-rose-600 transition-colors"
              >
                + ADD PRODUCT
              </button>
            </div>
            <div className="grid gap-4">
              {products.length > 0 ? products.map(product => (
                <div key={product.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-6">
                  <img src={product.image} className="w-16 h-16 rounded-xl object-cover" alt={product.name} />
                  <div className="flex-grow">
                    <h4 className="font-bold text-rose-100">{product.name}</h4>
                    <p className="text-xs text-slate-500 uppercase tracking-widest">{product.category}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">Stock</p>
                    <p className={`font-bold ${product.stock < 5 ? 'text-red-400' : 'text-slate-300'}`}>{product.stock}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-1">Price</p>
                    <p className="font-bold text-rose-400">₹{product.price}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button 
                      onClick={() => openEditProduct(product)}
                      className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-300 transition-colors"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )) : (
                <p className="text-slate-500 text-center py-10">No products in inventory. Add your first product!</p>
              )}
            </div>
          </div>
        )}

        {/* Product Modal */}
        {showProductModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <div className="bg-slate-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-rose-500/20 shadow-2xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-mystic text-rose-100">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button 
                  onClick={() => { setShowProductModal(false); resetProductForm(); }}
                  className="text-slate-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleProductSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Product Name</label>
                    <input 
                      required
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:border-rose-500 outline-none"
                      placeholder="e.g., Amethyst Cluster"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Category</label>
                    <select 
                      value={productForm.category}
                      onChange={(e) => setProductForm({...productForm, category: e.target.value as any})}
                      className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:border-rose-500 outline-none"
                    >
                      <option value="Crystal">Crystal</option>
                      <option value="Jewelry">Jewelry</option>
                      <option value="Aura">Aura</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Price (₹)</label>
                    <input 
                      required
                      type="number"
                      min="0"
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: Number(e.target.value)})}
                      className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:border-rose-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Stock</label>
                    <input 
                      required
                      type="number"
                      min="0"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({...productForm, stock: Number(e.target.value)})}
                      className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:border-rose-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Product Image</label>
                  
                  {/* File Upload */}
                  <div className="flex gap-4 items-start">
                    <div className="flex-grow">
                      <input 
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        id="product-image-upload"
                      />
                      <label 
                        htmlFor="product-image-upload"
                        className="flex items-center justify-center gap-2 w-full bg-slate-950 border-2 border-dashed border-slate-700 hover:border-rose-500 p-4 rounded-xl cursor-pointer transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-slate-400 text-sm">
                          {imageFile ? imageFile.name : 'Tap to upload image'}
                        </span>
                      </label>
                    </div>
                    {(imagePreview || productForm.image) && (
                      <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-700 flex-shrink-0">
                        <img 
                          src={imagePreview || productForm.image} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* OR divider */}
                  <div className="flex items-center gap-3 py-2">
                    <div className="flex-grow h-px bg-slate-800"></div>
                    <span className="text-slate-600 text-xs">OR paste URL</span>
                    <div className="flex-grow h-px bg-slate-800"></div>
                  </div>
                  
                  {/* URL Input */}
                  <input 
                    type="url"
                    value={productForm.image}
                    onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:border-rose-500 outline-none text-sm"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Description</label>
                  <textarea 
                    required
                    rows={2}
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:border-rose-500 outline-none resize-none"
                    placeholder="Brief product description..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Metaphysical Properties</label>
                  <textarea 
                    required
                    rows={3}
                    value={productForm.metaphysicalProperties}
                    onChange={(e) => setProductForm({...productForm, metaphysicalProperties: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:border-rose-500 outline-none resize-none"
                    placeholder="Healing properties, chakras, zodiac signs..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => { setShowProductModal(false); resetProductForm(); }}
                    className="flex-1 bg-slate-800 text-white py-3 rounded-xl font-bold tracking-widest hover:bg-slate-700 transition-colors"
                  >
                    CANCEL
                  </button>
                  <button 
                    type="submit"
                    disabled={isUploading}
                    className="flex-1 bg-rose-500 text-white py-3 rounded-xl font-bold tracking-widest hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        UPLOADING...
                      </>
                    ) : (
                      editingProduct ? 'UPDATE PRODUCT' : 'ADD PRODUCT'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {view === AdminView.MODERATION && (
          <div className="space-y-8 animate-fade-in">
            <h3 className="text-2xl font-mystic text-rose-100">Review Moderation</h3>
            <div className="grid gap-6">
              {testimonials.length > 0 ? testimonials.map(t => (
                <div key={t.id} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 relative">
                   <div className="absolute top-6 right-6 flex gap-3">
                    {!t.isModerated && (
                      <button 
                        onClick={async () => {
                          try {
                            await updateTestimonialInDB(t.id, { isModerated: true });
                          } catch (error) {
                            console.error('Error approving testimonial:', error);
                            alert('Failed to approve testimonial');
                          }
                        }}
                        className="bg-green-500/20 text-green-400 px-4 py-2 rounded-xl text-xs font-bold"
                      >
                        APPROVE
                      </button>
                    )}
                    <button 
                      onClick={async () => {
                        if (window.confirm('Delete this testimonial?')) {
                          try {
                            await deleteTestimonialFromDB(t.id);
                          } catch (error) {
                            console.error('Error deleting testimonial:', error);
                            alert('Failed to delete testimonial');
                          }
                        }
                      }} 
                      className="bg-red-500/20 text-red-400 px-4 py-2 rounded-xl text-xs font-bold"
                    >
                      DELETE
                    </button>
                  </div>
                  <div className="flex gap-1 text-yellow-500 mb-2">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                  <p className="text-slate-300 italic mb-4 max-w-lg">"{t.text}"</p>
                  <p className="text-rose-100 font-bold">{t.name}</p>
                </div>
              )) : (
                <p className="text-slate-500 text-center py-10">No reviews submitted yet.</p>
              )}
            </div>
          </div>
        )}

        {view === AdminView.SETTINGS && (
          <div className="space-y-8 animate-fade-in">
            <h3 className="text-2xl font-mystic text-rose-100">Site Settings</h3>
            
            {/* About Section Settings */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <h4 className="text-lg font-mystic text-rose-200 mb-6 flex items-center gap-2">
                <span>👤</span> About Section (Practitioner Info)
              </h4>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Title</label>
                  <input 
                    type="text"
                    value={aboutForm.title}
                    onChange={(e) => setAboutForm({...aboutForm, title: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl focus:border-rose-500 outline-none"
                    placeholder="e.g., The Practitioner"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Description</label>
                  <textarea 
                    rows={4}
                    value={aboutForm.description}
                    onChange={(e) => setAboutForm({...aboutForm, description: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl focus:border-rose-500 outline-none resize-none"
                    placeholder="Your bio and experience..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Profile Image</label>
                  <div className="flex gap-4 items-start">
                    <div className="flex-grow">
                      <input 
                        ref={aboutFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setAboutImageFile(file);
                            const reader = new FileReader();
                            reader.onloadend = () => setAboutImagePreview(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                        id="about-image-upload"
                      />
                      <label 
                        htmlFor="about-image-upload"
                        className="flex items-center justify-center gap-2 w-full bg-slate-900 border-2 border-dashed border-slate-700 hover:border-rose-500 p-4 rounded-xl cursor-pointer transition-colors"
                      >
                        <span className="text-slate-400 text-sm">
                          {aboutImageFile ? aboutImageFile.name : 'Tap to upload new image'}
                        </span>
                      </label>
                    </div>
                    {(aboutImagePreview || aboutForm.image) && (
                      <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-700 flex-shrink-0">
                        <img src={aboutImagePreview || aboutForm.image} alt="Preview" className="w-full h-full object-cover"/>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Credentials (one per line)</label>
                  <textarea 
                    rows={4}
                    value={aboutForm.credentials.join('\n')}
                    onChange={(e) => setAboutForm({...aboutForm, credentials: e.target.value.split('\n').filter(c => c.trim())})}
                    className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl focus:border-rose-500 outline-none resize-none"
                    placeholder="Certified Vedic Astrologer&#10;Crystal Healing Practitioner&#10;Tarot Reader"
                  />
                </div>

                <button
                  onClick={async () => {
                    setSettingsSaving(true);
                    try {
                      let imageUrl = aboutForm.image;
                      if (aboutImageFile) {
                        imageUrl = await uploadImage(aboutImageFile);
                      }
                      await updateAboutContent({ ...aboutForm, image: imageUrl });
                      setAboutImageFile(null);
                      setAboutImagePreview(null);
                      alert('About section updated!');
                    } catch (error) {
                      console.error('Error saving about:', error);
                      alert('Failed to save about section');
                    } finally {
                      setSettingsSaving(false);
                    }
                  }}
                  disabled={settingsSaving}
                  className="bg-rose-500 text-white px-6 py-3 rounded-xl font-bold tracking-widest hover:bg-rose-600 transition-colors disabled:opacity-50"
                >
                  {settingsSaving ? 'SAVING...' : 'SAVE ABOUT SECTION'}
                </button>
              </div>
            </div>

            {/* Service Pricing Settings */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <h4 className="text-lg font-mystic text-rose-200 mb-6 flex items-center gap-2">
                <span>💰</span> Service Pricing
              </h4>
              
              <div className="space-y-4">
                {servicesForm.map((service, index) => (
                  <div key={service.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-500 uppercase">Icon</label>
                        <input 
                          type="text"
                          value={service.icon}
                          onChange={(e) => {
                            const updated = [...servicesForm];
                            updated[index] = {...service, icon: e.target.value};
                            setServicesForm(updated);
                          }}
                          className="w-full bg-slate-950 border border-slate-800 p-2 rounded-lg focus:border-rose-500 outline-none text-center text-xl"
                          maxLength={2}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-500 uppercase">Service Name</label>
                        <input 
                          type="text"
                          value={service.name}
                          onChange={(e) => {
                            const updated = [...servicesForm];
                            updated[index] = {...service, name: e.target.value};
                            setServicesForm(updated);
                          }}
                          className="w-full bg-slate-950 border border-slate-800 p-2 rounded-lg focus:border-rose-500 outline-none text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-500 uppercase">Price (₹)</label>
                        <input 
                          type="number"
                          min="0"
                          value={service.price}
                          onChange={(e) => {
                            const updated = [...servicesForm];
                            updated[index] = {...service, price: Number(e.target.value)};
                            setServicesForm(updated);
                          }}
                          className="w-full bg-slate-950 border border-slate-800 p-2 rounded-lg focus:border-rose-500 outline-none text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-500 uppercase">Duration</label>
                        <input 
                          type="text"
                          value={service.duration}
                          onChange={(e) => {
                            const updated = [...servicesForm];
                            updated[index] = {...service, duration: e.target.value};
                            setServicesForm(updated);
                          }}
                          className="w-full bg-slate-950 border border-slate-800 p-2 rounded-lg focus:border-rose-500 outline-none text-sm"
                          placeholder="e.g., 60 mins"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setServicesForm([...servicesForm, {
                        id: Date.now().toString(),
                        name: 'New Service',
                        price: 1000,
                        duration: '30 mins',
                        icon: '✨'
                      }]);
                    }}
                    className="bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-sm tracking-widest hover:bg-slate-700 transition-colors"
                  >
                    + ADD SERVICE
                  </button>
                  
                  {servicesForm.length > 1 && (
                    <button
                      onClick={() => {
                        if (window.confirm('Remove last service?')) {
                          setServicesForm(servicesForm.slice(0, -1));
                        }
                      }}
                      className="bg-red-500/20 text-red-400 px-4 py-2 rounded-xl font-bold text-sm tracking-widest hover:bg-red-500/30 transition-colors"
                    >
                      REMOVE LAST
                    </button>
                  )}
                </div>

                <button
                  onClick={async () => {
                    setSettingsSaving(true);
                    try {
                      await updateServices(servicesForm);
                      alert('Service prices updated!');
                    } catch (error: any) {
                      console.error('Error saving services:', error);
                      alert('Failed to save services: ' + (error?.message || error));
                    } finally {
                      setSettingsSaving(false);
                    }
                  }}
                  disabled={settingsSaving}
                  className="bg-rose-500 text-white px-6 py-3 rounded-xl font-bold tracking-widest hover:bg-rose-600 transition-colors disabled:opacity-50"
                >
                  {settingsSaving ? 'SAVING...' : 'SAVE SERVICE PRICES'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
