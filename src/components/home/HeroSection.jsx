import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  CheckCircle2,
  Search,
  Smartphone,
  Headphones,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import ScrollReveal from '../common/ScrollReveal';
import TiltCard from '../common/TiltCard';

const FLAGSHIP_SLIDES = [
  {
    image: '/1001102628.jpg',
    model: 'iPhone 15 Pro Max',
    tag: 'Apple iOS Flagship',
    slug: 'apple-iphone-15-pro-max',
  },
  {
    image: '/1001102629.jpg',
    model: 'Samsung Galaxy S24 Ultra',
    tag: 'Galaxy AI Flagship',
    slug: 'samsung-galaxy-s24-ultra-5g',
  },
  {
    image: '/1001102630.jpg',
    model: 'Apple iPhone 14 Pro',
    tag: 'Pro Camera Series',
    slug: 'apple-iphone-14-pro',
  },
  {
    image: '/1001102632.jpg',
    model: 'Google Pixel 8 Pro',
    tag: 'Google AI Flagship',
    slug: 'google-pixel-8-pro',
  },
  {
    image: '/1001102635.jpg',
    model: 'Apple AirPods Pro 2',
    tag: 'Certified Audio & Accessories',
    slug: 'apple-airpods-pro-2-usb-c',
  },
];

export default function HeroSection({ content }) {
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);

  const headline =
    content?.headline || 'Your Trusted Destination for Premium Smartphones and Gadgets.';
  const subtext =
    content?.subtext ||
    'Discover quality smartphones, essential gadgets, and accessories at competitive prices. Shop with confidence and enjoy a convenient shopping experience with UBAN HARKALLA.';

  // Automatic slide progression every 3.8 seconds
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % FLAGSHIP_SLIDES.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [isHovered]);

  const handlePrevSlide = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentSlide((prev) => (prev - 1 + FLAGSHIP_SLIDES.length) % FLAGSHIP_SLIDES.length);
  };

  const handleNextSlide = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentSlide((prev) => (prev + 1) % FLAGSHIP_SLIDES.length);
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 45) {
      // Swiped left -> next
      setCurrentSlide((prev) => (prev + 1) % FLAGSHIP_SLIDES.length);
    } else if (diff < -45) {
      // Swiped right -> prev
      setCurrentSlide((prev) => (prev - 1 + FLAGSHIP_SLIDES.length) % FLAGSHIP_SLIDES.length);
    }
    setTouchStartX(null);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/shop?search=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-16 sm:py-24 border-b border-slate-800/80">
      {/* Decorative ambient lighting spheres */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse-glow"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-amber-500/8 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-10 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">

            {/* Top Brand Tag with Subtle Glow */}
            <ScrollReveal direction="down" duration={500}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wider uppercase shadow-lg shadow-emerald-500/5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
                <span>OFFICIAL UBAN HARKALLA STORE • KANO, NIGERIA</span>
              </div>
            </ScrollReveal>

            {/* Main Headline */}
            <ScrollReveal direction="up" delay={100} duration={600}>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
                Your Trusted Destination for{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
                  Premium Smartphones
                </span>{' '}
                and Gadgets.
              </h1>
            </ScrollReveal>

            {/* Subtext */}
            <ScrollReveal direction="up" delay={200} duration={600}>
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                {subtext}
              </p>
            </ScrollReveal>

            {/* Prominent Landing Page Hero Search Bar */}
            <ScrollReveal direction="up" delay={280} duration={600}>
              <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto lg:mx-0 pt-2">
                <div className="relative flex items-center bg-slate-900/80 hover:bg-slate-900 focus-within:bg-slate-900 backdrop-blur-xl rounded-2xl p-2 border border-slate-700/80 focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-500/15 shadow-2xl transition-all">
                  <Search className="w-5 h-5 text-emerald-400 ml-3 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search iPhones, Samsung, gadgets, accessories..."
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    className="w-full bg-transparent text-white placeholder-slate-400 text-sm sm:text-base px-3 py-2.5 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1.5 active:scale-95"
                  >
                    <span>Search</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Popular Quick Filter Pills */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-3 text-xs text-slate-300">
                  <span className="text-slate-400 font-semibold">Popular:</span>
                  {['iPhone 15 Pro Max', 'Samsung S24 Ultra', 'AirPods Pro', '20W Charger'].map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => navigate(`/shop?search=${encodeURIComponent(term)}`)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-200 border border-white/10 hover:border-emerald-400/40 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </form>
            </ScrollReveal>

            {/* Action Buttons */}
            <ScrollReveal direction="up" delay={360} duration={600}>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/shop"
                  className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-2xl shadow-xl hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 group text-base active:scale-95"
                >
                  <span>Shop Catalogue</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </Link>

                <a
                  href="#about"
                  className="w-full sm:w-auto px-8 py-4 bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold rounded-2xl border border-slate-700 transition-colors flex items-center justify-center text-base"
                >
                  Learn About Us
                </a>
              </div>
            </ScrollReveal>

            {/* Quick Guarantees Grid */}
            <ScrollReveal direction="up" delay={420} duration={600}>
              <div className="pt-8 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-left">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-xs">
                  <p className="text-emerald-400 font-black text-lg sm:text-xl">FREE</p>
                  <p className="text-xs text-slate-400 mt-0.5">Delivery in Kano</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-xs">
                  <p className="text-emerald-400 font-black text-lg sm:text-xl">100%</p>
                  <p className="text-xs text-slate-400 mt-0.5">Genuine Guarantee</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-xs">
                  <p className="text-emerald-400 font-black text-lg sm:text-xl">2-Hour</p>
                  <p className="text-xs text-slate-400 mt-0.5">Physical Pickup</p>
                </div>
              </div>
            </ScrollReveal>

          </div>

          {/* Right Column: Visual Product Showcase with Tilt & Ambient Depth */}
          <div className="lg:col-span-5 relative">
            <ScrollReveal direction="zoom" delay={200} duration={700}>
              <div className="relative mx-auto max-w-md lg:max-w-none">

                {/* Ambient dynamic back-glow behind device card */}
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-amber-500/20 rounded-3xl blur-2xl opacity-75 animate-pulse-glow" />

                {/* Main 3D Tilt Showcase Card with Image Slider */}
                <TiltCard maxTilt={6} scale={1.01} className="rounded-3xl overflow-hidden border border-slate-700/80 bg-slate-900/90 shadow-2xl backdrop-blur-md group">
                  <div
                    className="relative overflow-hidden h-84 sm:h-96 select-none"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                  >
                    {/* Horizontal Slide Track */}
                    <div
                      className="flex h-full w-full transition-transform duration-700 ease-out will-change-transform"
                      style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                      {FLAGSHIP_SLIDES.map((slide, idx) => (
                        <div key={idx} className="relative w-full h-full shrink-0 overflow-hidden">
                          <img
                            src={slide.image}
                            alt={slide.model}
                            className={`w-full h-full object-cover object-center transition-transform duration-1000 ${currentSlide === idx ? 'scale-105' : 'scale-100'
                              }`}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>
                        </div>
                      ))}
                    </div>

                    {/* Manual Navigation Chevrons */}
                    <button
                      type="button"
                      onClick={handlePrevSlide}
                      aria-label="Previous flagship image"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-950/70 hover:bg-slate-900 border border-slate-700/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 sm:opacity-75 transition-all duration-200 z-20 backdrop-blur-md shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-200" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextSlide}
                      aria-label="Next flagship image"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-950/70 hover:bg-slate-900 border border-slate-700/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 sm:opacity-75 transition-all duration-200 z-20 backdrop-blur-md shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-200" />
                    </button>

                    {/* Slide Indicator Dots at top right */}
                    <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-slate-950/75 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-slate-700/60 shadow-md">
                      {FLAGSHIP_SLIDES.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentSlide(idx);
                          }}
                          aria-label={`Go to slide ${idx + 1}`}
                          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${currentSlide === idx
                            ? 'w-5 bg-emerald-400'
                            : 'w-1.5 bg-slate-600 hover:bg-slate-400'
                            }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Floating Overlay Card on Image */}
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-700/80 flex items-center justify-between shadow-xl z-20">
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          Flagship Selection
                        </span>
                        <span className="text-[10px] font-bold text-slate-300 bg-slate-800/90 border border-slate-700/70 px-2 py-0.5 rounded-md truncate max-w-[150px]">
                          {FLAGSHIP_SLIDES[currentSlide].model}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-white text-sm sm:text-base mt-0.5 truncate">
                        Apple iPhones & Androids
                      </h3>
                      <p className="text-xs text-slate-400">Brand New & Certified Pre-Owned</p>
                    </div>
                    <Link
                      to={`/shop?search=${encodeURIComponent(FLAGSHIP_SLIDES[currentSlide].model)}`}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors shrink-0 shadow-md active:scale-95"
                    >
                      Explore
                    </Link>
                  </div>
                </TiltCard>

                {/* Floating Top Badge */}
                <div className="absolute -top-5 -left-5 sm:-left-7 bg-slate-950/95 border border-slate-700/90 rounded-2xl p-3 shadow-2xl backdrop-blur-md flex items-center gap-3 animate-float">
                  <img
                    src="/Logo.jpg"
                    alt="UBAN HARKALLA Logo"
                    className="w-10 h-10 rounded-xl object-contain border border-slate-700"
                  />
                  <div>
                    <div className="flex items-center gap-1 text-emerald-400 font-extrabold text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified Genuine
                    </div>
                    <span className="text-[11px] text-slate-400">Official Direct Importer</span>
                  </div>
                </div>

                {/* Floating Second Thumbnail */}
                <div className="absolute -bottom-5 -right-4 sm:-right-6 bg-slate-950/95 border border-slate-700/90 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md flex items-center gap-3 max-w-[210px] animate-float" style={{ animationDelay: '2.5s' }}>
                  <img
                    src="/1001102636.jpg"
                    alt="Accessories"
                    className="w-11 h-11 rounded-xl object-cover border border-slate-700"
                  />
                  <div>
                    <p className="text-xs font-bold text-white">Original Tech</p>
                    <p className="text-[10px] font-semibold text-emerald-400">Accessories In Stock</p>
                  </div>
                </div>

              </div>
            </ScrollReveal>
          </div>

        </div>
      </div>
    </section>
  );
}
