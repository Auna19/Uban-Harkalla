import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductBySlug, getProducts } from '../../services/dataService';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/common/ProductCard';
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
    setSelectedAttributes((prev) => ({
      ...prev,
      [attrKey]: val,
    }));
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
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
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to previous page
          </button>
        </div>

        {/* Product Details Main Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-10 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            
            {/* Left: Image Gallery */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative aspect-square sm:aspect-4/3 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200">
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                />
                {product.is_featured && (
                  <span className="absolute top-4 left-4 px-3 py-1 bg-amber-500 text-white text-xs font-bold uppercase rounded-full shadow">
                    Featured Item
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        activeImage === img ? 'border-emerald-600 shadow-md scale-105' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info, Dynamic Variations & Checkout Action */}
            <div className="lg:col-span-6 space-y-6">
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold uppercase">
                    {product.brand_name}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {product.category_name}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                  {product.name}
                </h1>
                {matchedVariation?.sku && (
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    SKU: {matchedVariation.sku}
                  </p>
                )}
              </div>

              {/* Pricing Display */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-baseline gap-3">
                <span className="text-3xl font-black text-slate-950">
                  ₦{currentPrice.toLocaleString()}
                </span>
                {originalPrice > currentPrice && (
                  <>
                    <span className="text-sm text-slate-400 line-through">
                      ₦{originalPrice.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Save ₦{(originalPrice - currentPrice).toLocaleString()}
                    </span>
                  </>
                )}
              </div>

              {/* Short Description */}
              <p className="text-sm text-slate-600 leading-relaxed">
                {product.short_description}
              </p>

              {/* Dynamic Variation Pickers (Storage, Color, Condition, etc.) */}
              {Object.keys(availableAttributeOptions).length > 0 && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  {Object.entries(availableAttributeOptions).map(([attrKey, values]) => {
                    const currentSelected = selectedAttributes[attrKey];
                    return (
                      <div key={attrKey}>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-bold text-slate-700 uppercase tracking-wider">
                            Select {attrKey}:
                          </span>
                          <span className="font-semibold text-emerald-600">{currentSelected}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {values.map((v) => {
                            const isSelected = currentSelected === v;
                            return (
                              <button
                                key={v}
                                onClick={() => handleAttributeSelect(attrKey, v)}
                                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                                  isSelected
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                {v}
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
              <div className="text-xs font-semibold">
                {isOutOfStock ? (
                  <span className="text-red-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-600"></span>
                    Currently Out of Stock for this configuration.
                  </span>
                ) : currentStock < 5 ? (
                  <span className="text-amber-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    Hurry! Only {currentStock} units left in stock.
                  </span>
                ) : (
                  <span className="text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    In Stock ({currentStock} units available) • Ready to dispatch
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
                    className="w-9 h-9 rounded-lg bg-white text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-50 flex items-center justify-center text-sm shadow-xs"
                  >
                    -
                  </button>
                  <span className="px-4 text-sm font-bold text-slate-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                    disabled={quantity >= currentStock || isOutOfStock}
                    className="w-9 h-9 rounded-lg bg-white text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-50 flex items-center justify-center text-sm shadow-xs"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart CTA */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 w-full py-4 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
                    isOutOfStock
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : addedSuccess
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-emerald-500/25'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>
                    {addedSuccess ? '✓ Added to Cart!' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                  </span>
                </button>
              </div>

              {/* Guarantees Box */}
              <div className="pt-4 grid grid-cols-2 gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Free Kano Delivery</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>2-Hour Store Pickup</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Authenticity Guarantee</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Tested Battery Health</span>
                </div>
              </div>

            </div>

          </div>

          {/* Full Specifications & Long Description */}
          <div className="mt-16 pt-12 border-t border-slate-200">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              <div className="lg:col-span-7 space-y-4">
                <h3 className="text-xl font-bold text-slate-900">Product Overview</h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {product.description || product.short_description}
                </p>
              </div>

              {/* Technical Specifications Table */}
              <div className="lg:col-span-5">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Specifications</h3>
                {product.specifications && product.specifications.length > 0 ? (
                  <div className="rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-xs">
                    {product.specifications.map((spec, i) => (
                      <div key={i} className="flex justify-between p-3.5 bg-slate-50/50">
                        <span className="font-semibold text-slate-500">{spec.key}</span>
                        <span className="font-bold text-slate-900 text-right">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Detailed specs available upon request.</p>
                )}
              </div>

            </div>
          </div>

        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              Related Products in this Category
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
