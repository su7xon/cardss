import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Testimonial, AboutContent, Service, ServiceCategory } from '../types';

interface HomeProps {
  services: Service[];
  serviceCategories: ServiceCategory[];
  testimonials: Testimonial[];
  aboutContent: AboutContent;
  heroImage?: string;
  heroVideo?: string;
}

const Home: React.FC<HomeProps> = ({ services, serviceCategories, testimonials, aboutContent, heroImage, heroVideo }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || window.innerWidth >= 768) return;

    let animationId: number;
    let scrollPos = scrollContainer.scrollLeft;

    const scroll = () => {
      if (!isPaused && scrollContainer) {
        scrollPos += 0.5;
        if (scrollPos >= scrollContainer.scrollWidth / 2) {
          scrollPos = 0;
        }
        scrollContainer.scrollLeft = scrollPos;
      } else if (scrollContainer) {
        scrollPos = scrollContainer.scrollLeft;
      }
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationId);
  }, [isPaused]);

  // Combined list for seamless loop on mobile
  const moderatedReviews = testimonials.filter(t => t.isModerated);
  const scrollingReviews = [...moderatedReviews, ...moderatedReviews];

  // Default categories fallbacks just in case
  const displayCategories = serviceCategories && serviceCategories.length > 0 ? serviceCategories : [
    { id: '1', name: 'Tarot Guidance', icon: '🔮', description: 'Deep insights into your past, present, and future through ancient wisdom.' },
    { id: '2', name: 'Counseling & Healing', icon: '🕊️', description: 'Compassionate spiritual counseling and energy healing for inner peace.' },
    { id: '3', name: 'Special Packages', icon: '✨', description: 'Curated bundles of healing sessions and tools for complete transformation.' }
  ];

  return (
    <div className="space-y-2 md:space-y-12 pb-8 md:pb-16">
      <section
        className="relative w-full h-auto md:h-[90vh] aspect-[4/5] md:aspect-auto overflow-hidden bg-black bg-cover bg-center"
      >
        {/* Video Background */}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover md:object-[35%_center]"
          poster="/assets/hero_bg_final_2.png"
        >
          <source src="/assets/laptop_hero.mp4" type="video/mp4" media="(min-width: 768px)" />
          <source src="/assets/grok_video.mp4" type="video/mp4" />
        </video>

        {/* Dark Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40 z-0"></div>


        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
          <div className="max-w-[95%] sm:max-w-3xl w-full p-2 md:p-0">
            <h1 className="text-lg sm:text-xl md:text-5xl font-mystic font-bold text-white mb-2 tracking-tighter animate-fade-in drop-shadow-lg whitespace-nowrap">
              Healing • Guidance • Tarot
            </h1>

            <p className="text-[10px] md:text-xl text-white mb-6 md:mb-10 font-semibold leading-relaxed drop-shadow-lg max-w-2xl mx-auto">
              Personalized tarot reading, healing guidance <br /> & authentic crystals for balance, clarity and growth.
            </p>
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 justify-center items-center">
              <Link to="/booking" className="w-full sm:w-auto bg-rose-500 hover:bg-rose-600 text-white px-6 md:px-8 py-2.5 md:py-4 rounded-full font-bold text-[10px] md:text-base tracking-widest transition-all shadow-lg active:scale-95">
                BOOK A READING
              </Link>
              <Link to="/shop" className="w-full sm:w-auto bg-white border border-rose-500 text-rose-800 hover:bg-rose-50 px-6 md:px-8 py-2.5 md:py-4 rounded-full font-bold text-[10px] md:text-base tracking-widest transition-all shadow-md">
                EXPLORE CRYSTALS
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-xl md:text-5xl font-mystic text-rose-900 mb-2 md:mb-4 whitespace-nowrap">Our Sacred Services</h2>
          <p className="text-slate-600 text-sm md:text-base max-w-2xl mx-auto">Comprehensive guidance and healing for your soul's evolution.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-8">
          {displayCategories.map((cat, i, arr) => (
            <Link
              key={cat.id || i}
              to="/booking"
              className={`bg-white p-4 md:p-8 rounded-2xl md:rounded-3xl border border-rose-100 hover:border-rose-300 transition-all text-center shadow-sm hover:shadow-md group block h-full ${
                // If there are exactly 3 items and this is the last one (index 2), span 2 columns on mobile to center it
                arr.length === 3 && i === 2 ? 'col-span-2 md:col-span-1 w-[50%] mx-auto md:w-full' : ''
                }`}
            >
              <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center overflow-hidden rounded-full md:rounded-2xl">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl md:text-5xl">{cat.icon}</span>
                )}
              </div>
              <h3 className="font-mystic text-xs md:text-xl text-rose-900 mb-2">{cat.name}</h3>
              <p className="text-slate-600 text-[10px] md:text-sm leading-relaxed line-clamp-3 md:line-clamp-none">{cat.description || cat.name}</p>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8 md:mt-12">
          <Link to="/booking" className="inline-block text-xs md:text-base text-rose-500 font-bold border-b-2 border-rose-500 hover:text-rose-600 hover:border-rose-600 transition-all">
            BOOK A CONSULTATION →
          </Link>
        </div>
      </section>

      <section className="bg-rose-50/30 py-6 md:py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 md:mb-12 gap-6 text-center md:text-left">
            <div>
              <h2 className="text-2xl md:text-5xl font-mystic text-rose-900 mb-2 md:mb-4">Crystal & Healing Store</h2>
              <p className="text-slate-600 text-sm md:text-base">Premium tools for your spiritual practice, energized and ethically sourced.</p>
            </div>
            <Link to="/shop" className="bg-rose-500 text-white px-8 py-3 rounded-full font-bold text-xs md:text-base tracking-widest hover:bg-rose-600 transition-all shadow-lg">
              VISIT STORE
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { name: 'Healing Stones', cat: 'Crystal', icon: '💎' },
              { name: 'Crystal Bracelets', cat: 'Bracelet', icon: '📿' },
              { name: 'Spiritual Jewellery', cat: 'Jewelry', icon: '✨' },
              { name: 'Raw & Charged', cat: 'Raw Stone', icon: '🌑' }
            ].map((c, i) => (
              <Link key={i} to="/shop" className="bg-white p-4 md:p-6 rounded-2xl border border-rose-100 text-center hover:-translate-y-1 transition-all shadow-sm">
                <div className="text-2xl md:text-3xl mb-2">{c.icon}</div>
                <h4 className="text-rose-900 font-bold text-xs md:text-sm mb-1">{c.name}</h4>
                <span className="text-rose-400 text-[8px] md:text-[10px] uppercase tracking-widest">{c.cat}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-4 text-center">
        <div className="space-y-6 bg-white p-8 md:p-12 rounded-3xl border border-rose-100 shadow-sm">
          <h2 className="text-lg sm:text-2xl md:text-5xl font-mystic text-rose-900">{aboutContent.title}</h2>
          <p className="text-slate-700 leading-relaxed text-sm md:text-lg mx-auto">
            {aboutContent.description}
          </p>
          <ul className="grid md:grid-cols-2 gap-3 md:gap-4 text-rose-800/80 max-w-2xl mx-auto">
            {aboutContent.credentials.map((credential, index) => (
              <li key={index} className="flex items-center justify-center gap-3 bg-rose-50/50 p-2.5 md:p-3 rounded-xl border border-rose-100 text-sm md:text-base">
                <span className="w-2 h-2 bg-rose-400 rounded-full"></span>
                <span className="font-semibold">{credential}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-rose-50/50 py-6 md:py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-mystic text-rose-900 mb-4">Wall of Love</h2>
            <div className="flex justify-center gap-1 text-yellow-500 mb-4">
              {[1, 2, 3, 4, 5].map(i => (
                <svg key={i} className="w-6 h-6 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              ))}
            </div>
            <p className="text-rose-700 font-semibold tracking-wide">Trusted by 300+ souls worldwide.</p>
          </div>

          <div className="overflow-hidden md:overflow-visible">
            <div
              ref={scrollRef}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
              className={`flex md:grid md:grid-cols-3 gap-6 overflow-x-auto md:overflow-visible no-scrollbar -mx-4 px-4 md:mx-0 md:px-0`}
            >
              {(window.innerWidth < 768
                ? scrollingReviews
                : (showAllReviews ? moderatedReviews : moderatedReviews.slice(0, 3))
              ).map((t, i) => (
                <div key={`${t.id}-${i}`} className="w-[85vw] md:w-auto md:min-w-0 bg-white p-6 md:p-8 rounded-2xl gold-border rose-gold-glow md:hover:-translate-y-2 transition-all shadow-sm flex-shrink-0">
                  <div className="flex gap-1 text-yellow-500 mb-4">
                    {Array.from({ length: t.rating }).map((_, starIndex) => (
                      <svg key={starIndex} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                  <p className="text-slate-600 italic mb-6 text-sm md:text-base leading-relaxed">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center font-bold text-rose-500">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-rose-900 text-sm md:text-base">{t.name}</h4>
                      <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-widest">{t.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {moderatedReviews.length > 3 && (
              <div className="hidden md:flex justify-center mt-12">
                <button
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="bg-white border border-rose-200 text-rose-600 px-8 py-3 rounded-full font-bold tracking-widest hover:bg-rose-50 transition-all shadow-sm"
                >
                  {showAllReviews ? 'SHOW LESS' : 'VIEW ALL TESTIMONIALS'}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div >
  );
};

export default Home;