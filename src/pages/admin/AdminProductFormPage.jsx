import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  getProductById,
  getCategories,
  getBrands,
  saveProduct,
  getAttributes,
} from '../../services/dataService';
import { formatPrice, formatNumber } from '../../utils/formatters';
import {
  Smartphone,
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { processLocalImage } from '../../utils/imageUpload';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useAdminToast } from '../../context/AdminToastContext';

export default function AdminProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id && id !== 'create' && id !== 'new');
  const { showToast } = useAdminToast();

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [attributesMaster, setAttributesMaster] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [deleteVariationTarget, setDeleteVariationTarget] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [os, setOs] = useState('iOS');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState(0);
  const [prevBasePrice, setPrevBasePrice] = useState(0);
  const [discountedPrice, setDiscountedPrice] = useState(0);
  const [prevDiscountedPrice, setPrevDiscountedPrice] = useState(0);
  const [stockQuantity, setStockQuantity] = useState(10);
  const [isFeatured, setIsFeatured] = useState(!isEditing);
  const [isActive, setIsActive] = useState(true);
  const [imageUrls, setImageUrls] = useState(['/1001102628.jpg']);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Dynamic Variations Array
  const [variations, setVariations] = useState([]);

  useEffect(() => {
    async function init() {
      const [cats, brs, attrs] = await Promise.all([
        getCategories(),
        getBrands(),
        getAttributes(),
      ]);
      setCategories(cats);
      setBrands(brs);
      setAttributesMaster(attrs);

      if (cats.length > 0 && !categoryId) setCategoryId(cats[0].id);
      if (brs.length > 0 && !brandId) setBrandId(brs[0].id);

      if (isEditing) {
        const prod = await getProductById(id);
        if (prod) {
          setName(prod.name);
          setSlug(prod.slug);
          setCategoryId(prod.category_id || cats[0]?.id || '');
          setBrandId(prod.brand_id || brs[0]?.id || '');
          setOs(prod.os || 'Universal');
          setShortDescription(prod.short_description || '');
          setDescription(prod.description || '');
          setBasePrice(prod.base_price || 0);
          setPrevBasePrice(prod.base_price || 0);
          setDiscountedPrice(prod.discounted_price || 0);
          setPrevDiscountedPrice(prod.discounted_price || 0);
          setStockQuantity(prod.stock_quantity || 0);
          setIsFeatured(prod.is_featured || false);
          setIsActive(prod.is_active !== false);
          setImageUrls(prod.images || [prod.image_url || '/1001102628.jpg']);
          setVariations(prod.variations || []);
        }
        setLoading(false);
      }
    }
    init();
  }, [id, isEditing]);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (!isEditing) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    }
  };

  const handleAddVariation = () => {
    const newVar = {
      id: `var-${Date.now()}`,
      sku: `SKU-${Date.now().toString().slice(-5)}`,
      attributes: { storage: '256GB', color: 'Natural Titanium', condition: 'Brand New (Sealed)' },
      price: basePrice || 100000,
      discounted_price: discountedPrice || 0,
      stock_quantity: 5,
      image_url: imageUrls[0] || '/1001102628.jpg',
      is_active: true,
    };
    setVariations((prev) => [...prev, newVar]);
    showToast('New variation added! Configure attributes below.', 'success');
  };

  const handleUpdateVariation = (idx, field, val) => {
    const updated = [...variations];
    updated[idx] = { ...updated[idx], [field]: val };
    setVariations(updated);
  };

  const handleUpdateVariationAttribute = (idx, attrKey, val) => {
    const updated = [...variations];
    updated[idx].attributes = {
      ...(updated[idx].attributes || {}),
      [attrKey]: val,
    };
    setVariations(updated);
  };

  const handleRemoveVariation = (idx, varLabel) => {
    setVariations((prev) => prev.filter((_, i) => i !== idx));
    showToast(varLabel ? `Variation "${varLabel}" removed.` : `Variation #${idx + 1} removed.`, 'info');
  };

  const handleProductImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setIsUploadingImage(true);
    try {
      const processed = [];
      for (const file of files) {
        const dataUrl = await processLocalImage(file, 900, 0.78);
        processed.push(dataUrl);
      }
      setImageUrls((prev) => {
        const isPlaceholder = prev.length === 1 && prev[0] === '/1001102628.jpg';
        const next = isPlaceholder ? processed : [...prev, ...processed];
        if (next.length > 0) {
          const newPrimary = next[0];
          setVariations((prevVars) =>
            prevVars.map((v) =>
              v.has_custom_image ? v : { ...v, image_url: newPrimary }
            )
          );
        }
        return next;
      });
      showToast(`${files.length} product image${files.length > 1 ? 's' : ''} uploaded and optimized!`, 'success');
    } catch (err) {
      console.error('Image upload failed:', err);
      showToast('Failed to process image. Please try another image file.', 'error');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSetPrimaryImage = (index) => {
    if (index === 0) return;
    setImageUrls((prev) => {
      const copy = [...prev];
      const [selected] = copy.splice(index, 1);
      const next = [selected, ...copy];
      setVariations((prevVars) =>
        prevVars.map((v) =>
          v.has_custom_image ? v : { ...v, image_url: selected }
        )
      );
      return next;
    });
    showToast('Primary product image updated!', 'success');
  };

  const handleRemoveProductImage = (index) => {
    setImageUrls((prev) => {
      const next = prev.filter((_, i) => i !== index);
      const finalImages = next.length > 0 ? next : ['/1001102628.jpg'];
      const newPrimary = finalImages[0];
      setVariations((prevVars) =>
        prevVars.map((v) =>
          v.has_custom_image ? v : { ...v, image_url: newPrimary }
        )
      );
      return finalImages;
    });
    showToast('Product image removed', 'info');
  };

  const handleAddCustomImageUrl = () => {
    if (!newImageUrl.trim()) return;
    const url = newImageUrl.trim();
    setImageUrls((prev) => {
      const isPlaceholder = prev.length === 1 && prev[0] === '/1001102628.jpg';
      const next = isPlaceholder ? [url] : [...prev, url];
      if (isPlaceholder) {
        setVariations((prevVars) =>
          prevVars.map((v) =>
            v.has_custom_image ? v : { ...v, image_url: url }
          )
        );
      }
      return next;
    });
    setNewImageUrl('');
    showToast('Image URL added to product gallery!', 'success');
  };

  const handleVariationImageUpload = async (idx, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await processLocalImage(file, 900, 0.78);
      setVariations((prev) => {
        const copy = [...prev];
        copy[idx] = {
          ...copy[idx],
          image_url: dataUrl,
          has_custom_image: true,
        };
        return copy;
      });
      showToast(`Variation #${idx + 1} custom photo uploaded!`, 'success');
    } catch (err) {
      console.error('Variation image upload failed:', err);
      showToast('Failed to process variation image file.', 'error');
    } finally {
      e.target.value = '';
    }
  };

  const handleResetVariationImage = (idx) => {
    const primary = imageUrls[0] || '/1001102628.jpg';
    setVariations((prev) => {
      const copy = [...prev];
      copy[idx] = {
        ...copy[idx],
        image_url: primary,
        has_custom_image: false,
      };
      return copy;
    });
    showToast(`Variation #${idx + 1} reset to primary product photo!`, 'info');
  };

  const handleSyncPricingToVariations = () => {
    const bPrice = Number(basePrice) || 0;
    const dPrice = Number(discountedPrice) || 0;
    setVariations((prev) =>
      prev.map((v) => ({
        ...v,
        price: bPrice,
        discounted_price: dPrice > 0 && dPrice < bPrice ? dPrice : 0,
      }))
    );
    showToast(`Base price (${formatPrice(bPrice)}) & discount applied to all variations!`, 'success');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const numBase = Number(basePrice) || 0;
    const numDiscount = Number(discountedPrice) || 0;

    if (numDiscount > 0 && numDiscount >= numBase) {
      showToast('Discounted price must be less than the base price.', 'error');
      return;
    }

    const selectedCategoryObj = categories.find((c) => c.id === categoryId);
    const selectedBrandObj = brands.find((b) => b.id === brandId);

    // Sum total stock from variations if variations exist
    const calculatedTotalStock = variations.length > 0
      ? variations.reduce((sum, v) => sum + Number(v.stock_quantity || 0), 0)
      : Number(stockQuantity);

    const cleanSlug = (slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')) || `prod-${Date.now()}`;
    const primaryImage = imageUrls[0] || '/1001102628.jpg';

    const normalizedVariations = variations.map((v, idx) => {
      let vPrice = Number(v.price) || 0;
      // If variation price was empty, or equal to previous base price, or default variation:
      if (!vPrice || vPrice === Number(prevBasePrice) || idx === 0) {
        vPrice = numBase || vPrice;
      }

      let vDiscount = Number(v.discounted_price) || 0;
      if (numDiscount > 0 && numDiscount < vPrice) {
        if (!vDiscount || vDiscount === Number(prevDiscountedPrice) || idx === 0) {
          vDiscount = numDiscount;
        }
      } else if (!numDiscount || numDiscount <= 0) {
        if (vDiscount === Number(prevDiscountedPrice) || idx === 0) {
          vDiscount = null;
        }
      }

      return {
        ...v,
        price: vPrice,
        discounted_price: vDiscount && vDiscount > 0 && vDiscount < vPrice ? vDiscount : null,
        stock_quantity: Number(v.stock_quantity || 0),
        has_custom_image: Boolean(v.has_custom_image),
        image_url: v.has_custom_image ? v.image_url : primaryImage,
      };
    });

    const payload = {
      id: isEditing ? id : undefined,
      name,
      slug: cleanSlug,
      brand_id: brandId,
      brand_name: selectedBrandObj?.name || 'Original',
      category_id: categoryId,
      category_name: selectedCategoryObj?.name || 'Smartphones',
      os,
      short_description: shortDescription,
      description,
      base_price: numBase,
      discounted_price: numDiscount > 0 && numDiscount < numBase ? numDiscount : null,
      stock_quantity: calculatedTotalStock,
      is_featured: isFeatured,
      is_active: isActive,
      image_url: primaryImage,
      images: imageUrls,
      variations: normalizedVariations,
    };

    await saveProduct(payload);
    showToast(isEditing ? `Product "${name}" updated successfully!` : `Product "${name}" created successfully!`, 'success');
    navigate('/admin/products');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Product Catalog
        </Link>
        <h1 className="text-xl font-bold text-white">
          {isEditing ? `Edit Product: ${name}` : 'Create New Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Section 1: Basic Information */}
        <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-white pb-3 border-b border-slate-800">
            1. Core Specifications & Category
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
              Product Title *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={handleNameChange}
              placeholder="e.g. Apple iPhone 15 Pro Max"
              className="w-full text-xs font-semibold rounded-xl px-4 py-2.5 bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl px-4 py-2.5 bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Brand *
              </label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl px-4 py-2.5 bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Operating System
              </label>
              <select
                value={os}
                onChange={(e) => setOs(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl px-4 py-2.5 bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="iOS">iOS (Apple)</option>
                <option value="Android">Android</option>
                <option value="Universal">Universal / Accessory</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
              Short Description *
            </label>
            <input
              type="text"
              required
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="e.g. Titanium design with A17 Pro chip, 48MP main camera, and 5x optical telephoto."
              className="w-full text-xs rounded-xl px-4 py-2.5 bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
              Full Description & Specifications Overview
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs rounded-xl px-4 py-2.5 bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            ></textarea>
          </div>
        </div>

        {/* Section 2: Pricing & Product Media Gallery */}
        <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-sm">
          <div className="pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white">
              2. Base Pricing & Image Assets
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Set product pricing and upload images directly from your computer or provide URLs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Base Price (₦) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="w-full text-xs font-bold rounded-xl px-4 py-2.5 bg-slate-900 border border-slate-700 text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {Number(basePrice) > 0 && (
                <span className="text-[11px] text-emerald-400/80 font-bold mt-1 block">
                  Formatted: {formatPrice(basePrice)}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Discounted Price (₦)
              </label>
              <input
                type="number"
                min="0"
                value={discountedPrice}
                onChange={(e) => setDiscountedPrice(e.target.value)}
                placeholder="Optional promo price"
                className="w-full text-xs font-bold rounded-xl px-4 py-2.5 bg-slate-900 border border-slate-700 text-amber-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {Number(discountedPrice) > 0 && (
                <span className="text-[11px] text-amber-400/80 font-bold mt-1 block">
                  Formatted: {formatPrice(discountedPrice)}{' '}
                  {Number(basePrice) > Number(discountedPrice) && (
                    <span className="text-emerald-400 font-semibold">
                      (Save {formatPrice(Number(basePrice) - Number(discountedPrice))})
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>

          {variations.length > 0 && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400">
                Have variations with different pricing? You can sync them now:
              </span>
              <button
                type="button"
                onClick={handleSyncPricingToVariations}
                className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Apply base price & discount to all ({variations.length}) variations
              </button>
            </div>
          )}

          {/* Product Media Gallery Uploader */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="block text-xs font-bold text-white uppercase tracking-wider">
                  Product Image Gallery ({imageUrls.length})
                </label>
                <p className="text-[11px] text-slate-400">
                  Upload from local files. The first image is highlighted as the primary display photo.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="url"
                    placeholder="Or paste image URL (https://...)"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1 text-xs rounded-xl px-3 py-2 bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newImageUrl.trim()) {
                        const val = newImageUrl.trim();
                        setImageUrls((prev) => {
                          const isPlaceholder = prev.length === 1 && prev[0] === '/1001102628.jpg';
                          return isPlaceholder ? [val] : [...prev, val];
                        });
                        setNewImageUrl('');
                        showToast('Image URL added to gallery!', 'success');
                      }
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs rounded-xl transition-all whitespace-nowrap"
                  >
                    Add Image URL
                  </button>
                </div>

                <div>
                  <label
                    htmlFor="product-local-upload"
                    className={`inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow transition-all whitespace-nowrap ${isUploadingImage ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isUploadingImage ? 'Processing...' : 'Upload File'}</span>
                  </label>
                  <input
                    id="product-local-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={isUploadingImage}
                    onChange={handleProductImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Thumbnail Preview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
              {imageUrls.map((url, idx) => (
                <div
                  key={idx}
                  className={`relative group rounded-2xl overflow-hidden border ${idx === 0
                    ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                    : 'border-slate-800 hover:border-slate-700'
                    } bg-slate-900 aspect-square`}
                >
                  <img
                    src={url}
                    alt={`Product photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Badges & Actions */}
                  <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between">
                    {idx === 0 ? (
                      <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 font-black text-[9px] rounded-md shadow uppercase tracking-wider">
                        Primary
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(idx)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 bg-slate-900/90 hover:bg-emerald-600 text-white font-bold text-[9px] rounded-md shadow"
                        title="Set as primary product photo"
                      >
                        Make Primary
                      </button>
                    )}

                    {imageUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveProductImage(idx)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-red-600/90 hover:bg-red-500 text-white rounded-md shadow ml-auto"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Fallback / Manual URL input */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Or paste an image web URL (e.g. /1001102628.jpg or https://...)"
                className="flex-1 text-xs rounded-xl px-4 py-2 bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddCustomImageUrl}
                disabled={!newImageUrl.trim()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-bold rounded-xl transition-colors shrink-0"
              >
                + Add URL
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2 border-t border-slate-800/80">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 accent-emerald-500"
              />
              <span>Mark as Featured Product</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 accent-emerald-500"
              />
              <span>Published & Active on Store</span>
            </label>
          </div>
        </div>

        {/* Section 3: Dynamic Variations Matrix */}
        <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">
                3. Dynamic Variations Builder
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure unique prices, conditions (Brand New / UK Used), colors, and stock per variation.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddVariation}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Variation</span>
            </button>
          </div>

          {variations.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-slate-800 rounded-2xl p-6">
              <p className="text-xs text-slate-400">
                No variations configured. This product will use its standard base price and single stock count.
              </p>
              <button
                type="button"
                onClick={handleAddVariation}
                className="mt-3 px-4 py-2 bg-slate-900 text-emerald-400 text-xs font-bold rounded-xl border border-slate-700"
              >
                + Add First Variation (e.g. 256GB Titanium)
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {variations.map((v, idx) => (
                <div
                  key={v.id || idx}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 uppercase">
                      Variation #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDeleteVariationTarget({ idx, v })}
                      className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">SKU</label>
                      <input
                        type="text"
                        value={v.sku || ''}
                        onChange={(e) => handleUpdateVariation(idx, 'sku', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Storage</label>
                      <input
                        type="text"
                        value={v.attributes?.storage || ''}
                        onChange={(e) => handleUpdateVariationAttribute(idx, 'storage', e.target.value)}
                        placeholder="e.g. 256GB"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Color</label>
                      <input
                        type="text"
                        value={v.attributes?.color || ''}
                        onChange={(e) => handleUpdateVariationAttribute(idx, 'color', e.target.value)}
                        placeholder="e.g. Natural Titanium"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Condition</label>
                      <select
                        value={v.attributes?.condition || 'Brand New (Sealed)'}
                        onChange={(e) => handleUpdateVariationAttribute(idx, 'condition', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-semibold"
                      >
                        <option value="Brand New (Sealed)">Brand New (Sealed)</option>
                        <option value="UK Used (Grade A+)">UK Used (Grade A+)</option>
                        <option value="US Used (Pristine)">US Used (Pristine)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Price (₦) *</label>
                      <input
                        type="number"
                        value={v.price || 0}
                        onChange={(e) => handleUpdateVariation(idx, 'price', Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-emerald-400 font-bold"
                      />
                      <span className="text-[10px] text-emerald-400/80 font-mono mt-0.5 block">
                        {formatPrice(v.price || basePrice)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Discount Price (₦)</label>
                      <input
                        type="number"
                        value={v.discounted_price || 0}
                        onChange={(e) => handleUpdateVariation(idx, 'discounted_price', Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-amber-400 font-bold"
                      />
                      <span className="text-[10px] text-amber-400/80 font-mono mt-0.5 block">
                        {Number(v.discounted_price) > 0
                          ? formatPrice(v.discounted_price)
                          : Number(discountedPrice) > 0
                            ? `Inherits: ${formatPrice(discountedPrice)}`
                            : 'No Discount'}
                      </span>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Stock Units</label>
                      <input
                        type="number"
                        min="0"
                        value={v.stock_quantity || 0}
                        onChange={(e) => handleUpdateVariation(idx, 'stock_quantity', Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-bold"
                      />
                    </div>
                  </div>

                  {/* Variation Image Asset */}
                  <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shrink-0">
                        <img
                          src={v.image_url || imageUrls[0] || '/1001102628.jpg'}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-200 block">
                          Variation Image Asset
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {v.has_custom_image
                            ? 'Custom variant photo selected'
                            : 'Inheriting primary product photo'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label
                        htmlFor={`var-upload-${idx}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Upload Variant Image</span>
                      </label>
                      <input
                        id={`var-upload-${idx}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleVariationImageUpload(idx, e)}
                        className="hidden"
                      />
                      {v.has_custom_image && (
                        <button
                          type="button"
                          onClick={() => handleResetVariationImage(idx)}
                          className="text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-950 border border-slate-800 transition-colors"
                        >
                          Reset to Main
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link
            to="/admin/products"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isEditing ? 'Save Product Changes' : 'Create & Publish Product'}</span>
          </button>
        </div>

      </form>

      {/* Confirmation Modal for Variation Removal */}
      <ConfirmationModal
        isOpen={Boolean(deleteVariationTarget)}
        onClose={() => setDeleteVariationTarget(null)}
        onConfirm={() => {
          if (deleteVariationTarget !== null) {
            const varLabel =
              deleteVariationTarget.v?.sku ||
              Object.values(deleteVariationTarget.v?.attributes || {}).filter(Boolean).join(' / ') ||
              `Variation #${deleteVariationTarget.idx + 1}`;
            handleRemoveVariation(deleteVariationTarget.idx, varLabel);
            setDeleteVariationTarget(null);
          }
        }}
        title="Remove Product Variation?"
        message="Are you sure you want to remove this variation? Price, SKU, and allocated stock for this variation will be removed."
        itemName={
          deleteVariationTarget
            ? `Variation #${deleteVariationTarget.idx + 1}: ${deleteVariationTarget.v.sku || 'No SKU'} (${Object.values(deleteVariationTarget.v.attributes || {}).filter(Boolean).join(' / ') || 'Standard'})`
            : ''
        }
        confirmText="Remove Variation"
      />

    </div>
  );
}
