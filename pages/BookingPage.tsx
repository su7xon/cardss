
import React, { useState, useEffect } from 'react';
import { Booking, Service, Testimonial } from '../types';
import { addBooking, addTestimonial, subscribeToSettings, getDefaultSettings } from '../services/databaseService';
import { sendBookingNotification } from '../services/emailService';

import { auth } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

interface BookingPageProps {
  services: Service[];
  testimonials: Testimonial[];
  onBookingSubmit?: (booking: Booking) => void;
}

const BookingPage: React.FC<BookingPageProps> = ({ services, testimonials, onBookingSubmit }) => {
  const { user, signInWithGoogle } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [upiId, setUpiId] = useState<string>(getDefaultSettings().upiId || 'pooja.gupta639783@okhdfcbank');

  // Payment State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'WhatsApp'>('UPI');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', text: '', rating: 5 });
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

  useEffect(() => {
    if (services.length > 0) {
      setFormData(prev => ({
        ...prev,
        service: services[0].name,
        price: services[0].price
      }));
    }

    const unsubscribe = subscribeToSettings((settings) => {
      if (settings.upiId) {
        setUpiId(settings.upiId);
      }
    });

    return () => unsubscribe();
  }, [services]);

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

    if (!user) {
      try {
        await signInWithGoogle();
        // If login successful, loop will continue, or re-click might be needed depending on flow.
        // Ideally, we wait for user state to update.
        // But since await signInWithGoogle resolves after popup closes and auth state updates (usually),
        // we can proceed. However, checking 'user' variable again might depend on closure.
        // It's safer to rely on the fact that if this awaits, the next render will have user.
        // But to block execution here:
        const currentUser = auth.currentUser;
        if (!currentUser) return; // Login cancelled or failed
      } catch (error) {
        console.error("Login required", error);
        return;
      }
    }

    // Open Payment Modal instead of direct submission
    setShowPaymentModal(true);
  };

  const finalizeBooking = async (method: 'UPI' | 'WhatsApp') => {
    setIsSubmitting(true);
    setShowPaymentModal(false);

    try {
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
        paymentMethod: method
      };

      if (isTarot) {
        bookingData.birthDetails = {
          dob: formData.dob || 'Not Provided',
          tob: formData.tob || 'Not Provided',
          pob: formData.pob || 'Not Provided'
        };
      }

      await addBooking(bookingData);

      // Send Email Notification
      await sendBookingNotification({
        ...bookingData,
        email: user?.email || formData.email || bookingData.email
      }, formData.email || user?.email); // Pass email as recipient

      if (method === 'WhatsApp') {
        const message = encodeURIComponent(
          `✨ *New Booking Request*\n\n` +
          `*Client:* ${formData.name}\n` +
          `*Service:* ${formData.service}\n` +
          `*Date:* ${formData.date} at ${formData.time}\n` +
          `*Price:* ₹${formData.price}\n\n` +
          `I would like to finalize this booking.`
        );
        window.open(`https://wa.me/916397832791?text=${message}`, '_blank');
      } else if (method === 'UPI') {
        window.location.href = `upi://pay?pa=${upiId}&pn=Divine Guidance Studio&am=${formData.price}&cu=INR`;
      }

      setStep(3);
    } catch (error: any) {
      console.error('Error submitting booking:', error);
      alert('Failed to submit booking: ' + (error?.message || error));
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="bg-rose-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-12 md:mb-20 animate-fade-in">
          <h1 className="text-2xl md:text-5xl font-mystic text-rose-900 mb-4 tracking-tighter uppercase">Book a Session</h1>
          <p className="text-slate-600 text-sm md:text-lg max-w-2xl mx-auto">Choose the path that calls to you. Secure your 1:1 consultation below.</p>
        </div>

        <div className="space-y-16">
          {step === 1 && (
            <div className="space-y-12 animate-fade-in">
              {[
                { title: 'Tarot Guidance', key: 'Tarot Guidance' },
                { title: 'Counseling & Healing', key: 'Counseling & Healing' },
                { title: 'Special Packages', key: 'Special Package' }
              ].map(cat => (
                <div key={cat.key} className="space-y-6 md:space-y-10">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <h2 className="text-lg md:text-2xl font-mystic font-semibold text-slate-950 tracking-wider uppercase text-center">{cat.title}</h2>
                    <div className="w-16 h-[1px] bg-rose-200"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                    {services.filter(s => (s.category || 'Tarot Guidance') === cat.key).map(s => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setSelectedService(s);
                          setFormData({ ...formData, service: s.name, price: s.price });
                          setStep(1.5);
                        }}
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
                                }`}>{s.duration}</span>
                              <span className={`text-xl md:text-2xl transition-transform group-hover:scale-110 ${s.image ? 'drop-shadow-lg' : ''}`}>{s.icon}</span>
                            </div>
                            <h4 className={`text-sm md:text-lg font-bold mb-1 md:mb-2 leading-tight ${s.image ? 'text-white drop-shadow-md' : 'text-rose-900'
                              }`}>{s.name}</h4>
                            <p className={`hidden md:block text-xs leading-relaxed italic border-l-2 pl-2 ${s.image ? 'text-slate-200 border-white/50' : 'text-slate-500 border-rose-50'
                              }`}>{s.description}</p>
                          </div>

                          <div className="mt-3 md:mt-6 flex justify-between items-center">
                            <span className={`text-base md:text-xl font-bold ${s.image ? 'text-white drop-shadow-md' : 'text-rose-600'
                              }`}>₹{s.price}</span>
                            {s.name.includes('Combo') && (
                              <span className="text-[7px] md:text-[9px] font-bold text-white bg-rose-500 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full animate-pulse uppercase">Best</span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 1.5 && selectedService && (
            <div className="max-w-2xl mx-auto bg-white border border-rose-200 p-6 md:p-10 rounded-3xl shadow-xl animate-fade-in text-center">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner border border-rose-100/50">
                {selectedService.icon}
              </div>
              <p className="text-rose-400 text-[10px] font-bold uppercase tracking-widest mb-2">{selectedService.category}</p>
              <h2 className="text-2xl md:text-3xl font-mystic text-rose-900 mb-4">{selectedService.name}</h2>
              <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl mb-8">
                <p className="text-slate-600 leading-relaxed text-sm md:text-base whitespace-pre-wrap">{selectedService.description || "No description available for this service."}</p>
              </div>
              <div className="flex flex-col md:flex-row gap-4 items-center justify-center mb-10">
                <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 rounded-full border border-rose-100">
                  <span className="text-rose-400 text-[10px] font-bold uppercase tracking-widest">DURATION:</span>
                  <span className="text-rose-900 text-xs font-bold uppercase tracking-widest">{selectedService.duration}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 rounded-full border border-rose-100">
                  <span className="text-rose-400 text-[10px] font-bold uppercase tracking-widest">ENERGY EXCHANGE:</span>
                  <span className="text-rose-900 text-lg font-bold">₹{selectedService.price}</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white py-4 rounded-xl font-bold tracking-widest transition-all shadow-lg hover:shadow-rose-200 hover:-translate-y-1 active:scale-95"
                >
                  PROCEED TO BOOK
                </button>
                <button
                  onClick={() => setStep(1)}
                  className="text-slate-400 hover:text-rose-500 font-bold text-xs uppercase tracking-widest transition-colors py-2"
                >
                  Go Back
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-md border border-rose-200 p-5 md:p-12 rounded-3xl shadow-xl animate-fade-in overflow-hidden">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-rose-100">
                <h2 className="text-xl md:text-2xl font-mystic text-rose-900">Personal Details</h2>
                <button type="button" onClick={() => setStep(1)} className="text-rose-500 text-xs md:text-sm hover:underline">Change Service</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-white border border-rose-200 p-3.5 md:p-4 rounded-xl focus:border-rose-500 outline-none text-slate-900"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                    <input
                      required
                      type="email"
                      className="w-full bg-white border border-rose-200 p-3.5 md:p-4 rounded-xl focus:border-rose-500 outline-none text-slate-900"
                      placeholder="name@email.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Phone Number</label>
                    <input
                      required
                      type="tel"
                      className="w-full bg-white border border-rose-200 p-3.5 md:p-4 rounded-xl focus:border-rose-500 outline-none text-slate-900"
                      placeholder="+91 00000 00000"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                {formData.service.includes('Tarot') && (
                  <div className="space-y-6 pt-6 border-t border-rose-100">
                    <h3 className="text-rose-700 font-bold uppercase tracking-widest text-xs">Birth Details (For Chart Reading)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs text-slate-500">Date of Birth</label>
                        <input type="date" className="w-full bg-white border border-rose-200 p-3.5 md:p-4 rounded-xl outline-none text-slate-900 focus:border-rose-500" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-slate-500">Time of Birth</label>
                        <input type="time" className="w-full bg-white border border-rose-200 p-3.5 md:p-4 rounded-xl outline-none text-slate-900 focus:border-rose-500" value={formData.tob} onChange={e => setFormData({ ...formData, tob: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-slate-500">Place of Birth</label>
                        <input type="text" className="w-full bg-white border border-rose-200 p-3.5 md:p-4 rounded-xl outline-none text-slate-900 focus:border-rose-500" placeholder="City, Country" value={formData.pob} onChange={e => setFormData({ ...formData, pob: e.target.value })} />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-rose-100">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Preferred Date</label>
                    <input
                      required
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-white border border-rose-200 p-3.5 md:p-4 rounded-xl outline-none focus:border-rose-500 text-slate-900"
                      value={formData.date}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Preferred Time</label>
                    <select required className="w-full bg-white border border-rose-200 p-3.5 md:p-4 rounded-xl outline-none focus:border-rose-500 text-slate-900" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })}>
                      <option value="">Select slot</option>
                      {['10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'].map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 text-white py-4 md:py-5 rounded-xl font-bold tracking-widest transition-all mt-8 md:mt-8 text-base md:text-lg shadow-lg shadow-rose-200">
                  CONFIRM BOOKING
                </button>
              </form>
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

        {/* Payment Selection Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl border border-rose-100 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 transition-colors"
              >
                ✕
              </button>

              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
                  💳
                </div>

                <div>
                  <h3 className="text-2xl font-mystic text-rose-900 mb-2">Complete Your Booking</h3>
                  <p className="text-slate-500 text-sm">Amount to Pay: <span className="font-bold text-rose-600">₹{formData.price}</span></p>
                </div>

                <div className="space-y-4">
                  {/* Option 1: WhatsApp */}
                  <div
                    onClick={() => setPaymentMethod('WhatsApp')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${paymentMethod === 'WhatsApp' ? 'border-rose-500 bg-rose-50' : 'border-slate-200 hover:border-rose-300'}`}
                  >
                    <span className="text-2xl">📱</span>
                    <div className="text-left flex-grow">
                      <h4 className="font-bold text-slate-800">Connect via WhatsApp</h4>
                      <p className="text-xs text-slate-500">Coordinate directly with Pooja</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'WhatsApp' ? 'border-rose-500' : 'border-slate-300'}`}>
                      {paymentMethod === 'WhatsApp' && <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />}
                    </div>
                  </div>

                  {/* Option 2: UPI */}
                  <div
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${paymentMethod === 'UPI' ? 'border-rose-500 bg-rose-50' : 'border-slate-200 hover:border-rose-300'}`}
                  >
                    <span className="text-2xl">💠</span>
                    <div className="text-left flex-grow">
                      <h4 className="font-bold text-slate-800">Pay via UPI</h4>
                      <p className="text-xs text-slate-500">Instant Transfer</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'UPI' ? 'border-rose-500' : 'border-slate-300'}`}>
                      {paymentMethod === 'UPI' && <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />}
                    </div>
                  </div>
                </div>

                {paymentMethod === 'UPI' && (
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 animate-fade-in">
                  </div>
                )}

                <button
                  onClick={() => finalizeBooking(paymentMethod)}
                  className={`w-full text-white py-4 rounded-xl font-bold tracking-widest transition-all active:scale-[0.98] shadow-xl ${paymentMethod === 'UPI' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-800 hover:bg-slate-700'}`}
                >
                  {paymentMethod === 'UPI' ? 'PAY' : 'CHAT & CONFIRM'}
                </button>
              </div>
            </div>
          </div>
        )}
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
                            ★
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
              <div className="grid md:grid-cols-2 gap-6">
                {approvedTestimonials.slice(0, 4).map(t => (
                  <div key={t.id} className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex gap-1 text-yellow-500 mb-3">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <span key={i} className="text-sm">★</span>
                      ))}
                    </div>
                    <p className="text-slate-600 text-sm italic mb-4 leading-relaxed">"{t.text}"</p>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
