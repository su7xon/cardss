
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Product, Booking, Testimonial, AdminView, SiteSettings, Service, AboutContent, ServiceCategory, HeroContent, FooterSettings, CourseEbook, CrystalCombo } from '../types';
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
  deleteBlog,
  subscribeToCoursesEbooks,
  addCourseEbook,
  updateCourseEbook,
  deleteCourseEbook,
  uploadCoursePdf,
  uploadCourseCover,
  updateCrystalCombos
} from '../services/databaseService';
import { uploadImage, uploadPdf } from '../services/imageUpload';
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
  const [coursesEbooks, setCoursesEbooks] = useState<CourseEbook[]>([]);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseEbook | null>(null);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    type: 'ebook' as 'ebook' | 'course',
    category: 'Spiritual',
    pdfUrl: '',
    coverImage: '',
    price: 0,
    author: '',
    pages: 0,
    duration: '',
    isFeatured: false
  });
  const [coursePdfFile, setCoursePdfFile] = useState<File | null>(null);
  const [courseCoverFile, setCourseCoverFile] = useState<File | null>(null);
  const [courseCoverPreview, setCourseCoverPreview] = useState<string | null>(null);
  const [isCourseUploading, setIsCourseUploading] = useState(false);
  const coursePdfInputRef = useRef<HTMLInputElement>(null);
  const courseCoverInputRef = useRef<HTMLInputElement>(null);
  const [crystalCombos, setCrystalCombos] = useState<CrystalCombo[]>([]);
  const [isUpdatingCombo, setIsUpdatingCombo] = useState(false);
  const FIREBASE_UPLOAD_TIMEOUT_MS = 20000;
  const CLOUDINARY_UPLOAD_TIMEOUT_MS = 30000;
  const FIRESTORE_WRITE_TIMEOUT_MS = 15000;

  const withTimeout = async <T,>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      const timer = window.setTimeout(() => {
        reject(new Error(`${label} timed out after ${Math.floor(ms / 1000)}s`));
      }, ms);

      promise
        .then((value) => {
          window.clearTimeout(timer);
          resolve(value);
        })
        .catch((error) => {
          window.clearTimeout(timer);
          reject(error);
        });
    });
  };

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
    category: 'Crystal',
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
    icon: '',
    image: '',
    description: '',
    chatDescription: '',
    callDescription: '',
    videoDescription: '',
    chatPrice: 0,
    callPrice: 0,
    videoPrice: 0
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
    icon: '',
    image: '',
    description: '',
    chatPrice: 0,
    callPrice: 0,
    videoPrice: 0
  });
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState<string | null>(null);
  const categoryFileInputRef = useRef<HTMLInputElement>(null);

  // Hero Background State
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const heroImageInputRef = useRef<HTMLInputElement>(null);
  const crystalCombosSectionRef = useRef<HTMLDivElement>(null);

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
    onConfirm: () => void | Promise<void>;
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
      setCrystalCombos(
        (settings.crystalCombos && settings.crystalCombos.length > 0)
          ? settings.crystalCombos
          : defaultSettings.crystalCombos || []
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

  useEffect(() => {
    const unsubCourses = subscribeToCoursesEbooks(setCoursesEbooks);
    return () => unsubCourses();
  }, []);

  const resetCourseForm = () => {
    setCourseForm({ title: '', description: '', type: 'ebook', category: 'Spiritual', pdfUrl: '', coverImage: '', price: 0, author: '', pages: 0, duration: '', isFeatured: false });
    setEditingCourse(null);
    setCoursePdfFile(null);
    setCourseCoverFile(null);
    setCourseCoverPreview(null);
    if (coursePdfInputRef.current) coursePdfInputRef.current.value = '';
    if (courseCoverInputRef.current) courseCoverInputRef.current.value = '';
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.title.trim()) { showToast('Title is required', 'error'); return; }
    if (!editingCourse && !coursePdfFile && !courseForm.pdfUrl) { showToast('Please upload a PDF', 'error'); return; }
    setIsCourseUploading(true);
    try {
      const host = window.location.hostname;
      const isLocalPreview = host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('10.') || host.endsWith('.local');
      let pdfUrl = courseForm.pdfUrl;
      let coverUrl = courseForm.coverImage;
      if (coursePdfFile) {
        if (isLocalPreview) {
          pdfUrl = await withTimeout(
            uploadPdf(coursePdfFile),
            CLOUDINARY_UPLOAD_TIMEOUT_MS,
            'Cloudinary PDF upload'
          );
        } else {
          try {
            pdfUrl = await withTimeout(
              uploadCoursePdf(coursePdfFile),
              FIREBASE_UPLOAD_TIMEOUT_MS,
              'Firebase PDF upload'
            );
          } catch (pdfErr) {
            console.warn('Firebase PDF upload failed, falling back to Cloudinary:', pdfErr);
            pdfUrl = await withTimeout(
              uploadPdf(coursePdfFile),
              CLOUDINARY_UPLOAD_TIMEOUT_MS,
              'Cloudinary PDF upload'
            );
          }
        }
      }
      if (courseCoverFile) {
        if (isLocalPreview) {
          coverUrl = await withTimeout(
            uploadImage(courseCoverFile),
            CLOUDINARY_UPLOAD_TIMEOUT_MS,
            'Cloudinary cover upload'
          );
        } else {
          try {
            coverUrl = await withTimeout(
              uploadCourseCover(courseCoverFile),
              FIREBASE_UPLOAD_TIMEOUT_MS,
              'Firebase cover upload'
            );
          } catch (coverErr) {
            console.warn('Firebase cover upload failed, falling back to Cloudinary:', coverErr);
            coverUrl = await withTimeout(
              uploadImage(courseCoverFile),
              CLOUDINARY_UPLOAD_TIMEOUT_MS,
              'Cloudinary cover upload'
            );
          }
        }
      }
      const data = { ...courseForm, pdfUrl, coverImage: coverUrl };
      if (editingCourse) {
        await withTimeout(
          updateCourseEbook(editingCourse.id, data),
          FIRESTORE_WRITE_TIMEOUT_MS,
          'Firestore update'
        );
      } else {
        await withTimeout(
          addCourseEbook(data),
          FIRESTORE_WRITE_TIMEOUT_MS,
          'Firestore create'
        );
      }
      setShowCourseModal(false);
      resetCourseForm();
      showToast(editingCourse ? 'Updated successfully!' : 'Published successfully!');
    } catch (err: any) {
      console.error('Course submit failed:', err);
      showToast('Error: ' + (err?.message || 'Upload failed'), 'error');
    } finally {
      setIsCourseUploading(false);
    }
  };

  const handleDeleteCourse = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Item',
      message: 'Delete this course/ebook? This cannot be undone.',
      onConfirm: async () => {
        setIsProcessingAction(true);
        try {
          await deleteCourseEbook(id);
          showToast('Deleted successfully');
        } catch { showToast('Failed to delete', 'error'); }
        finally {
          setIsProcessingAction(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

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
      const message = error instanceof Error ? error.message : 'Failed to save product';
      showToast(message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const productToDelete = products.find(p => p.id === id);

    setConfirmModal({
      isOpen: true,
      title: 'Delete Product',
      message: 'Are you sure you want to remove this product? This action cannot be undone.',
      onConfirm: async () => {
        setIsProcessingAction(true);
        try {
          await deleteProductFromDB(id);

          // Persist a local tombstone so fallback catalog won't bring it back.
          if (productToDelete?.name) {
            try {
              const key = 'deleted_product_names';
              const raw = localStorage.getItem(key);
              const list = raw ? JSON.parse(raw) : [];
              const normalized = productToDelete.name.trim().toLowerCase();
              const next = Array.isArray(list) ? list : [];

              if (!next.includes(normalized)) {
                next.push(normalized);
                localStorage.setItem(key, JSON.stringify(next));
              }
            } catch (error) {
              console.warn('Failed to save deleted product tombstone:', error);
            }
          }

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
      metaphysicalProperties: product.metaphysicalProperties || '',
      image: product.image,
      category: product.category || 'Crystal',
      stock: product.stock ?? 0
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
      icon: '',
      image: '',
      description: '',
      chatDescription: '',
      callDescription: '',
      videoDescription: '',
      chatPrice: 0,
      callPrice: 0,
      videoPrice: 0
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

      console.log('Saving service:', updatedService);

      const updatedServices = editingService
        ? servicesForm.map(s => s.id === editingService.id ? updatedService : s)
        : [...servicesForm, updatedService];

      console.log('All services after update:', updatedServices);

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
          console.log('[Service Delete] Starting delete for serviceId:', serviceId);
          const updatedServices = servicesForm.filter(s => s.id !== serviceId);
          console.log('[Service Delete] Updated services list:', updatedServices.length, 'items');
          setServicesForm(updatedServices); // Optimistic UI update
          console.log('[Service Delete] Calling updateServices to persist...');
          const result = await updateServices(updatedServices); // Persist to DB
          console.log('[Service Delete] updateServices completed:', result);
          showToast('Service deleted successfully', 'success');
        } catch (error) {
          console.error('[Service Delete] Error occurred:', error);
          const errorMsg = error instanceof Error ? error.message : String(error);
          showToast(`Failed to delete service: ${errorMsg}`, 'error');
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
    console.log('Category submit started...');
    setIsUploading(true);

    try {
      const withTimeout = async <T,>(promise: Promise<T>, ms: number, message: string): Promise<T> => {
        return Promise.race([
          promise,
          new Promise<T>((_, reject) => setTimeout(() => reject(new Error(message)), ms))
        ]);
      };

      let imageUrl = categoryForm.image || '';
      
      if (categoryImageFile) {
        console.log('Uploading image file:', categoryImageFile.name);
        try {
          imageUrl = await withTimeout(
            uploadImage(categoryImageFile),
            20000,
            'Image upload timeout'
          );
          console.log('Image uploaded successfully to Cloudinary:', imageUrl);
        } catch (uploadError: unknown) {
          const errorMsg = uploadError instanceof Error ? uploadError.message : String(uploadError);
          console.error('Image upload error:', errorMsg);
          showToast(errorMsg, 'error');
          return;
        }
      } else {
        console.log('No image file selected. Using existing:', imageUrl);
      }

      // Sanitize category to ensure no undefined values
      const sanitizedCategory = {
        id: categoryForm.id || Date.now().toString(),
        name: categoryForm.name || '',
        icon: categoryForm.icon || '',
        image: imageUrl,
        description: categoryForm.description || '',
        chatPrice: Number(categoryForm.chatPrice) || 0,
        callPrice: Number(categoryForm.callPrice) || 0,
        videoPrice: Number(categoryForm.videoPrice) || 0
      };
      console.log('Final category object ready:', {
        id: sanitizedCategory.id,
        name: sanitizedCategory.name,
        hasImage: !!sanitizedCategory.image,
        imageUrl: sanitizedCategory.image
      });

      const updatedCategories = editingCategory
        ? categoriesForm.map(c => c.id === editingCategory.id ? sanitizedCategory : c)
        : [...categoriesForm, sanitizedCategory];

      console.log('Updated categories array:', updatedCategories);
      setCategoriesForm(updatedCategories);
      
      console.log('Saving to database...');
      await withTimeout(
        updateServiceCategories(updatedCategories),
        7000,
        'Saving category timed out'
      );
      console.log('Database saved successfully');

      // Clean up and close
      setShowCategoryModal(false);
      setCategoryImageFile(null);
      setCategoryImagePreview(null);
      setCategoryForm({
        id: '',
        name: '',
        icon: '',
        image: '',
        description: '',
        chatPrice: 0,
        callPrice: 0,
        videoPrice: 0
      });
      if (categoryFileInputRef.current) {
        categoryFileInputRef.current.value = '';
      }
      
      showToast(editingCategory ? 'Category updated successfully!' : 'Category added successfully!', 'success');
      console.log('Category submit completed - category now visible in list');
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('Error saving category:', errorMsg);
      showToast('Failed to save category: ' + errorMsg, 'error');
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="w-14 h-14 bg-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-900/40">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Shunyethra Admin</h1>
            <p className="text-slate-400 text-sm mt-1">Sign in to your dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 px-4 py-3.5 rounded-xl outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 transition-all text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-rose-400 transition-colors"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-500 text-white py-3.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-rose-900/30"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50 flex">

        {/* ── SIDEBAR (Desktop) ── */}
        <aside className="hidden lg:flex flex-col w-60 xl:w-64 bg-slate-900 text-white shrink-0 sticky top-0 h-screen overflow-y-auto">
          {/* Brand */}
          <div className="px-5 py-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-none">Shunyethra</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Admin Portal</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {[
              { id: AdminView.DASHBOARD,      label: 'Dashboard',        emoji: '▦' },
              { id: AdminView.ORDERS,         label: 'Orders',           emoji: '⬡' },
              { id: AdminView.APPOINTMENTS,   label: 'Bookings',         emoji: '◷' },
              { id: AdminView.INVENTORY,      label: 'Products',         emoji: '⬡' },
              { id: AdminView.SERVICES,       label: 'Services',         emoji: '◈' },
              { id: AdminView.MODERATION,     label: 'Reviews',          emoji: '★' },
              { id: AdminView.BLOG,           label: 'Blog',             emoji: '◧' },
              { id: AdminView.COURSES_EBOOKS, label: 'Courses & eBooks', emoji: '▤' },
              { id: AdminView.SETTINGS,       label: 'Settings',         emoji: '◎' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                  view === item.id
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="text-base w-5 text-center leading-none">{item.emoji}</span>
                <span>{item.label}</span>
                {item.id === AdminView.MODERATION && testimonials.filter(t => !t.isModerated).length > 0 && (
                  <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {testimonials.filter(t => !t.isModerated).length}
                  </span>
                )}
                {item.id === AdminView.ORDERS && orders.filter(o => o.status === 'pending').length > 0 && (
                  <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {orders.filter(o => o.status === 'pending').length}
                  </span>
                )}
                {item.id === AdminView.APPOINTMENTS && bookings.filter(b => b.status === 'pending').length > 0 && (
                  <span className="ml-auto bg-blue-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {bookings.filter(b => b.status === 'pending').length}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Bottom */}
          <div className="px-3 py-4 border-t border-slate-800 space-y-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-left"
            >
              <span className="text-base w-5 text-center">⏻</span>
              <span>Sign Out</span>
            </button>
            <p className="text-[10px] text-slate-600 px-3 pt-2">v1.1.0</p>
          </div>
        </aside>

        {/* ── MOBILE TOP BAR ── */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 text-white flex items-center justify-between px-4 h-12 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-rose-600 rounded flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">S</span>
            </div>
            <span className="text-sm font-bold">Admin</span>
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-rose-400 text-xs font-medium">Sign out</button>
        </div>

        {/* ── MOBILE BOTTOM NAV ── */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 flex overflow-x-auto no-scrollbar">
          {[
            { id: AdminView.DASHBOARD,      label: 'Home',     emoji: '▦' },
            { id: AdminView.ORDERS,         label: 'Orders',   emoji: '⬡' },
            { id: AdminView.APPOINTMENTS,   label: 'Bookings', emoji: '◷' },
            { id: AdminView.INVENTORY,      label: 'Products', emoji: '⬡' },
            { id: AdminView.SERVICES,       label: 'Services', emoji: '◈' },
            { id: AdminView.MODERATION,     label: 'Reviews',  emoji: '★' },
            { id: AdminView.BLOG,           label: 'Blog',     emoji: '◧' },
            { id: AdminView.COURSES_EBOOKS, label: 'Courses',  emoji: '▤' },
            { id: AdminView.SETTINGS,       label: 'More',     emoji: '◎' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex-none flex flex-col items-center justify-center gap-1 py-3 px-4 text-xs font-bold transition-colors min-w-[72px] ${
                view === item.id ? 'text-rose-400 bg-slate-800/50' : 'text-slate-500'
              }`}
            >
              <span className="text-xl leading-none relative">
                {item.emoji}
                {item.id === AdminView.ORDERS && orders.filter(o => o.status === 'pending').length > 0 && (
                  <span className="absolute top-0 -right-1 w-2 h-2 bg-rose-500 rounded-full border border-slate-900"></span>
                )}
                {item.id === AdminView.APPOINTMENTS && bookings.filter(b => b.status === 'pending').length > 0 && (
                  <span className="absolute top-0 -right-1 w-2 h-2 bg-rose-500 rounded-full border border-slate-900"></span>
                )}
              </span>
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          ))}
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 flex flex-col min-h-screen lg:overflow-y-auto min-w-0">
          {/* Content Header */}
          <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-100 sticky top-0 z-30">
            <div>
              <h1 className="text-base font-bold text-slate-800">
                {[
                  { id: AdminView.DASHBOARD,      label: 'Dashboard' },
                  { id: AdminView.ORDERS,         label: 'Orders' },
                  { id: AdminView.APPOINTMENTS,   label: 'Bookings' },
                  { id: AdminView.INVENTORY,      label: 'Products' },
                  { id: AdminView.SERVICES,       label: 'Services' },
                  { id: AdminView.MODERATION,     label: 'Reviews & Testimonials' },
                  { id: AdminView.BLOG,           label: 'Blog Posts' },
                  { id: AdminView.COURSES_EBOOKS, label: 'Courses & eBooks' },
                  { id: AdminView.SETTINGS,       label: 'Settings' },
                ].find(v => v.id === view)?.label}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
                <span className="text-rose-600 text-xs font-bold">P</span>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-3 sm:p-4 pt-16 lg:pt-6 lg:p-8 pb-24 lg:pb-8 min-w-0 overflow-x-hidden">

        {view === AdminView.DASHBOARD && (
          <div className="space-y-8 lg:space-y-10 animate-fade-in">
            <div>
              <h3 className="text-2xl lg:text-4xl font-mystic text-rose-900 mb-2">Business Overview</h3>
              <p className="text-slate-500 text-sm lg:text-base">Real-time dashboard metrics and performance</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-6">
              <div className="bg-gradient-to-br from-rose-50 to-white p-3 sm:p-4 lg:p-8 rounded-2xl border border-rose-100 shadow-sm min-w-0">
                <p className="text-slate-500 text-[9px] sm:text-xs uppercase font-bold tracking-widest mb-1 sm:mb-3 truncate">Total Revenue</p>
                <p className="text-xl sm:text-3xl lg:text-4xl font-mystic text-rose-600 mb-1 sm:mb-2">₹{analytics.totalSales.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400 truncate">Last 30 days</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-white p-3 sm:p-4 lg:p-8 rounded-2xl border border-blue-100 shadow-sm min-w-0">
                <p className="text-slate-500 text-[9px] sm:text-xs uppercase font-bold tracking-widest mb-1 sm:mb-3 truncate">Pending Sessions</p>
                <p className="text-xl sm:text-3xl lg:text-4xl font-mystic text-blue-600 mb-1 sm:mb-2">
                  {analytics.pendingCount}
                </p>
                <p className="text-[10px] text-slate-400 truncate">Awaiting confirmation</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-white p-3 sm:p-4 lg:p-8 rounded-2xl border border-emerald-100 shadow-sm min-w-0">
                <p className="text-slate-500 text-[9px] sm:text-xs uppercase font-bold tracking-widest mb-1 sm:mb-3 truncate">Active Inventory</p>
                <p className="text-xl sm:text-3xl lg:text-4xl font-mystic text-emerald-600 mb-1 sm:mb-2">
                  {products.length}
                </p>
                <p className="text-[10px] text-slate-400 truncate">Products listed</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-white p-3 sm:p-4 lg:p-8 rounded-2xl border border-purple-100 shadow-sm min-w-0">
                <p className="text-slate-500 text-[9px] sm:text-xs uppercase font-bold tracking-widest mb-1 sm:mb-3 truncate">Testimonials</p>
                <p className="text-xl sm:text-3xl lg:text-4xl font-mystic text-purple-600 mb-1 sm:mb-2">
                  {testimonials.length}
                </p>
                <p className="text-[10px] text-slate-400 truncate">Client reviews</p>
              </div>
            </div>

            <div className="mt-10 lg:mt-12">
              <h4 className="text-lg lg:text-xl font-bold text-slate-800 mb-6">Most Booked Slots</h4>
              <div className="space-y-3 lg:space-y-4">
                {analytics.sortedSlots.length > 0 ? analytics.sortedSlots.map(([slot, count]) => (
                  <div key={slot} className="bg-slate-50 h-12 lg:h-14 rounded-lg flex items-center px-4 lg:px-6 overflow-hidden relative border border-slate-200">
                    <div className="absolute left-0 top-0 bottom-0 bg-rose-200" style={{ width: `${(count / bookings.length) * 100}%` }}></div>
                    <span className="relative z-10 text-slate-700 text-sm lg:text-base font-bold">{slot}</span>
                    <span className="relative z-10 ml-auto text-rose-600 text-xs lg:text-sm font-semibold">{count} bookings</span>
                  </div>
                )) : (
                  <p className="text-slate-500 text-sm lg:text-base">No bookings recorded yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {view === AdminView.COURSES_EBOOKS && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-2xl lg:text-3xl font-mystic text-rose-900 mb-1">Courses &amp; eBooks</h3>
                <p className="text-slate-500 text-sm">Upload and manage PDFs for your spiritual knowledge library</p>
              </div>
              <button
                onClick={() => { resetCourseForm(); setShowCourseModal(true); }}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-rose-600 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg hover:opacity-90 transition-opacity w-full sm:w-auto"
              >
                <span>+</span> Add New
              </button>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-purple-700">{coursesEbooks.length}</p>
                <p className="text-xs text-purple-500 font-medium">Total Items</p>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-indigo-700">{coursesEbooks.filter(c => c.type === 'ebook').length}</p>
                <p className="text-xs text-indigo-500 font-medium">eBooks</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-emerald-700">{coursesEbooks.filter(c => c.type === 'course').length}</p>
                <p className="text-xs text-emerald-500 font-medium">Courses</p>
              </div>
            </div>

            {/* List */}
            {coursesEbooks.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-rose-200 rounded-2xl">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-slate-500 font-medium text-lg">No courses or eBooks yet</p>
                <p className="text-sm text-slate-400 mt-1">Click "Add New" to upload your first PDF</p>
              </div>
            ) : (
              <div className="space-y-3">
                {coursesEbooks.map(item => (
                  <div key={item.id} className="flex items-center gap-4 bg-white border border-rose-100 rounded-2xl p-4 hover:shadow-md transition-shadow">
                    {/* Thumbnail */}
                    <div className="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-purple-100 to-rose-100 flex items-center justify-center">
                      {item.coverImage ? (
                        <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">{item.type === 'ebook' ? '📖' : '🎓'}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${item.type === 'ebook' ? 'bg-indigo-500' : 'bg-emerald-500'}`}>
                          {item.type === 'ebook' ? 'eBook' : 'Course'}
                        </span>
                        {item.isFeatured && <span className="text-xs font-bold text-yellow-500">⭐ Featured</span>}
                        <span className={`text-xs font-bold ml-auto ${item.price === 0 ? 'text-rose-500' : 'text-amber-600'}`}>
                          {item.price === 0 ? 'FREE' : `₹${item.price}`}
                        </span>
                      </div>
                      <p className="font-bold text-slate-800 truncate" title={item.title}>{item.title}</p>
                      <p className="text-xs text-slate-400 truncate" title={`${item.category} · ${item.author}`}>{item.category} · {item.author}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a href={item.pdfUrl} download={`${item.title}.pdf`}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Download PDF">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                      <a href={item.pdfUrl} target="_blank" rel="noopener noreferrer"
                        className="p-2 text-purple-500 hover:bg-purple-50 rounded-lg transition-colors" title="Preview PDF">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                      <button onClick={() => {
                        setEditingCourse(item);
                        setCourseForm({
                          title: item.title, description: item.description, type: item.type,
                          category: item.category, pdfUrl: item.pdfUrl, coverImage: item.coverImage || '',
                          price: item.price, author: item.author, pages: item.pages || 0,
                          duration: item.duration || '', isFeatured: item.isFeatured || false
                        });
                        setCourseCoverPreview(item.coverImage || null);
                        setShowCourseModal(true);
                      }}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDeleteCourse(item.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add/Edit Modal */}
            {showCourseModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
                  <div className="p-6 border-b border-rose-100 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-800">{editingCourse ? 'Edit' : 'Add'} Course / eBook</h3>
                    <button onClick={() => { setShowCourseModal(false); resetCourseForm(); }}
                      className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <form onSubmit={handleCourseSubmit} className="p-6 space-y-4">
                    {/* Type Toggle */}
                    <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                      {(['ebook', 'course'] as const).map(t => (
                        <button type="button" key={t}
                          onClick={() => setCourseForm(f => ({ ...f, type: t }))}
                          className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-all ${courseForm.type === t ? 'bg-white shadow text-purple-700' : 'text-slate-500'}`}>
                          {t === 'ebook' ? '📖 eBook' : '🎓 Course'}
                        </button>
                      ))}
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Title *</label>
                      <input type="text" required
                        value={courseForm.title}
                        onChange={e => setCourseForm(f => ({ ...f, title: e.target.value }))}
                        placeholder="Enter title..." 
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 bg-slate-50" />
                    </div>

                    {/* Author & Category */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Author</label>
                        <input type="text"
                          value={courseForm.author}
                          onChange={e => setCourseForm(f => ({ ...f, author: e.target.value }))}
                          placeholder="Pooja Gupta"
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 bg-slate-50" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Category</label>
                        <input type="text"
                          value={courseForm.category}
                          onChange={e => setCourseForm(f => ({ ...f, category: e.target.value }))}
                          placeholder="Tarot, Healing..."
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 bg-slate-50" />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Description</label>
                      <textarea rows={3}
                        value={courseForm.description}
                        onChange={e => setCourseForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Brief description..."
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 bg-slate-50 resize-none" />
                    </div>

                    {/* Price & Pages/Duration */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Price (₹) — 0 = Free</label>
                        <input type="number" min="0"
                          value={courseForm.price}
                          onChange={e => setCourseForm(f => ({ ...f, price: Number(e.target.value) }))}
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 bg-slate-50" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                          {courseForm.type === 'ebook' ? 'Pages' : 'Duration'}
                        </label>
                        {courseForm.type === 'ebook' ? (
                          <input type="number" min="0"
                            value={courseForm.pages}
                            onChange={e => setCourseForm(f => ({ ...f, pages: Number(e.target.value) }))}
                            placeholder="e.g. 48"
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 bg-slate-50" />
                        ) : (
                          <input type="text"
                            value={courseForm.duration}
                            onChange={e => setCourseForm(f => ({ ...f, duration: e.target.value }))}
                            placeholder="e.g. 4 hours"
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 bg-slate-50" />
                        )}
                      </div>
                    </div>

                    {/* Featured Toggle */}
                    <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                      <input type="checkbox" id="isFeatured"
                        checked={courseForm.isFeatured}
                        onChange={e => setCourseForm(f => ({ ...f, isFeatured: e.target.checked }))}
                        className="w-4 h-4 accent-yellow-500" />
                      <label htmlFor="isFeatured" className="text-sm font-medium text-slate-700 cursor-pointer">
                        ⭐ Feature this item prominently on the page
                      </label>
                    </div>

                    {/* Cover Image Upload */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Cover Image (optional)</label>
                      <div
                        onClick={() => courseCoverInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 rounded-xl p-4 cursor-pointer hover:border-purple-400 transition-colors text-center">
                        {courseCoverPreview ? (
                          <img src={courseCoverPreview} alt="Cover" className="w-24 h-32 object-cover rounded-lg mx-auto" />
                        ) : (
                          <div className="text-slate-400">
                            <div className="text-3xl mb-1">🖼️</div>
                            <p className="text-xs">Click to upload cover image</p>
                          </div>
                        )}
                      </div>
                      <input ref={courseCoverInputRef} type="file" accept="image/*" className="hidden"
                        onChange={e => {
                          const f = e.target.files?.[0];
                          if (f) {
                            setCourseCoverFile(f);
                            const reader = new FileReader();
                            reader.onloadend = () => setCourseCoverPreview(reader.result as string);
                            reader.readAsDataURL(f);
                          }
                        }} />
                    </div>

                    {/* PDF Upload */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">PDF File *</label>
                      <div
                        onClick={() => coursePdfInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-5 cursor-pointer transition-colors text-center ${coursePdfFile || (editingCourse && courseForm.pdfUrl) ? 'border-purple-400 bg-purple-50' : 'border-slate-200 hover:border-purple-400'}`}>
                        {coursePdfFile ? (
                          <div className="text-purple-700">
                            <div className="text-3xl mb-1">📄</div>
                            <p className="text-sm font-medium">{coursePdfFile.name}</p>
                            <p className="text-xs text-purple-400">{(coursePdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        ) : editingCourse && courseForm.pdfUrl ? (
                          <div className="text-green-600">
                            <div className="text-3xl mb-1">✅</div>
                            <p className="text-xs">PDF already uploaded. Click to replace.</p>
                          </div>
                        ) : (
                          <div className="text-slate-400">
                            <div className="text-3xl mb-1">📤</div>
                            <p className="text-sm font-medium">Click to upload PDF</p>
                            <p className="text-xs mt-0.5">Maximum 50MB recommended</p>
                          </div>
                        )}
                      </div>
                      <input ref={coursePdfInputRef} type="file" accept="application/pdf" className="hidden"
                        onChange={e => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          if (f.type !== 'application/pdf') {
                            showToast('Only PDF files are allowed', 'error');
                            if (coursePdfInputRef.current) coursePdfInputRef.current.value = '';
                            return;
                          }
                          if (f.size > 50 * 1024 * 1024) {
                            showToast('PDF must be 50MB or smaller', 'error');
                            if (coursePdfInputRef.current) coursePdfInputRef.current.value = '';
                            return;
                          }
                          setCoursePdfFile(f);
                        }} />
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={isCourseUploading}
                      className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-rose-600 hover:opacity-90 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2">
                      {isCourseUploading ? (
                        <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Uploading...</>
                      ) : (
                        <>{editingCourse ? '💾 Save Changes' : '🚀 Publish'}</>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {view === AdminView.APPOINTMENTS && (

          <div className="space-y-8 lg:space-y-10 animate-fade-in">
            <div>
              <h3 className="text-2xl lg:text-4xl font-mystic text-rose-900 mb-2">Appointment Dashboard</h3>
              <p className="text-slate-500 text-sm lg:text-base">Manage all bookings and consultations</p>
            </div>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm lg:text-base">
                <thead>
                  <tr className="border-b-2 border-rose-200 text-slate-600 text-xs lg:text-sm uppercase tracking-widest font-bold bg-rose-50/50">
                    <th className="py-4 lg:py-6 px-4 lg:px-6">Client</th>
                    <th className="py-4 lg:py-6 px-4 lg:px-6">Service</th>
                    <th className="py-4 lg:py-6 px-4 lg:px-6">Date/Time</th>
                    <th className="py-4 lg:py-6 px-4 lg:px-6">Status</th>
                    <th className="py-4 lg:py-6 px-4 lg:px-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-100">
                  {bookings.length > 0 ? bookings.map(booking => (
                    <tr key={booking.id} className="border-b border-rose-50 hover:bg-rose-50/50 transition-colors">
                      <td className="py-4 pr-4 max-w-[200px]">
                        <p className="font-bold text-rose-900 truncate" title={booking.clientName}>{booking.clientName}</p>
                        <p className="text-xs text-slate-500 truncate" title={booking.email}>{booking.email}</p>
                        <p className="text-[10px] text-rose-400 font-bold">{booking.phone}</p>
                      </td>
                      <td className="py-4 text-slate-600 max-w-[150px]">
                        <div className="truncate" title={booking.service}>{booking.service}</div>
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
                    <div className="flex-grow min-w-0 mr-2">
                      <p className="font-bold text-rose-900 text-lg leading-tight truncate" title={booking.clientName}>{booking.clientName}</p>
                      <p className="text-xs text-slate-500">{booking.email}</p>
                      <p className="text-[10px] text-rose-400 font-bold">{booking.phone}</p>
                    </div>
                    <div className="flex gap-2">
                      {booking.birthDetails && <button className="w-9 h-9 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center shadow-sm">📜</button>}
                      <button onClick={() => handleDeleteBooking(booking.id)} className="w-9 h-9 bg-red-50 text-red-400 rounded-full flex items-center justify-center shadow-sm">🗑️</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-3 border-y border-rose-50">
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Service</p>
                      <p className="text-sm font-bold text-slate-700 truncate" title={booking.service}>{booking.service}</p>
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
                    <div className="flex flex-wrap gap-2">
                      {['Pending', 'Confirmed', 'Completed'].map(status => (
                        <button
                          key={status}
                          onClick={() => updateBookingStatus(booking.id, status as any)}
                          className={`flex-1 min-w-[70px] py-2 rounded-xl text-[10px] font-bold uppercase tracking-tighter transition-all shadow-sm ${booking.status === status
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
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-2xl font-mystic text-rose-900">Order Management</h3>

            {orders.length === 0 ? (
              <p className="text-center text-slate-500 py-10">No orders received yet.</p>
            ) : (
              <>
                {/* ── MOBILE: card list ── */}
                <div className="flex flex-col gap-4 md:hidden">
                  {orders.map(order => (
                    <div key={order.id} className="bg-white rounded-2xl border border-rose-100 shadow-sm p-4 space-y-3">
                      {/* Customer */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <p className="font-bold text-rose-900 truncate">{order.customerName}</p>
                          <p className="text-[11px] text-rose-400 font-bold">{order.phone || (order as any).customerPhone}</p>
                          <p className="text-xs text-slate-400 break-words line-clamp-2" title={order.address || (order as any).shippingAddress}>
                            {order.address || (order as any).shippingAddress}
                          </p>
                          {(order.pincode || (order as any).pinCode) && (
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">PIN: {order.pincode || (order as any).pinCode}</p>
                          )}
                        </div>
                        <span className="text-lg font-extrabold text-rose-600 whitespace-nowrap">
                          ₹{order.total || (order as any).totalAmount}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="bg-rose-50/60 rounded-xl px-3 py-2 space-y-0.5">
                        {order.items.map((item: any, idx: number) => (
                          <p key={idx} className="text-xs text-slate-700">
                            {item.quantity}x {item.name || item.product?.name || 'Unknown Product'}
                          </p>
                        ))}
                      </div>

                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        <span className="bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">
                          {order.paymentMethod}
                        </span>
                        <span className="text-slate-400">
                          {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Just now'}
                        </span>
                      </div>

                      {/* Status + Delete */}
                      <div className="flex items-center justify-between gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                          className={`bg-white border border-rose-200 text-[11px] uppercase font-bold px-2 py-1 rounded flex-1 ${
                            order.status === 'Completed' ? 'text-green-600' :
                            order.status === 'Cancelled' ? 'text-red-600' : 'text-yellow-600'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-white border border-red-100 text-red-500 rounded-lg hover:bg-red-50 transition-colors text-xs font-bold"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── DESKTOP: full table ── */}
                <div className="hidden md:block overflow-x-auto">
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
                      {orders.map(order => (
                        <tr key={order.id} className="border-b border-rose-50 hover:bg-rose-50/50 transition-colors">
                          <td className="py-4 pr-4 max-w-[220px]">
                            <p className="font-bold text-rose-900 truncate" title={order.customerName}>{order.customerName}</p>
                            <p className="text-[10px] text-rose-400 font-bold">{order.phone || (order as any).customerPhone}</p>
                            <p className="text-xs text-slate-500 break-words mt-1" title={order.address || (order as any).shippingAddress}>
                              {order.address || (order as any).shippingAddress}
                            </p>
                            {(order.pincode || (order as any).pinCode) && (
                              <p className="text-[10px] text-slate-500 font-bold mt-1 bg-slate-50 inline-block px-2 py-0.5 rounded border border-slate-100">
                                PIN: {order.pincode || (order as any).pinCode}
                              </p>
                            )}
                          </td>
                          <td className="py-4">
                            <div className="space-y-1">
                              {order.items.map((item: any, idx: number) => (
                                <p key={idx} className="text-xs text-slate-600">
                                  {item.quantity}x {item.name || item.product?.name || 'Unknown Product'}
                                </p>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 font-bold text-rose-600">₹{order.total || (order as any).totalAmount}</td>
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
                              className={`bg-white border border-rose-200 text-[10px] uppercase font-bold p-1 rounded ${
                                order.status === 'Completed' ? 'text-green-600' :
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
                      ))}
                    </tbody>
                  </table>
                </div>


              </>

            )}
          </div>
        )}



        {view === AdminView.BLOG && (
          <div className="space-y-8 animate-fade-in sm:px-0 box-border overflow-x-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 items-start w-full box-border sm:px-0">
              <h3 className="text-2xl font-mystic text-rose-900">Blog Posts</h3>
              <button
                onClick={() => { resetBlogForm(); setShowBlogModal(true); }}
                className="bg-rose-500 text-white px-3 py-2 rounded-xl font-bold text-xs w-full max-w-[140px] sm:w-auto sm:px-6 sm:py-3.5 sm:text-sm shadow-lg hover:bg-rose-600 transition-colors"
                style={{ minWidth: 0, alignSelf: 'flex-start' }}
              >
                + NEW POST
              </button>
            </div>
            <div className="grid gap-5 px-1 sm:px-0 box-border">
              {blogs.length > 0 ? blogs.map(blog => (
                <div key={blog.id} className="bg-white p-4 rounded-2xl border border-rose-100 flex flex-col gap-4 shadow-sm group w-full">
                  <div className="flex items-center gap-4">
                    <img src={blog.image} className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0" alt="" />
                    <div className="flex-grow min-w-0">
                      <h4 className="font-bold text-slate-800 line-clamp-1 sm:line-clamp-2 text-sm sm:text-base" title={blog.title}>{blog.title}</h4>
                      <p className="text-[10px] sm:text-xs text-slate-400 capitalize truncate mt-1" title={blog.slug}>{blog.slug}</p>
                    </div>
                    {/* Desktop Buttons */}
                    <div className="hidden sm:flex gap-2 shrink-0 ml-4">
                      <button onClick={() => {
                        setEditingBlog(blog);
                        setBlogForm({ title: blog.title, content: blog.content, image: blog.image || '', excerpt: blog.excerpt || '' });
                        setShowBlogModal(true);
                      }} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors" title="Edit">
                        ✏️
                      </button>
                      <button onClick={() => handleDeleteBlog(blog.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors" title="Delete">
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Mobile Buttons - Separate Row */}
                  <div className="sm:hidden flex flex-col items-start gap-2 w-full pt-3 border-t border-rose-50 box-border px-2">
                    <button
                      onClick={() => {
                        setEditingBlog(blog);
                        setBlogForm({ title: blog.title, content: blog.content, image: blog.image || '', excerpt: blog.excerpt || '' });
                        setShowBlogModal(true);
                      }}
                      className="w-auto px-10 flex items-center justify-center gap-2 bg-rose-50 text-rose-600 py-2.5 rounded-xl font-bold text-xs"
                    >
                      ✏️ EDIT
                    </button>
                    <button
                      onClick={() => handleDeleteBlog(blog.id)}
                      className="w-auto px-10 flex items-center justify-center gap-2 bg-red-50 text-red-500 py-2.5 rounded-xl font-bold text-xs"
                    >
                      🗑️ DELETE
                    </button>
                  </div>
                </div>
              )) : <p className="text-center text-slate-400 py-10">No blogs yet.</p>}
            </div>
          </div>
        )}

        {view === AdminView.INVENTORY && (
          <div className="space-y-8 animate-fade-in px-0 sm:px-4 box-border overflow-x-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 w-full max-w-full box-border px-4 sm:px-0">
              <h3 className="text-2xl font-mystic text-rose-900">Inventory Management</h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0 box-border">
                <button
                  onClick={() => {
                    setView(AdminView.SETTINGS);
                    requestAnimationFrame(() => {
                      setTimeout(() => {
                        crystalCombosSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 120);
                    });
                  }}
                  className="w-auto px-6 bg-amber-500 text-white py-3 rounded-xl font-bold text-xs tracking-wide hover:bg-amber-600 transition-colors shadow-sm"
                  style={{ minWidth: 0 }}
                >
                  Manage Crystal Combos
                </button>
                <button
                  onClick={() => { resetProductForm(); setShowProductModal(true); }}
                  className="w-auto px-6 bg-rose-500 text-white py-3 rounded-xl font-bold text-xs tracking-wide hover:bg-rose-600 transition-colors shadow-md"
                  style={{ minWidth: 0 }}
                >
                  + ADD PRODUCT
                </button>
              </div>
            </div>
            <div className="grid gap-4 px-1 sm:px-0 box-border">
              {products.length > 0 ? products.map(product => (
                <div key={product.id} className="bg-white p-4 rounded-2xl border border-rose-100 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 shadow-sm relative group w-full max-w-full">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img src={product.image} className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover" alt={product.name} />
                    <div className="flex-grow min-w-0">
                      <h4 className="font-bold text-rose-900 leading-tight truncate" title={product.name}>{product.name}</h4>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest truncate">{product.category}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full sm:w-auto sm:flex-grow gap-4 sm:gap-6">
                    <div className="flex items-center gap-8 w-full sm:w-auto justify-start">
                      <div className="text-left sm:text-center">
                        <p className="text-[10px] text-slate-400 mb-0.5 uppercase font-bold tracking-tighter">Stock</p>
                        <p className={`font-bold text-sm ${(product.stock ?? 0) < 5 ? 'text-red-500' : 'text-slate-700'}`}>{product.stock ?? 0}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] text-slate-400 mb-0.5 uppercase font-bold tracking-tighter">Price</p>
                        <p className="font-bold text-rose-500 text-sm">₹{product.price}</p>
                      </div>
                    </div>

                    {/* Desktop Buttons */}
                    <div className="hidden sm:flex gap-2 shrink-0 ml-auto">
                      <button
                        onClick={() => openEditProduct(product)}
                        className="w-8 h-8 flex items-center justify-center bg-rose-50 hover:bg-rose-100 rounded-xl text-rose-600 transition-colors shadow-sm"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="w-8 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 rounded-xl text-red-500 transition-colors shadow-sm"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>

                    {/* Mobile Buttons - Separate Row */}
                    <div className="sm:hidden flex flex-col items-start gap-2 w-full pt-3 border-t border-rose-50 box-border px-2">
                      <button
                        onClick={() => openEditProduct(product)}
                        className="w-auto px-10 flex items-center justify-center gap-2 bg-rose-50 text-rose-600 py-2.5 rounded-xl font-bold text-[11px] leading-none transition-colors"
                      >
                        ✏️ EDIT
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="w-auto px-10 flex items-center justify-center gap-2 bg-red-50 text-red-500 py-2.5 rounded-xl font-bold text-[11px] leading-none transition-colors"
                      >
                        🗑️ DELETE
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
            <div className="bg-white w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-3xl border border-rose-200 shadow-2xl p-5 sm:p-8">
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
            <div className="bg-white w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-3xl border border-rose-200 shadow-2xl p-5 sm:p-8">
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
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Base Price (₹)</label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={serviceForm.price}
                      onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none text-slate-900"
                      placeholder="Fallback price"
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
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Category</label>
                    <input
                      required
                      type="text"
                      value={serviceForm.category}
                      onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none text-slate-900"
                      placeholder="e.g., Tarot Guidance"
                    />
                  </div>
                </div>

                  <div className="space-y-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                  <label className="text-sm font-bold text-rose-900 uppercase tracking-widest">Session Mode Prices (₹)</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-600">💬 Chat Price</p>
                      <input
                        type="number"
                        min="0"
                        value={serviceForm.chatPrice || ''}
                        onChange={(e) => setServiceForm({ ...serviceForm, chatPrice: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-200 p-2 rounded-lg focus:border-rose-500 outline-none text-slate-900 text-sm"
                        placeholder="e.g., 555"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-600">📞 Call Price</p>
                      <input
                        type="number"
                        min="0"
                        value={serviceForm.callPrice || ''}
                        onChange={(e) => setServiceForm({ ...serviceForm, callPrice: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-200 p-2 rounded-lg focus:border-rose-500 outline-none text-slate-900 text-sm"
                        placeholder="e.g., 999"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-600">🎥 Video Price</p>
                      <input
                        type="number"
                        min="0"
                        value={serviceForm.videoPrice || ''}
                        onChange={(e) => setServiceForm({ ...serviceForm, videoPrice: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-200 p-2 rounded-lg focus:border-rose-500 outline-none text-slate-900 text-sm"
                        placeholder="e.g., 1999"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">Leave empty to use base price as fallback for that mode.</p>
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

                <div className="space-y-4 p-4 bg-gradient-to-br from-purple-50 to-rose-50 border border-purple-200 rounded-xl">
                  <label className="text-sm font-bold text-purple-900 uppercase tracking-widest flex items-center gap-2">
                    <span>📝</span> Mode-Specific Descriptions
                  </label>
                  <p className="text-xs text-slate-600">Add unique descriptions for each session mode</p>
                  
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <span>💬</span> Chat Description
                      </label>
                      <textarea
                        rows={2}
                        value={serviceForm.chatDescription || ''}
                        onChange={(e) => setServiceForm({ ...serviceForm, chatDescription: e.target.value })}
                        className="w-full bg-white border border-slate-200 p-2.5 rounded-lg focus:border-purple-500 outline-none resize-none text-slate-900 text-sm"
                        placeholder="Describe the chat session experience..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <span>📞</span> Call Description
                      </label>
                      <textarea
                        rows={2}
                        value={serviceForm.callDescription || ''}
                        onChange={(e) => setServiceForm({ ...serviceForm, callDescription: e.target.value })}
                        className="w-full bg-white border border-slate-200 p-2.5 rounded-lg focus:border-purple-500 outline-none resize-none text-slate-900 text-sm"
                        placeholder="Describe the call session experience..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <span>🎥</span> Video Description
                      </label>
                      <textarea
                        rows={2}
                        value={serviceForm.videoDescription || ''}
                        onChange={(e) => setServiceForm({ ...serviceForm, videoDescription: e.target.value })}
                        className="w-full bg-white border border-slate-200 p-2.5 rounded-lg focus:border-purple-500 outline-none resize-none text-slate-900 text-sm"
                        placeholder="Describe the video session experience..."
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">General Description (Fallback)</label>
                  <textarea
                    rows={2}
                    value={serviceForm.description || ''}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none resize-none text-slate-900"
                    placeholder="General description if mode-specific not provided..."
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
          <div className="space-y-6 sm:space-y-8 px-0 sm:px-4 overflow-x-hidden animate-fade-in">
            <h3 className="text-2xl font-mystic text-rose-900 px-4 sm:px-0">Review Moderation</h3>
            <div className="grid gap-6 px-4 sm:px-0">
              {testimonials.length > 0 ? testimonials.map(t => (
                <div key={t.id} className="bg-white p-4 sm:p-6 rounded-2xl border border-rose-100 relative shadow-sm">
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
                  <p className="text-slate-600 italic mb-4 max-w-lg line-clamp-3" title={t.text}>"{t.text}"</p>
                  <p className="text-rose-900 font-bold">{t.name}</p>
                </div>
              )) : (
                <p className="text-slate-500 text-center py-10">No reviews submitted yet.</p>
              )}
            </div>
          </div>
        )}



        {view === AdminView.SERVICES && (
          <div className="space-y-8 animate-fade-in px-0 sm:px-4 box-border overflow-x-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 w-full max-w-full box-border px-4 sm:px-0">
              <h3 className="text-2xl font-mystic text-rose-900">Service Management</h3>
              <button
                onClick={() => {
                  setEditingService(null);
                  setServiceForm({
                    id: '',
                    name: '',
                    category: 'Tarot Guidance',
                    price: 0,
                    duration: '',
                    icon: '🔮',
                    image: '',
                    description: '',
                    chatDescription: '',
                    callDescription: '',
                    videoDescription: '',
                    chatPrice: 0,
                    callPrice: 0,
                    videoPrice: 0
                  });
                  setServiceImageFile(null);
                  setServiceImagePreview(null);
                  setShowServiceModal(true);
                }}
                className="bg-rose-500 text-white px-6 py-3 rounded-xl font-bold tracking-widest hover:bg-rose-600 transition-all shadow-lg hover:shadow-rose-200 flex items-center justify-center gap-2"
              >
                <span>➕</span> ADD NEW SERVICE
              </button>
            </div>
            {/* Category Management */}
            <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm">
              <h4 className="text-lg font-mystic text-rose-800 mb-6 flex items-center gap-2">
                <span>📁</span> Manage Categories
              </h4>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {categoriesForm.map((cat, idx) => {
                    console.log(`Rendering category: ${cat.name}, has image: ${!!cat.image}, imageUrl: ${cat.image ? cat.image.substring(0, 50) : 'EMPTY'}`);
                    return (
                    <div key={cat.id || idx} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-4 flex-grow min-w-0">
                        <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center text-2xl overflow-hidden shrink-0">
                          {cat.image ? (
                            <img 
                              src={cat.image} 
                              alt={cat.name} 
                              className="w-full h-full object-cover" 
                              title={cat.image}
                              onError={(e) => console.error(`Image failed to load for ${cat.name}:`, cat.image)}
                            />
                          ) : (
                            cat.icon || '📁'
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <h5 className="font-bold text-slate-800 truncate">{cat.name}</h5>
                          <p className="text-xs text-slate-500 line-clamp-1">{cat.description || 'No description'}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0 self-end sm:self-center">
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
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryForm({
                      id: Date.now().toString(),
                      name: '',
                      icon: '',
                      image: '',
                      description: '',
                      chatPrice: 0,
                      callPrice: 0,
                      videoPrice: 0
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
                <span>•</span> Manage Product Categories
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
                <span>•</span> Edit Services
              </h4>

              <div className="space-y-4">
                {servicesForm.map((service) => (
                  <div key={service.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-4 transition-all hover:border-rose-200">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex items-center gap-4 flex-grow min-w-0">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl border border-rose-50 overflow-hidden shrink-0">
                          {service.image ? (
                            <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                          ) : (
                            service.icon
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-800 truncate" title={service.name}>{service.name}</h4>
                            <span className="text-[10px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest flex-shrink-0">{service.category}</span>
                          </div>
                          <div className="flex gap-4 mt-1">
                            <p className="text-xs text-slate-500"><span className="font-bold text-rose-500">₹{service.price}</span></p>
                            <p className="text-xs text-slate-400">🕒 {service.duration}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0 self-end sm:self-start">
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
                    {/* Service Descriptions Display */}
                    {(service.chatDescription || service.callDescription || service.videoDescription || service.description) && (
                      <div className="pl-16 pr-4 space-y-1.5">
                        {service.chatDescription && (
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-bold text-purple-600 shrink-0">💬 Chat:</span>
                            <p className="text-xs text-slate-600 leading-relaxed line-clamp-1" title={service.chatDescription}>
                              {service.chatDescription}
                            </p>
                          </div>
                        )}
                        {service.callDescription && (
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-bold text-blue-600 shrink-0">📞 Call:</span>
                            <p className="text-xs text-slate-600 leading-relaxed line-clamp-1" title={service.callDescription}>
                              {service.callDescription}
                            </p>
                          </div>
                        )}
                        {service.videoDescription && (
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-bold text-rose-600 shrink-0">🎥 Video:</span>
                            <p className="text-xs text-slate-600 leading-relaxed line-clamp-1" title={service.videoDescription}>
                              {service.videoDescription}
                            </p>
                          </div>
                        )}
                        {!service.chatDescription && !service.callDescription && !service.videoDescription && service.description && (
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-bold text-slate-500 shrink-0">📝 General:</span>
                            <p className="text-xs text-slate-600 leading-relaxed line-clamp-1" title={service.description}>
                              {service.description}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
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
          <div className="space-y-6 sm:space-y-8 px-0 sm:px-4 overflow-x-hidden animate-fade-in">
            <h3 className="text-2xl font-mystic text-rose-900 px-4 sm:px-0">Admin Settings</h3>

            {/* About Section */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-rose-100 shadow-sm mx-4 sm:mx-0">
              <h4 className="text-lg font-mystic text-rose-800 mb-6 flex items-center gap-2">
                <span>•</span> About Section (Practitioner Info)
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
                <span>•</span> Hero Text Section (Home Banner)
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

            {/* Crystal Combos Section */}
            <div ref={crystalCombosSectionRef} id="crystal-combos-admin" className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm">
              <h4 className="text-lg font-mystic text-rose-800 mb-6 flex items-center gap-2">
                <span>💎</span> Crystal Combos (Homepage Section)
              </h4>

              <div className="mb-5">
                <button
                  type="button"
                  onClick={() => {
                    const newCombo: CrystalCombo = {
                      id: `combo_${Date.now()}`,
                      title: 'New Crystal Combo',
                      subtitle: '',
                      description: '',
                      fullDescription: '',
                      image: '',
                      gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 55%, #fbbf24 100%)',
                      accentColor: 'amber',
                      price: 0,
                      originalPrice: undefined,
                      tag: '',
                      benefits: [],
                      includedItems: []
                    };
                    setCrystalCombos((prev) => [...prev, newCombo]);
                  }}
                  className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors text-sm font-bold"
                >
                  + Add New Combo
                </button>
              </div>

              <div className="space-y-6">
                {crystalCombos.map((combo, index) => (
                  <div key={combo.id} className="border border-amber-200 rounded-xl p-4 bg-amber-50/30">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h5 className="font-bold text-amber-900">Combo {index + 1}: {combo.title}</h5>
                      <button
                        type="button"
                        onClick={() => {
                          setCrystalCombos((prev) => prev.filter((_, i) => i !== index));
                        }}
                        className="text-xs font-bold uppercase tracking-wide text-rose-600 hover:text-rose-700"
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Title</label>
                        <input
                          type="text"
                          value={combo.title}
                          onChange={(e) => {
                            const updated = [...crystalCombos];
                            updated[index] = { ...updated[index], title: e.target.value };
                            setCrystalCombos(updated);
                          }}
                          className="w-full bg-white border border-slate-200 p-2 rounded-lg focus:border-amber-500 outline-none text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Subtitle (Crystals)</label>
                        <input
                          type="text"
                          value={combo.subtitle}
                          onChange={(e) => {
                            const updated = [...crystalCombos];
                            updated[index] = { ...updated[index], subtitle: e.target.value };
                            setCrystalCombos(updated);
                          }}
                          className="w-full bg-white border border-slate-200 p-2 rounded-lg focus:border-amber-500 outline-none text-sm"
                          placeholder="e.g., Black Tourmaline + Red Jasper"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
                        <input
                          type="text"
                          value={combo.description}
                          onChange={(e) => {
                            const updated = [...crystalCombos];
                            updated[index] = { ...updated[index], description: e.target.value };
                            setCrystalCombos(updated);
                          }}
                          className="w-full bg-white border border-slate-200 p-2 rounded-lg focus:border-amber-500 outline-none text-sm"
                          placeholder="e.g., Ultimate shield against negativity"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Price (₹)</label>
                          <input
                            type="number"
                            value={combo.price}
                            onChange={(e) => {
                              const updated = [...crystalCombos];
                              updated[index] = { ...updated[index], price: parseInt(e.target.value) || 0 };
                              setCrystalCombos(updated);
                            }}
                            className="w-full bg-white border border-slate-200 p-2 rounded-lg focus:border-amber-500 outline-none text-sm"
                            placeholder="1499"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Original Price (₹)</label>
                          <input
                            type="number"
                            value={combo.originalPrice || ''}
                            onChange={(e) => {
                              const updated = [...crystalCombos];
                              updated[index] = { ...updated[index], originalPrice: parseInt(e.target.value) || undefined };
                              setCrystalCombos(updated);
                            }}
                            className="w-full bg-white border border-slate-200 p-2 rounded-lg focus:border-amber-500 outline-none text-sm"
                            placeholder="1999"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tag (Optional)</label>
                        <input
                          type="text"
                          value={combo.tag || ''}
                          onChange={(e) => {
                            const updated = [...crystalCombos];
                            updated[index] = { ...updated[index], tag: e.target.value };
                            setCrystalCombos(updated);
                          }}
                          className="w-full bg-white border border-slate-200 p-2 rounded-lg focus:border-amber-500 outline-none text-sm"
                          placeholder="e.g., BESTSELLER, NEW, POPULAR"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Image</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={combo.image}
                            onChange={(e) => {
                              const updated = [...crystalCombos];
                              updated[index] = { ...updated[index], image: e.target.value };
                              setCrystalCombos(updated);
                            }}
                            className="flex-1 bg-white border border-slate-200 p-2 rounded-lg focus:border-amber-500 outline-none text-sm"
                            placeholder="Upload image or paste URL"
                          />
                          <label className="bg-amber-500 text-white px-3 py-2 rounded-lg cursor-pointer hover:bg-amber-600 transition-colors text-sm font-bold whitespace-nowrap">
                            Upload
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                
                                setIsUpdatingCombo(true);
                                try {
                                  const imageUrl = await uploadImage(file);
                                  const updated = [...crystalCombos];
                                  updated[index] = { ...updated[index], image: imageUrl };
                                  setCrystalCombos(updated);
                                  showToast('Image uploaded successfully');
                                } catch (error: any) {
                                  showToast(error.message || 'Upload failed', 'error');
                                } finally {
                                  setIsUpdatingCombo(false);
                                }
                              }}
                            />
                          </label>
                        </div>
                        {combo.image && (
                          <div className="mt-2">
                            <img src={combo.image} alt={combo.title} className="w-24 h-24 object-cover rounded-lg border border-amber-200" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Description (for details page)</label>
                        <textarea
                          rows={4}
                          value={combo.fullDescription || ''}
                          onChange={(e) => {
                            const updated = [...crystalCombos];
                            updated[index] = { ...updated[index], fullDescription: e.target.value };
                            setCrystalCombos(updated);
                          }}
                          className="w-full bg-white border border-slate-200 p-2 rounded-lg focus:border-amber-500 outline-none resize-none text-sm"
                          placeholder="Detailed description for product details page..."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Benefits (one per line)</label>
                        <textarea
                          rows={4}
                          value={(combo.benefits || []).join('\n')}
                          onChange={(e) => {
                            const updated = [...crystalCombos];
                            updated[index] = { ...updated[index], benefits: e.target.value.split('\n').filter(b => b.trim()) };
                            setCrystalCombos(updated);
                          }}
                          className="w-full bg-white border border-slate-200 p-2 rounded-lg focus:border-amber-500 outline-none resize-none text-sm"
                          placeholder="Relieves stress\nBoosts energy\nImproves focus"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Included Items (one per line)</label>
                        <textarea
                          rows={4}
                          value={(combo.includedItems || []).join('\n')}
                          onChange={(e) => {
                            const updated = [...crystalCombos];
                            updated[index] = { ...updated[index], includedItems: e.target.value.split('\n').filter(item => item.trim()) };
                            setCrystalCombos(updated);
                          }}
                          className="w-full bg-white border border-slate-200 p-2 rounded-lg focus:border-amber-500 outline-none resize-none text-sm"
                          placeholder="1x Black Tourmaline Bracelet\n1x Red Jasper Bracelet\n1x Velvet Pouch\n1x Care Guide"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                    await updateCrystalCombos(crystalCombos);

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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-3xl border border-rose-200 shadow-2xl p-5 sm:p-8 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
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
                          <span className="text-2xl mb-1">▤</span>
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
                            const maxSize = 5 * 1024 * 1024; // 5MB max
                            if (file.size > maxSize) {
                              showToast('File size exceeds 5MB. Please choose a smaller image.', 'error');
                              return;
                            }
                            setCategoryImageFile(file);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setCategoryImagePreview(reader.result as string);
                            };
                            reader.onerror = () => {
                              showToast('Failed to read file', 'error');
                              setCategoryImageFile(null);
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
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Description</label>
                    <textarea
                      rows={2}
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none text-slate-900 resize-none"
                      placeholder="Brief description for home page..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Session Mode Prices (₹)</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-500">Chat Price</p>
                        <input
                          type="number"
                          min="0"
                          value={categoryForm.chatPrice ?? 0}
                          onChange={(e) => setCategoryForm({ ...categoryForm, chatPrice: Number(e.target.value) })}
                          className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none text-slate-900"
                          placeholder="e.g., 699"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-500">Call Price</p>
                        <input
                          type="number"
                          min="0"
                          value={categoryForm.callPrice ?? 0}
                          onChange={(e) => setCategoryForm({ ...categoryForm, callPrice: Number(e.target.value) })}
                          className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none text-slate-900"
                          placeholder="e.g., 999"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-500">Video Price</p>
                        <input
                          type="number"
                          min="0"
                          value={categoryForm.videoPrice ?? 0}
                          onChange={(e) => setCategoryForm({ ...categoryForm, videoPrice: Number(e.target.value) })}
                          className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-rose-500 outline-none text-slate-900"
                          placeholder="e.g., 1499"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400">Set 0 to use each service's base price as fallback.</p>
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
        </div>  {/* flex-1 content column */}
      </div>  {/* outer flex row */}

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white w-full max-w-3xl max-h-[95vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-2xl">
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
    </>
  );
};

export default AdminPanel;
