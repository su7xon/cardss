
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Booking, Service, Testimonial } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { addBooking, addTestimonial, subscribeToSettings, getDefaultSettings } from '../services/databaseService';
import { sendBookingNotification } from '../services/emailService';

import { auth } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { openPaymentModal } from '../services/razorpayService';

interface BookingPageProps {
  services: Service[];
  testimonials: Testimonial[];
}

const BookingPage: React.FC<BookingPageProps> = ({ services, testimonials }) => {
  const location = useLocation();
  const { user, signInWithGoogle } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isPromoConsultationFlow, setIsPromoConsultationFlow] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [upiId, setUpiId] = useState<string>(getDefaultSettings().upiId || 'pooja.gupta639783@okhdfcbank');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const reviewsScrollRef = useRef<HTMLDivElement>(null);
  const [isReviewsPaused, setIsReviewsPaused] = useState(false);

  const faqs = [
    {
      question: "How do I prepare for a tarot reading?",
      answer: "Find a quiet space where you won't be disturbed. Have specific questions in mind but stay open to guidance. Have your birth details ready if you've booked a chart reading."
    },
    {
      question: "What happens after I book a session?",
      answer: "Once you book, you'll receive a confirmation. Pooja will personally reach out to finalize the date, time, and any specific details for your reading."
    },
    {
      question: "Can I reschedule my appointment?",
      answer: "Yes! We understand life happens. You can reschedule up to 24 hours before your scheduled session at no extra cost."
    },
    {
      question: "Are the crystals ethically sourced?",
      answer: "Absolutely! We take pride in sourcing authentic, ethically-mined crystals directly from trusted suppliers. Each crystal is cleansed and charged before shipping."
    },
    {
      question: "How long do sessions typically last?",
      answer: "Session durations vary by service: Tarot readings (30-45 mins), Healing sessions (60 mins), and Combo packages (90 mins). You'll receive a confirmation with exact timing."
    }
  ];

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'WhatsApp' | 'COD'>('UPI');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', text: '', rating: 5 });
  const [settings, setSettings] = useState(getDefaultSettings());
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: services[0]?.name || 'Tarot Reading',
    price: services[0]?.price || 1499,
    date: '',
    time: '',
    dob: '',
    tob: '',
    pob: ''
  });

  const getModePrice = (service: any, mode: 'chat' | 'call' | 'video', fallbackPrice: number) => {
    // First check service-level prices
    const servicePrice =
      mode === 'chat'
        ? service.chatPrice
        : mode === 'call'
          ? service.callPrice
          : service.videoPrice;

    if (Number(servicePrice) > 0) return Number(servicePrice);

    // Fallback to category-level prices
    const matchedCategory = settings.serviceCategories?.find((cat) => cat.name === service.category);
    if (!matchedCategory) return fallbackPrice;

    const configuredPrice =
      mode === 'chat'
        ? matchedCategory.chatPrice
        : mode === 'call'
          ? matchedCategory.callPrice
          : matchedCategory.videoPrice;

    return Number(configuredPrice) > 0 ? Number(configuredPrice) : fallbackPrice;
  };

  useEffect(() => {
    if (services.length > 0) {
      setFormData(prev => ({
        ...prev,
        service: services[0].name,
        price: services[0].price
      }));
    }

    const unsubscribe = subscribeToSettings((settingsData) => {
      if (settingsData.upiId) {
        setUpiId(settingsData.upiId);
      }
      setSettings(settingsData);
    });

    // Pre-load Razorpay SDK
    import('../services/razorpayService').then(({ loadRazorpayScript }) => {
      loadRazorpayScript().catch(err => console.error('Failed to preload Razorpay', err));
    });

    return () => unsubscribe();
  }, [services]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const stepParam = params.get('step');
    const serviceHint = params.get('service')?.trim().toLowerCase();
    const promo = params.get('promo')?.trim().toLowerCase();
    const promoPriceRaw = Number(params.get('price'));
    const promoPrice = Number.isFinite(promoPriceRaw) && promoPriceRaw > 0 ? promoPriceRaw : 99;
    const isGemstonePromo = promo === 'gemstone99';

    if (stepParam !== 'details' || services.length === 0) {
      setIsPromoConsultationFlow(false);
      return;
    }

    const matchedService = serviceHint
      ? services.find((s) => {
          const id = (s.id || '').toLowerCase();
          const name = (s.name || '').toLowerCase();
          return id.includes(serviceHint) || name.includes(serviceHint);
        })
      : null;

    const nextService = matchedService || services[0];
    const nextServiceName = isGemstonePromo
      ? 'Personalised Gemstone Consultation by Pooja Gupta'
      : nextService.name;
    const nextPrice = isGemstonePromo ? promoPrice : nextService.price;

    setSelectedService(nextService);
    setFormData((prev) => ({
      ...prev,
      service: nextServiceName,
      price: nextPrice
    }));
    setIsPromoConsultationFlow(isGemstonePromo);
    setStep(2);
  }, [location.search, services]);

  useEffect(() => {
    const scrollContainer = reviewsScrollRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    let lastTime = 0;
    let lastScrollLeft = 0;
    let manualScrollTimeout: ReturnType<typeof setTimeout> | null = null;
    const speedPxPerSecond = 24;

    const halfWidth = () => scrollContainer.scrollWidth / 2;
    let scrollPos = 0;
    scrollContainer.scrollLeft = scrollPos;

    const resumeAutoScroll = () => {
      setIsReviewsPaused(false);
      if (manualScrollTimeout) clearTimeout(manualScrollTimeout);
    };

    const handleScroll = () => {
      const currentScroll = scrollContainer.scrollLeft;
      if (Math.abs(currentScroll - lastScrollLeft) > 2) {
        setIsReviewsPaused(true);
        scrollPos = currentScroll;
        if (manualScrollTimeout) clearTimeout(manualScrollTimeout);
        manualScrollTimeout = setTimeout(resumeAutoScroll, 3000);
      }
      lastScrollLeft = currentScroll;
    };

    scrollContainer.addEventListener('scroll', handleScroll);

    const scroll = (time: number) => {
      if (!lastTime) lastTime = time;
      const deltaSeconds = (time - lastTime) / 1000;
      lastTime = time;

      if (!isReviewsPaused) {
        const resetPoint = halfWidth();
        if (resetPoint > 0) {
          scrollPos += speedPxPerSecond * deltaSeconds;
          if (scrollPos >= resetPoint) {
            scrollPos = 0;
          }
          scrollContainer.scrollLeft = scrollPos;
          lastScrollLeft = scrollPos;
        }
      } else {
        scrollPos = scrollContainer.scrollLeft;
        lastScrollLeft = scrollPos;
      }

      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    return () => {
      cancelAnimationFrame(animationId);
      scrollContainer.removeEventListener('scroll', handleScroll);
      if (manualScrollTimeout) clearTimeout(manualScrollTimeout);
    };
  }, [isReviewsPaused, testimonials]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all required fields
    if (!formData.name.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!formData.email.trim()) {
      alert('Please enter your email');
      return;
    }
    if (!formData.phone.trim()) {
      alert('Please enter your phone number');
      return;
    }
    if (!formData.date) {
      alert('Please select a date');
      return;
    }
    if (!formData.time) {
      alert('Please select a time');
      return;
    }

    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    if (!user) {
      try {
        await signInWithGoogle();
        const currentUser = auth.currentUser;
        if (!currentUser) return; // Login cancelled or failed
      } catch (error) {
        console.error("Login required", error);
        return;
      }
    }

    // Direct submission
    finalizeBooking(paymentMethod);
  };

  const finalizeBooking = async (method: 'UPI' | 'WhatsApp' | 'COD') => {
    setIsSubmitting(true);

    // Validate price before payment
    const safePrice = Number(formData.price) || 0;
    if (safePrice <= 0) {
      alert('Invalid booking price. Please contact support.');
      setIsSubmitting(false);
      return;
    }

    // Prepare Booking Data
    const isTarot = formData.service.includes('Tarot');
    const bookingData: any = {
      clientName: formData.name,
      email: formData.email,
      phone: formData.phone,
      service: formData.service,
      price: formData.price,
      date: formData.date,
      time: formData.time,
      status: 'Pending',
      paymentMethod: method,
      paymentStatus: method === 'COD' ? 'COD' : 'Pending'
    };

    if (isTarot) {
      bookingData.birthDetails = {
        dob: formData.dob || 'Not Provided',
        tob: formData.tob || 'Not Provided',
        pob: formData.pob || 'Not Provided'
      };
    }

    const processBooking = async (status: 'Pending' | 'Paid' | 'COD', transactionId?: string) => {
      try {
        bookingData.status = status === 'Paid' ? 'Confirmed' : 'Pending';
        bookingData.paymentStatus = status;
        if (transactionId) bookingData.transactionId = transactionId;

        // For WhatsApp, save to DB FIRST, then redirect
        if (method === 'WhatsApp') {
          await addBooking(bookingData);
          sendBookingNotification({
            ...bookingData,
            email: user?.email || formData.email || bookingData.email
          }, formData.email || user?.email).catch(e => console.error("Email error", e));

          const message = encodeURIComponent(
            `*New Booking Request*\n\n` +
            `*Client:* ${formData.name}\n` +
            `*Service:* ${formData.service}\n` +
            `*Date:* ${formData.date} at ${formData.time}\n` +
            `*Price:* ₹${formData.price}\n\n` +
            `I would like to finalize this booking.`
          );

          window.location.href = `https://wa.me/916397832791?text=${message}`;
          return;
        }

        // For other methods, we wait for completion
        await addBooking(bookingData);

        // Send Email Notification
        await sendBookingNotification({
          ...bookingData,
          email: user?.email || formData.email || bookingData.email
        }, formData.email || user?.email);

        setStep(3);
      } catch (error: any) {
        console.error('Error submitting booking:', error);
        alert('Failed to submit booking: ' + (error?.message || error));
      } finally {
        setIsSubmitting(false);
      }
    };

    if (method === 'UPI') {
      // Save booking FIRST with Pending status, then trigger payment
      bookingData.status = 'Pending';
      bookingData.paymentStatus = 'Pending';
      const bookingId = await addBooking(bookingData);

      const cleanPhone = formData.phone.replace(/\D/g, '');
      await openPaymentModal(
        formData.price,
        {
          name: formData.name,
          email: formData.email,
          contact: cleanPhone,
          desc: `Booking: ${formData.service}`
        },
        async (response: any) => {
          // Payment Success — update booking
          const bookingRef = doc(db, 'bookings', bookingId);
          await updateDoc(bookingRef, {
            status: 'Confirmed',
            paymentStatus: 'Paid',
            transactionId: response.razorpay_payment_id || ''
          });
          sendBookingNotification({
            ...bookingData,
            id: bookingId,
            email: user?.email || formData.email || bookingData.email
          }, formData.email || user?.email).catch(e => console.error("Email error", e));
          setStep(3);
        },
        (error: any) => {
          // Payment Failed — booking still exists as Pending
          console.error('Booking Payment Failed', error);
          alert('Payment Failed: ' + (error.description || 'Unknown error'));
          setIsSubmitting(false);
        }
      );
    } else if (method === 'COD') {
      // COD Flow
      await processBooking('COD');
    } else {
      // WhatsApp Flow (No Payment Reqd Immediately)
      await processBooking('Pending');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitting(true);
    try {
      await addTestimonial({
        name: reviewForm.name,
        text: reviewForm.text,
        rating: reviewForm.rating,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        isModerated: false
      });
      setReviewForm({ name: '', text: '', rating: 5 });
      setShowReviewForm(false);
      alert('Thank you! Your review has been submitted for approval.');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const approvedTestimonials = testimonials.filter(t => t.isModerated);
  const visibleTestimonials = approvedTestimonials.slice(0, 6);
  const scrollingTestimonials = [...visibleTestimonials, ...visibleTestimonials];

  return (
    <div className="bg-rose-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
        <div className="text-center mb-8 md:mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-serif text-rose-900 mb-4 tracking-tight">Book a Session</h1>
          <p className="text-slate-600 text-sm md:text-lg max-w-2xl mx-auto">Choose the path that calls to you. Secure your 1:1 consultation below.</p>
        </div>

        <div className="space-y-16">
          {step === 1 && (
            <div className="space-y-12 animate-fade-in">
              {settings.serviceCategories?.map((cat) => (
                <div key={cat.id} className="space-y-6 md:space-y-10">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <h2 className="text-lg md:text-2xl font-mystic font-semibold text-slate-950 tracking-wider uppercase text-center">{cat.name}</h2>
                    <div className="w-16 h-[1px] bg-rose-200"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                    {services.filter(s => (s.category || 'Tarot Guidance') === cat.name).map(s => {
                      // Determine which modes are available for this service
                      const modes: Array<{ key: 'chat' | 'call' | 'video'; label: string; icon: string; price: number }> = [];

                      // Check Chat mode
                      const chatPrice = Number(s.chatPrice) > 0 ? Number(s.chatPrice) : Number(cat.chatPrice) > 0 ? Number(cat.chatPrice) : 0;
                      if (chatPrice > 0) {
                        modes.push({ key: 'chat', label: 'Chat', icon: '💬', price: chatPrice });
                      }

                      // Check Call mode
                      const callPrice = Number(s.callPrice) > 0 ? Number(s.callPrice) : Number(cat.callPrice) > 0 ? Number(cat.callPrice) : 0;
                      if (callPrice > 0) {
                        modes.push({ key: 'call', label: 'Call', icon: '📞', price: callPrice });
                      }

                      // Check Video mode
                      const videoPrice = Number(s.videoPrice) > 0 ? Number(s.videoPrice) : Number(cat.videoPrice) > 0 ? Number(cat.videoPrice) : 0;
                      if (videoPrice > 0) {
                        modes.push({ key: 'video', label: 'Video', icon: '🎥', price: videoPrice });
                      }

                      // If no modes available, skip this service
                      if (modes.length === 0) return null;

                      // Return a card for EACH available mode
                      return modes.map((mode) => {
                        // Get mode-specific description or fallback to general description
                        const modeDescription = 
                          mode.key === 'chat' ? (s.chatDescription || s.description) :
                          mode.key === 'call' ? (s.callDescription || s.description) :
                          mode.key === 'video' ? (s.videoDescription || s.description) :
                          s.description;

                        return (
                        <div
                          key={`${s.id}-${mode.key}`}
                          className={`group relative bg-white border border-rose-100 rounded-xl md:rounded-2xl p-3 md:p-6 text-left transition-all hover:border-rose-400 hover:shadow-xl flex flex-col justify-between h-full min-h-[160px] md:min-h-[220px] overflow-hidden ${s.name.includes('Combo') ? 'ring-2 ring-rose-500/10' : ''
                            }`}
                        >
                          {/* Background Image if available */}
                          {s.image && (
                            <>
                              <div className="absolute inset-0 z-0">
                                <img src={s.image} alt={s.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30 z-0"></div>
                            </>
                          )}

                          <div className="relative z-10 w-full h-full flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start mb-2 md:mb-3">
                                <span className={`text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest ${s.image ? 'bg-white/20 text-white backdrop-blur-sm' : 'bg-rose-50 text-rose-400'
                                  }`}>{mode.label}</span>
                                <span className="text-xl md:text-2xl">{mode.icon}</span>
                              </div>
                              <h4 className={`text-sm md:text-lg font-bold mb-1 md:mb-2 leading-tight ${s.image ? 'text-white drop-shadow-md' : 'text-rose-900'
                                }`}>{s.name}</h4>
                              <p className={`text-xs leading-relaxed ${s.image ? 'text-slate-200' : 'text-slate-500'
                                }`}>{modeDescription}</p>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedService(s);
                                setFormData({
                                  ...formData,
                                  service: `${s.name} (${mode.label})`,
                                  price: mode.price
                                });
                                setStep(2);
                              }}
                              className={`mt-4 w-full py-3 rounded-lg md:rounded-xl font-bold text-sm uppercase tracking-wider transition-all active:scale-95 ${s.image
                                  ? 'bg-white text-rose-900 hover:bg-rose-50'
                                  : 'bg-rose-500 text-white hover:bg-rose-600'
                                }`}
                            >
                              Book Now - ₹{mode.price}
                            </button>
                          </div>
                        </div>
                      )});
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="max-w-5xl mx-auto bg-white border border-rose-200 rounded-2xl md:rounded-3xl shadow-xl animate-fade-in overflow-hidden">
              <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-rose-900 p-4 md:p-6 text-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-rose-200 font-bold">Personal Details</p>
                    <h2 className="text-lg md:text-3xl font-mystic mt-1">{formData.service}</h2>
                    <p className="text-rose-100 text-[10px] md:text-xs mt-1">Please share your details to confirm your session slot.</p>
                  </div>
                  <div className="flex items-center gap-3 self-start md:self-auto">
                    <div className="bg-white/15 border border-white/30 rounded-lg md:rounded-xl px-2.5 py-1.5 md:px-4 md:py-3">
                      <p className="text-[8px] md:text-[10px] uppercase tracking-widest text-rose-100">Payable</p>
                      <p className="text-lg md:text-2xl font-bold">₹{formData.price}</p>
                    </div>
                    <button type="button" onClick={() => setStep(1)} className="text-white/90 text-[10px] md:text-xs hover:text-white underline underline-offset-4">Change Service</button>
                  </div>
                </div>
                {isPromoConsultationFlow && (
                  <p className="mt-3 inline-block bg-yellow-300 text-rose-900 text-[10px] md:text-xs font-bold tracking-widest px-3 py-1 rounded-full uppercase">
                    Limited Offer: Gemstone Consultation @ ₹99
                  </p>
                )}
              </div>

              <div className="p-3 md:p-6 md:px-8">
                <div className="flex items-center justify-between mb-4 md:mb-5 pb-2.5 md:pb-3 border-b border-rose-100">
                  <h3 className="text-sm md:text-xl font-mystic text-rose-900">Complete Your Booking Form</h3>
                </div>

              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <div className="grid md:grid-cols-3 gap-3 md:gap-5">
                  <div className="space-y-1">
                    <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-white border border-rose-200 p-2 md:p-3 text-xs md:text-sm rounded-lg md:rounded-xl focus:border-rose-500 outline-none text-slate-900"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                    <input
                      required
                      type="email"
                      className="w-full bg-white border border-rose-200 p-2 md:p-3 text-xs md:text-sm rounded-lg md:rounded-xl focus:border-rose-500 outline-none text-slate-900"
                      placeholder="name@email.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Phone Number</label>
                    <input
                      required
                      type="tel"
                      className="w-full bg-white border border-rose-200 p-2 md:p-3 text-xs md:text-sm rounded-lg md:rounded-xl focus:border-rose-500 outline-none text-slate-900"
                      placeholder="+91 00000 00000"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-3 md:pt-4 border-t border-rose-100">
                  <h3 className="text-rose-700 font-bold uppercase tracking-widest text-[10px] md:text-xs">Birth Details (For Chart Reading)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
                    <div className="space-y-1">
                      <label className="text-[10px] md:text-xs text-slate-500">Date of Birth</label>
                      <input type="date" className="w-full bg-white border border-rose-200 p-2 md:p-3 text-xs md:text-sm rounded-lg md:rounded-xl outline-none text-slate-900 focus:border-rose-500" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] md:text-xs text-slate-500">Time of Birth</label>
                      <input type="time" className="w-full bg-white border border-rose-200 p-2 md:p-3 text-xs md:text-sm rounded-lg md:rounded-xl outline-none text-slate-900 focus:border-rose-500" value={formData.tob} onChange={e => setFormData({ ...formData, tob: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] md:text-xs text-slate-500">Place of Birth</label>
                      <input type="text" className="w-full bg-white border border-rose-200 p-2 md:p-3 text-xs md:text-sm rounded-lg md:rounded-xl outline-none text-slate-900 focus:border-rose-500" placeholder="City, Country" value={formData.pob} onChange={e => setFormData({ ...formData, pob: e.target.value })} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 pt-3 md:pt-4 border-t border-rose-100">
                  <div className="space-y-1">
                    <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Preferred Date</label>
                    <input
                      required
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-white border border-rose-200 p-2 md:p-3 text-xs md:text-sm rounded-lg md:rounded-xl outline-none focus:border-rose-500 text-slate-900"
                      value={formData.date}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Preferred Time</label>
                    <select required className="w-full bg-white border border-rose-200 p-2 md:p-3 text-xs md:text-sm rounded-lg md:rounded-xl outline-none focus:border-rose-500 text-slate-900" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })}>
                      <option value="">Select slot</option>
                      {['10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'].map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-4 md:pt-5 border-t border-rose-100">
                  <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest block mb-3 md:mb-4">Payment Method</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('UPI')}
                      className={`py-2 md:py-3 px-2 rounded-lg md:rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all ${
                        paymentMethod === 'UPI' ? 'border-rose-500 bg-rose-50 text-rose-900' : 'border-slate-200 text-slate-600 hover:border-rose-300'
                      }`}
                    >
                      <div className="text-lg md:text-xl">💳</div>
                      <span className="text-[10px] md:text-xs font-bold tracking-wider">ONLINE</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('COD')}
                      className={`py-2 md:py-3 px-2 rounded-lg md:rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all ${
                        paymentMethod === 'COD' ? 'border-orange-500 bg-orange-50 text-orange-900' : 'border-slate-200 text-slate-600 hover:border-orange-300'
                      }`}
                    >
                      <div className="text-lg md:text-xl">💵</div>
                      <span className="text-[10px] md:text-xs font-bold tracking-wider">COD</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('WhatsApp')}
                      className={`py-2 md:py-3 px-2 rounded-lg md:rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all ${
                        paymentMethod === 'WhatsApp' ? 'border-green-500 bg-green-50 text-green-900' : 'border-slate-200 text-slate-600 hover:border-green-300'
                      }`}
                    >
                      <div className="text-lg md:text-xl">💬</div>
                      <span className="text-[10px] md:text-xs font-bold tracking-wider">WHATSAPP</span>
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className={`w-full text-white py-3 md:py-4 rounded-lg md:rounded-xl font-bold tracking-widest transition-all mt-6 shadow-lg ${isSubmitting ? 'opacity-70 cursor-not-allowed bg-slate-500' : paymentMethod === 'UPI' ? 'bg-rose-600 hover:bg-rose-700' : paymentMethod === 'COD' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'}`}>
                  {isSubmitting ? 'PROCESSING...' : paymentMethod === 'UPI' ? 'PROCEED TO PAY' : paymentMethod === 'COD' ? 'CONFIRM BOOKING' : 'CHAT & CONFIRM'}
                </button>
              </form>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-16 animate-fade-in max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-4xl font-mystic text-rose-900 mb-4">WISDOM RECEIVED</h2>
              <p className="text-slate-600 mb-10 text-lg">
                Thank you, {formData.name}. Your request for <span className="text-rose-600 font-bold">{formData.service}</span> has been received. <br />
                Pooja will reach out to you personally to finalize the details.
              </p>
              <button onClick={() => setStep(1)} className="text-rose-500 font-bold border-b-2 border-rose-500 pb-1 hover:text-rose-700 hover:border-rose-700 transition-all uppercase tracking-widest text-sm">Book Another Session</button>
            </div>
          )}
        </div>

        {step === 1 && (
          <div className="mt-24 pt-16 border-t border-rose-100">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl md:text-3xl font-mystic text-rose-900 uppercase">Soul Voices</h2>
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="text-sm font-bold text-rose-500 hover:text-rose-700 transition-colors uppercase tracking-widest"
              >
                {showReviewForm ? '✕ Close' : '+ Add Review'}
              </button>
            </div>

            {showReviewForm && (
              <form onSubmit={handleReviewSubmit} className="max-w-2xl mx-auto bg-white rounded-3xl border border-rose-100 p-8 mb-12 animate-fade-in shadow-xl">
                <h3 className="text-xl font-mystic text-rose-900 mb-6 text-center">Share Your Experience</h3>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Your Name</label>
                      <input
                        required
                        type="text"
                        value={reviewForm.name}
                        onChange={e => setReviewForm({ ...reviewForm, name: e.target.value })}
                        className="w-full bg-rose-50/50 border border-rose-100 p-3 rounded-xl focus:border-rose-500 outline-none mt-1 text-slate-900"
                        placeholder="Enter name"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Rating</label>
                      <div className="flex gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                            className={`text-2xl transition-transform hover:scale-110 ${star <= reviewForm.rating ? 'text-yellow-500' : 'text-slate-300'}`}
                          >
                            •
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Your Review</label>
                    <textarea
                      required
                      rows={3}
                      value={reviewForm.text}
                      onChange={e => setReviewForm({ ...reviewForm, text: e.target.value })}
                      className="w-full bg-rose-50/50 border border-rose-100 p-3 rounded-xl focus:border-rose-500 outline-none mt-1 resize-none text-slate-900"
                      placeholder="Share your experience..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white py-4 rounded-xl font-bold tracking-widest transition-all disabled:opacity-50 text-sm shadow-md"
                  >
                    {reviewSubmitting ? 'SUBMITTING...' : 'SUBMIT TESTIMONY'}
                  </button>
                </div>
              </form>
            )}

            {approvedTestimonials.length > 0 && (
              <div
                ref={reviewsScrollRef}
                className="flex overflow-x-auto gap-4 md:gap-6 px-1 pb-6 no-scrollbar cursor-grab active:cursor-grabbing"
                onMouseEnter={() => setIsReviewsPaused(true)}
                onMouseLeave={() => setIsReviewsPaused(false)}
                onTouchStart={() => setIsReviewsPaused(true)}
                onTouchEnd={() => setIsReviewsPaused(false)}
              >
                {scrollingTestimonials.map((t, index) => (
                  <div
                    key={`${t.id}-${index}`}
                    className="flex-shrink-0 w-[260px] md:w-[360px] bg-white p-6 rounded-2xl border border-rose-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-1 text-yellow-500 mb-3">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <span key={i} className="text-sm">•</span>
                      ))}
                    </div>
                    <p className="text-slate-600 text-sm italic mb-4 leading-relaxed line-clamp-4">"{t.text}"</p>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 text-base font-bold">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-rose-900 text-sm font-bold uppercase tracking-wider">{t.name}</p>
                        <p className="text-slate-400 text-[10px] font-bold tracking-widest">{t.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* FAQ Section */}
            <div className="mt-24 pt-16 border-t border-rose-100">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-4xl font-mystic text-rose-900 mb-4">Frequently Asked Questions</h2>
                <p className="text-slate-600 max-w-xl mx-auto">Have questions? We've got answers.</p>
              </div>
              
              <div className="max-w-3xl mx-auto space-y-4">
                {faqs.map((faq, index) => (
                  <div 
                    key={index}
                    className="bg-white rounded-xl border border-rose-100 overflow-hidden shadow-sm"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full flex items-center justify-between p-4 md:p-5 text-left hover:bg-rose-50/50 transition-colors"
                    >
                      <span className="font-bold text-rose-900 text-sm md:text-base pr-4">{faq.question}</span>
                      <span className={`text-rose-500 text-xl transition-transform ${openFaq === index ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </button>
                    {openFaq === index && (
                      <div className="px-4 md:px-5 pb-4 md:pb-5 animate-fade-in">
                        <p className="text-slate-600 text-sm leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
