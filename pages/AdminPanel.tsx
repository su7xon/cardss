
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Product, Booking, Testimonial, AdminView, SiteSettings, Service, AboutContent, ServiceCategory, HeroContent, FooterSettings } from '../types';
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
  updateServiceCategories,
  updateProductCategories,
  updateAdminPassword,
  updateHeroBackground,
  updateHeroContent,
  updateFooterSettings,
  getDefaultSettings,
  subscribeToOrders,
  updateOrderStatus,
  deleteOrder,
  subscribeToBlogs,
  addBlog,
  updateBlog,
  deleteBlog
} from '../services/databaseService';
import { uploadImage } from '../services/imageUpload';
import Toast from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';

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
  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState<AdminView>(AdminView.DASHBOARD);
  const [orders, setOrders] = useState<import('../types').Order[]>([]);
  const [blogs, setBlogs] = useState<import('../types').BlogPost[]>([]);

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<import('../types').BlogPost | null>(null);
  const [blogForm, setBlogForm] = useState({ title: '', content: '', image: '', excerpt: '' });
  const [blogImageFile, setBlogImageFile] = useState<File | null>(null);
  const [blogImagePreview, setBlogImagePreview] = useState<string | null>(null);
  const blogFileInputRef = useRef<HTMLInputElement>(null);
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

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState<Service>({
    id: '',
    name: '',
    category: '',
    price: 0,
    duration: '',
    icon: '✨',
    image: '',
    description: ''
  });
  const [serviceImageFile, setServiceImageFile] = useState<File | null>(null);
  const [serviceImagePreview, setServiceImagePreview] = useState<string | null>(null);
  const serviceFileInputRef = useRef<HTMLInputElement>(null);

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(getDefaultSettings());
  const [aboutForm, setAboutForm] = useState<AboutContent>(getDefaultSettings().about);
  const [heroTextForm, setHeroTextForm] = useState<HeroContent>(getDefaultSettings().heroContent);
  const [footerForm, setFooterForm] = useState<FooterSettings>(getDefaultSettings().footer!);
  const [servicesForm, setServicesForm] = useState<Service[]>(getDefaultSettings().services);
  // @ts-ignore - Supressing temporary type error during migration
  const [categoriesForm, setCategoriesForm] = useState<ServiceCategory[]>(getDefaultSettings().serviceCategories);
  const [productCategoriesForm, setProductCategoriesForm] = useState<string[]>(getDefaultSettings().productCategories);
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Category Edit State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState<ServiceCategory>({
    id: '',
    name: '',
    icon: '✨',
    image: '',
    description: ''
  });
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState<string | null>(null);
  const categoryFileInputRef = useRef<HTMLInputElement>(null);

  // Hero Background State
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const heroImageInputRef = useRef<HTMLInputElement>(null);

  const [heroVideoFile, setHeroVideoFile] = useState<File | null>(null);
  const heroVideoInputRef = useRef<HTMLInputElement>(null);
  const [heroVideoName, setHeroVideoName] = useState<string | null>(null);

  // Password change state
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { }
  });
  const [isProcessingAction, setIsProcessingAction] = useState(false);


  useEffect(() => {
    // Session persistence
    const savedSession = localStorage.getItem('admin_session');
    if (savedSession === 'active') {
      setIsLoggedIn(true);
    }

    const unsubscribe = subscribeToSettings((settings) => {
      setSiteSettings(settings);
      setAboutForm(settings.about);
      setServicesForm(settings.services.map(s => ({
        ...s,
        category: s.category || 'Tarot Guidance'
      })));

      // PARANOID UI UPDATES: Ensure we never set empty arrays if defaults exist
      const defaultSettings = getDefaultSettings();
      setHeroTextForm({
        ...defaultSettings.heroContent,
        ...(settings.heroContent || {})
      });
      setFooterForm({
        ...defaultSettings.footer!,
        ...(settings.footer || {})
      });
      setCategoriesForm(
        (settings.serviceCategories && settings.serviceCategories.length > 0)
          ? settings.serviceCategories
          : defaultSettings.serviceCategories
      );
      setProductCategoriesForm(
        (settings.productCategories && settings.productCategories.length > 0)
          ? settings.productCategories
          : defaultSettings.productCategories
      );
    });

    const unsubscribeOrders = subscribeToOrders((data) => {
      setOrders(data);
    });

    return () => {
      unsubscribe();
      unsubscribeOrders();
    };
  }, []);

  useEffect(() => {
    const unsubBlogs = subscribeToBlogs(setBlogs);
    return () => unsubBlogs();
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

  const handleServiceImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setServiceImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setServiceImagePreview(reader.result as string);
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

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      if (!imageUrl && !editingProduct) {
        showToast('Please add a product image', 'error');
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
      showToast(editingProduct ? 'Product updated successfully!' : 'Product added successfully!', 'success');
    } catch (error) {
      console.error('Error saving product:', error);
      showToast('Failed to save product. Check your ImgBB API key.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Product',
      message: 'Are you sure you want to remove this product? This action cannot be undone.',
      onConfirm: async () => {
        setIsProcessingAction(true);
        try {
          await deleteProductFromDB(id);
          showToast('Product deleted successfully', 'success');
        } catch (error) {
          console.error('Error deleting product:', error);
          showToast('Failed to delete product', 'error');
        } finally {
          setIsProcessingAction(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
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

  const analytics = useMemo(() => {
    const totalSales = bookings
      .filter(b => b.status !== 'Pending')
      .reduce((sum, b) => sum + (b.price || 0), 0);

    const pendingCount = bookings.filter(b => b.status === 'Pending').length;

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
    const correctPassword = siteSettings.adminPassword || 'pooja.gupta001';
    if (password === correctPassword) {
      setIsLoggedIn(true);
      localStorage.setItem('admin_session', 'active');
      showToast('Welcome back, Pooja!', 'success');
    } else {
      showToast('Incorrect Password', 'error');
    }
  };

  const resetServiceForm = () => {
    setServiceForm({
      id: Date.now().toString(),
      name: '',
      category: 'Tarot Guidance',
      price: 0,
      duration: '',
      icon: '✨',
      image: '',
      description: ''
    });
    setServiceImageFile(null);
    setServiceImagePreview(null);
    if (serviceFileInputRef.current) {
      serviceFileInputRef.current.value = '';
    }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let imageUrl = serviceForm.image;
      if (serviceImageFile) {
        imageUrl = await uploadImage(serviceImageFile);
      }

      const updatedService = { ...serviceForm, image: imageUrl };

      const updatedServices = editingService
        ? servicesForm.map(s => s.id === editingService.id ? updatedService : s)
        : [...servicesForm, updatedService];

      setServicesForm(updatedServices); // Optimistic update
      setShowServiceModal(false);
      resetServiceForm(); // Clear form state

      // PERSISTENCE FIX: Save immediately
      await updateServices(updatedServices);
      showToast(editingService ? 'Service updated successfully!' : 'Service created successfully!', 'success');
    } catch (error) {
      console.error('Error saving service:', error);
      showToast('Failed to save changes to database', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteService = (serviceId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Service',
      message: 'Are you sure you want to remove this service? This action cannot be undone.',
      onConfirm: async () => {
        setIsProcessingAction(true);
        try {
          const updatedServices = servicesForm.filter(s => s.id !== serviceId);
          setServicesForm(updatedServices); // Optimistic
          await updateServices(updatedServices); // Persist
          showToast('Service deleted successfully', 'success');
        } catch (error) {
          console.error('Error deleting service:', error);
          showToast('Failed to delete service', 'error');
        } finally {
          setIsProcessingAction(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleProductCategoriesSave = async () => {
    setSettingsSaving(true);
    try {
      await updateProductCategories(productCategoriesForm);
      showToast('Product categories updated!', 'success');
    } catch (error) {
      console.error('Error saving product categories:', error);
      showToast('Failed to save product categories', 'error');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('admin_session');
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = siteSettings.adminPassword || 'pooja.gupta001';

    if (passwords.current !== correctPassword) {
      showToast('Current password incorrect', 'error');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (passwords.new.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      await updateAdminPassword(passwords.new);
      showToast('Password updated successfully!', 'success');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      showToast('Failed to update password', 'error');
    } finally {
      setIsChangingPassword(false);
    }

  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let imageUrl = categoryForm.image;
      if (categoryImageFile) {
        imageUrl = await uploadImage(categoryImageFile);
      }

      const updatedCategory = { ...categoryForm, image: imageUrl };

      const updatedCategories = editingCategory
        ? categoriesForm.map(c => c.id === editingCategory.id ? updatedCategory : c)
        : [...categoriesForm, updatedCategory];

      setCategoriesForm(updatedCategories);
      await updateServiceCategories(updatedCategories);

      setShowCategoryModal(false);
      setCategoryImageFile(null);
      setCategoryImagePreview(null);
      showToast(editingCategory ? 'Category updated successfully!' : 'Category added successfully!', 'success');
    } catch (error) {
      console.error('Error saving category:', error);
      showToast('Failed to save category', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const updateBookingStatus = async (id: string, newStatus: 'Confirmed' | 'Completed') => {
    try {
      await updateBookingInDB(id, { status: newStatus });
      showToast('Booking updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating booking:', error);
      showToast('Failed to update booking status', 'error');
    }
  };

  const handleDeleteBooking = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Booking',
      message: 'Are you sure you want to remove this booking? This action cannot be undone.',
      onConfirm: async () => {
        setIsProcessingAction(true);
        try {
          await deleteBookingFromDB(id);
          showToast('Booking deleted successfully', 'success');
        } catch (error) {
          console.error('Error deleting booking:', error);
          showToast('Failed to delete booking', 'error');
        } finally {
          setIsProcessingAction(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const resetBlogForm = () => {
    setBlogForm({ title: '', content: '', image: '', excerpt: '' });
    setEditingBlog(null);
    setBlogImageFile(null);
    setBlogImagePreview(null);
    if (blogFileInputRef.current) blogFileInputRef.current.value = '';
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      let imageUrl = blogForm.image;
      if (blogImageFile) imageUrl = await uploadImage(blogImageFile);
      const slug = blogForm.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      const blogData = { ...blogForm, image: imageUrl, slug };
      if (editingBlog) await updateBlog(editingBlog.id, blogData);
      else await addBlog(blogData);
      setShowBlogModal(false);
      resetBlogForm();
      showToast(editingBlog ? 'Blog updated!' : 'Blog posted!');
    } catch (error: any) {
      console.error('Blog submission error:', error);
      showToast('Blog error: ' + (error?.message || 'Unknown error'), 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Blog Post',
      message: 'Are you sure you want to remove this blog post? This action cannot be undone.',
      onConfirm: async () => {
        setIsProcessingAction(true);
        try {
          await deleteBlog(id);
          showToast('Blog deleted successfully');
        } catch (error) {
          console.error('Error deleting blog:', error);
          showToast('Failed to delete blog', 'error');
        } finally {
          setIsProcessingAction(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleDeleteOrder = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Order',
      message: 'Are you sure you want to delete this order? This action cannot be undone.',
      onConfirm: async () => {
        setIsProcessingAction(true);
        try {
          await deleteOrder(id);
          showToast('Order deleted successfully');
        } catch (error) {
          console.error('Error deleting order:', error);
          showToast('Failed to delete order', 'error');
        } finally {
          setIsProcessingAction(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-white p-10 rounded-3xl border border-rose-200 max-w-md w-full text-center shadow-xl">
          <div className="w-16 h-16 bg-rose-500/20 text-rose-300 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-mystic text-slate-950 mb-8">Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Admin Password"
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl outline-none focus:border-rose-500 text-center text-slate-800"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors p-2"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <button type="submit" className="w-full bg-rose-500 py-4 rounded-xl font-bold tracking-widest text-white shadow-lg">
              LOG IN
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-12 flex flex-col md:flex-row gap-6 md:gap-8">
      <aside className="w-full md:w-64">
        <div className="flex items-center justify-between mb-6 md:block">
          <h2 className="font-mystic text-slate-900 text-xl px-4 md:mb-6">Pooja's Dashboard</h2>
          <button onClick={() => setIsLoggedIn(false)} className="md:hidden text-red-400 text-xs font-bold uppercase tracking-widest px-4">Logout</button>
        </div>

        <div className="flex md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 no-scrollbar">
          {[
            { id: AdminView.DASHBOARD, name: 'Analytics', icon: '📊' },
            { id: AdminView.ORDERS, name: 'Orders', icon: '🛒' },
            { id: AdminView.BLOG, name: 'Blog', icon: '✍️' },
            { id: AdminView.APPOINTMENTS, name: 'Bookings', icon: '📅' },
            { id: AdminView.SERVICES, name: 'Services', icon: '💰' },
            { id: AdminView.INVENTORY, name: 'Inventory', icon: '📦' },
            { id: AdminView.MODERATION, name: 'Reviews', icon: '⭐' },
            { id: AdminView.SETTINGS, name: 'Settings', icon: '⚙️' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex-shrink-0 md:w-full flex items-center gap-3 md:gap-4 px-5 md:px-6 py-3 md:py-4 rounded-xl transition-all text-xs md:text-base whitespace-nowrap ${view === item.id
                ? 'bg-rose-500 text-white font-bold shadow-lg md:scale-100 scale-105'
                : 'text-slate-500 bg-white border border-rose-50 md:border-none md:bg-transparent hover:bg-rose-50 hover:text-rose-700'
                }`}
            >
              <span>{item.icon}</span>
              {item.name}
            </button>
          ))}
        </div>

        <button onClick={handleLogout} className="hidden md:flex w-full items-center gap-4 px-6 py-4 rounded-xl text-red-300 hover:bg-red-500/10 mt-10 transition-colors">
          <span>🚪</span> Logout
        </button>
        <p className="hidden md:block text-center text-[10px] text-slate-300 mt-4 font-mono">v1.1.0 (Hero Update)</p>
      </aside>

      <main className="flex-grow bg-white border border-rose-100 rounded-3xl p-4 md:p-8 min-h-[500px] md:min-h-[600px] shadow-sm">
        {view === AdminView.DASHBOARD && (
          <div className="space-y-8 animate-fade-in">
            <h3 className="text-2xl font-mystic text-rose-900">Business Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm">
                <p className="text-slate-500 text-xs uppercase font-bold tracking-widest mb-2">Total Revenue</p>
                <p className="text-4xl font-mystic text-rose-600">₹{analytics.totalSales.toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm">
                <p className="text-slate-500 text-xs uppercase font-bold tracking-widest mb-2">Pending Sessions</p>
                <p className="text-4xl font-mystic text-rose-600">{analytics.pendingCount}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm">
                <p className="text-slate-500 text-xs uppercase font-bold tracking-widest mb-2">Active Inventory</p>
                <p className="text-4xl font-mystic text-rose-600">{products.length}</p>
              </div>
            </div>

            <div className="mt-10">
              <h4 className="text-rose-200 font-bold mb-4">Most Booked Slots</h4>
              <div className="space-y-3">
                {analytics.sortedSlots.length > 0 ? analytics.sortedSlots.map(([slot, count]) => (
                  <div key={slot} className="bg-slate-50 h-12 rounded-lg flex items-center px-4 overflow-hidden relative border border-slate-200">
                    <div className="absolute left-0 top-0 bottom-0 bg-rose-200" style={{ width: `${(count / bookings.length) * 100}%` }}></div>
                    <span className="relative z-10 text-slate-700 text-sm font-bold">{slot}</span>
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
            <h3 className="text-2xl font-mystic text-rose-900">Appointment Dashboard</h3>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-rose-100 text-slate-500 text-xs uppercase tracking-widest">
                    <th className="py-4 font-bold">Client</th>
                    <th className="py-4 font-bold">Service</th>
                    <th className="py-4 font-bold">Date/Time</th>
                    <th className="py-4 font-bold">Status</th>
                    <th className="py-4 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {bookings.length > 0 ? bookings.map(booking => (
                    <tr key={booking.id} className="border-b border-rose-50 hover:bg-rose-50/50 transition-colors">
                      <td className="py-4 pr-4">
                        <p className="font-bold text-rose-900">{booking.clientName}</p>
                        <p className="text-xs text-slate-500">{booking.email}</p>
                        <p className="text-[10px] text-rose-400 font-bold">{booking.phone}</p>
                      </td>
                      <td className="py-4 text-slate-600">
                        {booking.service}
                        <p className="text-[10px] text-rose-600 font-bold">₹{booking.price}</p>
                      </td>
                      <td className="py-4 text-slate-600">{booking.date} @ {booking.time}</td>
                      <td className="py-4">
                        <select
                          value={booking.status}
                          onChange={(e) => updateBookingStatus(booking.id, e.target.value as any)}
                          className={`bg-white border border-rose-200 text-[10px] uppercase font-bold p-1 rounded ${booking.status === 'Confirmed' ? 'text-green-600' : 'text-yellow-600'}`}
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

            {/* Mobile View - Card Layout */}
            <div className="md:hidden space-y-4">
              {bookings.length > 0 ? bookings.map(booking => (
                <div key={booking.id} className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm space-y-4 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-rose-900 text-lg leading-tight">{booking.clientName}</p>
                      <p className="text-xs text-slate-500">{booking.email}</p>
                      <p className="text-[10px] text-rose-400 font-bold">{booking.phone}</p>
                    </div>
                    <div className="flex gap-2">
                      {booking.birthDetails && <button className="w-9 h-9 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center shadow-sm">📜</button>}
                      <button onClick={() => handleDeleteBooking(booking.id)} className="w-9 h-9 bg-red-50 text-red-400 rounded-full flex items-center justify-center shadow-sm">🗑️</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-3 border-y border-rose-50">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Service</p>
                      <p className="text-sm font-bold text-slate-700">{booking.service}</p>
                      <p className="text-xs text-rose-600 font-bold">₹{booking.price}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Schedule</p>
                      <p className="text-sm text-slate-700 font-medium">{booking.date}</p>
                      <p className="text-xs text-slate-500">{booking.time}</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Update Status</p>
                    <div className="flex gap-2">
                      {['Pending', 'Confirmed', 'Completed'].map(status => (
                        <button
                          key={status}
                          onClick={() => updateBookingStatus(booking.id, status as any)}
                          className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-tighter transition-all shadow-sm ${booking.status === status
                            ? 'bg-rose-500 text-white ring-2 ring-rose-200'
                            : 'bg-slate-50 text-slate-500 border border-slate-100'
                            }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )) : (
                <p className="py-10 text-center text-slate-500 text-sm">No bookings found.</p>
              )}
            </div>
          </div>
        )}



        {view === AdminView.ORDERS && (
          <div className="space-y-8 animate-fade-in">
            <h3 className="text-2xl font-mystic text-rose-900">Order Management</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-rose-100 text-slate-500 text-xs uppercase tracking-widest">
                    <th className="py-4 font-bold">Customer</th>
                    <th className="py-4 font-bold">Items</th>
                    <th className="py-4 font-bold">Total</th>
                    <th className="py-4 font-bold">Payment</th>
                    <th className="py-4 font-bold">Date</th>
                    <th className="py-4 font-bold">Status</th>
                    <th className="py-4 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {orders.length > 0 ? orders.map(order => (
                    <tr key={order.id} className="border-b border-rose-50 hover:bg-rose-50/50 transition-colors">
                      <td className="py-4 pr-4">
                        <p className="font-bold text-rose-900">{order.customerName}</p>
                        <p className="text-[10px] text-rose-400 font-bold">{order.phone}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[150px]">{order.address}</p>
                      </td>
                      <td className="py-4">
                        <div className="space-y-1">
                          {order.items.map((item, idx) => (
                            <p key={idx} className="text-xs text-slate-600">
                              {item.quantity}x {item.name}
                            </p>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 font-bold text-rose-600">₹{order.total}</td>
                      <td className="py-4">
                        <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="py-4 text-xs text-slate-500">
                        {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Just now'}
                      </td>
                      <td className="py-4">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                          className={`bg-white border border-rose-200 text-[10px] uppercase font-bold p-1 rounded ${order.status === 'Completed' ? 'text-green-600' :
                            order.status === 'Cancelled' ? 'text-red-600' : 'text-yellow-600'
                            }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-4">
                        <button onClick={() => handleDeleteOrder(order.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-100 text-red-500 rounded-lg hover:bg-red-50 transition-colors text-xs font-bold">
                          <span>🗑️</span> DELETE
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-500">No orders received yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}



        {view === AdminView.BLOG && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-mystic text-rose-900">Blog Posts</h3>
              <button
                onClick={() => { resetBlogForm(); setShowBlogModal(true); }}
                className="bg-rose-500 text-white px-6 py-2 rounded-xl font-bold text-sm"
              >
                + NEW POST
              </button>
            </div>
            <div className="grid gap-4">
              {blogs.length > 0 ? blogs.map(blog => (
                <div key={blog.id} className="bg-white p-4 rounded-2xl border border-rose-100 flex items-center gap-4 shadow-sm group">
                  <img src={blog.image} className="w-16 h-16 rounded-xl object-cover" alt="" />
                  <div className="flex-grow">
                    <h4 className="font-bold text-slate-800">{blog.title}</h4>
                    <p className="text-xs text-slate-400 capitalize">{blog.slug}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => {
                      setEditingBlog(blog);
                      setBlogForm({ title: blog.title, content: blog.content, image: blog.image || '', excerpt: blog.excerpt || '' });
                      setShowBlogModal(true);
                    }} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-rose-200 text-slate-600 rounded-lg hover:bg-rose-50 transition-colors text-xs font-bold">
                      <span>✏️</span> EDIT
                    </button>
                    <button onClick={() => handleDeleteBlog(blog.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-100 text-red-500 rounded-lg hover:bg-red-50 transition-colors text-xs font-bold">
                      <span>🗑️</span> DELETE
                    </button>
                  </div>
                </div>
              )) : <p className="text-center text-slate-400 py-10">No blogs yet.</p>}
            </div>
          </div>
        )}

        {view === AdminView.INVENTORY && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-mystic text-rose-900">Inventory Management</h3>
              <button
                onClick={() => { resetProductForm(); setShowProductModal(true); }}
                className="bg-rose-500 text-white px-6 py-2 rounded-xl font-bold text-sm tracking-widest hover:bg-rose-600 transition-colors"
              >
                + ADD PRODUCT
              </button>
            </div>
            <div className="grid gap-4">
              {products.length > 0 ? products.map(product => (
                <div key={product.id} className="bg-white p-4 rounded-2xl border border-rose-100 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 shadow-sm relative group">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img src={product.image} className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover" alt={product.name} />
                    <div className="flex-grow">
                      <h4 className="font-bold text-rose-900 leading-tight">{product.name}</h4>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">{product.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto sm:flex-grow gap-4 pl-1 sm:pl-0">
                    <div className="text-left sm:text-center">
                      <p className="text-[10px] text-slate-500 mb-0.5 uppercase">Stock</p>
                      <p className={`font-bold text-sm ${product.stock < 5 ? 'text-red-500' : 'text-slate-700'}`}>{product.stock}</p>
                    </div>
                    <div className="text-right sm:text-right">
                      <p className="text-[10px] text-slate-500 mb-0.5 uppercase">Price</p>
                      <p className="font-bold text-rose-500 text-sm">₹{product.price}</p>
                    </div>
                    <div className="flex gap-1.5 ml-auto sm:ml-4">
                      <button
                        onClick={() => openEditProduct(product)}
                        className="p-2 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-slate-500 text-center py-10">No products in inventory. Add your first product!</p>
              )}
            </div>
          </div>
        )}

        {showProductModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-rose-200 shadow-2xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-mystic text-rose-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button
                  onClick={() => { setShowProductModal(false); resetProductForm(); }}
                  className="text-slate-400 hover:text-slate-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleProductSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Product Name</label>
                    <input
                      required
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none text-slate-900"
                      placeholder="e.g., Amethyst Cluster"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Category</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none text-slate-900"
                    >
                      {productCategoriesForm.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Price (₹)</label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Stock</label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Product Image</label>

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
                        className="flex items-center justify-center gap-2 w-full bg-slate-50 border-2 border-dashed border-slate-300 hover:border-rose-500 p-4 rounded-xl cursor-pointer transition-colors"
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
                      <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                        <img
                          src={imagePreview || productForm.image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 py-2">
                    <div className="flex-grow h-px bg-slate-800"></div>
                    <span className="text-slate-600 text-xs">OR paste URL</span>
                    <div className="flex-grow h-px bg-slate-800"></div>
                  </div>

                  <input
                    type="url"
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none text-sm text-slate-900"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Description</label>
                  <textarea
                    required
                    rows={2}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none resize-none text-slate-900"
                    placeholder="Brief product description..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Metaphysical Properties</label>
                  <textarea
                    required
                    rows={3}
                    value={productForm.metaphysicalProperties}
                    onChange={(e) => setProductForm({ ...productForm, metaphysicalProperties: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none resize-none text-slate-900"
                    placeholder="Healing properties, chakras, zodiac signs..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowProductModal(false); resetProductForm(); }}
                    className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-xl font-bold tracking-widest hover:bg-slate-300 transition-colors"
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

        {showServiceModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-rose-200 shadow-2xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-mystic text-rose-900">
                  {editingService ? 'Edit Service' : 'Add New Service'}
                </h3>
                <button
                  onClick={() => { setShowServiceModal(false); }}
                  className="text-slate-400 hover:text-slate-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleServiceSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Service Name</label>
                      <input
                        required
                        type="text"
                        value={serviceForm.name}
                        onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none text-slate-900"
                        placeholder="e.g., Detailed Tarot Reading"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Custom Icon (Image)</label>
                      <div
                        onClick={() => serviceFileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-rose-400 hover:bg-rose-50 transition-all text-center min-h-[100px]"
                      >
                        {serviceImagePreview || serviceForm.image ? (
                          <img
                            src={serviceImagePreview || serviceForm.image}
                            alt="Icon Preview"
                            className="w-16 h-16 object-contain rounded-lg shadow-sm"
                          />
                        ) : (
                          <>
                            <span className="text-2xl mb-1">🖼️</span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Upload Image</span>
                          </>
                        )}
                        <input
                          type="file"
                          ref={serviceFileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setServiceImageFile(file);
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setServiceImagePreview(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>
                      {serviceForm.image && !serviceImageFile && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setServiceForm({ ...serviceForm, image: '' });
                            setServiceImagePreview(null);
                          }}
                          className="text-xs text-red-500 font-bold hover:underline"
                        >
                          Remove Image
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Category</label>
                    <select
                      value={serviceForm.category}
                      onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none text-slate-900"
                    >
                      {categoriesForm.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Price (₹)</label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={serviceForm.price}
                      onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Duration</label>
                    <input
                      required
                      type="text"
                      value={serviceForm.duration}
                      onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none text-slate-900"
                      placeholder="e.g., 60 mins"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Fallback Emoji</label>
                    <input
                      required
                      type="text"
                      value={serviceForm.icon}
                      onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none text-center text-xl"
                      maxLength={2}
                      placeholder="✨"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Service Image (Background)</label>

                  <div className="flex gap-4 items-start">
                    <div className="flex-grow">
                      <input
                        ref={serviceFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleServiceImageSelect}
                        className="hidden"
                        id="service-image-upload"
                      />
                      <label
                        htmlFor="service-image-upload"
                        className="flex items-center justify-center gap-2 w-full bg-slate-50 border-2 border-dashed border-slate-300 hover:border-rose-500 p-4 rounded-xl cursor-pointer transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-slate-400 text-sm">
                          {serviceImageFile ? serviceImageFile.name : 'Tap to upload image'}
                        </span>
                      </label>
                    </div>
                    {(serviceImagePreview || serviceForm.image) && (
                      <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                        <img
                          src={serviceImagePreview || serviceForm.image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 py-2">
                    <div className="flex-grow h-px bg-slate-800"></div>
                    <span className="text-slate-600 text-xs">OR paste URL</span>
                    <div className="flex-grow h-px bg-slate-800"></div>
                  </div>

                  <input
                    type="url"
                    value={serviceForm.image || ''}
                    onChange={(e) => setServiceForm({ ...serviceForm, image: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none text-sm text-slate-900"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Description</label>
                  <textarea
                    rows={3}
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none resize-none text-slate-900"
                    placeholder="Briefly describe what this service offers..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowServiceModal(false); }}
                    className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-xl font-bold tracking-widest hover:bg-slate-300 transition-colors"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-rose-500 text-white py-3 rounded-xl font-bold tracking-widest hover:bg-rose-600 transition-colors"
                  >
                    {editingService ? 'UPDATE SERVICE' : 'ADD SERVICE'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {view === AdminView.MODERATION && (
          <div className="space-y-8 animate-fade-in">
            <h3 className="text-2xl font-mystic text-rose-900">Review Moderation</h3>
            <div className="grid gap-6">
              {testimonials.length > 0 ? testimonials.map(t => (
                <div key={t.id} className="bg-white p-6 rounded-2xl border border-rose-100 relative shadow-sm">
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
                  <p className="text-slate-600 italic mb-4 max-w-lg">"{t.text}"</p>
                  <p className="text-rose-900 font-bold">{t.name}</p>
                </div>
              )) : (
                <p className="text-slate-500 text-center py-10">No reviews submitted yet.</p>
              )}
            </div>
          </div>
        )}



        {view === AdminView.SERVICES && (
          <div className="space-y-8 animate-fade-in">
            <h3 className="text-2xl font-mystic text-rose-900">Service Management</h3>

            {/* Category Management */}
            <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm">
              <h4 className="text-lg font-mystic text-rose-800 mb-6 flex items-center gap-2">
                <span>📁</span> Manage Categories
              </h4>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {categoriesForm.map((cat, idx) => (
                    <div key={cat.id || idx} className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center text-2xl overflow-hidden shrink-0">
                        {cat.image ? (
                          <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                        ) : (
                          cat.icon
                        )}
                      </div>
                      <div className="flex-grow">
                        <h5 className="font-bold text-slate-800">{cat.name}</h5>
                        <p className="text-xs text-slate-500 line-clamp-1">{cat.description || 'No description'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setCategoryForm(cat);
                            setCategoryImagePreview(cat.image || null);
                            setCategoryImageFile(null);
                            setShowCategoryModal(true);
                          }}
                          className="p-2 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        >✏️</button>
                        <button
                          onClick={() => {
                            setConfirmModal({
                              isOpen: true,
                              title: 'Delete Service Category?',
                              message: `Are you sure you want to delete "${cat.name}"? Usage of this category in services will need to be updated.`,
                              onConfirm: async () => {
                                setIsProcessingAction(true);
                                try {
                                  const updated = categoriesForm.filter(c => c.id !== cat.id);
                                  setCategoriesForm(updated);
                                  await updateServiceCategories(updated);
                                  showToast('Category deleted successfully', 'success');
                                } catch (error) {
                                  console.error('Error deleting category:', error);
                                  showToast('Failed to delete category', 'error');
                                } finally {
                                  setIsProcessingAction(false);
                                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                }
                              }
                            });
                          }}
                          className="p-2 hover:bg-red-100 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                        >🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryForm({
                      id: Date.now().toString(),
                      name: '',
                      icon: '✨',
                      image: '',
                      description: ''
                    });
                    setCategoryImageFile(null);
                    setCategoryImagePreview(null);
                    setShowCategoryModal(true);
                  }}
                  disabled={settingsSaving}
                  className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 font-bold hover:border-rose-400 hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
                >
                  <span>+</span> ADD NEW CATEGORY
                </button>
              </div>
            </div>

            {/* Product Category Management */}
            <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm">
              <h4 className="text-lg font-mystic text-rose-800 mb-6 flex items-center gap-2">
                <span>📦</span> Manage Product Categories
              </h4>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {productCategoriesForm.map((cat, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 capitalize">
                      <span className="text-sm font-bold">{cat}</span>
                      <button
                        onClick={() => {
                          setConfirmModal({
                            isOpen: true,
                            title: 'Delete Category?',
                            message: `Are you sure you want to delete the product category "${cat}"? This cannot be undone.`,
                            onConfirm: async () => {
                              setProductCategoriesForm(productCategoriesForm.filter((_, i) => i !== idx));
                              setConfirmModal(prev => ({ ...prev, isOpen: false }));
                            }
                          });
                        }}
                        className="hover:text-red-500 transition-colors"
                      >✕</button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="new-product-category-input"
                    placeholder="New product category..."
                    className="flex-grow bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-rose-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val && !productCategoriesForm.includes(val)) {
                          setProductCategoriesForm([...productCategoriesForm, val]);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('new-product-category-input') as HTMLInputElement;
                      const val = input.value.trim();
                      if (val && !productCategoriesForm.includes(val)) {
                        setProductCategoriesForm([...productCategoriesForm, val]);
                        input.value = '';
                      }
                    }}
                    className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold text-sm"
                  >ADD</button>
                </div>
                <button
                  onClick={handleProductCategoriesSave}
                  disabled={settingsSaving}
                  className="mt-2 bg-rose-500 text-white px-6 py-3 rounded-xl font-bold tracking-widest hover:bg-rose-600 transition-colors disabled:opacity-50"
                >
                  {settingsSaving ? 'SAVING...' : 'SAVE PRODUCT CATEGORIES'}
                </button>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm">
              <h4 className="text-lg font-mystic text-rose-800 mb-6 flex items-center gap-2">
                <span>💰</span> Edit Services
              </h4>

              <div className="space-y-4">
                {servicesForm.map((service) => (
                  <div key={service.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-4 transition-all hover:border-rose-200">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl border border-rose-50 overflow-hidden">
                      {service.image ? (
                        <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                      ) : (
                        service.icon
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800">{service.name}</h4>
                        <span className="text-[10px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">{service.category}</span>
                      </div>
                      <div className="flex gap-4 mt-1">
                        <p className="text-xs text-slate-500"><span className="font-bold text-rose-500">₹{service.price}</span></p>
                        <p className="text-xs text-slate-400">🕒 {service.duration}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingService(service);
                          setServiceForm(service);
                          setServiceImagePreview(service.image || null);
                          setServiceImageFile(null);
                          setShowServiceModal(true);
                        }}
                        className="p-2 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                        title="Remove"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setEditingService(null);
                      resetServiceForm();
                      setShowServiceModal(true);
                    }}
                    className="bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-sm tracking-widest hover:bg-slate-700 transition-colors"
                  >
                    + ADD SERVICE
                  </button>
                </div>

                <button
                  onClick={async () => {
                    setSettingsSaving(true);
                    try {
                      await updateServices(servicesForm);
                      showToast('All services saved successfully!', 'success');
                    } catch (error: any) {
                      console.error('Error saving services:', error);
                      showToast('Failed to save services', 'error');
                    } finally {
                      setSettingsSaving(false);
                    }
                  }}
                  disabled={settingsSaving}
                  className="bg-rose-500 text-white px-6 py-3 rounded-xl font-bold tracking-widest hover:bg-rose-600 transition-colors disabled:opacity-50"
                >
                  {settingsSaving ? 'SAVING...' : 'SAVE ALL SERVICES'}
                </button>
              </div>
            </div>
          </div>
        )}

        {view === AdminView.SETTINGS && (
          <div className="space-y-8 animate-fade-in">
            <h3 className="text-2xl font-mystic text-rose-900">Admin Settings</h3>



            {/* About Section */}
            <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm">
              <h4 className="text-lg font-mystic text-rose-800 mb-6 flex items-center gap-2">
                <span>👤</span> About Section (Practitioner Info)
              </h4>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Title</label>
                  <input
                    type="text"
                    value={aboutForm.title}
                    onChange={(e) => setAboutForm({ ...aboutForm, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none text-slate-900"
                    placeholder="e.g., The Practitioner"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Description</label>
                  <textarea
                    rows={4}
                    value={aboutForm.description}
                    onChange={(e) => setAboutForm({ ...aboutForm, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none resize-none text-slate-900"
                    placeholder="Your bio and experience..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Credentials (one per line)</label>
                  <textarea
                    rows={4}
                    value={aboutForm.credentials.join('\n')}
                    onChange={(e) => setAboutForm({ ...aboutForm, credentials: e.target.value.split('\n').filter(c => c.trim()) })}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none resize-none text-slate-900"
                    placeholder="Certified Vedic Astrologer&#10;Crystal Healing Practitioner&#10;Tarot Reader"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm">
              <h4 className="text-lg font-mystic text-rose-800 mb-6 flex items-center gap-2">
                <span>🎯</span> Hero Text Section (Home Banner)
              </h4>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Main Heading</label>
                  <input
                    type="text"
                    value={heroTextForm.heading}
                    onChange={(e) => setHeroTextForm({ ...heroTextForm, heading: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none text-slate-900"
                    placeholder="e.g., Healing • Guidance • Tarot"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Subheading</label>
                  <textarea
                    rows={3}
                    value={heroTextForm.subheading}
                    onChange={(e) => setHeroTextForm({ ...heroTextForm, subheading: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none resize-none text-slate-900"
                    placeholder="Short message under heading..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Primary Button Text</label>
                    <input
                      type="text"
                      value={heroTextForm.primaryButtonText}
                      onChange={(e) => setHeroTextForm({ ...heroTextForm, primaryButtonText: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none text-slate-900"
                      placeholder="e.g., BOOK A READING"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Secondary Button Text</label>
                    <input
                      type="text"
                      value={heroTextForm.secondaryButtonText}
                      onChange={(e) => setHeroTextForm({ ...heroTextForm, secondaryButtonText: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none text-slate-900"
                      placeholder="e.g., EXPLORE CRYSTALS"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm">
              <h4 className="text-lg font-mystic text-rose-800 mb-6 flex items-center gap-2">
                <span>🦶</span> Footer Section
              </h4>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">About Title</label>
                    <input
                      type="text"
                      value={footerForm.aboutTitle}
                      onChange={(e) => setFooterForm({ ...footerForm, aboutTitle: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Services Title</label>
                    <input
                      type="text"
                      value={footerForm.servicesTitle}
                      onChange={(e) => setFooterForm({ ...footerForm, servicesTitle: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">About Description</label>
                  <textarea
                    rows={4}
                    value={footerForm.aboutDescription}
                    onChange={(e) => setFooterForm({ ...footerForm, aboutDescription: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none resize-none text-slate-900"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Services List (one per line)</label>
                  <textarea
                    rows={4}
                    value={footerForm.services.join('\n')}
                    onChange={(e) => setFooterForm({ ...footerForm, services: e.target.value.split('\n').map((item) => item.trim()).filter(Boolean) })}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none resize-none text-slate-900"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Contact Title</label>
                    <input
                      type="text"
                      value={footerForm.contactTitle}
                      onChange={(e) => setFooterForm({ ...footerForm, contactTitle: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Email</label>
                    <input
                      type="text"
                      value={footerForm.email}
                      onChange={(e) => setFooterForm({ ...footerForm, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Phone</label>
                    <input
                      type="text"
                      value={footerForm.phone}
                      onChange={(e) => setFooterForm({ ...footerForm, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Instagram URL</label>
                    <input
                      type="url"
                      value={footerForm.instagramUrl}
                      onChange={(e) => setFooterForm({ ...footerForm, instagramUrl: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">YouTube URL</label>
                    <input
                      type="url"
                      value={footerForm.youtubeUrl}
                      onChange={(e) => setFooterForm({ ...footerForm, youtubeUrl: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">WhatsApp URL</label>
                    <input
                      type="url"
                      value={footerForm.whatsappUrl}
                      onChange={(e) => setFooterForm({ ...footerForm, whatsappUrl: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Address Line 1</label>
                    <input
                      type="text"
                      value={footerForm.addressLine1}
                      onChange={(e) => setFooterForm({ ...footerForm, addressLine1: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Address Line 2</label>
                    <input
                      type="text"
                      value={footerForm.addressLine2}
                      onChange={(e) => setFooterForm({ ...footerForm, addressLine2: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Address Line 3</label>
                    <input
                      type="text"
                      value={footerForm.addressLine3}
                      onChange={(e) => setFooterForm({ ...footerForm, addressLine3: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Change Password */}
            <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm">
              <h4 className="text-lg font-mystic text-rose-800 mb-6 flex items-center gap-2">
                <span>🔒</span> Change Admin Password
              </h4>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Current Password</label>
                    <input
                      required
                      type="password"
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-rose-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">New Password</label>
                    <input
                      required
                      type="password"
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-rose-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Confirm New</label>
                    <input
                      required
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold tracking-widest hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  {isChangingPassword ? 'UPDATING...' : 'UPDATE PASSWORD'}
                </button>
              </form>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={async () => {
                  setSettingsSaving(true);
                  try {
                    let heroImage = siteSettings.heroImage || '';
                    let heroVideo = siteSettings.heroVideo || '';

                    if (heroImageFile) {
                      heroImage = await uploadImage(heroImageFile);
                    }
                    if (heroVideoFile) {
                      heroVideo = await uploadImage(heroVideoFile);
                    }

                    await updateAboutContent(aboutForm);
                    await updateServices(servicesForm);
                    await updateServiceCategories(categoriesForm);
                    await updateProductCategories(productCategoriesForm);
                    await updateHeroBackground(heroImage, heroVideo);
                    await updateHeroContent(heroTextForm);
                    await updateFooterSettings(footerForm);

                    showToast('All settings saved successfully');
                    setHeroImageFile(null);
                    setHeroVideoFile(null);
                    setHeroVideoName(null);
                  } catch (error) {
                    console.error('Error saving settings:', error);
                    showToast('Failed to save settings', 'error');
                  } finally {
                    setSettingsSaving(false);
                  }
                }}
                disabled={settingsSaving}
                className="w-full bg-rose-500 text-white px-8 py-5 rounded-2xl font-bold tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-rose-200 active:scale-[0.98] disabled:opacity-50"
              >
                {settingsSaving ? 'SAVING ALL SETTINGS...' : 'SAVE ALL SITE SETTINGS'}
              </button>
            </div>
          </div>
        )}
        {showCategoryModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-3xl border border-rose-200 shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-mystic text-rose-900 mb-6">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>

              <form onSubmit={handleCategorySubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Category Name</label>
                    <input
                      required
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none text-slate-900"
                      placeholder="e.g., Tarot Guidance"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Category Image</label>
                    <div
                      onClick={() => categoryFileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-rose-400 hover:bg-rose-50 transition-all text-center min-h-[100px]"
                    >
                      {categoryImagePreview || categoryForm.image ? (
                        <img
                          src={categoryImagePreview || categoryForm.image}
                          alt="Icon Preview"
                          className="w-full h-32 object-cover rounded-lg shadow-sm"
                        />
                      ) : (
                        <>
                          <span className="text-2xl mb-1">🖼️</span>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Upload Image</span>
                        </>
                      )}
                      <input
                        type="file"
                        ref={categoryFileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setCategoryImageFile(file);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setCategoryImagePreview(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                    {categoryForm.image && !categoryImageFile && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCategoryForm({ ...categoryForm, image: '' });
                          setCategoryImagePreview(null);
                        }}
                        className="text-xs text-red-500 font-bold hover:underline"
                      >
                        Remove Image
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Fallback Emoji Icon</label>
                    <input
                      required
                      type="text"
                      value={categoryForm.icon}
                      onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none text-slate-900 text-center text-xl"
                      placeholder="✨"
                      maxLength={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Description</label>
                    <textarea
                      rows={2}
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none text-slate-900 resize-none"
                      placeholder="Brief description for home page..."
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowCategoryModal(false); }}
                    className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-xl font-bold tracking-widest hover:bg-slate-300 transition-colors"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="flex-1 bg-rose-500 text-white py-3 rounded-xl font-bold tracking-widest hover:bg-rose-600 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {isUploading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                    {editingCategory ? 'UPDATE' : 'ADD'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        isProcessing={isProcessingAction}
      />
      {showBlogModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 border border-rose-200 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-mystic text-rose-900">{editingBlog ? 'Edit Post' : 'New Thought'}</h3>
              <button onClick={() => setShowBlogModal(false)} className="text-slate-400 text-2xl">✕</button>
            </div>
            <form onSubmit={handleBlogSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Post Title</label>
                <input required type="text" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl outline-none focus:border-rose-500" value={blogForm.title} onChange={e => setBlogForm({ ...blogForm, title: e.target.value })} />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Preview Excerpt</label>
                  <textarea rows={2} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl outline-none focus:border-rose-500 text-sm" value={blogForm.excerpt} onChange={e => setBlogForm({ ...blogForm, excerpt: e.target.value })} placeholder="Short teaser for the list view..." />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cover Image</label>
                  <input type="file" className="hidden" id="blog-image" ref={blogFileInputRef} onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setBlogImageFile(file);
                      const reader = new FileReader();
                      reader.onloadend = () => setBlogImagePreview(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }} />
                  <label htmlFor="blog-image" className="block w-full bg-slate-50 border-2 border-dashed border-slate-200 p-4 rounded-xl text-center cursor-pointer hover:border-rose-400 transition-colors">
                    <span className="text-slate-400 text-sm">{blogImageFile ? blogImageFile.name : 'Click to upload image'}</span>
                  </label>
                  {(blogImagePreview || blogForm.image) && <img src={blogImagePreview || blogForm.image} className="h-20 w-full object-cover rounded-xl mt-2" />}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Body Content</label>
                <textarea required rows={10} className="w-full bg-slate-50 border border-slate-200 p-6 rounded-3xl outline-none focus:border-rose-500 leading-relaxed font-serif" value={blogForm.content} onChange={e => setBlogForm({ ...blogForm, content: e.target.value })} placeholder="Share your wisdom..." />
              </div>
              <button type="submit" disabled={isUploading} className="w-full bg-rose-500 text-white py-5 rounded-2xl font-bold tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-rose-200 disabled:opacity-50">
                {isUploading ? 'UPLOADING...' : (editingBlog ? 'UPDATE POST' : 'PUBLISH POST')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
