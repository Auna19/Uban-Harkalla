import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Sparkles } from 'lucide-react';
import ProductCard from '../common/ProductCard';
import ScrollReveal from '../common/ScrollReveal';

export default function FeaturedProducts({ products, categories }) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const featured = products.filter((p) => p.is_featured);
  const displayList =
    selectedCategory === 'all'
      ? featured
      : featured.filter(
          (p) => p.category_id === selectedCategory || p.category_name?.toLowerCase() === selectedCategory.toLowerCase()
        );

  return (
    <section className="py-20 sm:py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 relative overflow-hidden">
      {/* Subtle background ambient mesh */}
      <div className="absolute top-10 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <ScrollReveal direction="up" duration={500}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider mb-3 shadow-2xs">
                <Flame className="w-3.5 h-3.5 fill-current text-amber-600 animate-pulse" />
                Customer Favorites
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
                Featured Products & Flagship Deals
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-2xl font-normal">
                Hand-picked flagship smartphones and premium accessories with verified warranty coverage.
              </p>
            </div>

            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-sm font-extrabold text-emerald-600 hover:text-emerald-700 hover:underline group shrink-0"
            >
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </ScrollReveal>

        {/* Category Pill Filters */}
        <ScrollReveal direction="up" delay={80} duration={500}>
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-slate-950 text-white shadow-md shadow-slate-950/20'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Featured ({featured.length})
            </button>
            {categories.map((cat) => {
              const count = featured.filter(p => p.category_id === cat.id || p.category_name?.toLowerCase() === cat.name?.toLowerCase()).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat.name} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Product Cards Grid with Cascade Animation */}
        {displayList.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <p className="text-slate-500 font-medium">No featured items in this category right now.</p>
            <Link
              to="/shop"
              className="mt-4 inline-block px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl"
            >
              Browse Full Catalogue
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayList.map((product, idx) => (
              <ScrollReveal
                key={product.id}
                direction="up"
                delay={idx * 70}
                duration={550}
              >
                <ProductCard product={product} />
              </ScrollReveal>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
