import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, CheckCircle2, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import TiltCard from './TiltCard';
import QuickViewModal from './QuickViewModal';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

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
  const isOutOfStock = (product.stock_quantity || 0) <= 0;

  // Extract color dots if variations exist
  const colorOptions = React.useMemo(() => {
    if (!product.variations) return [];
    const colors = new Set();
    product.variations.forEach((v) => {
      if (v.attributes?.color) colors.add(v.attributes.color);
    });
    return Array.from(colors).slice(0, 4);
  }, [product.variations]);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    try {
      addToCart(product, defaultVariation, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1800);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOpenQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  return (
    <>
      <TiltCard
        maxTilt={5}
        scale={1.015}
        className="group bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300 flex flex-col overflow-hidden relative"
      >
        {/* Badges Overlay */}
        <div className="absolute top-3.5 left-3.5 z-10 flex flex-col gap-1.5 items-start pointer-events-none">
          {product.is_featured && (
            <span className="px-2.5 py-1 text-[10px] font-black bg-slate-900/90 backdrop-blur-md text-amber-300 rounded-full shadow-sm tracking-wider uppercase border border-amber-400/30 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-300" />
              Featured
            </span>
          )}
          {hasDiscount && (
            <span className="px-2.5 py-1 text-[10px] font-extrabold bg-emerald-600/95 backdrop-blur-md text-white rounded-full shadow-sm">
              Save ₦{(originalPrice - currentPrice).toLocaleString()}
            </span>
          )}
        </div>

        {/* Image Showcase Container with Ken Burns preview on hover */}
        <div className="relative aspect-4/3 sm:aspect-square bg-gradient-to-b from-slate-50 to-slate-100/60 overflow-hidden cursor-pointer flex items-center justify-center p-4">
          <Link to={`/product/${product.slug}`} className="w-full h-full flex items-center justify-center">
            <img
              src={primaryImage}
              alt={product.name}
              className="max-h-full max-w-full object-contain group-hover:scale-108 transition-transform duration-500 drop-shadow-md"
              loading="lazy"
            />
          </Link>

          {/* Quick View Floating Pill */}
          <button
            onClick={handleOpenQuickView}
            className="absolute bottom-3 right-3 px-3.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-950 backdrop-blur-md text-white text-xs font-semibold shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0"
            title="Instant Variation Preview"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>Quick View</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 flex flex-col flex-1">
          {/* Brand & Category & Color Swatches */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md text-[11px] tracking-wide uppercase">
              {product.brand_name || 'Original'}
            </span>

            {/* Color preview tags */}
            {colorOptions.length > 0 && (
              <div className="flex items-center gap-1" title={`Available in: ${colorOptions.join(', ')}`}>
                <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                  {colorOptions.length} colors
                </span>
                <span className="w-2 h-2 rounded-full bg-slate-700 ring-1 ring-slate-300" />
                <span className="w-2 h-2 rounded-full bg-amber-600 ring-1 ring-slate-300" />
              </div>
            )}
          </div>

          {/* Title */}
          <Link to={`/product/${product.slug}`}>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base group-hover:text-emerald-600 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed flex-1">
            {product.short_description}
          </p>

          {/* Stock Status */}
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold">
            {isOutOfStock ? (
              <span className="text-red-500 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Out of Stock
              </span>
            ) : product.stock_quantity < 5 ? (
              <span className="text-amber-600 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Only {product.stock_quantity} left in stock!
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                In Stock & Ready to Ship
              </span>
            )}
          </div>

          {/* Price */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-baseline justify-between gap-2">
            <div>
              <div className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
                ₦{currentPrice?.toLocaleString()}
              </div>
              {hasDiscount && (
                <div className="text-xs text-slate-400 line-through -mt-0.5 font-medium">
                  ₦{originalPrice?.toLocaleString()}
                </div>
              )}
            </div>
            {hasDiscount && (
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full shrink-0">
                -₦{(originalPrice - currentPrice).toLocaleString()}
              </span>
            )}
          </div>

          {/* Action Buttons Row */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleOpenQuickView}
              className="w-full py-2.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 border border-slate-200/70 shadow-2xs"
              title="Select Storage, Color & Condition"
            >
              <Eye className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span className="font-extrabold whitespace-nowrap">Options</span>
            </button>

            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={isOutOfStock}
              className={`w-full py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 ${
                justAdded
                  ? 'bg-emerald-700 text-white shadow-emerald-700/20'
                  : isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 hover:shadow-md'
              }`}
              title={isOutOfStock ? 'Currently Out of Stock' : 'Add to Cart'}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-extrabold whitespace-nowrap">Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-extrabold whitespace-nowrap">{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </TiltCard>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
}
