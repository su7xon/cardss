import React, { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Download } from 'lucide-react';
import { Testimonial, Service, ServiceCategory, HeroContent, Product, CourseEbook, CrystalCombo } from '../types';
import { subscribeToCoursesEbooks, subscribeToSettings } from '../services/databaseService';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeleton';
import { useCart } from '../contexts/CartContext';

interface HomeProps {
  services: Service[];
  serviceCategories: ServiceCategory[];
  testimonials: Testimonial[];
  heroImage?: string;
  heroVideo?: string;
  heroContent?: HeroContent;
  products?: Product[];
}

const Home: React.FC<HomeProps> = ({ services, serviceCategories, testimonials, heroImage, heroVideo, heroContent, products }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const courseScrollRef = useRef<HTMLDivElement>(null);
  const isCoursesHoldingRef = useRef(false);
  const isCoursesDraggingRef = useRef(false);
  const ignoreProgrammaticCourseScrollRef = useRef(false);
  const courseDragStartXRef = useRef(0);
  const courseDragStartYRef = useRef(0);
  const courseDragStartScrollRef = useRef(0);
  const courseResumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isCoursesPaused, setIsCoursesPaused] = useState(false);
  const [coursesEbooks, setCoursesEbooks] = useState<CourseEbook[]>([]);
  const [crystalCombos, setCrystalCombos] = useState<CrystalCombo[]>([]);
  const { addToCart } = useCart();
  const [addedComboId, setAddedComboId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isHeroVideoReady, setIsHeroVideoReady] = useState(false);
  const [heroVideoSrc, setHeroVideoSrc] = useState(() => {
    if (typeof window === 'undefined') {
      return heroVideo || '/assets/grok_video.mp4';
    }

    return window.innerWidth >= 768 ? '/assets/laptop_hero.mp4' : '/assets/grok_video.mp4';
  });

  // Subscribe to courses & ebooks
  useEffect(() => {
    const unsub = subscribeToCoursesEbooks((items) => setCoursesEbooks(items));
    return () => unsub();
  }, []);

  useEffect(() => {
    const updateHeroVideoSrc = () => {
      setHeroVideoSrc(window.innerWidth >= 768 ? '/assets/laptop_hero.mp4' : '/assets/grok_video.mp4');
    };

    updateHeroVideoSrc();
    window.addEventListener('resize', updateHeroVideoSrc);

    return () => window.removeEventListener('resize', updateHeroVideoSrc);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsHeroVideoReady(false);
    video.load();
    video.play().catch(() => {});
  }, [heroVideoSrc]);

  // Subscribe to crystal combos
  useEffect(() => {
    const unsub = subscribeToSettings((settings) => {
      if (settings.crystalCombos && settings.crystalCombos.length > 0) {
        setCrystalCombos(settings.crystalCombos);
      }
    });
    return () => unsub();
  }, []);

  const visibleProducts = (products || []).filter(p => 
    p.name?.toLowerCase() !== 'personalized energy bracelet' && 
    p.category?.toLowerCase() !== 'personalized energy bracelet'
  );
  const filteredProducts = visibleProducts; // Show all products across multiple sections
  const topProducts = filteredProducts.slice(0, 10);
  const middleProducts = filteredProducts.slice(10, 20);
  const bottomProducts = filteredProducts.slice(20);

  // Update loading state when products change
  useEffect(() => {
    if (products && products.length > 0) {
      setIsLoadingProducts(false);
    }
  }, [products]);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    let lastTime = 0;
    let lastScrollLeft = 0;
    let manualScrollTimeout: NodeJS.Timeout | null = null;
    const speedPxPerSecond = 28;

    const halfWidth = () => scrollContainer.scrollWidth / 2;
    let scrollPos = 0;
    scrollContainer.scrollLeft = scrollPos;

    const resumeAutoScroll = () => {
      setIsPaused(false);
      if (manualScrollTimeout) clearTimeout(manualScrollTimeout);
    };

    const handleScroll = () => {
      const currentScroll = scrollContainer.scrollLeft;
      // Detect if user manually scrolled (scroll position changed unexpectedly)
      if (Math.abs(currentScroll - lastScrollLeft) > 2) {
        setIsPaused(true);
        scrollPos = currentScroll;
        if (manualScrollTimeout) clearTimeout(manualScrollTimeout);
        manualScrollTimeout = setTimeout(resumeAutoScroll, 3000); // Resume after 3 seconds of no scroll
      }
      lastScrollLeft = currentScroll;
    };

    scrollContainer.addEventListener('scroll', handleScroll);

    const scroll = (time: number) => {
      if (!lastTime) lastTime = time;
      const deltaSeconds = (time - lastTime) / 1000;
      lastTime = time;

      if (!isPaused) {
        const resetPoint = halfWidth();
        if (resetPoint > 0) {
          // Right-to-left visual motion by moving scroll position forward.
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
  }, [isPaused, testimonials]);

  // Combined list for seamless loop — always show ALL approved reviews in marquee
  const moderatedReviews = testimonials.filter(t => t.isModerated);
  const scrollingReviews = moderatedReviews.length > 0
    ? [...moderatedReviews, ...moderatedReviews]  // duplicate for seamless infinite scroll
    : [];

  const displayedCourses = coursesEbooks;
  const courseScrollItems = displayedCourses; // No duplication - scroll modulo handles looping

  const scheduleCoursesResume = (delay = 1200) => {
    if (courseResumeTimeoutRef.current) clearTimeout(courseResumeTimeoutRef.current);
    courseResumeTimeoutRef.current = setTimeout(() => {
      if (!isCoursesHoldingRef.current && !isCoursesDraggingRef.current) {
        setIsCoursesPaused(false);
      }
    }, delay);
  };

  const handleCoursePressStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    const container = courseScrollRef.current;
    if (!container) return;

    isCoursesHoldingRef.current = true;
    isCoursesDraggingRef.current = false;
    courseDragStartXRef.current = e.clientX;
    courseDragStartYRef.current = e.clientY;
    courseDragStartScrollRef.current = container.scrollLeft;
    setIsCoursesPaused(true);

    if (courseResumeTimeoutRef.current) clearTimeout(courseResumeTimeoutRef.current);
    if (e.pointerType === 'mouse') {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handleCoursePressMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isCoursesHoldingRef.current) return;

    const container = courseScrollRef.current;
    if (!container) return;

    const deltaX = e.clientX - courseDragStartXRef.current;
    const deltaY = e.clientY - courseDragStartYRef.current;

    if (!isCoursesDraggingRef.current) {
      if (Math.abs(deltaX) < 6 && Math.abs(deltaY) < 6) return;

      // If user intent is vertical, let page scroll naturally.
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        handleCoursePressEnd(e);
        return;
      }

      isCoursesDraggingRef.current = true;
    }

    container.scrollLeft = courseDragStartScrollRef.current - deltaX;
  };

  const handleCoursePressEnd = (e?: React.PointerEvent<HTMLDivElement>) => {
    if (e && e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    isCoursesHoldingRef.current = false;
    isCoursesDraggingRef.current = false;
    scheduleCoursesResume(700);
  };

  const handleCourseWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const container = courseScrollRef.current;
    if (!container) return;

    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 1) return;

    setIsCoursesPaused(true);
    container.scrollLeft += delta;
    scheduleCoursesResume(1000);
  };

  useEffect(() => {
    const scrollContainer = courseScrollRef.current;
    if (!scrollContainer || displayedCourses.length <= 1) return;

    let animationId: number;
    let lastTime: number | null = null;
    let scrollPos = 0;
    let releaseProgrammaticGuardRaf: number | null = null;
    const speedPxPerSecond = 32;

    const halfWidth = () => scrollContainer.scrollWidth / 2;

    const handleScroll = () => {
      if (ignoreProgrammaticCourseScrollRef.current) return;
      // Manual scroll detected
      setIsCoursesPaused(true);
      scrollPos = scrollContainer.scrollLeft;
      if (courseResumeTimeoutRef.current) clearTimeout(courseResumeTimeoutRef.current);
      scheduleCoursesResume(1800);
    };

    scrollContainer.addEventListener('scroll', handleScroll);

    const animateScroll = (currentTime: number) => {
      // Reset timer when resuming from pause
      if (!isCoursesPaused && lastTime === null) {
        lastTime = currentTime;
      }

      if (!isCoursesPaused && lastTime !== null) {
        const deltaMs = currentTime - lastTime;
        const halfW = halfWidth();

        if (halfW > 0) {
          // Incremental scroll movement
          scrollPos += (deltaMs / 1000) * speedPxPerSecond;
          
          // Seamless wraparound at halfway point
          if (scrollPos >= halfW) {
            scrollPos = scrollPos % halfW;
          }

          ignoreProgrammaticCourseScrollRef.current = true;
          scrollContainer.scrollLeft = scrollPos;
          if (releaseProgrammaticGuardRaf) cancelAnimationFrame(releaseProgrammaticGuardRaf);
          releaseProgrammaticGuardRaf = requestAnimationFrame(() => {
            ignoreProgrammaticCourseScrollRef.current = false;
          });
        }
        lastTime = currentTime;
      } else if (isCoursesPaused) {
        // While paused, keep track of current position
        lastTime = null;
        scrollPos = scrollContainer.scrollLeft;
      }

      animationId = requestAnimationFrame(animateScroll);
    };

    animationId = requestAnimationFrame(animateScroll);

    return () => {
      cancelAnimationFrame(animationId);
      if (releaseProgrammaticGuardRaf) cancelAnimationFrame(releaseProgrammaticGuardRaf);
      ignoreProgrammaticCourseScrollRef.current = false;
      scrollContainer.removeEventListener('scroll', handleScroll);
      if (courseResumeTimeoutRef.current) clearTimeout(courseResumeTimeoutRef.current);
    };
  }, [isCoursesPaused, displayedCourses.length]);

  // Default categories fallbacks just in case
  const displayCategories = serviceCategories && serviceCategories.length > 0 ? serviceCategories : [
    { id: '1', name: 'Tarot Guidance', icon: '', description: 'Deep insights into your past, present, and future through ancient wisdom.' },
    { id: '2', name: 'Counseling & Healing', icon: '', description: 'Compassionate spiritual counseling and energy healing for inner peace.' },
    { id: '3', name: 'Special Packages', icon: '', description: 'Curated bundles of healing sessions and tools for complete transformation.' },
    { id: '4', name: 'Crystal Combo', icon: '', description: 'Powerful crystal combinations curated for specific intentions and energy work.' }
  ];

  const displayHeroContent: HeroContent = {
    heading: heroContent?.heading || 'Healing • Guidance • Tarot',
    subheading: heroContent?.subheading || 'Personalized tarot reading, healing guidance\n& authentic crystals for balance, clarity and growth.',
    subtitle: heroContent?.subtitle || '',
    primaryButtonText: heroContent?.primaryButtonText || 'BOOK A READING',
    secondaryButtonText: heroContent?.secondaryButtonText || 'BUY CRYSTAL'
  };

  const servicesGridClass =
    displayCategories.length <= 1
      ? 'md:grid-cols-1 md:max-w-[420px] md:mx-auto'
      : displayCategories.length === 2
        ? 'md:grid-cols-2 md:max-w-4xl md:mx-auto'
        : 'md:grid-cols-3';

  return (
    <div className="space-y-2 md:space-y-12 pb-8 md:pb-16">
      <section
        className="relative w-full h-auto md:h-[90vh] aspect-[4/5] md:aspect-auto overflow-hidden bg-cover bg-center"
        style={{ background: 'linear-gradient(135deg, #881337 0%, #9f1239 50%, #000000 100%)' }}
      >
        {/* Video Background */}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          src={heroVideoSrc}
          onLoadedData={() => setIsHeroVideoReady(true)}
          className="absolute inset-0 w-full h-full object-cover md:object-[35%_center]"
        >
        </video>

        {/* Dark Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40 z-0"></div>


        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
          <div className="max-w-[98%] sm:max-w-5xl w-full p-2 md:p-0">
            <h1 className="text-[clamp(12px,3.8vw,19px)] sm:text-2xl md:text-4xl lg:text-5xl font-mystic font-bold text-white mb-2 tracking-tight animate-fade-in drop-shadow-lg whitespace-nowrap leading-tight">
              {displayHeroContent.heading}
            </h1>

            {displayHeroContent.subtitle && (
              <p className="text-sm md:text-2xl text-rose-200 mt-2 mb-4 font-mystic tracking-widest animate-fade-in drop-shadow-md">
                {displayHeroContent.subtitle}
              </p>
            )}

            <p className="text-[10px] md:text-xl text-white mb-6 md:mb-10 font-semibold italic leading-relaxed drop-shadow-lg max-w-2xl mx-auto whitespace-pre-line">
              {displayHeroContent.subheading}
            </p>
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 justify-center items-center">
              <Link to="/booking" className="w-full sm:w-auto bg-rose-500 hover:bg-rose-600 text-white px-6 md:px-8 py-2.5 md:py-4 rounded-full font-bold text-[10px] md:text-base tracking-widest transition-all shadow-lg active:scale-95">
                {displayHeroContent.primaryButtonText}
              </Link>
              <Link to="/shop" className="w-full sm:w-auto bg-white border border-rose-500 text-rose-800 hover:bg-rose-50 px-6 md:px-8 py-2.5 md:py-4 rounded-full font-bold text-[10px] md:text-base tracking-widest transition-all shadow-md text-center">
                {displayHeroContent.secondaryButtonText}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ✨ Courses & eBooks Section */}
      {displayedCourses.length > 0 && (
        <section className="relative overflow-hidden bg-[#fdf8f6] py-12 md:py-24">
          {/* Background elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-100 rounded-full blur-[100px] opacity-40"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-50 rounded-full blur-[100px] opacity-40"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block text-rose-500 text-[10px] md:text-sm font-bold tracking-[0.3em] uppercase mb-4">
                Digital Wisdom
              </span>
              <h2 className="text-3xl md:text-5xl font-mystic text-rose-900 mb-4">
                Courses & eBooks
              </h2>
              <p className="text-slate-500 text-sm md:text-lg max-w-2xl mx-auto">
                Master the arts of healing and tarot with our curated digital library.
              </p>
            </div>

            <div
              ref={courseScrollRef}
              className="flex overflow-x-auto gap-3 md:gap-5 px-1 pb-2 no-scrollbar cursor-grab active:cursor-grabbing"
              onPointerDown={handleCoursePressStart}
              onPointerMove={handleCoursePressMove}
              onPointerUp={handleCoursePressEnd}
              onPointerCancel={handleCoursePressEnd}
              onPointerLeave={handleCoursePressEnd}
              onWheel={handleCourseWheel}
              style={{ touchAction: 'pan-y' }}
            >
              {courseScrollItems.map((item, index) => {
                const badge = item.price === 0
                  ? 'FREE'
                  : item.isFeatured
                    ? 'POPULAR'
                    : item.type === 'course'
                      ? 'BESTSELLER'
                      : 'NEW';

                const computedOriginal = item.price === 0
                  ? 499
                  : Math.max(item.price + Math.round(item.price * 0.6), item.price + 100);

                return (
                  <div
                    key={`${item.id}-${index}`}
                    className="group w-[210px] md:w-[240px] flex-shrink-0 bg-white rounded-xl overflow-hidden flex flex-col h-full shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-lg transition-all duration-300"
                  >
                    <div className="relative w-full aspect-square bg-[#f9f7f0] p-2 sm:p-3 flex items-center justify-center overflow-hidden">
                      <div className="absolute top-0 left-0 bg-gradient-to-b from-rose-400 to-rose-600 px-2 py-1.5 rounded-br-xl shadow-sm z-10 flex flex-col items-center justify-center">
                        <span className="text-[10px] sm:text-xs font-black text-white leading-none">{badge}</span>
                      </div>
                      <img src={item.coverImage || 'https://images.unsplash.com/photo-1596501047101-5764d73286df?auto=format&fit=crop&q=80&w=800'} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-2.5 sm:p-3 flex flex-col flex-grow bg-white">
                      <h3 className="text-[11px] sm:text-xs font-medium text-gray-800 line-clamp-2 h-7 sm:h-8 leading-snug">
                        {item.title}
                      </h3>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="text-xs sm:text-sm font-bold text-gray-900">
                            {item.price === 0 ? 'FREE' : `₹${item.price}`}
                          </span>
                          <span className="text-[10px] sm:text-xs text-gray-400 line-through">₹{computedOriginal}</span>
                        </div>
                        <Link
                          to="/courses"
                          className="bg-black hover:bg-gray-800 text-white p-1.5 rounded-md transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 flex justify-end">
              <Link
                to="/courses"
                className="inline-flex items-center gap-1.5 px-0 py-0 font-semibold text-[10px] tracking-[0.14em] uppercase text-rose-900 hover:text-rose-700 transition-colors"
              >
                Explore All Courses
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}



      {/* Spiritual Store Section */}
      <section className="max-w-7xl mx-auto px-4 py-8 md:py-24">
        <div className="flex flex-col items-center justify-center mb-8 md:mb-16 gap-6 text-center">
          <div className="space-y-2 md:space-y-4">
            <h2 className="text-xl md:text-5xl font-mystic text-rose-900 mb-2 md:mb-4 whitespace-nowrap">
              Our Spiritual Store
            </h2>
            <p className="text-slate-500 text-xs md:text-xl max-w-2xl mx-auto font-medium tracking-wide">
              Authentic crystals and sacred tools for your journey.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-10">
          {isLoadingProducts ? (
            // Show skeleton loaders while products are loading
            Array.from({ length: 8 }).map((_, index) => (
              <ProductCardSkeleton key={`skeleton-${index}`} />
            ))
          ) : (
            topProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product}
              />
            ))
          )}
        </div>

        <div className="flex justify-center mt-8 md:mt-12">
          <Link 
            to="/shop" 
            className="text-rose-700 hover:text-rose-900 text-[10px] md:text-sm font-bold tracking-[0.2em] uppercase border border-rose-200 hover:border-rose-400 rounded-full px-6 md:px-8 py-2 md:py-3 transition-all hover:shadow-md active:scale-95"
          >
            View More
          </Link>
        </div>

      </section>

      {/* Promotional Banner: Gemstone Consultation */}
      <section className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="relative bg-gradient-to-br from-rose-900 via-rose-800 to-rose-900 rounded-3xl p-6 md:p-12 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-400/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10 text-center">
            <span className="inline-block text-yellow-400 text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase mb-3 md:mb-4">
              Only Limited Slots Available!
            </span>
            <h2 className="text-xl md:text-4xl font-mystic text-white mb-4 md:mb-6">
              Personalised Gemstone Consultation by Pooja Gupta
            </h2>
            <p className="text-rose-100 text-sm md:text-lg max-w-2xl mx-auto mb-6 md:mb-8 leading-relaxed">
              Not sure which crystal or gemstone is right for you? Get a personalised recommendation based on your birth chart, current challenges and energy — so every stone you wear truly works for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center">
              <Link 
                to="/booking?step=details&service=gemstone&price=99&promo=gemstone99" 
                className="bg-yellow-400 hover:bg-yellow-300 text-rose-900 px-6 md:px-10 py-3 md:py-4 rounded-full font-bold text-xs md:text-sm tracking-widest transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                Book Consultation @ ₹99
              </Link>
              <Link 
                to="/booking?step=details&service=gemstone&price=99&promo=gemstone99" 
                className="text-rose-200 hover:text-white text-xs md:text-sm font-bold underline underline-offset-4 transition-colors"
              >
                Book Now →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section 2 - After Consultation Banner */}
      {middleProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8 md:py-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-10">
            {middleProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product}
              />
            ))}
          </div>

          <div className="flex justify-center mt-8 md:mt-12">
            <Link 
              to="/shop" 
              className="text-rose-700 hover:text-rose-900 text-[10px] md:text-sm font-bold tracking-[0.2em] uppercase border border-rose-200 hover:border-rose-400 rounded-full px-6 md:px-8 py-2 md:py-3 transition-all hover:shadow-md active:scale-95"
            >
              View More
            </Link>
          </div>

        </section>
      )}
      
      {/* Show skeletons for middle products if still loading */}
      {isLoadingProducts && middleProducts.length === 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8 md:py-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-10">
            {Array.from({ length: 4 }).map((_, index) => (
              <ProductCardSkeleton key={`skeleton-middle-${index}`} />
            ))}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 py-10 md:py-16">
        <div className="relative rounded-[2rem] md:rounded-[2.5rem] border border-rose-100/70 bg-gradient-to-b from-white via-rose-50/40 to-white px-4 py-8 md:px-10 md:py-14 shadow-[0_24px_70px_-45px_rgba(136,19,55,0.45)] overflow-hidden">
          <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-rose-100/60 blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-52 h-52 rounded-full bg-rose-100/50 blur-3xl"></div>

          <div className="relative z-10 text-center mb-8 md:mb-12">
            <span className="inline-flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-[0.28em] text-rose-500 font-bold mb-3 md:mb-4">
              Curated Spiritual Offerings
            </span>
            <h2 className="text-3xl md:text-6xl font-mystic text-rose-900 mb-3 md:mb-5 leading-[1.05]">
              Our Sacred Services
            </h2>
            <p className="text-slate-600 text-sm md:text-lg max-w-3xl mx-auto leading-relaxed">
              Comprehensive guidance and healing for your soul&apos;s evolution.
            </p>
          </div>

          <div className={`relative z-10 grid grid-cols-1 ${servicesGridClass} gap-6 md:gap-7`}>
            {displayCategories.map((cat, i) => (
              <Link
                key={cat.id || i}
                to="/booking"
                className="group relative overflow-hidden w-full max-w-[370px] mx-auto md:max-w-none py-[14px] px-4 md:p-8 rounded-[16px] md:rounded-3xl border border-rose-100 shadow-[0_10px_30px_rgba(0,0,0,0.15)] md:shadow-[0_20px_35px_-30px_rgba(136,19,55,0.7)] hover:border-rose-300 hover:-translate-y-1 transition-all duration-300 text-center h-full min-h-[120px] md:min-h-0"
                style={cat.image ? { backgroundImage: `url(${cat.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: 'linear-gradient(135deg, #881337 0%, #be123c 55%, #9f1239 100%)' }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/45 to-black/70 group-hover:from-black/20 group-hover:to-black/65 transition-colors duration-300"></div>
                <div className="relative z-10">
                <div className="w-12 md:w-20 h-1 bg-gradient-to-r from-rose-300 via-rose-500 to-rose-300 rounded-full mx-auto mb-3 md:mb-6 group-hover:w-16 md:group-hover:w-24 transition-all duration-300"></div>
                <h3 className="font-mystic text-[1.55rem] md:text-4xl text-white mb-2 md:mb-3 leading-tight">
                  {cat.name}
                </h3>
                <p className="text-white/95 text-xs md:text-base leading-relaxed max-w-[18rem] mx-auto">
                  {cat.description || cat.name}
                </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CRYSTAL COMBO Section */}
      {crystalCombos.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-10 md:py-16">
          <div className="relative py-8 md:py-14">
            <div className="relative z-10 text-center mb-8 md:mb-12">
              <span className="inline-flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-[0.28em] text-rose-600 font-bold mb-3 md:mb-4">
                Powerfully Curated
              </span>
              <h2 className="text-3xl md:text-6xl font-mystic text-rose-900 mb-3 md:mb-5 leading-[1.05]">
                CRYSTAL COMBO
              </h2>
              <p className="text-slate-700 text-sm md:text-lg max-w-3xl mx-auto leading-relaxed">
                Discover our sacred crystal combinations - handpicked sets designed to amplify your intentions, balance your energy, and transform your space.
              </p>
            </div>

            <div className="relative z-10">
              <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
                {crystalCombos.map((combo) => (
                  <div
                    key={combo.id}
                    onClick={() => navigate(`/product/combo_${combo.id}`)}
                    className="w-[calc(50%-12px)] sm:w-[260px] md:w-[280px] group bg-white rounded-lg sm:rounded-xl overflow-hidden flex flex-col h-full cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-lg transition-all duration-300"
                >
                  {/* Image Container */}
                  <div className="relative w-full aspect-[4/3] sm:aspect-square bg-gradient-to-br from-rose-50 to-pink-50 p-2 sm:p-5 flex items-center justify-center overflow-hidden">
                    {combo.image ? (
                      <img 
                        src={combo.image} 
                        alt={combo.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center rounded-lg"
                        style={{ background: combo.gradient }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30"></div>
                        <span className="relative z-10 text-white font-mystic text-lg sm:text-2xl md:text-3xl font-bold text-center px-2">
                          {combo.title}
                        </span>
                      </div>
                    )}
                    
                    {/* Tag Badge */}
                    {combo.tag && (
                      <div className="absolute top-0 left-0 bg-gradient-to-b from-rose-400 to-rose-600 px-2 py-1.5 rounded-br-xl shadow-sm z-10 flex flex-col items-center justify-center">
                        <span className="text-[10px] sm:text-xs font-black text-white leading-none">{combo.tag}</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-2.5 sm:p-4 flex flex-col flex-grow bg-white">
                    <h3 className="text-[11px] sm:text-sm font-medium text-gray-800 line-clamp-2 h-7 sm:h-10 leading-snug mb-1.5 sm:mb-2">
                      {combo.title}
                    </h3>
                    <p className="text-[9px] sm:text-xs text-slate-500 mb-1.5 sm:mb-2 line-clamp-1">
                      {combo.subtitle}
                    </p>

                    {/* Price & Button */}
                    <div className="mt-auto flex items-center justify-between pt-2 gap-2">
                      <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
                        <span className="text-xs sm:text-base font-bold text-gray-900 truncate">
                          ₹{combo.price}
                        </span>
                        {combo.originalPrice && (
                          <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                            ₹{combo.originalPrice}
                          </span>
                        )}
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          try {
                            const product: Product = {
                              id: `combo_${combo.id}`,
                              name: combo.title,
                              price: combo.price,
                              originalPrice: combo.originalPrice,
                              description: `${combo.subtitle} - ${combo.description}`,
                              image: combo.image || '',
                              category: 'Crystal Combo',
                              tag: combo.tag,
                              stock: 999,
                              rating: 5,
                              reviews: 0
                            };
                            console.error('[DEBUG] Product:', product);
                            addToCart(product);
                            console.error('[DEBUG] Added to cart successfully');
                            setAddedComboId(combo.id);
                            setTimeout(() => setAddedComboId(null), 2000);
                          } catch (error) {
                            console.error('[ERROR] Add to cart failed:', error);
                          }
                        }}
                        className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-md text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all shrink-0 whitespace-nowrap ${
                          addedComboId === combo.id
                            ? 'bg-green-500 text-white'
                            : 'bg-rose-500 hover:bg-rose-600 text-white'
                        }`}
                      >
                        {addedComboId === combo.id ? (
                          <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            ADDED
                          </span>
                        ) : (
                          'ADD'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 text-right mt-8 md:mt-12">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium text-sm md:text-base transition-colors"
              >
                View All Combos
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M3 12h18" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Products Section 3 - After Sacred Services */}
      {bottomProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8 md:py-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-10">
            {bottomProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product}
              />
            ))}
          </div>

          <div className="flex justify-center mt-8 md:mt-12">
            <Link 
              to="/shop" 
              className="text-rose-700 hover:text-rose-900 text-[10px] md:text-sm font-bold tracking-[0.2em] uppercase border border-rose-200 hover:border-rose-400 rounded-full px-6 md:px-8 py-2 md:py-3 transition-all hover:shadow-md active:scale-95"
            >
              View More
            </Link>
          </div>

        </section>
      )}

      <section id="contact" className="bg-rose-50/30 py-8 md:py-20 overflow-hidden relative">

        <div className="max-w-7xl mx-auto px-4 mb-4 md:mb-12 flex flex-col items-center text-center">
          <div>
            <h2 className="text-xl md:text-5xl font-mystic text-rose-900 mb-2">Wall of Love</h2>
            <p className="text-rose-800/60 text-[10px] md:text-lg font-mystic tracking-widest uppercase">What our souls say about us</p>
          </div>
        </div>

        {/* Auto-scrolling Testimonials */}
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 md:gap-6 px-4 pb-8 no-scrollbar cursor-grab active:cursor-grabbing"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {scrollingReviews.map((testimonial, index) => (
            <div 
              key={`${testimonial.id}-${index}`}
              className="flex-shrink-0 w-[280px] md:w-[360px] bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-rose-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex gap-1 mb-3 md:mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < testimonial.rating ? "text-amber-400 text-xs md:text-sm" : "text-slate-200 text-xs md:text-sm"}>•</span>
                ))}
              </div>
              <p className="text-slate-600 text-sm md:text-base mb-4 md:mb-6 italic tracking-tight leading-relaxed line-clamp-4">"{testimonial.text}"</p>
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-bold text-xs md:text-sm uppercase">
                  {testimonial.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-rose-900 text-xs md:text-base">{testimonial.name}</h4>
                  <p className="text-[10px] md:text-xs text-slate-400 uppercase md:tracking-widest">{testimonial.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Product Detail Modal removed in favor of ProductDetails page */}
    </div >
  );
};
export default Home;