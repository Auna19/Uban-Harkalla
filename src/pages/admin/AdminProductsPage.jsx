import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getCategories, deleteProduct, saveProduct } from '../../services/dataService';
import {
  Smartphone,
  Plus,
  Search,
  Star,
  Trash2,
  Edit,
  Eye,
  Sliders,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useAdminToast } from '../../context/AdminToastContext';

export default function AdminProductsPage() {
  const { showToast } = useAdminToast();
  const [products, setProducts] = useState(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem('ubh_products');
        if (raw) return JSON.parse(raw);
      }
    } catch (_) {}
    return [];
  });
  const [categories, setCategories] = useState(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem('ubh_categories');
        if (raw) return JSON.parse(raw);
      }
    } catch (_) {}
    return [];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [loading, setLoading] = useState(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem('ubh_products');
        if (raw && JSON.parse(raw).length > 0) return false;
      }
    } catch (_) {}
    return true;
  });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchProducts = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        getProducts({ activeOnly: false }),
        getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const targetName = deleteTarget.name;
    await deleteProduct(deleteTarget.id);
    setDeleteTarget(null);
    showToast(`Product "${targetName}" deleted successfully!`, 'info');
    fetchProducts();
  };

  const handleToggleFeatured = async (product) => {
    const nextVal = !product.is_featured;
    await saveProduct({
      ...product,
      is_featured: nextVal,
    });
    showToast(nextVal ? `Marked "${product.name}" as Featured!` : `Removed "${product.name}" from Featured`, 'info');
    fetchProducts();
  };

  const handleToggleActive = async (product) => {
    const nextVal = !product.is_active;
    await saveProduct({
      ...product,
      is_active: nextVal,
    });
    showToast(nextVal ? `Published "${product.name}" active on store!` : `Moved "${product.name}" to draft`, 'info');
    fetchProducts();
  };

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCat === 'all' || p.category_id === selectedCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Product Inventory & Variations</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your smartphone catalog, variation matrices, prices, and stock counts.
          </p>
        </div>

        <Link
          to="/admin/products/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow transition-all w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search phones, brand, model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs rounded-xl pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="w-full sm:w-auto text-xs font-semibold rounded-xl px-3 py-2 bg-slate-900 border border-slate-700 text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            <p className="text-xs">Loading product inventory...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">No Products Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchTerm || selectedCat !== 'all'
                ? 'No products match your current search or category filter.'
                : 'Click "Add New Product" to create your first smartphone listing.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-500 uppercase tracking-wider border-b border-slate-800 bg-slate-950/80">
                  <th className="py-3 px-4 font-semibold">Product</th>
                  <th className="py-3 px-4 font-semibold">Brand / Category</th>
                  <th className="py-3 px-4 font-semibold">Base Price</th>
                  <th className="py-3 px-4 font-semibold">Variations</th>
                  <th className="py-3 px-4 font-semibold">Stock</th>
                  <th className="py-3 px-4 font-semibold">Featured</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {filtered.map((prod) => {
                  const img = (prod.images && prod.images[0]) || prod.image_url || '/Logo.jpg';
                  const varCount = prod.variations?.length || 0;
                  const isLowStock = (prod.stock_quantity || 0) <= 5;

                  return (
                    <tr key={prod.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={img}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover border border-slate-800 shrink-0"
                          />
                          <div className="max-w-[200px] truncate">
                            <span className="font-bold text-white block truncate">{prod.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{prod.slug}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-bold text-slate-200">{prod.brand_name || 'Original'}</p>
                        <p className="text-[10px] text-slate-400">{prod.category_name}</p>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-black text-emerald-400">
                          ₦{(prod.discounted_price || prod.base_price).toLocaleString()}
                        </div>
                        {prod.discounted_price && (
                          <div className="text-[10px] text-slate-500 line-through">
                            ₦{prod.base_price.toLocaleString()}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-semibold">
                          {varCount} variations
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`font-bold ${prod.stock_quantity === 0
                            ? 'text-red-400'
                            : isLowStock
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                            }`}
                        >
                          {prod.stock_quantity} units
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleFeatured(prod)}
                          className={`p-1.5 rounded-lg transition-colors ${prod.is_featured
                            ? 'text-amber-400 bg-amber-950/60 border border-amber-800'
                            : 'text-slate-600 hover:text-slate-400'
                            }`}
                          title="Toggle Featured"
                        >
                          <Star className={`w-4 h-4 ${prod.is_featured ? 'fill-amber-400' : ''}`} />
                        </button>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(prod)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${prod.is_active !== false
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-slate-800 text-slate-400'
                            }`}
                        >
                          {prod.is_active !== false ? 'Active' : 'Draft'}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/product/${prod.slug}?from=admin`}
                            state={{ from: 'admin' }}
                            target="_blank"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                            title="View on Storefront"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/admin/products/${prod.id}`}
                            className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-slate-800"
                            title="Edit Product & Variations"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(prod)}
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-slate-800"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Product Deletion */}
      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Product from Store?"
        message="Are you sure you want to delete this product? All configured attributes, variations, and photography mappings will be permanently removed from the storefront."
        itemName={deleteTarget?.name}
        confirmText="Delete Product"
      />

    </div>
  );
}
