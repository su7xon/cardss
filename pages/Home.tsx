import React from 'react';
import { Link } from 'react-router-dom';
import { Testimonial, AboutContent } from '../types';

interface HomeProps {
  testimonials: Testimonial[];
  aboutContent: AboutContent;
}

const Home: React.FC<HomeProps> = ({ testimonials, aboutContent }) => {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://i.pinimg.com/originals/a1/6b/f6/a16bf61442a7e835f95c62d1d13cfc4a.jpg" 
            alt="Spiritual cosmic background" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-transparent to-slate-950"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-mystic text-rose-100 mb-6 tracking-tighter animate-fade-in">
            Master Your <span className="text-rose-400">Destiny</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-10 font-light leading-relaxed">
            Gurgaon-based Astrologer & Crystal Healer Pooja Gupta invites you to explore the healing power of the cosmos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/booking" className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-4 rounded-full font-bold tracking-widest transition-all shadow-lg hover:scale-105 active:scale-95">
              BOOK A READING
            </Link>
            <Link to="/shop" className="bg-transparent border border-rose-300 text-rose-200 hover:bg-rose-500/10 px-8 py-4 rounded-full font-bold tracking-widest transition-all">
              EXPLORE CRYSTALS
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        <div className="rounded-2xl overflow-hidden shadow-2xl gold-border">
          <img src={aboutContent.image} alt="Pooja Gupta" className="w-full h-full object-cover" />
        </div>
        <div className="space-y-6">
          <h2 className="text-3xl md:text-5xl font-mystic text-rose-200">{aboutContent.title}</h2>
          <p className="text-slate-300 leading-relaxed text-lg">
            {aboutContent.description}
          </p>
          <ul className="space-y-4 text-rose-100/80">
            {aboutContent.credentials.map((credential, index) => (
              <li key={index} className="flex items-center gap-3">
                <span className="w-2 h-2 bg-rose-400 rounded-full"></span>
                {credential}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Wall of Love Section */}
      <section className="bg-slate-900/50 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-mystic text-rose-200 mb-4">Wall of Love</h2>
            <div className="flex justify-center gap-1 text-yellow-500 mb-4">
              {[1, 2, 3, 4, 5].map(i => (
                <svg key={i} className="w-6 h-6 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              ))}
            </div>
            <p className="text-slate-400">Trusted by 5,000+ souls worldwide.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.filter(t => t.isModerated).map(t => (
              <div key={t.id} className="bg-slate-950 p-8 rounded-2xl gold-border rose-gold-glow hover:-translate-y-2 transition-transform">
                <div className="flex gap-1 text-yellow-500 mb-4">
                   {Array.from({ length: t.rating }).map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-slate-300 italic mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-rose-300">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-rose-100">{t.name}</h4>
                    <p className="text-xs text-slate-500 uppercase tracking-widest">{t.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;