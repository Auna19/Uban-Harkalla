import React, { useState, useMemo } from 'react';
import { X, Check, ShoppingBag, Eye, Star, ShieldCheck, Truck, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';

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

  // Compute matched variation
  const matchedVariation = useMemo(() => {
    if (!product.variations || product.variations.length === 0) return null;
    const match = product.variations.find((v) =>
      v.attributes && Object.entries(selectedAttributes).every(([k, val]) => v.attributes[k] === val)
    );
    return match || product.variations[0];
  }, [product, selectedAttributes]);

  const activeImage = (matchedVariation && matchedVariation.image_url) || (product.images && product.images[0]) || '/1001102628.jpg';
  const currentPrice = matchedVariation ? (matchedVariation.discounted_price || matchedVariation.price) : (product.discounted_price || product.base_price);
  const originalPrice = matchedVariation ? matchedVariation.price : (product.base_price || currentPrice);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Showcase */}
          <div className="relative bg-slate-50 flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-slate-100">
            <img
              src={activeImage}
              alt={product.name}
              className="max-h-72 object-contain rounded-2xl drop-shadow-xl hover:scale-105 transition-transform duration-300"
            />
            {product.is_featured && (
              <span className="absolute top-4 left-4 bg-slate-900 text-amber-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                ★ Featured
              </span>
            )}
          </div>

          {/* Details & Selectors */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[11px] font-bold tracking-widest text-emerald-600 uppercase">
                {product.brand_name} • {product.category_name}
              </span>
              <h3 className="text-xl font-extrabold text-slate-950 mt-1">
                {product.name}
              </h3>

              {/* Pricing */}
              <div className="flex items-baseline gap-2.5 mt-3">
                <span className="text-2xl font-black text-slate-950">
                  ₦{currentPrice?.toLocaleString()}
                </span>
                {originalPrice > currentPrice && (
                  <>
                    <span className="text-xs text-slate-400 line-through">
                      ₦{originalPrice?.toLocaleString()}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Save ₦{(originalPrice - currentPrice).toLocaleString()}
                    </span>
                  </>
                )}
              </div>

              {/* Dynamic Variations Selector */}
              {Object.keys(availableOptions).length > 0 && (
                <div className="space-y-3 mt-4 pt-3 border-t border-slate-100">
                  {Object.entries(availableOptions).map(([attrKey, values]) => (
                    <div key={attrKey}>
                      <div className="flex justify-between text-xs mb-1.5 font-semibold text-slate-600">
                        <span className="uppercase tracking-wider font-bold text-slate-700 text-[11px]">
                          {attrKey}:
                        </span>
                        <span className="text-emerald-600 font-bold">{selectedAttributes[attrKey]}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {values.map((v) => {
                          const isSelected = selectedAttributes[attrKey] === v;
                          return (
                            <button
                              key={v}
                              type="button"
                              onClick={() => handleSelectAttribute(attrKey, v)}
                              className={`px-3 py-1.5 text-xs rounded-xl font-semibold border transition-all ${
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
                  ))}
                </div>
              )}

              {/* Stock status */}
              <div className="mt-3 flex items-center gap-2 text-xs font-semibold">
                <span className={`w-2 h-2 rounded-full ${stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <span className={stock > 0 ? 'text-emerald-700' : 'text-red-600'}>
                  {stock > 0 ? `In Stock (${stock} units ready to dispatch)` : 'Temporarily Out of Stock'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button
                onClick={handleAddToCart}
                disabled={stock <= 0}
                className={`w-full py-3 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : stock > 0
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-lg hover:shadow-emerald-600/25 active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>{stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                  </>
                )}
              </button>

              <Link
                to={`/product/${product.slug}`}
                onClick={onClose}
                className="w-full py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View Full Product Specifications</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
