import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  getProductById,
  getCategories,
  getBrands,
  saveProduct,
  getAttributes,
} from '../../services/dataService';
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
} from 'lucide-react';

export default function AdminProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [attributesMaster, setAttributesMaster] = useState([]);
  const [loading, setLoading] = useState(isEditing);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [os, setOs] = useState('iOS');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState(0);
  const [discountedPrice, setDiscountedPrice] = useState(0);
  const [stockQuantity, setStockQuantity] = useState(10);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [imageUrls, setImageUrls] = useState(['/1001102628.jpg']);

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
          setDiscountedPrice(prod.discounted_price || 0);
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
    setVariations([...variations, newVar]);
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

  const handleRemoveVariation = (idx) => {
    setVariations(variations.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedCategoryObj = categories.find((c) => c.id === categoryId);
    const selectedBrandObj = brands.find((b) => b.id === brandId);

    // Sum total stock from variations if variations exist
    const calculatedTotalStock = variations.length > 0
      ? variations.reduce((sum, v) => sum + Number(v.stock_quantity || 0), 0)
      : Number(stockQuantity);

    const payload = {
      id: isEditing ? id : undefined,
      name,
      slug,
      brand_id: brandId,
      brand_name: selectedBrandObj?.name || 'Original',
      category_id: categoryId,
      category_name: selectedCategoryObj?.name || 'Smartphones',
      os,
      short_description: shortDescription,
      description,
      base_price: Number(basePrice),
      discounted_price: discountedPrice ? Number(discountedPrice) : null,
      stock_quantity: calculatedTotalStock,
      is_featured: isFeatured,
      is_active: isActive,
      images: imageUrls,
      variations,
    };

    await saveProduct(payload);
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
          {isEditing ? `Edit Product: ${name}` : 'Scaffold New Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Basic Information */}
        <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-white pb-3 border-b border-slate-800">
            1. Core Specifications & Category
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full text-xs font-mono rounded-xl px-4 py-2.5 bg-slate-900 border border-slate-700 text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
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

        {/* Section 2: Pricing & Stock */}
        <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-white pb-3 border-b border-slate-800">
            2. Base Pricing & Image Asset
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Primary Image Asset Path *
              </label>
              <input
                type="text"
                required
                value={imageUrls[0] || '/1001102628.jpg'}
                onChange={(e) => setImageUrls([e.target.value])}
                placeholder="e.g. /1001102628.jpg"
                className="w-full text-xs rounded-xl px-4 py-2.5 bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
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
                      onClick={() => handleRemoveVariation(idx)}
                      className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
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
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Discount Price (₦)</label>
                      <input
                        type="number"
                        value={v.discounted_price || 0}
                        onChange={(e) => handleUpdateVariation(idx, 'discounted_price', Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-amber-400 font-bold"
                      />
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

    </div>
  );
}
