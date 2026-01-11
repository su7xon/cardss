
import React, { useState, useEffect } from 'react';
import { Booking, Service, Testimonial } from '../types';
import { addBooking, addTestimonial } from '../services/databaseService';

interface BookingPageProps {
  services: Service[];
  testimonials: Testimonial[];
  onBookingSubmit?: (booking: Booking) => void;
}

const BookingPage: React.FC<BookingPageProps> = ({ services, testimonials, onBookingSubmit }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', text: '', rating: 5 });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: services[0]?.name || 'Astrology Reading',
    price: services[0]?.price || 2100,
    date: '',
    time: '',
    dob: '',
    tob: '',
    pob: ''
  });

  // Update default service when services prop changes
  useEffect(() => {
    if (services.length > 0) {
      setFormData(prev => ({
        ...prev,
        service: services[0].name,
        price: services[0].price
      }));
    }
  }, [services]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const bookingData = {
        clientName: formData.name,
        email: formData.email,
        service: formData.service,
        price: formData.price,
        date: formData.date,
        time: formData.time,
        status: 'Pending' as const,
        birthDetails: formData.service.includes('Astrology') ? {
          dob: formData.dob,
          tob: formData.tob,
          pob: formData.pob
        } : undefined
      };
      
      await addBooking(bookingData);
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
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-mystic text-rose-100 mb-4">Book a Session</h1>
        <p className="text-slate-400">Align your path with the wisdom of Pooja Gupta. Secure your 1:1 consultation below.</p>
      </div>

      <div className="bg-slate-900/50 rounded-3xl border border-rose-900/20 overflow-hidden">
        <div className="flex">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-2 flex-grow transition-all duration-500 ${step >= i ? 'bg-rose-500' : 'bg-slate-800'}`}></div>
          ))}
        </div>

        <div className="p-8 md:p-12">
          {step === 1 && (
            <div className="space-y-8 animate-fade-in">
              <h2 className="text-2xl font-mystic text-rose-200 mb-6">Step 1: Choose Your Service</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map(s => (
                  <button
                    key={s.name}
                    onClick={() => {
                      setFormData({ ...formData, service: s.name, price: s.price });
                      setStep(2);
                    }}
                    className={`flex items-center gap-4 p-6 rounded-2xl border text-left transition-all ${formData.service === s.name ? 'border-rose-400 bg-rose-500/10' : 'border-slate-800 hover:border-slate-600 bg-slate-950/50'}`}
                  >
                    <span className="text-3xl">{s.icon}</span>
                    <div className="flex-grow">
                      <h4 className="font-bold text-rose-100">{s.name}</h4>
                      <p className="text-xs text-slate-500">{s.duration}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-rose-400 font-bold">₹{s.price}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-mystic text-rose-200">Step 2: Personal Details</h2>
                <button type="button" onClick={() => setStep(1)} className="text-rose-400 text-sm hover:underline">Change Service</button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl focus:border-rose-500 outline-none" 
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                  <input 
                    required 
                    type="email" 
                    className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl focus:border-rose-500 outline-none" 
                    placeholder="name@email.com"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              {formData.service.includes('Astrology') && (
                <div className="space-y-6 pt-6 border-t border-slate-800">
                  <h3 className="text-rose-300 font-bold uppercase tracking-widest text-sm">Birth Details (For Chart Reading)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs text-slate-500">Date of Birth</label>
                      <input type="date" className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-slate-500">Time of Birth</label>
                      <input type="time" className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none" value={formData.tob} onChange={e => setFormData({...formData, tob: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-slate-500">Place of Birth</label>
                      <input type="text" className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none" placeholder="City, Country" value={formData.pob} onChange={e => setFormData({...formData, pob: e.target.value})} />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-800">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Preferred Date</label>
                  <div className="relative">
                    <input 
                      required 
                      type="date" 
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none focus:border-rose-500 text-white appearance-none cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" 
                      value={formData.date} 
                      onChange={e => setFormData({...formData, date: e.target.value})} 
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-400 pointer-events-none">📅</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Preferred Time</label>
                  <select required className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none focus:border-rose-500 text-white cursor-pointer" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})}>
                    <option value="">Select slot</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                    <option value="06:00 PM">06:00 PM</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 text-white py-5 rounded-xl font-bold tracking-widest transition-all mt-8 text-lg">
                CONFIRM BOOKING
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-12 animate-fade-in">
              <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-mystic text-rose-100 mb-4">Booking Success!</h2>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                Thank you, {formData.name}. Your request for {formData.service} has been received. Pooja will reach out to you personally to finalize the details.
              </p>
              <button onClick={() => setStep(1)} className="text-rose-400 font-bold border-b border-rose-400">Book Another Session</button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-mystic text-rose-200">What Our Clients Say</h2>
          <button 
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="text-sm text-rose-400 hover:text-rose-300 transition-colors"
          >
            {showReviewForm ? '✕ Cancel' : '+ Add Your Review'}
          </button>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <form onSubmit={handleReviewSubmit} className="bg-slate-900/50 rounded-2xl border border-rose-900/20 p-6 mb-8 animate-fade-in">
            <h3 className="text-lg font-mystic text-rose-100 mb-4">Share Your Experience</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-widest">Your Name</label>
                <input 
                  required
                  type="text"
                  value={reviewForm.name}
                  onChange={e => setReviewForm({...reviewForm, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:border-rose-500 outline-none mt-1"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-widest">Rating</label>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({...reviewForm, rating: star})}
                      className={`text-2xl transition-transform hover:scale-110 ${star <= reviewForm.rating ? 'text-yellow-500' : 'text-slate-600'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-widest">Your Review</label>
                <textarea 
                  required
                  rows={3}
                  value={reviewForm.text}
                  onChange={e => setReviewForm({...reviewForm, text: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:border-rose-500 outline-none mt-1 resize-none"
                  placeholder="Share your experience with Pooja..."
                />
              </div>
              <button 
                type="submit"
                disabled={reviewSubmitting}
                className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl font-bold tracking-widest transition-all disabled:opacity-50"
              >
                {reviewSubmitting ? 'SUBMITTING...' : 'SUBMIT REVIEW'}
              </button>
            </div>
          </form>
        )}

        {/* Reviews Grid */}
        {approvedTestimonials.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4">
            {approvedTestimonials.slice(0, 4).map(t => (
              <div key={t.id} className="bg-slate-900/30 p-6 rounded-2xl border border-slate-800">
                <div className="flex gap-1 text-yellow-500 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <span key={i} className="text-sm">★</span>
                  ))}
                </div>
                <p className="text-slate-300 text-sm italic mb-4">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-rose-300 text-sm font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-rose-100 text-sm font-bold">{t.name}</p>
                    <p className="text-slate-500 text-xs">{t.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
