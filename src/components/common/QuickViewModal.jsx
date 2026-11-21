import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, ShoppingBag, Eye, Star, ShieldCheck, Truck, ArrowRight, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import { formatPrice, formatNumber } from '../../utils/formatters';

export default function QuickViewModal({ product, isOpen, onClose }) {
  if (!isOpen || !product) return null;

  const { addToCart } = useCart();
  const [selectedAttributes, setSelectedAttributes] = useState(() => {
    if (product.variations && product.variations.length > 0 && product.variations[0].attributes) {
      return { ...product.variations[0].attributes };
    }
    return {};
  });
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Re-sync attributes when product changes
  useEffect(() => {
    if (product?.variations && product.variations.length > 0 && product.variations[0].attributes) {
      setSelectedAttributes({ ...product.variations[0].attributes });
    } else {
      setSelectedAttributes({});
    }
    setQuantity(1);
    setAdded(false);
  }, [product]);

  // Handle ESC key and lock body scroll while modal is open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  // Compute matched variation
  const matchedVariation = useMemo(() => {
    if (!product.variations || product.variations.length === 0) return null;
    const match = product.variations.find((v) =>
      v.attributes && Object.entries(selectedAttributes).every(([k, val]) => v.attributes[k] === val)
    );
    return match || product.variations[0];
  }, [product, selectedAttributes]);

  const activeImage =
    (matchedVariation && matchedVariation.has_custom_image && matchedVariation.image_url) ||
    (product.images && product.images[0]) ||
    product.image_url ||
    (matchedVariation && matchedVariation.image_url) ||
    '/1001102628.jpg';

  const originalPrice = Number(
    (matchedVariation && matchedVariation.price) ||
    product.base_price ||
    0
  );

  const varDiscount = matchedVariation?.discounted_price ? Number(matchedVariation.discounted_price) : null;
  const prodDiscount = product.discounted_price ? Number(product.discounted_price) : null;

  const effectiveDiscount = (varDiscount && varDiscount > 0 && varDiscount < originalPrice)
    ? varDiscount
    : (prodDiscount && prodDiscount > 0 && prodDiscount < originalPrice)
      ? prodDiscount
      : null;

  const currentPrice = effectiveDiscount !== null ? effectiveDiscount : originalPrice;
  const hasDiscount = effectiveDiscount !== null && originalPrice > currentPrice;

  const stock = matchedVariation ? matchedVariation.stock_quantity : (product.stock_quantity || 0);

  // Available options
  const availableOptions = useMemo(() => {
    if (!product.variations) return {};
    const map = {};
    product.variations.forEach((v) => {
      if (v.attributes) {
        Object.entries(v.attributes).forEach(([k, val]) => {
          if (!map[k]) map[k] = new Set();
          map[k].add(val);
        });
      }
    });
    const res = {};
    Object.keys(map).forEach((k) => {
      res[k] = Array.from(map[k]);
    });
    return res;
  }, [product]);

  const handleSelectAttribute = (key, val) => {
    const candidate = { ...selectedAttributes, [key]: val };
    const exact = product.variations?.find(
      (v) => v.attributes && Object.entries(candidate).every(([k, vVal]) => v.attributes[k] === vVal)
    );
    if (exact) {
      setSelectedAttributes(candidate);
    } else {
      const match = product.variations?.find((v) => v.attributes && v.attributes[key] === val);
      if (match) {
        setSelectedAttributes({ ...match.attributes });
      } else {
        setSelectedAttributes(candidate);
      }
    }
  };

  const handleAddToCart = () => {
    if (stock <= 0) return;
    try {
      addToCart(product, matchedVariation, quantity);
      setAdded(true);
      setTimeout(() => {
        setAdded(false);
        onClose();
      }, 1200);
    } catch (e) {
      alert(e.message);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      {/* Click outside backdrop to close */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-scale-in my-auto max-h-[90vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors z-30 cursor-pointer shadow-xs"
          aria-label="Close options modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Product Image Showcase */}
        <div className="relative md:w-1/2 bg-gradient-to-b from-slate-50 to-slate-100/70 flex items-center justify-center p-6 sm:p-8 border-b md:border-b-0 md:border-r border-slate-100 shrink-0">
          <img
            src={activeImage}
            alt={product.name}
            className="max-h-56 sm:max-h-72 w-full object-contain drop-shadow-xl transition-transform duration-300"
          />
          {product.is_featured && (
            <span className="absolute top-4 left-4 bg-slate-900 text-amber-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-amber-400/20 shadow-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              Featured
            </span>
          )}
        </div>

        {/* Right: Product Details, Variations & Add to Cart */}
        <div className="p-6 sm:p-8 md:w-1/2 flex flex-col justify-between overflow-y-auto space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-black tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md uppercase border border-emerald-100">
                {product.brand_name || 'Genuine'}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                {product.category_name}
              </span>
            </div>

            <h3 className="text-xl font-black text-slate-950 mt-1 tracking-tight leading-snug">
              {product.name}
            </h3>

            {/* Pricing */}
            <div className="flex items-baseline gap-2.5 mt-2.5 flex-wrap">
              <span className="text-2xl font-black text-slate-950">
                {formatPrice(currentPrice)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xs text-slate-400 line-through font-semibold">
                    {formatPrice(originalPrice)}
                  </span>
                  <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Save {formatPrice(originalPrice - currentPrice)}
                  </span>
                </>
              )}
            </div>

            {/* Dynamic Variations Selector */}
            {Object.keys(availableOptions).length > 0 && (
              <div className="space-y-3 mt-4 pt-3 border-t border-slate-100">
                {Object.entries(availableOptions).map(([attrKey, values]) => (
                  <div key={attrKey}>
                    <div className="flex justify-between items-center text-xs mb-1.5 font-semibold text-slate-600">
                      <span className="uppercase tracking-wider font-extrabold text-slate-700 text-[11px]">
                        Select {attrKey}:
                      </span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-100">
                        {selectedAttributes[attrKey]}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {values.map((v) => {
                        const isSelected = selectedAttributes[attrKey] === v;
                        return (
                          <button
                            key={v}
                            type="button"
                            onClick={() => handleSelectAttribute(attrKey, v)}
                            className={`px-3 py-1.5 text-xs rounded-xl font-bold border transition-all cursor-pointer flex items-center gap-1 ${isSelected
                              ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                              }`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                            <span>{v}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Stock status indicator */}
            <div className="mt-4 flex items-center gap-2 text-xs font-bold">
              <span className={`w-2.5 h-2.5 rounded-full ${stock > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span className={stock > 0 ? 'text-emerald-800' : 'text-rose-600'}>
                {stock > 0 ? `In Stock (${stock} units available)` : 'Temporarily Out of Stock'}
              </span>
            </div>
          </div>

          {/* Quantity & Action Buttons */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Qty:</span>
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-0.5">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || stock <= 0}
                  className="w-8 h-8 rounded-lg bg-white text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center text-xs shadow-2xs cursor-pointer"
                >
                  -
                </button>
                <span className="px-3 text-xs font-bold text-slate-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                  disabled={quantity >= stock || stock <= 0}
                  className="w-8 h-8 rounded-lg bg-white text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center text-xs shadow-2xs cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={stock <= 0}
              className={`w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${added
                ? 'bg-emerald-700 text-white shadow-emerald-700/30'
                : stock > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 hover:shadow-lg'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Shopping Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>{stock > 0 ? `Add to Cart • ${formatPrice(currentPrice * quantity)}` : 'Out of Stock'}</span>
                </>
              )}
            </button>

            <Link
              to={`/product/${product.slug}#specs`}
              state={{ tab: 'specs' }}
              onClick={() => {
                document.body.style.overflow = '';
                onClose();
              }}
              className="w-full py-3 rounded-2xl text-xs font-black text-emerald-800 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-950 transition-colors flex items-center justify-center gap-2 border border-emerald-200/80 shadow-2xs cursor-pointer"
            >
              <span>View Full Device Specifications</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}