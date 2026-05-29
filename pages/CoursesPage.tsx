import React, { useState, useEffect, useRef } from 'react';
import { CourseEbook } from '../types';
import { subscribeToCoursesEbooks } from '../services/databaseService';

const CoursesPage: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isHoldingRef = useRef(false);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartYRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [items, setItems] = useState<CourseEbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'course' | 'ebook'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isPaused, setIsPaused] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToCoursesEbooks((data) => {
      setItems(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleDownload = async (item: CourseEbook) => {
    if (!item.pdfUrl) return;
    
    setDownloadingId(item.id);
    try {
      // For direct download, use fetch + blob approach
      const response = await fetch(item.pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      window.open(item.pdfUrl, '_blank');
    } finally {
      setDownloadingId(null);
    }
  };

  const categories = ['all', ...Array.from(new Set(items.map(i => i.category).filter(Boolean)))];
  const filtered = items.filter(item => {
    const typeMatch = filter === 'all' || item.type === filter;
    const catMatch = categoryFilter === 'all' || item.category === categoryFilter;
    return typeMatch && catMatch;
  });

  const featured = items.filter(i => i.isFeatured);
  const scrollingItems = filtered; // No duplication - scroll modulo handles looping

  const scheduleResume = (delay = 900) => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      if (!isHoldingRef.current && !isDraggingRef.current) {
        setIsPaused(false);
      }
    }, delay);
  };

  const handlePointerStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const container = scrollRef.current;
    if (!container) return;

    isHoldingRef.current = true;
    isDraggingRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartYRef.current = e.clientY;
    dragStartScrollRef.current = container.scrollLeft;
    setIsPaused(true);
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    if (e.pointerType === 'mouse') {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isHoldingRef.current) return;
    const container = scrollRef.current;
    if (!container) return;

    const deltaX = e.clientX - dragStartXRef.current;
    const deltaY = e.clientY - dragStartYRef.current;

    if (!isDraggingRef.current) {
      if (Math.abs(deltaX) < 6 && Math.abs(deltaY) < 6) return;

      // Vertical intent should scroll the page, not drag the carousel.
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        handlePointerEnd(e);
        return;
      }

      isDraggingRef.current = true;
    }

    e.preventDefault();
    container.scrollLeft = dragStartScrollRef.current - deltaX;
  };

  const handlePointerEnd = (e?: React.PointerEvent<HTMLDivElement>) => {
    if (e && e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    isHoldingRef.current = false;
    isDraggingRef.current = false;
    scheduleResume(700);
  };

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || filtered.length <= 1) return;

    let animationId: number;
    let lastTime = 0;
    let lastScrollLeft = 0;
    let manualScrollTimeout: NodeJS.Timeout | null = null;
    const speedPxPerSecond = 30;

    const halfWidth = () => scrollContainer.scrollWidth / 2;
    let scrollPos = 0;
    scrollContainer.scrollLeft = scrollPos;

    const resumeAutoScroll = () => {
      setIsPaused(false);
      if (manualScrollTimeout) clearTimeout(manualScrollTimeout);
    };

    const handleScroll = () => {
      const currentScroll = scrollContainer.scrollLeft;
      if (Math.abs(currentScroll - lastScrollLeft) > 2) {
        setIsPaused(true);
        scrollPos = currentScroll;
        if (manualScrollTimeout) clearTimeout(manualScrollTimeout);
        manualScrollTimeout = setTimeout(resumeAutoScroll, 3000);
      }
      lastScrollLeft = currentScroll;
    };

    scrollContainer.addEventListener('scroll', handleScroll);

    const animateScroll = (time: number) => {
      if (!lastTime) lastTime = time;
      const deltaSeconds = (time - lastTime) / 1000;
      lastTime = time;

      if (!isPaused) {
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

      animationId = requestAnimationFrame(animateScroll);
    };

    animationId = requestAnimationFrame(animateScroll);

    return () => {
      cancelAnimationFrame(animationId);
      scrollContainer.removeEventListener('scroll', handleScroll);
      if (manualScrollTimeout) clearTimeout(manualScrollTimeout);
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, [isPaused, filtered]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-purple-50 to-white">
      {/* Hero Banner */}
      <div
        className="relative py-24 px-4 text-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #4a1942 0%, #7c3aed 50%, #be185d 100%)'
        }}
      >
        {/* Decorative circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-purple-400/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-rose-400/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-400/10 blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white/80 text-sm mb-4">
            Spiritual Knowledge Library
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Courses &amp; eBooks
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            Deepen your spiritual journey with guided courses and healing wisdom — available to download anytime.
          </p>

          {/* Stats */}
          <div className="mt-8 flex justify-center gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{items.filter(i => i.type === 'course').length}</div>
              <div className="text-white/60 text-sm">Courses</div>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{items.filter(i => i.type === 'ebook').length}</div>
              <div className="text-white/60 text-sm">eBooks</div>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{items.filter(i => i.price === 0).length}</div>
              <div className="text-white/60 text-sm">Free</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Featured Section */}
        {featured.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-rose-900 mb-6 flex items-center gap-2">
              <span className="inline-block w-1 h-6 bg-rose-500 rounded-full mr-1"></span> Featured
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featured.map(item => (
                <FeaturedCard 
                  key={item.id} 
                  item={item}
                  onDownload={handleDownload}
                  isDownloading={downloadingId === item.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-3 items-center">
          <div className="flex bg-white border border-rose-200 rounded-xl p-1 gap-1 shadow-sm">
            {(['all', 'course', 'ebook'] as const).map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                  filter === t
                    ? 'bg-gradient-to-r from-purple-600 to-rose-600 text-white shadow'
                    : 'text-slate-500 hover:text-rose-600'
                }`}
              >
                {t === 'all' ? 'All' : t === 'course' ? 'Courses' : 'eBooks'}
              </button>
            ))}
          </div>

          {categories.length > 1 && (
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="border border-rose-200 rounded-xl px-4 py-2 text-sm text-slate-600 bg-white shadow-sm focus:outline-none focus:border-rose-500"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
              ))}
            </select>
          )}

          <span className="text-sm text-slate-400 ml-auto">{filtered.length} item{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(n => (
              <div key={n} className="bg-white rounded-2xl h-64 animate-pulse border border-rose-100" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            <p className="text-xl font-medium text-slate-500">Coming Soon</p>
            <p className="text-sm mt-2">Our spiritual knowledge library is being curated. Check back soon!</p>
          </div>
        )}

        {/* Moving Wall */}
        {!loading && filtered.length > 0 && (
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-5 md:gap-6 pb-2 no-scrollbar cursor-grab active:cursor-grabbing"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onPointerDown={handlePointerStart}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onPointerLeave={handlePointerEnd}
            style={{ touchAction: 'pan-y' }}
          >
            {scrollingItems.map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex-shrink-0 w-[200px] md:w-[240px]">
                <ItemCard 
                  item={item} 
                  onDownload={handleDownload}
                  isDownloading={downloadingId === item.id}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ---- Item Card ----
const ItemCard: React.FC<{ 
  item: CourseEbook;
  onDownload: (item: CourseEbook) => void;
  isDownloading: boolean;
}> = ({ item, onDownload, isDownloading }) => {
  const isEbook = item.type === 'ebook';

  return (
    <div className="bg-white rounded-2xl border border-rose-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden group flex flex-col">
      {/* Cover Image */}
      <div className="relative h-32 overflow-hidden bg-gradient-to-br from-purple-100 to-rose-100 flex items-center justify-center">
        {item.coverImage ? (
          <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-200 to-rose-200 flex items-center justify-center">
            <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={isEbook ? "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" : "M15 10l4.553-2.069A1 1 0 0121 8.868V15.13a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"} /></svg>
          </div>
        )}
        {/* Type badge */}
        <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow ${isEbook ? 'bg-indigo-500' : 'bg-emerald-500'}`}>
          {isEbook ? 'eBook' : 'Course'}
        </span>
        {/* Price badge */}
        <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow ${item.price === 0 ? 'bg-rose-500' : 'bg-amber-500'}`}>
          {item.price === 0 ? 'FREE' : `₹${item.price}`}
        </span>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <div className="text-xs text-purple-500 font-semibold uppercase tracking-wider mb-1">{item.category}</div>
        <h3 className="text-slate-800 font-bold text-sm leading-snug mb-2 line-clamp-2">{item.title}</h3>
        <p className="text-slate-500 text-xs line-clamp-2 flex-1">{item.description}</p>

        {/* Meta info */}
        <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
          <span>{item.author}</span>
          {item.pages && <span>· {item.pages} pg</span>}
        </div>

        {/* Action */}
        <button
          onClick={() => onDownload(item)}
          disabled={isDownloading}
          className="mt-3 flex items-center justify-center gap-2 w-full py-2 rounded-lg font-semibold text-xs transition-all bg-gradient-to-r from-purple-600 to-rose-600 text-white hover:opacity-90 hover:shadow-lg disabled:opacity-50"
        >
          {isDownloading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {item.price === 0 ? 'Download' : `₹${item.price}`}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ---- Featured Card (wider) ----
const FeaturedCard: React.FC<{ 
  item: CourseEbook;
  onDownload: (item: CourseEbook) => void;
  isDownloading: boolean;
}> = ({ item, onDownload, isDownloading }) => {
  const isEbook = item.type === 'ebook';
  return (
    <div className="bg-gradient-to-br from-purple-900 to-rose-800 rounded-2xl overflow-hidden flex gap-0 shadow-xl hover:shadow-2xl transition-all group">
      <div className="w-40 flex-shrink-0 relative overflow-hidden">
        {item.coverImage ? (
          <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-800 to-rose-700">
            <svg className="w-12 h-12 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d={isEbook ? "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" : "M15 10l4.553-2.069A1 1 0 0121 8.868V15.13a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"} /></svg>
          </div>
        )}
      </div>
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${isEbook ? 'bg-indigo-500' : 'bg-emerald-500'}`}>
              {isEbook ? 'eBook' : 'Course'}
            </span>
            <span className="text-yellow-300 text-xs font-bold tracking-widest">FEATURED</span>
          </div>
          <h3 className="text-white font-bold text-xl mb-2">{item.title}</h3>
          <p className="text-white/60 text-sm line-clamp-2">{item.description}</p>
        </div>
        <button
          onClick={() => onDownload(item)}
          disabled={isDownloading}
          className="mt-4 inline-flex items-center gap-2 bg-white text-purple-900 font-bold text-sm px-4 py-2 rounded-xl hover:bg-rose-50 transition-colors w-fit disabled:opacity-50"
        >
          {isDownloading ? (
            <>
              <div className="w-4 h-4 border-2 border-purple-400/40 border-t-purple-600 rounded-full animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {item.price === 0 ? 'Download Free' : `Get for ₹${item.price}`}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CoursesPage;
