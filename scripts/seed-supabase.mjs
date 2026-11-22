import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import {
  INITIAL_CATEGORIES,
  INITIAL_BRANDS,
  INITIAL_PRODUCTS,
  INITIAL_DELIVERY_LOCATIONS,
  INITIAL_WEBSITE_CONTENT,
  INITIAL_BUSINESS_SETTINGS,
} from '../src/services/initialData.js';

// Parse .env manually if available
let envVars = {};
try {
  const envContent = fs.readFileSync(path.resolve('.env'), 'utf-8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        envVars[key] = val;
      }
    }
  });
} catch (_) {}

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  envVars.VITE_SUPABASE_URL ||
  'https://rewguroxxexcboxoywdt.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  envVars.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_JI9lDRqrKsWKNcWAgj7c0g__GMXVhep';

console.log('Connecting to Supabase at:', SUPABASE_URL);
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SEED_USERS = [
  {
    email: 'admin@ubanharkalla.com',
    password_hash: 'admin123',
    full_name: 'UBAN HARKALLA Super Admin',
    phone_number: '08123456789',
    role: 'super_admin',
    is_active: true,
  },
  {
    email: 'inventory@ubanharkalla.com',
    password_hash: 'admin123',
    full_name: 'Store Inventory Manager',
    phone_number: '08022223344',
    role: 'admin',
    is_active: true,
  },
  {
    email: 'customer@ubanharkalla.com',
    password_hash: 'customer123',
    full_name: 'Musa Abdullahi',
    phone_number: '08098765432',
    role: 'customer',
    is_active: true,
  },
  {
    email: 'abubakar@test.ng',
    password_hash: 'Password123!',
    full_name: 'Abubakar Garba',
    phone_number: '08031234567',
    role: 'customer',
    is_active: true,
  },
  {
    email: 'chidi@test.ng',
    password_hash: 'Password123!',
    full_name: 'Chidi Eze',
    phone_number: '08129876543',
    role: 'customer',
    is_active: true,
  },
  {
    email: 'suspended@test.ng',
    password_hash: 'Password123!',
    full_name: 'Suspended Account',
    phone_number: '07011223344',
    role: 'customer',
    is_active: false,
  },
];

async function seed() {
  console.log('Starting full database seed...');
  try {
    // 1. Seed Users
    console.log('Upserting users...');
    const { data: userData, error: userErr } = await supabase
      .from('users')
      .upsert(SEED_USERS, { onConflict: 'email' })
      .select();
    if (userErr) console.warn('Users seed error:', userErr.message);
    else console.log(`✓ Seeded ${userData?.length || 0} users.`);

    // 2. Seed Categories
    console.log('Upserting categories...');
    const categoriesPayload = INITIAL_CATEGORIES.map((c) => ({
      name: c.name,
      slug: c.slug,
      description: c.description || '',
      image_url: c.image_url || '',
      is_active: c.is_active ?? true,
      display_order: c.display_order || 0,
    }));
    const { data: catData, error: catErr } = await supabase
      .from('categories')
      .upsert(categoriesPayload, { onConflict: 'slug' })
      .select();
    if (catErr) console.warn('Categories seed error:', catErr.message);
    else console.log(`✓ Seeded ${catData?.length || 0} categories.`);

    // 3. Seed Brands
    console.log('Upserting brands...');
    const brandsPayload = INITIAL_BRANDS.map((b, idx) => ({
      name: b.name,
      slug: b.slug,
      logo_url: b.logo_url || '',
      display_order: idx + 1,
      is_active: true,
    }));
    const { data: brandData, error: brandErr } = await supabase
      .from('brands')
      .upsert(brandsPayload, { onConflict: 'slug' })
      .select();
    if (brandErr) console.warn('Brands seed error:', brandErr.message);
    else console.log(`✓ Seeded ${brandData?.length || 0} brands.`);

    // Map Category IDs & Brand IDs
    const catMap = new Map((catData || []).map((c) => [c.slug, c.id]));
    const brandMap = new Map((brandData || []).map((b) => [b.slug, b.id]));

    // 4. Seed Products & Variations
    console.log('Upserting products & variations...');
    for (const prod of INITIAL_PRODUCTS) {
      let catId = catMap.get(prod.category_slug) || catMap.get(prod.category_id?.replace('cat-', ''));
      if (!catId) {
        if (prod.category_name?.toLowerCase().includes('iphone')) catId = catMap.get('iphones');
        else if (prod.category_name?.toLowerCase().includes('android')) catId = catMap.get('android-phones');
        else if (prod.category_name?.toLowerCase().includes('gadget')) catId = catMap.get('gadgets');
        else if (prod.category_name?.toLowerCase().includes('accessor')) catId = catMap.get('accessories');
      }

      let brandId = brandMap.get(prod.brand_slug) || brandMap.get(prod.brand_id?.replace('brand-', ''));
      if (!brandId) {
        brandId = brandMap.get(prod.brand_name?.toLowerCase());
      }

      const prodPayload = {
        name: prod.name,
        slug: prod.slug,
        base_price: prod.base_price || 0,
        discounted_price: prod.discounted_price || null,
        short_description: prod.short_description || '',
        description: prod.description || '',
        stock_quantity: prod.stock_quantity || 0,
        is_featured: prod.is_featured ?? true,
        is_active: prod.is_active ?? true,
        category_id: catId || null,
        brand_id: brandId || null,
        images: prod.images || [prod.image_url || '/1001102631.jpg'],
        specifications: prod.specifications || {},
      };

      const { data: savedProds, error: prodErr } = await supabase
        .from('products')
        .upsert(prodPayload, { onConflict: 'slug' })
        .select();

      if (prodErr) {
        console.warn(`Product ${prod.name} save error:`, prodErr.message);
        continue;
      }

      const savedProd = savedProds?.[0];
      if (savedProd && prod.variations?.length) {
        for (const v of prod.variations) {
          const varPayload = {
            product_id: savedProd.id,
            sku: v.sku,
            price: v.price || prod.base_price || 0,
            discounted_price: v.discounted_price || null,
            stock_quantity: v.stock_quantity || 0,
            attributes: v.attributes || {},
            image_url: v.image_url || prod.image_url || '/1001102631.jpg',
            is_active: v.is_active !== false,
          };
          const { error: varErr } = await supabase
            .from('product_variations')
            .upsert(varPayload, { onConflict: 'sku' });
          if (varErr) console.warn(`Variation ${v.sku} error:`, varErr.message);
        }
      }
    }
    console.log(`✓ Seeded ${INITIAL_PRODUCTS.length} products and variations.`);

    // 5. Seed Delivery Locations
    console.log('Upserting delivery locations...');
    const { data: existingLocs } = await supabase.from('delivery_locations').select('id, state');
    if (!existingLocs || existingLocs.length === 0) {
      const locPayload = INITIAL_DELIVERY_LOCATIONS.map((l, idx) => ({
        state: l.state,
        city: l.city,
        fee: l.fee || 0,
        display_order: idx + 1,
        estimated_delivery: l.estimated_delivery || '1-3 days',
        is_active: true,
      }));
      await supabase.from('delivery_locations').insert(locPayload);
      console.log(`✓ Seeded ${locPayload.length} delivery locations.`);
    } else {
      console.log(`✓ Delivery locations already present (${existingLocs.length}).`);
    }

    // 6. Seed Website Content
    console.log('Upserting website content...');
    for (const [key, val] of Object.entries(INITIAL_WEBSITE_CONTENT)) {
      await supabase.from('website_content').upsert(
        { section_key: key, content: val },
        { onConflict: 'section_key' }
      );
    }
    console.log('✓ Seeded website content sections.');

    // 7. Seed Business Settings
    console.log('Upserting business settings...');
    for (const [key, val] of Object.entries(INITIAL_BUSINESS_SETTINGS)) {
      await supabase.from('business_settings').upsert(
        { key, value: val },
        { onConflict: 'key' }
      );
    }
    console.log('✓ Seeded business settings.');

    console.log('🎉 FULL SUPABASE SEEDING COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('Fatal seeding error:', err);
  }
}

seed();
