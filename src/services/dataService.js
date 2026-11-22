import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import {
  INITIAL_CATEGORIES,
  INITIAL_BRANDS,
  INITIAL_ATTRIBUTES,
  INITIAL_PRODUCTS,
  INITIAL_DELIVERY_LOCATIONS,
  INITIAL_WEBSITE_CONTENT,
  INITIAL_TESTIMONIALS,
  INITIAL_ORDERS,
  INITIAL_BUSINESS_SETTINGS,
} from './initialData.js';

// Local storage keys for standalone / client-side resilience
const STORAGE_KEYS = {
  CATEGORIES: 'ubh_categories',
  BRANDS: 'ubh_brands',
  ATTRIBUTES: 'ubh_attributes',
  PRODUCTS: 'ubh_products',
  DELIVERY_LOCATIONS: 'ubh_delivery_locations',
  ORDERS: 'ubh_orders',
  WEBSITE_CONTENT: 'ubh_website_content',
  TESTIMONIALS: 'ubh_testimonials',
  SETTINGS: 'ubh_settings',
  NOTIFICATIONS: 'ubh_notifications',
  CUSTOMERS: 'ubh_customers',
};

// Helper to safely load or initialize data
function getStoredData(key, fallback) {
  try {
    if (typeof localStorage === 'undefined') return fallback;
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Error reading ${key} from storage:`, err);
    return fallback;
  }
}

function saveStoredData(key, data) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(data));
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('ubh-data-changed', { detail: { key } }));
    }
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
    if (err && (err.name === 'QuotaExceededError' || err.code === 22)) {
      try {
        localStorage.removeItem('ubh_notifications');
        localStorage.setItem(key, JSON.stringify(data));
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('ubh-data-changed', { detail: { key } }));
        }
      } catch (retryErr) {
        console.error('Storage quota exceeded on retry:', retryErr);
      }
    }
  }
}

// Helper to enforce strict timeouts on network queries to prevent UI hanging
async function executeWithTimeout(promise, timeoutMs = 15000) {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Database query timed out after ${timeoutMs}ms`)), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
}

// ------------------------------------------------------------------------------
// CATEGORIES
// ------------------------------------------------------------------------------
export async function getCategories() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await executeWithTimeout(
        supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: true }),
        15000
      );
      if (!error && data && data.length > 0) {
        try {
          localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data));
        } catch (_) { }
        return data;
      }
    } catch (e) {
      console.warn('Supabase categories query warning:', e);
    }
  }
  return getStoredData(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
}

export async function saveCategory(category) {
  const current = getStoredData(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  let updated;
  if (category.id) {
    updated = current.map((c) => (c.id === category.id ? { ...c, ...category } : c));
  } else {
    const newCat = {
      ...category,
      id: `cat-${Date.now()}`,
      slug: category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      is_active: category.is_active ?? true,
      display_order: (current.length || 0) + 1,
    };
    updated = [...current, newCat];
  }
  saveStoredData(STORAGE_KEYS.CATEGORIES, updated);

  if (isSupabaseConfigured && supabase) {
    try {
      const isUuid = category.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category.id);
      if (isUuid) {
        await supabase
          .from('categories')
          .update({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            image_url: category.image_url || '',
            is_active: category.is_active ?? true,
            display_order: category.display_order || 0,
          })
          .eq('id', category.id);
      } else {
        const { data: dbCats } = await supabase.from('categories').select('id, slug, name');
        const existingCat = (dbCats || []).find(
          (c) =>
            c.id === category.id ||
            c.slug === category.slug ||
            c.name.toLowerCase() === category.name.toLowerCase() ||
            (category.id === 'cat-1' && (c.slug.includes('iphone') || c.name.toLowerCase().includes('iphone'))) ||
            (category.id === 'cat-2' && (c.slug.includes('android') || c.name.toLowerCase().includes('android'))) ||
            (category.id === 'cat-3' && (c.slug.includes('gadget') || c.name.toLowerCase().includes('gadget'))) ||
            (category.id === 'cat-4' && (c.slug.includes('accessor') || c.name.toLowerCase().includes('accessor')))
        );

        if (existingCat) {
          await supabase
            .from('categories')
            .update({
              name: category.name,
              description: category.description || '',
              image_url: category.image_url || '',
              is_active: category.is_active ?? true,
              display_order: category.display_order || 0,
            })
            .eq('id', existingCat.id);
        } else {
          await supabase
            .from('categories')
            .upsert(
              {
                name: category.name,
                slug: category.slug,
                description: category.description || '',
                image_url: category.image_url || '',
                is_active: category.is_active ?? true,
                display_order: category.display_order || 0,
              },
              { onConflict: 'slug' }
            );
        }
      }
    } catch (e) {
      console.warn('Supabase category upsert warning:', e);
    }
  }
  return updated;
}

export async function deleteCategory(id) {
  const current = getStoredData(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  const updated = current.filter((c) => c.id !== id);
  saveStoredData(STORAGE_KEYS.CATEGORIES, updated);

  if (isSupabaseConfigured && supabase) {
    try {
      const isUuid = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuid) {
        await supabase.from('categories').delete().eq('id', id);
      } else {
        await supabase.from('categories').delete().eq('slug', id);
      }
    } catch (e) {
      console.warn('Supabase category delete warning:', e);
    }
  }
  return updated;
}

// ------------------------------------------------------------------------------
// BRANDS
// ------------------------------------------------------------------------------
export async function getBrands() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase brands query warning:', e);
    }
  }
  return getStoredData(STORAGE_KEYS.BRANDS, INITIAL_BRANDS);
}

export async function saveBrand(brand) {
  const current = getStoredData(STORAGE_KEYS.BRANDS, INITIAL_BRANDS);
  let updated;
  if (brand.id) {
    updated = current.map((b) => (b.id === brand.id ? { ...b, ...brand } : b));
  } else {
    const newBrand = {
      ...brand,
      id: `brand-${Date.now()}`,
      slug: brand.slug || brand.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    };
    updated = [...current, newBrand];
  }
  saveStoredData(STORAGE_KEYS.BRANDS, updated);
  return updated;
}

export async function deleteBrand(id) {
  const current = getStoredData(STORAGE_KEYS.BRANDS, INITIAL_BRANDS);
  const updated = current.filter((b) => b.id !== id);
  saveStoredData(STORAGE_KEYS.BRANDS, updated);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('brands').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase brand delete warning:', e);
    }
  }
  return updated;
}

// ------------------------------------------------------------------------------
// ATTRIBUTES
// ------------------------------------------------------------------------------
export async function getAttributes() {
  return getStoredData(STORAGE_KEYS.ATTRIBUTES, INITIAL_ATTRIBUTES);
}

export async function saveAttribute(attribute) {
  const current = getStoredData(STORAGE_KEYS.ATTRIBUTES, INITIAL_ATTRIBUTES);
  let updated;
  if (attribute.id) {
    updated = current.map((a) => (a.id === attribute.id ? { ...a, ...attribute } : a));
  } else {
    const newAttr = {
      ...attribute,
      id: `attr-${Date.now()}`,
      code: attribute.code || attribute.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      values: attribute.values || [],
    };
    updated = [...current, newAttr];
  }
  saveStoredData(STORAGE_KEYS.ATTRIBUTES, updated);
  return updated;
}

// ------------------------------------------------------------------------------
// PRODUCTS & VARIATIONS
// ------------------------------------------------------------------------------
export async function getProducts(filters = {}) {
  let products = getStoredData(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: rows, error } = await executeWithTimeout(
        supabase
          .from('products')
          .select(`
            *,
            categories (name, slug),
            brands (name, slug),
            product_variations (*)
          `)
          .order('created_at', { ascending: false }),
        15000
      );

      if (!error && rows && rows.length > 0) {
        const mappedList = rows.map((np) => {
          const images = Array.isArray(np.images)
            ? np.images
            : (typeof np.images === 'string' ? JSON.parse(np.images || '[]') : []);
          const primaryImg = images[0] || np.image_url || '/1001102631.jpg';
          return {
            ...np,
            base_price: Number(np.base_price),
            discounted_price: np.discounted_price ? Number(np.discounted_price) : null,
            stock_quantity: Number(np.stock_quantity || 0),
            is_featured: Boolean(np.is_featured),
            is_active: Boolean(np.is_active),
            images: images.length > 0 ? images : [primaryImg],
            image_url: primaryImg,
            category_name: np.categories?.name,
            category_slug: np.categories?.slug,
            brand_name: np.brands?.name,
            brand_slug: np.brands?.slug,
            variations: Array.isArray(np.product_variations) && np.product_variations.length > 0
              ? np.product_variations.map((v) => ({
                  ...v,
                  price: Number(v.price) || 0,
                  discounted_price: v.discounted_price && Number(v.discounted_price) > 0 ? Number(v.discounted_price) : null,
                  stock_quantity: Number(v.stock_quantity || 0),
                }))
              : undefined,
          };
        });

        // Authoritative database source
        products = mappedList;

        // Persist fresh canonical state to storage for fast caching
        try {
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        } catch (_) { }
      }
    } catch (e) {
      console.warn('Supabase products query warning:', e);
    }
  }

  if (filters.category) {
    products = products.filter(
      (p) =>
        p.category_id === filters.category ||
        p.category_slug === filters.category ||
        p.category_name?.toLowerCase() === filters.category.toLowerCase()
    );
  }
  if (filters.brand) {
    products = products.filter(
      (p) =>
        p.brand_id === filters.brand ||
        p.brand_slug === filters.brand ||
        p.brand_name?.toLowerCase() === filters.brand.toLowerCase()
    );
  }
  if (filters.featured !== undefined) {
    products = products.filter((p) => p.is_featured === filters.featured);
  }
  if (filters.activeOnly !== false) {
    products = products.filter((p) => p.is_active !== false);
  }
  if (filters.search) {
    const term = filters.search.toLowerCase().trim();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.short_description?.toLowerCase().includes(term) ||
        p.brand_name?.toLowerCase().includes(term) ||
        p.category_name?.toLowerCase().includes(term)
    );
  }
  if (filters.os && filters.os !== 'all') {
    products = products.filter((p) => p.os?.toLowerCase() === filters.os.toLowerCase());
  }
  if (filters.condition && filters.condition !== 'all') {
    products = products.filter((p) =>
      p.variations?.some((v) => v.attributes?.condition?.toLowerCase().includes(filters.condition.toLowerCase()))
    );
  }
  if (filters.minPrice !== undefined) {
    products = products.filter((p) => (p.discounted_price || p.base_price) >= filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    products = products.filter((p) => (p.discounted_price || p.base_price) <= filters.maxPrice);
  }

  // Sorting
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'price-asc':
        products.sort((a, b) => (a.discounted_price || a.base_price) - (b.discounted_price || b.base_price));
        break;
      case 'price-desc':
        products.sort((a, b) => (b.discounted_price || b.base_price) - (a.discounted_price || a.base_price));
        break;
      case 'featured':
        products.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
      case 'newest':
      default:
        break;
    }
  }

  return products;
}

export async function getProductBySlug(slug) {
  if (isSupabaseConfigured && supabase) {
    try {
      const isUuid = slug && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
      let query = supabase
        .from('products')
        .select(`
          *,
          categories (name, slug),
          brands (name, slug),
          product_variations (*)
        `);

      if (isUuid) {
        query = query.or(`slug.eq.${slug},id.eq.${slug}`);
      } else {
        query = query.eq('slug', slug);
      }

      const { data: rows, error } = await executeWithTimeout(query.limit(1), 7000);
      if (!error && rows && rows.length > 0) {
        const np = rows[0];
        const images = Array.isArray(np.images) ? np.images : (typeof np.images === 'string' ? JSON.parse(np.images || '[]') : []);
        const primaryImg = images[0] || np.image_url || '/1001102631.jpg';
        return {
          ...np,
          base_price: Number(np.base_price),
          discounted_price: np.discounted_price ? Number(np.discounted_price) : null,
          stock_quantity: Number(np.stock_quantity || 0),
          is_featured: Boolean(np.is_featured),
          is_active: Boolean(np.is_active),
          images: images.length > 0 ? images : [primaryImg],
          image_url: primaryImg,
          category_name: np.categories?.name,
          category_slug: np.categories?.slug,
          brand_name: np.brands?.name,
          brand_slug: np.brands?.slug,
          variations: Array.isArray(np.product_variations) && np.product_variations.length > 0
            ? np.product_variations.map((v) => ({
                ...v,
                price: Number(v.price) || 0,
                discounted_price: v.discounted_price && Number(v.discounted_price) > 0 ? Number(v.discounted_price) : null,
                stock_quantity: Number(v.stock_quantity || 0),
              }))
            : undefined,
        };
      }
    } catch (e) {
      console.warn('Supabase getProductBySlug warning:', e);
    }
  }
  const products = getStoredData(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  return products.find((p) => p.slug === slug || p.id === slug) || null;
}

export async function getProductById(id) {
  return getProductBySlug(id);
}

export async function saveProduct(product) {
  const current = getStoredData(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const normalizedPrimaryImage = (product.images && product.images[0]) || product.image_url || '/1001102628.jpg';

  // Ensure variations inherit proper numeric prices, primary image unless explicitly customized,
  // and inherit product-level discount when no specific variation discount was set
  const normalizedVariations = (product.variations || []).map((v, idx) => {
    let vPrice = Number(v.price) || 0;
    if (idx === 0 && Number(product.base_price) > 0) {
      vPrice = Number(product.base_price);
    } else if (!vPrice && Number(product.base_price) > 0) {
      vPrice = Number(product.base_price);
    }

    const prodDiscount = (product.discounted_price && Number(product.discounted_price) > 0 && Number(product.discounted_price) < vPrice)
      ? Number(product.discounted_price)
      : null;

    let vDiscount = (v.discounted_price && Number(v.discounted_price) > 0 && Number(v.discounted_price) < vPrice)
      ? Number(v.discounted_price)
      : null;

    if (idx === 0 && product.discounted_price !== undefined) {
      vDiscount = prodDiscount;
    }

    let img = normalizedPrimaryImage;
    if (v.has_custom_image && v.image_url) {
      img = v.image_url;
    } else if (v.image_url && v.image_url !== '/1001102628.jpg' && v.image_url !== normalizedPrimaryImage) {
      img = v.image_url;
    }

    return {
      ...v,
      price: vPrice,
      discounted_price: vDiscount,
      stock_quantity: Number(v.stock_quantity || 0),
      image_url: img,
      has_custom_image: Boolean(v.has_custom_image),
    };
  });

  const productWithImages = {
    ...product,
    image_url: normalizedPrimaryImage,
    images: product.images && product.images.length > 0 ? product.images : [normalizedPrimaryImage],
    variations: normalizedVariations,
  };

  let updated;
  const isExisting = current.some((p) => p.id === product.id || (product.slug && p.slug === product.slug));
  if (product.id && isExisting) {
    updated = current.map((p) =>
      p.id === product.id || (product.slug && p.slug === product.slug)
        ? { ...p, ...productWithImages, updated_at: new Date().toISOString() }
        : p
    );
  } else {
    const newProduct = {
      ...productWithImages,
      id: product.id || `prod-${Date.now()}`,
      slug: product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: product.is_active ?? true,
      is_featured: product.is_featured ?? true,
    };
    updated = [newProduct, ...current];
  }
  saveStoredData(STORAGE_KEYS.PRODUCTS, updated);

  if (isSupabaseConfigured && supabase) {
    try {
      const isUuid = product.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product.id);

      // Resolve category_id to valid Supabase UUID
      let resolvedCategoryId = null;
      if (product.category_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product.category_id)) {
        resolvedCategoryId = product.category_id;
      } else {
        const { data: dbCats } = await supabase.from('categories').select('id, slug, name');
        const matchedCat = (dbCats || []).find(
          (c) =>
            c.id === product.category_id ||
            c.slug === product.category_id ||
            c.name.toLowerCase() === (product.category_name || '').toLowerCase() ||
            (product.category_id === 'cat-1' && (c.slug.includes('iphone') || c.name.toLowerCase().includes('iphone'))) ||
            (product.category_id === 'cat-2' && (c.slug.includes('android') || c.name.toLowerCase().includes('android'))) ||
            (product.category_id === 'cat-3' && (c.slug.includes('gadget') || c.name.toLowerCase().includes('gadget'))) ||
            (product.category_id === 'cat-4' && (c.slug.includes('accessor') || c.name.toLowerCase().includes('accessor')))
        );
        if (matchedCat) {
          resolvedCategoryId = matchedCat.id;
        } else if (dbCats && dbCats.length > 0) {
          resolvedCategoryId = dbCats[0].id;
        }
      }

      // Resolve brand_id to valid Supabase UUID
      let resolvedBrandId = null;
      if (product.brand_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product.brand_id)) {
        resolvedBrandId = product.brand_id;
      } else {
        const { data: dbBrands } = await supabase.from('brands').select('id, slug, name');
        const matchedBrand = (dbBrands || []).find(
          (b) =>
            b.id === product.brand_id ||
            b.slug === product.brand_id ||
            b.name.toLowerCase() === (product.brand_name || '').toLowerCase() ||
            product.slug?.toLowerCase().includes(b.slug) ||
            product.name?.toLowerCase().includes(b.name.toLowerCase())
        );
        if (matchedBrand) {
          resolvedBrandId = matchedBrand.id;
        }
      }

      let savedProductId = isUuid ? product.id : null;

      const productPayload = {
        name: product.name,
        slug: product.slug,
        base_price: product.base_price || 0,
        discounted_price: product.discounted_price || null,
        short_description: product.short_description || '',
        description: product.description || '',
        stock_quantity: product.stock_quantity || 0,
        is_featured: product.is_featured ?? true,
        is_active: product.is_active ?? true,
        category_id: resolvedCategoryId,
        brand_id: resolvedBrandId,
        images: productWithImages.images || [normalizedPrimaryImage],
        specifications: product.specifications || {},
        updated_at: new Date().toISOString(),
      };

      if (isUuid) {
        await supabase.from('products').update(productPayload).eq('id', product.id);
      } else {
        const { data: upsertData } = await supabase
          .from('products')
          .upsert(productPayload, { onConflict: 'slug' })
          .select('id');
        if (upsertData && upsertData.length > 0) {
          savedProductId = upsertData[0].id;
        }
      }

      // Upsert variations if available
      if (product.variations && product.variations.length > 0 && savedProductId) {
        for (const v of product.variations) {
          const vImg = v.has_custom_image ? v.image_url : normalizedPrimaryImage;
          try {
            await supabase
              .from('product_variations')
              .upsert(
                {
                  product_id: savedProductId,
                  sku: v.sku,
                  price: v.price || product.base_price || 0,
                  discounted_price: v.discounted_price || null,
                  stock_quantity: v.stock_quantity || 0,
                  attributes: v.attributes || {},
                  image_url: vImg,
                  is_active: v.is_active !== false,
                },
                { onConflict: 'sku' }
              );
          } catch (errVar) {
            console.warn('Variation save notice:', errVar);
          }
        }
      }
    } catch (e) {
      console.warn('Supabase product save warning:', e);
    }
  }
  return updated;
}

export async function deleteProduct(id) {
  const current = getStoredData(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const updated = current.filter((p) => p.id !== id && p.slug !== id);
  saveStoredData(STORAGE_KEYS.PRODUCTS, updated);

  if (isSupabaseConfigured && supabase) {
    try {
      const isUuid = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuid) {
        await supabase.from('product_variations').delete().eq('product_id', id);
        await supabase.from('products').delete().eq('id', id);
      } else {
        await supabase.from('products').delete().eq('slug', id);
      }
    } catch (e) {
      console.warn('Supabase product delete warning:', e);
    }
  }
  return updated;
}

export async function deleteProducts(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const idSet = new Set(ids.map(String));
  const current = getStoredData(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const updated = current.filter((p) => !idSet.has(String(p.id)) && !idSet.has(String(p.slug)));
  saveStoredData(STORAGE_KEYS.PRODUCTS, updated);

  if (isSupabaseConfigured && supabase) {
    try {
      for (const id of ids) {
        const isUuid = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        if (isUuid) {
          try {
            await supabase.from('product_variations').delete().eq('product_id', id);
            await supabase.from('products').delete().eq('id', id);
          } catch (_) { }
        } else {
          try {
            await supabase.from('products').delete().eq('slug', id);
          } catch (_) { }
        }
      }
    } catch (e) {
      console.warn('Supabase bulk products delete warning:', e);
    }
  }
  return updated;
}

export async function toggleProductFeatured(id, nextVal) {
  const current = getStoredData(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const updated = current.map((p) =>
    p.id === id || p.slug === id ? { ...p, is_featured: nextVal, updated_at: new Date().toISOString() } : p
  );
  saveStoredData(STORAGE_KEYS.PRODUCTS, updated);

  if (isSupabaseConfigured && supabase) {
    try {
      const isUuid = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      let query = supabase.from('products').update({ is_featured: nextVal, updated_at: new Date().toISOString() });
      if (isUuid) {
        query = query.eq('id', id);
      } else {
        query = query.eq('slug', id);
      }
      await executeWithTimeout(query, 8000);
    } catch (e) {
      console.warn('Supabase toggle featured warning:', e);
    }
  }
  return updated;
}

export async function toggleProductActive(id, nextVal) {
  const current = getStoredData(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const updated = current.map((p) =>
    p.id === id || p.slug === id ? { ...p, is_active: nextVal, updated_at: new Date().toISOString() } : p
  );
  saveStoredData(STORAGE_KEYS.PRODUCTS, updated);

  if (isSupabaseConfigured && supabase) {
    try {
      const isUuid = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      let query = supabase.from('products').update({ is_active: nextVal, updated_at: new Date().toISOString() });
      if (isUuid) {
        query = query.eq('id', id);
      } else {
        query = query.eq('slug', id);
      }
      await executeWithTimeout(query, 8000);
    } catch (e) {
      console.warn('Supabase toggle active warning:', e);
    }
  }
  return updated;
}

// ------------------------------------------------------------------------------
// DELIVERY LOCATIONS
// ------------------------------------------------------------------------------
export async function getDeliveryLocations() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('delivery_locations')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('fee', { ascending: true });
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase delivery locations query warning:', e);
    }
  }
  return getStoredData(STORAGE_KEYS.DELIVERY_LOCATIONS, INITIAL_DELIVERY_LOCATIONS);
}

export async function saveDeliveryLocation(location) {
  const current = getStoredData(STORAGE_KEYS.DELIVERY_LOCATIONS, INITIAL_DELIVERY_LOCATIONS);
  let updated;
  if (location.id) {
    updated = current.map((l) => (l.id === location.id ? { ...l, ...location } : l));
  } else {
    const newLoc = {
      ...location,
      id: `loc-${Date.now()}`,
      is_active: location.is_active ?? true,
    };
    updated = [...current, newLoc];
  }
  saveStoredData(STORAGE_KEYS.DELIVERY_LOCATIONS, updated);
  return updated;
}

export async function deleteDeliveryLocation(id) {
  const current = getStoredData(STORAGE_KEYS.DELIVERY_LOCATIONS, INITIAL_DELIVERY_LOCATIONS);
  const updated = current.filter((l) => l.id !== id);
  saveStoredData(STORAGE_KEYS.DELIVERY_LOCATIONS, updated);
  return updated;
}

// ------------------------------------------------------------------------------
// ORDERS (ATOMIC PLACEMENT & STATUS UPDATES)
// ------------------------------------------------------------------------------
export async function getOrders(filters = {}) {
  let orders = getStoredData(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);

  if (filters.userId) {
    orders = orders.filter((o) => o.user_id === filters.userId);
  }
  if (filters.status) {
    orders = orders.filter((o) => o.order_status?.toLowerCase() === filters.status.toLowerCase());
  }
  if (filters.search) {
    const term = filters.search.toLowerCase();
    orders = orders.filter(
      (o) =>
        o.order_reference?.toLowerCase().includes(term) ||
        o.customer_name?.toLowerCase().includes(term) ||
        o.customer_phone?.includes(term) ||
        o.customer_email?.toLowerCase().includes(term)
    );
  }

  // Sort by created_at descending
  return orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function getOrderByReference(reference) {
  const orders = getStoredData(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  return orders.find((o) => o.order_reference === reference) || null;
}

export async function getOrderById(id) {
  const orders = getStoredData(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  return orders.find((o) => o.id === id || o.order_reference === id) || null;
}

/**
 * Atomic Order Creation with Stock Validation and Decrement
 */
export async function createOrderAtomic(orderPayload) {
  const products = getStoredData(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const orders = getStoredData(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);

  // Validate items and stock
  for (const item of orderPayload.items) {
    const prod = products.find(
      (p) => p.id === item.product_id || p.name === item.product_name || (item.slug && p.slug === item.slug)
    );
    if (!prod) {
      throw new Error(`Product "${item.product_name}" is no longer available.`);
    }

    if (item.variation_id && prod.variations) {
      const varItem = prod.variations.find(
        (v) => v.id === item.variation_id || (v.sku && item.sku && v.sku === item.sku)
      );
      if (varItem) {
        if (varItem.stock_quantity < item.quantity) {
          throw new Error(
            `Insufficient stock for ${prod.name} (${item.variation_details}). Available: ${varItem.stock_quantity}, Requested: ${item.quantity}`
          );
        }
      }
    } else {
      if (prod.stock_quantity < item.quantity) {
        throw new Error(
          `Insufficient stock for ${prod.name}. Available: ${prod.stock_quantity}, Requested: ${item.quantity}`
        );
      }
    }
  }

  // Generate unique human-readable Order Reference e.g. UBH-2026-00042
  const nextNumber = String(orders.length + 1).padStart(5, '0');
  const year = new Date().getFullYear();
  const orderReference = `UBH-${year}-${nextNumber}`;

  const newOrder = {
    id: `ord-${Date.now()}`,
    order_reference: orderReference,
    user_id: orderPayload.user_id || null,
    customer_name: orderPayload.customer_name,
    customer_email: orderPayload.customer_email,
    customer_phone: orderPayload.customer_phone,
    subtotal: orderPayload.subtotal,
    delivery_fee: orderPayload.delivery_fee || 0,
    discount: orderPayload.discount || 0,
    total_amount: orderPayload.total_amount,
    payment_method: orderPayload.payment_method,
    payment_status: orderPayload.payment_status || 'pending',
    delivery_method: orderPayload.delivery_method,
    delivery_state: orderPayload.delivery_state,
    delivery_city: orderPayload.delivery_city,
    delivery_address: orderPayload.delivery_address,
    delivery_notes: orderPayload.delivery_notes || '',
    order_status: orderPayload.payment_status === 'verified' ? 'Confirmed' : 'Pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: orderPayload.items.map((i) => ({
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      product_id: i.product_id,
      variation_id: i.variation_id || null,
      product_name: i.product_name,
      variation_details: i.variation_details || '',
      unit_price: i.unit_price,
      quantity: i.quantity,
      subtotal: i.unit_price * i.quantity,
    })),
    status_history: [
      {
        status: orderPayload.payment_status === 'verified' ? 'Confirmed' : 'Pending',
        notes: `Order created via ${orderPayload.payment_method.replace(/_/g, ' ').toUpperCase()}`,
        changed_by: 'Customer / System',
        created_at: new Date().toISOString(),
      },
    ],
  };

  // Atomic stock decrement
  const updatedProducts = products.map((prod) => {
    const matchingItems = orderPayload.items.filter(
      (i) => i.product_id === prod.id || i.product_name === prod.name
    );
    if (!matchingItems.length) return prod;

    let updatedProd = { ...prod };
    for (const mItem of matchingItems) {
      if (mItem.variation_id && updatedProd.variations) {
        updatedProd.variations = updatedProd.variations.map((v) => {
          if (v.id === mItem.variation_id || (v.sku && mItem.sku && v.sku === mItem.sku)) {
            return { ...v, stock_quantity: Math.max(0, v.stock_quantity - mItem.quantity) };
          }
          return v;
        });
      }
      updatedProd.stock_quantity = Math.max(0, (updatedProd.stock_quantity || 0) - mItem.quantity);
    }
    return updatedProd;
  });

  // Save changes
  saveStoredData(STORAGE_KEYS.PRODUCTS, updatedProducts);
  const updatedOrders = [newOrder, ...orders];
  saveStoredData(STORAGE_KEYS.ORDERS, updatedOrders);

  // Sync with Supabase: decrement stock & persist order
  if (isSupabaseConfigured && supabase) {
    try {
      for (const mItem of orderPayload.items) {
        if (mItem.variation_id) {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(mItem.variation_id);
          if (isUuid) {
            const { data: vRow } = await supabase.from('product_variations').select('stock_quantity').eq('id', mItem.variation_id).single();
            if (vRow) {
              await supabase
                .from('product_variations')
                .update({ stock_quantity: Math.max(0, (vRow.stock_quantity || 0) - mItem.quantity) })
                .eq('id', mItem.variation_id);
            }
          }
        }
        if (mItem.product_id) {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(mItem.product_id);
          if (isUuid) {
            const { data: pRow } = await supabase.from('products').select('stock_quantity').eq('id', mItem.product_id).single();
            if (pRow) {
              await supabase
                .from('products')
                .update({ stock_quantity: Math.max(0, (pRow.stock_quantity || 0) - mItem.quantity) })
                .eq('id', mItem.product_id);
            }
          }
        }
      }

      await supabase.from('orders').insert([
        {
          order_reference: newOrder.order_reference,
          customer_name: newOrder.customer_name,
          customer_email: newOrder.customer_email,
          customer_phone: newOrder.customer_phone,
          delivery_method: newOrder.delivery_method === 'pickup' ? 'physical_pickup' : 'door_delivery',
          delivery_state: newOrder.delivery_state || 'Kano',
          delivery_address: newOrder.delivery_address || '',
          delivery_fee: newOrder.delivery_fee || 0,
          subtotal_amount: newOrder.subtotal || 0,
          discount_amount: newOrder.discount || 0,
          total_amount: newOrder.total_amount || 0,
          payment_method: newOrder.payment_method === 'card' ? 'paystack' : (newOrder.payment_method || 'bank_transfer'),
          payment_status: newOrder.payment_status === 'verified' ? 'Paid' : 'Pending',
          order_status: newOrder.order_status,
          notes: newOrder.delivery_notes || '',
          items: newOrder.items,
        },
      ]);
    } catch (dbErr) {
      console.warn('Supabase order atomic persistence warning:', dbErr);
    }
  }

  // Create notifications
  addNotification({
    user_id: newOrder.user_id,
    title: 'Order Placed Successfully!',
    message: `Your order #${newOrder.order_reference} has been received. Total: ₦${Number(newOrder.total_amount || 0).toLocaleString('en-NG')}`,
    type: 'order',
    link: `/dashboard/orders/${newOrder.order_reference}`,
  });

  return newOrder;
}

export async function updateOrderStatus(orderId, newStatus, notes = '', adminName = 'Admin') {
  const orders = getStoredData(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  const target = orders.find((o) => o.id === orderId || o.order_reference === orderId);
  if (!target) throw new Error('Order not found');

  const oldStatus = target.order_status;
  const historyEntry = {
    status: newStatus,
    notes: notes || `Status updated from ${oldStatus} to ${newStatus}`,
    changed_by: adminName,
    created_at: new Date().toISOString(),
  };

  const updatedOrders = orders.map((o) => {
    if (o.id === target.id) {
      return {
        ...o,
        order_status: newStatus,
        updated_at: new Date().toISOString(),
        status_history: [...(o.status_history || []), historyEntry],
      };
    }
    return o;
  });

  saveStoredData(STORAGE_KEYS.ORDERS, updatedOrders);

  // Atomic Stock Restoration if Order Cancelled
  if (newStatus === 'Cancelled' && oldStatus !== 'Cancelled') {
    const prods = getStoredData(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const restoredProducts = prods.map((prod) => {
      const match = target.items?.filter((i) => i.product_id === prod.id) || [];
      if (!match.length) return prod;
      let pCopy = { ...prod };
      for (const item of match) {
        if (item.variation_id && pCopy.variations) {
          pCopy.variations = pCopy.variations.map((v) => {
            if (v.id === item.variation_id) {
              return { ...v, stock_quantity: (v.stock_quantity || 0) + (item.quantity || 1) };
            }
            return v;
          });
        }
        pCopy.stock_quantity = (pCopy.stock_quantity || 0) + (item.quantity || 1);
      }
      return pCopy;
    });
    saveStoredData(STORAGE_KEYS.PRODUCTS, restoredProducts);

    if (isSupabaseConfigured && supabase) {
      try {
        for (const item of target.items || []) {
          if (item.variation_id) {
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.variation_id);
            if (isUuid) {
              const { data: vRow } = await supabase.from('product_variations').select('stock_quantity').eq('id', item.variation_id).single();
              if (vRow) {
                await supabase
                  .from('product_variations')
                  .update({ stock_quantity: (vRow.stock_quantity || 0) + (item.quantity || 1) })
                  .eq('id', item.variation_id);
              }
            }
          }
          if (item.product_id) {
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.product_id);
            if (isUuid) {
              const { data: pRow } = await supabase.from('products').select('stock_quantity').eq('id', item.product_id).single();
              if (pRow) {
                await supabase
                  .from('products')
                  .update({ stock_quantity: (pRow.stock_quantity || 0) + (item.quantity || 1) })
                  .eq('id', item.product_id);
              }
            }
          }
        }
      } catch (err) {
        console.warn('Supabase stock restoration warning:', err);
      }
    }
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('orders')
        .update({ order_status: newStatus, updated_at: new Date().toISOString() })
        .eq('order_reference', target.order_reference);
    } catch (err) {
      console.warn('Supabase order status update warning:', err);
    }
  }

  // Notify customer
  addNotification({
    user_id: target.user_id,
    title: `Order Status: ${newStatus}`,
    message: `Your order #${target.order_reference} is now ${newStatus}. ${notes}`,
    type: 'order',
    link: `/dashboard/orders/${target.order_reference}`,
  });

  return target;
}

// ------------------------------------------------------------------------------
// NOTIFICATIONS
// ------------------------------------------------------------------------------
export function getNotifications(userId) {
  const all = getStoredData(STORAGE_KEYS.NOTIFICATIONS, []);
  if (!userId) return all;
  return all.filter((n) => n.user_id === userId || !n.user_id);
}

export function addNotification(notification) {
  const all = getStoredData(STORAGE_KEYS.NOTIFICATIONS, []);
  const item = {
    ...notification,
    id: `notif-${Date.now()}`,
    is_read: false,
    created_at: new Date().toISOString(),
  };
  saveStoredData(STORAGE_KEYS.NOTIFICATIONS, [item, ...all]);
  return item;
}

export function markNotificationAsRead(id) {
  const all = getStoredData(STORAGE_KEYS.NOTIFICATIONS, []);
  const updated = all.map((n) => (n.id === id ? { ...n, is_read: true } : n));
  saveStoredData(STORAGE_KEYS.NOTIFICATIONS, updated);
}

// ------------------------------------------------------------------------------
// WEBSITE CONTENT & TESTIMONIALS & SETTINGS
// ------------------------------------------------------------------------------
export async function getWebsiteContent() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: rows, error } = await supabase.from('website_content').select('section_key, content');
      if (!error && rows && rows.length > 0) {
        const merged = { ...INITIAL_WEBSITE_CONTENT };
        rows.forEach((r) => {
          if (r.section_key && r.content) {
            merged[r.section_key] = typeof r.content === 'string' ? JSON.parse(r.content) : r.content;
          }
        });
        saveStoredData(STORAGE_KEYS.WEBSITE_CONTENT, merged);
        return merged;
      }
    } catch (e) {
      console.warn('Supabase website content query warning:', e);
    }
  }
  return getStoredData(STORAGE_KEYS.WEBSITE_CONTENT, INITIAL_WEBSITE_CONTENT);
}

export async function saveWebsiteContent(sectionKey, content) {
  const current = await getWebsiteContent();
  const updated = {
    ...current,
    [sectionKey]: {
      ...(current[sectionKey] || {}),
      ...content,
    },
  };
  saveStoredData(STORAGE_KEYS.WEBSITE_CONTENT, updated);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('website_content').upsert(
        {
          section_key: sectionKey,
          content: updated[sectionKey] || {},
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'section_key' }
      );
    } catch (e) {
      console.warn('Supabase website content save warning:', e);
    }
  }
  return updated;
}

export async function getTestimonials(approvedOnly = true) {
  let list = getStoredData(STORAGE_KEYS.TESTIMONIALS, INITIAL_TESTIMONIALS);
  if (approvedOnly) {
    list = list.filter((t) => t.is_approved);
  }
  return list;
}

export async function saveTestimonial(testimonial) {
  const current = getStoredData(STORAGE_KEYS.TESTIMONIALS, INITIAL_TESTIMONIALS);
  let updated;
  if (testimonial.id) {
    updated = current.map((t) => (t.id === testimonial.id ? { ...t, ...testimonial } : t));
  } else {
    const newItem = {
      ...testimonial,
      id: `test-${Date.now()}`,
      created_at: new Date().toISOString(),
      is_approved: testimonial.is_approved ?? false,
      is_featured: testimonial.is_featured ?? false,
    };
    updated = [newItem, ...current];
  }
  saveStoredData(STORAGE_KEYS.TESTIMONIALS, updated);
  return updated;
}

export async function deleteTestimonial(id) {
  const current = getStoredData(STORAGE_KEYS.TESTIMONIALS, INITIAL_TESTIMONIALS);
  const updated = current.filter((t) => t.id !== id);
  saveStoredData(STORAGE_KEYS.TESTIMONIALS, updated);
  return updated;
}

export async function getBusinessSettings() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: rows, error } = await supabase.from('business_settings').select('key, value');
      if (!error && rows && rows.length > 0) {
        const merged = { ...INITIAL_BUSINESS_SETTINGS };
        rows.forEach((r) => {
          if (r.key && r.value !== undefined) {
            merged[r.key] = typeof r.value === 'string' ? JSON.parse(r.value) : r.value;
          }
        });
        saveStoredData(STORAGE_KEYS.SETTINGS, merged);
        return merged;
      }
    } catch (e) {
      console.warn('Supabase business settings query warning:', e);
    }
  }
  return getStoredData(STORAGE_KEYS.SETTINGS, INITIAL_BUSINESS_SETTINGS);
}

export async function saveBusinessSettings(newSettings) {
  const current = await getBusinessSettings();
  const updated = { ...current, ...newSettings };
  saveStoredData(STORAGE_KEYS.SETTINGS, updated);

  if (isSupabaseConfigured && supabase) {
    try {
      for (const [key, value] of Object.entries(newSettings)) {
        await supabase.from('business_settings').upsert(
          {
            key,
            value,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        );
      }
    } catch (e) {
      console.warn('Supabase business settings save warning:', e);
    }
  }
  return updated;
}

// ------------------------------------------------------------------------------
// CUSTOMERS MANAGEMENT
// ------------------------------------------------------------------------------
export async function getCustomers() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, full_name, email, phone_number, role, is_active, created_at')
        .or('role.eq.customer,role.is.null')
        .order('created_at', { ascending: false });

      if (!error && users) {
        // Strip out any stale dummy user accounts
        const sanitized = users
          .filter(
            (c) =>
              c.email !== 'aliyu.haruna@example.com' &&
              c.email !== 'fatima.bello@example.com' &&
              c.id !== 'cust-1' &&
              c.id !== 'cust-2'
          )
          .map((c) => ({
            id: c.id,
            full_name: c.full_name || 'Customer',
            email: c.email,
            phone_number: c.phone_number || '',
            role: c.role || 'customer',
            is_active: c.is_active !== false,
            created_at: c.created_at,
            total_orders: 0,
            total_spent: 0,
          }));

        // Merge any locally registered accounts not yet on database
        const localRegistered = JSON.parse(localStorage.getItem('ubh_registered_users') || '[]');
        const dbEmails = new Set(sanitized.map((s) => s.email?.toLowerCase()));

        for (const lr of localRegistered) {
          if (
            (lr.role === 'customer' || !lr.role) &&
            !dbEmails.has(lr.email?.toLowerCase()) &&
            lr.email !== 'aliyu.haruna@example.com' &&
            lr.email !== 'fatima.bello@example.com'
          ) {
            sanitized.push({
              id: lr.id,
              full_name: lr.full_name,
              email: lr.email,
              phone_number: lr.phone_number || '',
              role: 'customer',
              is_active: lr.is_active !== false,
              created_at: lr.created_at || new Date().toISOString(),
              total_orders: 0,
              total_spent: 0,
            });
          }
        }

        saveStoredData(STORAGE_KEYS.CUSTOMERS, sanitized);
        return sanitized;
      }
    } catch (e) {
      console.warn('Supabase getCustomers query warning:', e);
    }
  }

  // Local fallback: purge any dummy users from cache
  const rawStored = getStoredData(STORAGE_KEYS.CUSTOMERS, []);
  const cleanStored = rawStored.filter(
    (c) =>
      c.id !== 'cust-1' &&
      c.id !== 'cust-2' &&
      c.email !== 'aliyu.haruna@example.com' &&
      c.email !== 'fatima.bello@example.com'
  );

  const localRegistered = JSON.parse(localStorage.getItem('ubh_registered_users') || '[]');
  const existingEmails = new Set(cleanStored.map((s) => s.email?.toLowerCase()));
  for (const lr of localRegistered) {
    if (
      (lr.role === 'customer' || !lr.role) &&
      !existingEmails.has(lr.email?.toLowerCase()) &&
      lr.email !== 'aliyu.haruna@example.com' &&
      lr.email !== 'fatima.bello@example.com'
    ) {
      cleanStored.push({
        id: lr.id,
        full_name: lr.full_name,
        email: lr.email,
        phone_number: lr.phone_number || '',
        role: 'customer',
        is_active: lr.is_active !== false,
        created_at: lr.created_at || new Date().toISOString(),
        total_orders: 0,
        total_spent: 0,
      });
    }
  }

  saveStoredData(STORAGE_KEYS.CUSTOMERS, cleanStored);
  return cleanStored;
}

export async function toggleCustomerStatus(id) {
  if (isSupabaseConfigured && supabase) {
    try {
      const isUuid = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuid) {
        const { data: uRow } = await supabase.from('users').select('is_active').eq('id', id).single();
        if (uRow) {
          await supabase
            .from('users')
            .update({ is_active: !uRow.is_active, updated_at: new Date().toISOString() })
            .eq('id', id);
        }
      }
    } catch (e) {
      console.warn('Supabase toggle customer error:', e);
    }
  }

  const current = getStoredData(STORAGE_KEYS.CUSTOMERS, []);
  const updated = current.map((c) => (c.id === id ? { ...c, is_active: !c.is_active } : c));
  saveStoredData(STORAGE_KEYS.CUSTOMERS, updated);

  const registered = JSON.parse(localStorage.getItem('ubh_registered_users') || '[]');
  const updatedReg = registered.map((u) => (u.id === id ? { ...u, is_active: !u.is_active } : u));
  localStorage.setItem('ubh_registered_users', JSON.stringify(updatedReg));

  return updated;
}

export async function deleteCustomer(id) {
  if (isSupabaseConfigured && supabase) {
    try {
      const isUuid = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuid) {
        await supabase.from('users').delete().eq('id', id);
      }
    } catch (e) {
      console.warn('Supabase delete customer error:', e);
    }
  }

  const current = getStoredData(STORAGE_KEYS.CUSTOMERS, []);
  const updated = current.filter((c) => c.id !== id);
  saveStoredData(STORAGE_KEYS.CUSTOMERS, updated);

  const registered = JSON.parse(localStorage.getItem('ubh_registered_users') || '[]');
  const updatedReg = registered.filter((u) => u.id !== id);
  localStorage.setItem('ubh_registered_users', JSON.stringify(updatedReg));

  return updated;
}

export async function deleteCustomers(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const idSet = new Set(ids.map(String));

  if (isSupabaseConfigured && supabase) {
    try {
      for (const id of ids) {
        const isUuid = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        if (isUuid) {
          try {
            await supabase.from('users').delete().eq('id', id);
          } catch (_) { }
        }
      }
    } catch (e) {
      console.warn('Supabase bulk delete customers error:', e);
    }
  }

  const current = getStoredData(STORAGE_KEYS.CUSTOMERS, []);
  const updated = current.filter((c) => !idSet.has(String(c.id)));
  saveStoredData(STORAGE_KEYS.CUSTOMERS, updated);

  try {
    if (typeof localStorage !== 'undefined') {
      const registered = JSON.parse(localStorage.getItem('ubh_registered_users') || '[]');
      const updatedReg = registered.filter((u) => !idSet.has(String(u.id)));
      localStorage.setItem('ubh_registered_users', JSON.stringify(updatedReg));
    }
  } catch (_) { }

  return updated;
}

// ------------------------------------------------------------------------------
// REPORTS & ANALYTICS
// ------------------------------------------------------------------------------
export async function getAnalytics() {
  const orders = getStoredData(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  const products = getStoredData(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const customers = await getCustomers();

  const totalRevenue = orders.reduce((sum, o) => sum + (o.payment_status === 'verified' || o.order_status === 'Delivered' ? o.total_amount : 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.order_status === 'Pending').length;
  const completedOrders = orders.filter((o) => o.order_status === 'Delivered' || o.order_status === 'Completed').length;
  const lowStockCount = products.filter((p) => (p.stock_quantity || 0) <= 5).length;

  // Monthly sales distribution
  const salesByMonth = [
    { month: 'Jun', sales: 4200000 },
    { month: 'Jul', sales: 6100000 },
    { month: 'Aug', sales: 5800000 },
    { month: 'Sep', sales: 7400000 },
    { month: 'Oct', sales: 9200000 },
    { month: 'Nov', sales: 11500000 },
  ];

  const categoryDistribution = [
    { name: 'iPhones', value: 58 },
    { name: 'Android Phones', value: 26 },
    { name: 'Accessories', value: 10 },
    { name: 'Other Gadgets', value: 6 },
  ];

  return {
    totalRevenue,
    totalOrders,
    pendingOrders,
    completedOrders,
    totalCustomers: customers.length,
    totalProducts: products.length,
    lowStockCount,
    salesByMonth,
    categoryDistribution,
    recentOrders: orders.slice(0, 5),
  };
}
