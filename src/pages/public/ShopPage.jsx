import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getCategories, getBrands } from '../../services/dataService';
import ProductCard from '../../components/common/ProductCard';
import { Search, Filter, SlidersHorizontal, X, ArrowUpDown, Tag, Sparkles } from 'lucide-react';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter states
  const searchParam = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || 'all';

  const [searchTerm, setSearchTerm] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedOS, setSelectedOS] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 2500000 });
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  // Sync url param updates
  useEffect(() => {
    if (searchParams.get('search') !== null) {
      setSearchTerm(searchParams.get('search'));
    }
    if (searchParams.get('category') !== null) {
      setSelectedCategory(searchParams.get('category'));
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadShopData() {
      try {
        const [prodList, catList, brandList] = await Promise.all([
          getProducts({ activeOnly: true }),
          getCategories(),
          getBrands(),
        ]);
        setProducts(prodList);
        setCategories(catList);
        setBrands(brandList);
      } catch (err) {
        console.error('Error loading shop catalog:', err);
      } finally {
        setLoading(false);
      }
    }
    loadShopData();

    const handleDataChanged = () => {
      loadShopData();
    };

    window.addEventListener('ubh-data-changed', handleDataChanged);
    window.addEventListener('storage', handleDataChanged);
    window.addEventListener('focus', handleDataChanged);

    return () => {
      window.removeEventListener('ubh-data-changed', handleDataChanged);
      window.removeEventListener('storage', handleDataChanged);
      window.removeEventListener('focus', handleDataChanged);
    };
  }, []);

  const matchCategory = (p, catIdentifier) => {
    if (!catIdentifier || catIdentifier === 'all') return true;
    const catObj = categories.find((c) => c.id === catIdentifier || c.slug === catIdentifier);

    if (p.category_id && p.category_id === catIdentifier) return true;
    if (catObj?.slug && p.category_id === catObj.slug) return true;

    const catName = (catObj?.name || catIdentifier).toLowerCase();
    const catSlug = (catObj?.slug || catIdentifier).toLowerCase();
    const pCatName = (p.category_name || '').toLowerCase();
    const pSlug = (p.slug || '').toLowerCase();
    const pBrand = (p.brand_name || '').toLowerCase();

    if (catSlug.includes('iphone') || catName.includes('iphone') || catIdentifier === 'cat-1') {
      return (p.category_id === 'cat-1' || pCatName.includes('iphone') || pSlug.includes('iphone') || p.name.toLowerCase().includes('iphone')) && !pSlug.includes('airpods');
    }
    if (catSlug.includes('android') || catName.includes('android') || catIdentifier === 'cat-2') {
      return (p.category_id === 'cat-2' || pCatName.includes('android') || pBrand === 'samsung' || pBrand === 'google' || pBrand === 'xiaomi') && !pSlug.includes('iphone') && pBrand !== 'apple';
    }
    if (catSlug.includes('gadget') || catName.includes('gadget') || catIdentifier === 'cat-3') {
      return p.category_id === 'cat-3' || pCatName.includes('gadget') || pSlug.includes('airpods') || pSlug.includes('audio') || pSlug.includes('freepods');
    }
    if (catSlug.includes('accessor') || catName.includes('accessor') || catIdentifier === 'cat-4') {
      return p.category_id === 'cat-4' || pCatName.includes('accessor') || pSlug.includes('charger') || pSlug.includes('powerbank') || pSlug.includes('adapter');
    }

    if (catName && pCatName === catName) return true;
    if (catSlug && pSlug.includes(catSlug)) return true;
    return false;
  };

  // Filter and sort computation
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search term (intelligent tokenized word matching)
    if (searchTerm.trim()) {
      const tokens = searchTerm.toLowerCase().trim().split(/\s+/).filter(Boolean);
      result = result.filter((p) => {
        const searchable = `${p.name} ${p.brand_name || ''} ${p.category_name || ''} ${p.short_description || ''} ${p.slug || ''}`.toLowerCase();
        return tokens.every((token) => searchable.includes(token));
      });
    }

    // Category
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter((p) => matchCategory(p, selectedCategory));
    }

    // Brand
    if (selectedBrand !== 'all') {
      result = result.filter(
        (p) => p.brand_id === selectedBrand || p.brand_name?.toLowerCase() === selectedBrand.toLowerCase()
      );
    }

    // OS
    if (selectedOS !== 'all') {
      result = result.filter((p) => p.os?.toLowerCase() === selectedOS.toLowerCase());
    }

    // Condition
    if (selectedCondition !== 'all') {
      result = result.filter((p) =>
        p.variations?.some((v) =>
          v.attributes?.condition?.toLowerCase().includes(selectedCondition.toLowerCase())
        )
      );
    }

    // Price range
    result = result.filter((p) => {
      const price = p.discounted_price || p.base_price;
      return price >= priceRange.min && price <= priceRange.max;
    });

    // In stock
    if (inStockOnly) {
      result = result.filter((p) => (p.stock_quantity || 0) > 0);
    }

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => (a.discounted_price || a.base_price) - (b.discounted_price || b.base_price));
        break;
      case 'price-desc':
        result.sort((a, b) => (b.discounted_price || b.base_price) - (a.discounted_price || a.base_price));
        break;
      case 'featured':
        result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
      case 'newest':
      default:
        // Already ordered
        break;
    }

    return result;
  }, [
    products,
    searchTerm,
    selectedCategory,
    selectedBrand,
    selectedOS,
    selectedCondition,
    priceRange,
    inStockOnly,
    sortBy,
  ]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSelectedOS('all');
    setSelectedCondition('all');
    setPriceRange({ min: 0, max: 2500000 });
    setInStockOnly(false);
    setSortBy('newest');
    setSearchParams({});
  };

  const activeFiltersCount = [
    selectedCategory !== 'all',
    selectedBrand !== 'all',
    selectedOS !== 'all',
    selectedCondition !== 'all',
    inStockOnly,
    priceRange.min > 0 || priceRange.max < 2500000,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <span>Home</span>
            <span>/</span>
            <span className="text-emerald-600 font-semibold">Shop Catalogue</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Explore All Smartphones & Gadgets
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Genuine devices verified with warranty coverage and instant delivery options.
          </p>
        </div>

        {/* Filter Controls Bar (Search, Category Pills, Sort, Mobile Filter Trigger) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative w-full md:max-w-md">
            <input
              type="text"
              placeholder="Search by name, model, brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 text-sm rounded-xl pl-10 pr-4 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort & Mobile Filter Toggle */}
          <div className="flex items-center justify-between w-full md:w-auto gap-3">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="md:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold"
            >
              <Filter className="w-4 h-4 text-emerald-600" />
              <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
            </button>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="featured">Featured First</option>
              </select>
            </div>
          </div>

        </div>

        {/* Main Grid: Sidebar Filters + Products */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                  Filter Products
                </span>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="text-xs font-bold text-emerald-600 hover:underline"
                  >
                    Reset All
                  </button>
                )}
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Categories</h4>
                <div className="space-y-1.5 text-xs font-medium">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-emerald-50 text-emerald-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    All Categories ({products.length})
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl transition-colors ${
                        selectedCategory === c.id
                          ? 'bg-emerald-50 text-emerald-700 font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Operating System */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Operating System</h4>
                <div className="space-y-1.5 text-xs font-medium">
                  {['all', 'iOS', 'Android'].map((os) => (
                    <button
                      key={os}
                      onClick={() => setSelectedOS(os)}
                      className={`w-full text-left px-3 py-2 rounded-xl transition-colors ${
                        selectedOS === os
                          ? 'bg-emerald-50 text-emerald-700 font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {os === 'all' ? 'All Operating Systems' : os}
                    </button>
                  ))}
                </div>
              </div>

              {/* Device Condition */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Condition</h4>
                <div className="space-y-1.5 text-xs font-medium">
                  {[
                    { key: 'all', label: 'All Conditions' },
                    { key: 'Brand New', label: 'Brand New (Sealed)' },
                    { key: 'UK Used', label: 'UK Used (Pristine Grade A+)' },
                  ].map((cond) => (
                    <button
                      key={cond.key}
                      onClick={() => setSelectedCondition(cond.key)}
                      className={`w-full text-left px-3 py-2 rounded-xl transition-colors ${
                        selectedCondition === cond.key
                          ? 'bg-emerald-50 text-emerald-700 font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {cond.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Brand</h4>
                <div className="grid grid-cols-2 gap-1.5 text-xs font-medium">
                  <button
                    onClick={() => setSelectedBrand('all')}
                    className={`px-3 py-2 rounded-xl text-center transition-colors ${
                      selectedBrand === 'all'
                        ? 'bg-emerald-50 text-emerald-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    All Brands
                  </button>
                  {brands.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBrand(b.id)}
                      className={`px-3 py-2 rounded-xl text-center transition-colors ${
                        selectedBrand === b.id
                          ? 'bg-emerald-50 text-emerald-700 font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className="text-slate-400 uppercase tracking-wider">Max Price</span>
                  <span className="text-emerald-700">₦{priceRange.max.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="20000"
                  max="2500000"
                  step="20000"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* In Stock Only Checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>

            </div>
          </aside>

          {/* Product Cards Grid Column */}
          <main className="lg:col-span-3">
            
            {/* Active Result Count Bar */}
            <div className="flex items-center justify-between text-xs text-slate-500 mb-4 px-1">
              <span>Showing <strong>{filteredProducts.length}</strong> products</span>
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-emerald-600 font-semibold hover:underline"
                >
                  Clear active filters
                </button>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div key={idx} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 animate-pulse">
                    <div className="bg-slate-200 aspect-square rounded-2xl w-full"></div>
                    <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                    <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">No matching products found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  We could not find any devices matching your exact search or filter options. Try adjusting your price range or clearing filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>

        </div>

      </div>

      {/* Mobile Filters Drawer Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xs bg-white h-full p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Filters</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Category</h4>
              <div className="space-y-1">
                <button
                  onClick={() => { setSelectedCategory('all'); setMobileFilterOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs ${selectedCategory === 'all' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600'}`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedCategory(c.id); setMobileFilterOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs ${selectedCategory === c.id ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600'}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Operating System */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">OS</h4>
              <div className="space-y-1">
                {['all', 'iOS', 'Android'].map((os) => (
                  <button
                    key={os}
                    onClick={() => { setSelectedOS(os); setMobileFilterOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs ${selectedOS === os ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600'}`}
                  >
                    {os === 'all' ? 'All' : os}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex gap-2">
              <button
                onClick={resetFilters}
                className="w-1/2 py-2.5 text-xs font-bold border border-slate-200 rounded-xl"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-1/2 py-2.5 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
