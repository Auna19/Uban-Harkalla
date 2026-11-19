import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const primaryImage =
    (product.images && product.images[0]) || product.image_url || '/1001102628.jpg';

  const defaultVariation =
    product.variations && product.variations.length > 0 ? product.variations[0] : null;

  const currentPrice = defaultVariation
    ? defaultVariation.discounted_price || defaultVariation.price
    : product.discounted_price || product.base_price;

  const originalPrice = defaultVariation
    ? defaultVariation.price
    : product.base_price;

  const hasDiscount = originalPrice > currentPrice;
  const isOutOfStock = product.stock_quantity <= 0;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      addToCart(product, defaultVariation, 1);
      alert(`Added "${product.name}" to cart!`);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">
      
      {/* Featured / Discount Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {product.is_featured && (
          <span className="px-2.5 py-1 text-[11px] font-bold bg-amber-500 text-white rounded-full shadow-xs tracking-wide uppercase">
            Featured
          </span>
        )}
        {hasDiscount && (
          <span className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 text-white rounded-full shadow-xs">
            Save ₦{(originalPrice - currentPrice).toLocaleString()}
          </span>
        )}
      </div>

      {/* Image Container with hover zoom */}
      <Link
        to={`/product/${product.slug}`}
        className="block relative aspect-4/3 sm:aspect-square bg-slate-50 overflow-hidden cursor-pointer"
      >
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <span className="px-3.5 py-2 rounded-xl bg-white/95 text-slate-900 text-xs font-semibold shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        
        {/* Brand & Category */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            {product.brand_name || 'Original'}
          </span>
          <span className="text-slate-400">
            {product.category_name}
          </span>
        </div>

        {/* Product Title */}
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-emerald-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Short Description */}
        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed flex-1">
          {product.short_description}
        </p>

        {/* Stock Status Indicator */}
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {isOutOfStock ? (
            <span className="text-red-500 font-medium">Out of Stock</span>
          ) : product.stock_quantity < 5 ? (
            <span className="text-amber-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              Only {product.stock_quantity} left in stock!
            </span>
          ) : (
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              In Stock & Ready to Ship
            </span>
          )}
        </div>

        {/* Price & Action Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-base sm:text-lg font-extrabold text-slate-950">
              ₦{currentPrice.toLocaleString()}
            </div>
            {hasDiscount && (
              <div className="text-xs text-slate-400 line-through -mt-0.5">
                ₦{originalPrice.toLocaleString()}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              to={`/product/${product.slug}`}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors flex items-center gap-1"
              title="View Specifications & Variations"
            >
              <Eye className="w-3.5 h-3.5 hidden sm:inline" />
              <span>Details</span>
            </Link>

            <button
              onClick={handleQuickAdd}
              disabled={isOutOfStock}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-md'
              }`}
              title="Add to Cart"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
