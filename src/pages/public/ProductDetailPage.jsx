import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductBySlug, getProducts } from '../../services/dataService';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/common/ProductCard';
import ScrollReveal from '../../components/common/ScrollReveal';
import TiltCard from '../../components/common/TiltCard';
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Share2,
  AlertCircle,
  Sparkles,
  Zap,
  Check,
  ChevronRight,
} from 'lucide-react';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected image
  const [activeImage, setActiveImage] = useState('');

  // Selected variation attributes state e.g. { storage: '256GB', color: 'Natural Titanium', condition: 'Brand New (Sealed)' }
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'specs'

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const found = await getProductBySlug(slug);
        if (found) {
          setProduct(found);
          const firstImg =
            (found.images && found.images[0]) || found.image_url || '/1001102628.jpg';
          setActiveImage(firstImg);

          // Initialize default attributes from first variation
          if (found.variations && found.variations.length > 0) {
            setSelectedAttributes(found.variations[0].attributes || {});
          }

          // Fetch related products in same category
          const allProds = await getProducts({ category: found.category_id, activeOnly: true });
          setRelatedProducts(allProds.filter((p) => p.id !== found.id).slice(0, 4));
        }
      } catch (err) {
        console.error('Error loading product:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  // Compute matched variation based on current selected attributes
  const matchedVariation = useMemo(() => {
    if (!product || !product.variations || product.variations.length === 0) {
      return null;
    }

    const matched = product.variations.find((v) => {
      if (!v.attributes) return false;
      return Object.entries(selectedAttributes).every(
        ([key, val]) => v.attributes[key] === val
      );
    });

    return matched || product.variations[0];
  }, [product, selectedAttributes]);

  // When matched variation changes, update image if variation has custom image
  useEffect(() => {
    if (matchedVariation && matchedVariation.image_url) {
      setActiveImage(matchedVariation.image_url);
    }
  }, [matchedVariation]);

  // Calculate pricing & stock based on matched variation
  const currentPrice = matchedVariation
    ? matchedVariation.discounted_price || matchedVariation.price
    : product?.discounted_price || product?.base_price || 0;

  const originalPrice = matchedVariation
    ? matchedVariation.price
    : product?.base_price || 0;

  const currentStock = matchedVariation
    ? matchedVariation.stock_quantity
    : product?.stock_quantity || 0;

  const isOutOfStock = currentStock <= 0;

  // Extract all unique attribute values available for this product
  const availableAttributeOptions = useMemo(() => {
    if (!product || !product.variations) return {};
    const map = {};
    product.variations.forEach((v) => {
      if (v.attributes) {
        Object.entries(v.attributes).forEach(([k, val]) => {
          if (!map[k]) map[k] = new Set();
          map[k].add(val);
        });
      }
    });

    const result = {};
    Object.keys(map).forEach((k) => {
      result[k] = Array.from(map[k]);
    });
    return result;
  }, [product]);

  const handleAttributeSelect = (attrKey, val) => {
    if (!product?.variations || product.variations.length === 0) {
      setSelectedAttributes((prev) => ({ ...prev, [attrKey]: val }));
      return;
    }

    const candidate = { ...selectedAttributes, [attrKey]: val };
    const exact = product.variations.find(
      (v) => v.attributes && Object.entries(candidate).every(([k, vVal]) => v.attributes[k] === vVal)
    );

    if (exact) {
      setSelectedAttributes(candidate);
    } else {
      const matching = product.variations.filter(
        (v) => v.attributes && v.attributes[attrKey] === val
      );
      if (matching.length > 0) {
        let best = matching[0];
        let maxMatches = -1;
        matching.forEach((v) => {
          let score = 0;
          Object.entries(selectedAttributes).forEach(([k, currentVal]) => {
            if (k !== attrKey && v.attributes[k] === currentVal) score++;
          });
          if (score > maxMatches) {
            maxMatches = score;
            best = v;
          }
        });
        setSelectedAttributes({ ...best.attributes });
      } else {
        setSelectedAttributes(candidate);
      }
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    try {
      addToCart(product, matchedVariation, quantity);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2500);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading Device Details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
          <p className="text-xs text-slate-500">The product you are looking for is unavailable or has been removed.</p>
          <Link
            to="/shop"
            className="inline-block px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow"
          >
            Return to Catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors group cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-2xs group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
            </div>
            <span>Back to previous page</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <Link to="/" className="hover:text-emerald-600">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link to="/shop" className="hover:text-emerald-600">Shop</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-800 line-clamp-1">{product.name}</span>
          </div>
        </div>

        {/* Product Details Main Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 mb-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            
            {/* Left: Image Gallery */}
            <div className="lg:col-span-6 space-y-4">
              <TiltCard maxTilt={5} glare={true} className="rounded-3xl shadow-sm">
                <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-b from-slate-100/60 to-slate-50 border border-slate-200/80 group">
                  <img
                    src={activeImage}
                    alt={product.name}
                    className="w-full h-full object-contain p-6 transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  {product.is_featured && (
                    <span className="absolute top-4 left-4 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[11px] font-black uppercase tracking-wider rounded-full shadow-md flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 fill-white" />
                      Featured Item
                    </span>
                  )}
                  {originalPrice > currentPrice && (
                    <span className="absolute top-4 right-4 px-3.5 py-1.5 bg-rose-600 text-white text-[11px] font-black uppercase tracking-wider rounded-full shadow-md">
                      Save ₦{(originalPrice - currentPrice).toLocaleString()}
                    </span>
                  )}
                </div>
              </TiltCard>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-18 h-18 rounded-2xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer p-1 bg-white ${
                        activeImage === img
                          ? 'border-emerald-600 shadow-md ring-2 ring-emerald-500/20 scale-105'
                          : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain rounded-xl" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info, Dynamic Variations & Checkout Action */}
            <div className="lg:col-span-6 space-y-6">
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-black uppercase tracking-wider border border-emerald-200/60">
                    {product.brand_name}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    {product.category_name}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight leading-tight">
                  {product.name}
                </h1>
                {matchedVariation?.sku && (
                  <p className="text-xs text-slate-400 font-mono mt-1.5 flex items-center gap-2">
                    <span>SKU: {matchedVariation.sku}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">100% Genuine Certified</span>
                  </p>
                )}
              </div>

              {/* Pricing Display */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 via-emerald-50/20 to-slate-50 border border-slate-200/80 flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                  ₦{currentPrice.toLocaleString()}
                </span>
                {originalPrice > currentPrice && (
                  <>
                    <span className="text-base text-slate-400 line-through font-semibold">
                      ₦{originalPrice.toLocaleString()}
                    </span>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      Save ₦{(originalPrice - currentPrice).toLocaleString()}
                    </span>
                  </>
                )}
              </div>

              {/* Short Description */}
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                {product.short_description}
              </p>

              {/* Dynamic Variation Pickers (Storage, Color, Condition, etc.) */}
              {Object.keys(availableAttributeOptions).length > 0 && (
                <div className="space-y-4 pt-3 border-t border-slate-100">
                  {Object.entries(availableAttributeOptions).map(([attrKey, values]) => {
                    const currentSelected = selectedAttributes[attrKey];
                    return (
                      <div key={attrKey}>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-extrabold text-slate-700 uppercase tracking-wider">
                            {attrKey}:
                          </span>
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                            {currentSelected}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                          {values.map((v) => {
                            const isSelected = currentSelected === v;
                            return (
                              <button
                                key={v}
                                onClick={() => handleAttributeSelect(attrKey, v)}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                                  isSelected
                                    ? 'bg-slate-950 text-white border-slate-950 shadow-md ring-2 ring-slate-900/10'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                }`}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                                <span>{v}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Stock Status Bar */}
              <div className="text-xs font-bold">
                {isOutOfStock ? (
                  <span className="text-rose-600 flex items-center gap-2 bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-xl">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span>
                    Currently Out of Stock for this configuration. Choose another variant.
                  </span>
                ) : currentStock < 5 ? (
                  <span className="text-amber-800 flex items-center gap-2 bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                    Hurry! Only {currentStock} units left in stock at our Kano hub.
                  </span>
                ) : (
                  <span className="text-emerald-800 flex items-center gap-2 bg-emerald-50/80 border border-emerald-200 px-3.5 py-2 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>In Stock ({currentStock} units available) • Verified & Ready for Fast Dispatch</span>
                  </span>
                )}
              </div>

              {/* Quantity Selector and Add to Cart Button */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-4">
                
                {/* Quantity */}
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1 w-full sm:w-auto justify-between">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="w-10 h-10 rounded-lg bg-white text-slate-700 font-extrabold hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center text-sm shadow-xs transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-5 text-sm font-extrabold text-slate-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                    disabled={quantity >= currentStock || isOutOfStock}
                    className="w-10 h-10 rounded-lg bg-white text-slate-700 font-extrabold hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center text-sm shadow-xs transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart CTA */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 w-full py-4 rounded-xl font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99] ${
                    isOutOfStock
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      : addedSuccess
                      ? 'bg-emerald-700 text-white shadow-emerald-700/30'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 hover:shadow-xl'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>
                    {addedSuccess ? '✓ Added to Cart!' : isOutOfStock ? 'Out of Stock' : 'Add to Shopping Cart'}
                  </span>
                </button>
              </div>

              {/* Guarantees Box */}
              <div className="pt-2 grid grid-cols-2 gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">Free Kano Delivery (₦0)</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">2-Hour Store Pickup</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">Warranty Protected</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">Tested Battery & Hardware</span>
                </div>
              </div>

            </div>

          </div>

          {/* Full Specifications & Long Description Tabs */}
          <div className="mt-16 pt-10 border-t border-slate-200">
            {/* Tabs Selector */}
            <div className="flex items-center gap-4 border-b border-slate-200 pb-4 mb-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`text-sm sm:text-base font-black transition-all cursor-pointer pb-1 relative ${
                  activeTab === 'overview'
                    ? 'text-emerald-700'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Product Overview & Features
                {activeTab === 'overview' && (
                  <span className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`text-sm sm:text-base font-black transition-all cursor-pointer pb-1 relative ${
                  activeTab === 'specs'
                    ? 'text-emerald-700'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Detailed Specifications ({product.specifications?.length || 0})
                {activeTab === 'specs' && (
                  <span className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
                )}
              </button>
            </div>

            {activeTab === 'overview' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-4">
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line font-normal">
                    {product.description || product.short_description}
                  </p>
                </div>
                <div className="lg:col-span-4 p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Why Buy from UBAN HARKALLA?</h4>
                  <ul className="text-xs text-slate-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>100% Genuine, tested devices direct from verified distributors</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Physical inspection before payment available at our store</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Transparent warranty coverage & after-sales support</span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="max-w-3xl">
                {product.specifications && product.specifications.length > 0 ? (
                  <div className="rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-xs sm:text-sm">
                    {product.specifications.map((spec, i) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-slate-50/50 hover:bg-emerald-50/20 transition-colors">
                        <span className="font-bold text-slate-600">{spec.key}</span>
                        <span className="font-black text-slate-950 text-right">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Detailed specifications available upon request via WhatsApp.</p>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <ScrollReveal direction="up">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-950 tracking-tight">
                    Related Products in this Category
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Explore other certified smartphones and accessories</p>
                </div>
                <Link
                  to={`/shop?category=${product.category_id}`}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <span>View All</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((rel) => (
                  <ProductCard key={rel.id} product={rel} />
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

      </div>

      {/* Sticky Mobile Add to Cart Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 px-4 z-40 flex items-center justify-between gap-3 shadow-lg">
        <div>
          <span className="text-xs text-slate-400 line-clamp-1">{product.name}</span>
          <span className="text-lg font-black text-slate-950">₦{currentPrice.toLocaleString()}</span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md ${
            isOutOfStock
              ? 'bg-slate-200 text-slate-400'
              : addedSuccess
              ? 'bg-emerald-700 text-white'
              : 'bg-emerald-600 text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{addedSuccess ? 'Added!' : isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
        </button>
      </div>

    </div>
  );
}
