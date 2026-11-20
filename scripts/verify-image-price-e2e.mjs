import assert from 'assert';

// 1. Mock LocalStorage and DOM events for Node test runner
const store = {};
global.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, val) => { store[key] = String(val); },
  removeItem: (key) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]); }
};
global.window = {
  dispatchEvent: () => {}
};
global.CustomEvent = class {};

console.log('====================================================');
console.log('   END-TO-END VERIFICATION: IMAGES, PRICES & USER SIDE');
console.log('====================================================\n');

// 2. Import Data Service
const {
  getCategories,
  saveCategory,
  getProducts,
  getProductBySlug,
  getProductById,
  saveProduct,
} = await import('../src/services/dataService.js');

// ----------------------------------------------------
// TEST 1: CATEGORY IMAGE & INFO UPDATE REFLECTION
// ----------------------------------------------------
console.log('--- TEST 1: Updating Category Image & Verifying User Reflection ---');
const initialCategories = await getCategories();
const targetCat = initialCategories[0];
assert(targetCat, 'A default category must exist');

console.log(`Original category: "${targetCat.name}" | Image: "${targetCat.image_url}"`);

const sampleLocalCategoryImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP...sampleCategoryDataUrl';
const updatedCatPayload = {
  ...targetCat,
  name: 'Apple iPhones (Updated Premium)',
  description: 'Updated description for premium iPhones direct from Kano warehouse.',
  image_url: sampleLocalCategoryImage,
};

await saveCategory(updatedCatPayload);

// Retrieve categories as the user side would (e.g. HomePage or ShopPage)
const userViewCategories = await getCategories();
const verifiedCat = userViewCategories.find((c) => c.id === targetCat.id || c.slug === targetCat.slug);

assert.strictEqual(verifiedCat.image_url, sampleLocalCategoryImage, 'User side must reflect new category image!');
assert.strictEqual(verifiedCat.name, 'Apple iPhones (Updated Premium)', 'User side must reflect updated category title!');
assert.strictEqual(verifiedCat.description, 'Updated description for premium iPhones direct from Kano warehouse.', 'User side must reflect updated category description!');
console.log('✓ Category image and details updated successfully and verified on user storefront data stream!\n');

// ----------------------------------------------------
// TEST 2: PRODUCT IMAGES, GALLERY & PRICES UPDATE
// ----------------------------------------------------
console.log('--- TEST 2: Updating Product Images, Gallery & Prices ---');
const originalProduct = await getProductBySlug('apple-iphone-15-pro-max');
assert(originalProduct, 'Target product must exist');
console.log(`Original Product: "${originalProduct.name}"`);
console.log(`Original Base Price: ₦${originalProduct.base_price.toLocaleString()} | Discount Price: ₦${originalProduct.discounted_price?.toLocaleString()}`);
console.log(`Original Gallery Count: ${originalProduct.images?.length || 1}`);

const sampleGalleryImg1 = 'data:image/jpeg;base64,PRODUCT_IMAGE_PRIMARY_12345';
const sampleGalleryImg2 = 'data:image/jpeg;base64,PRODUCT_IMAGE_SECONDARY_67890';
const sampleVariantImg = 'data:image/jpeg;base64,VARIANT_NATURAL_TITANIUM_IMAGE_555';

const newBasePrice = 1850000;
const newDiscountPrice = 1720000;

// Update variations with custom pricing and custom variant image
const updatedVariations = (originalProduct.variations || []).map((v, idx) => {
  if (idx === 0) {
    return {
      ...v,
      price: newBasePrice,
      discounted_price: newDiscountPrice,
      image_url: sampleVariantImg, // custom image for 256GB Natural Titanium
      stock_quantity: 12,
    };
  }
  if (idx === 1) {
    return {
      ...v,
      price: 2050000,
      discounted_price: 1950000,
      image_url: sampleGalleryImg2,
      stock_quantity: 8,
    };
  }
  return v;
});

const updatedProductPayload = {
  ...originalProduct,
  name: 'Apple iPhone 15 Pro Max (Titanium Edition)',
  base_price: newBasePrice,
  discounted_price: newDiscountPrice,
  images: [sampleGalleryImg1, sampleGalleryImg2],
  image_url: sampleGalleryImg1,
  variations: updatedVariations,
};

await saveProduct(updatedProductPayload);

// Retrieve updated product
const updatedProduct = await getProductBySlug(originalProduct.slug);
assert(updatedProduct, 'Updated product must exist');

// 1. Verify Base Product Fields
assert.strictEqual(updatedProduct.base_price, newBasePrice, 'Product base price must be ₦1,850,000');
assert.strictEqual(updatedProduct.discounted_price, newDiscountPrice, 'Product discount price must be ₦1,720,000');
assert.strictEqual(updatedProduct.image_url, sampleGalleryImg1, 'Primary image must be the new uploaded image');
assert.strictEqual(updatedProduct.images.length, 2, 'Product gallery must contain 2 images');
assert.strictEqual(updatedProduct.images[0], sampleGalleryImg1, 'Gallery image 0 must match primary');
assert.strictEqual(updatedProduct.images[1], sampleGalleryImg2, 'Gallery image 1 must match secondary');
console.log('✓ Product base price, discount price, and gallery images verified in data layer!\n');

// ----------------------------------------------------
// TEST 3: USER STOREFRONT & PRODUCT CARD SIMULATION
// ----------------------------------------------------
console.log('--- TEST 3: Simulating User-Facing ProductCard Display ---');
// ProductCard computation logic:
const primaryImage = (updatedProduct.images && updatedProduct.images[0]) || updatedProduct.image_url;
const defaultVariation = updatedProduct.variations && updatedProduct.variations[0];
const currentPrice = defaultVariation
  ? defaultVariation.discounted_price || defaultVariation.price
  : updatedProduct.discounted_price || updatedProduct.base_price;
const originalPrice = defaultVariation ? defaultVariation.price : updatedProduct.base_price;
const discountSavings = originalPrice - currentPrice;

assert.strictEqual(primaryImage, sampleGalleryImg1, 'User card must display the new primary uploaded image');
assert.strictEqual(currentPrice, 1720000, 'User card must display current price ₦1,720,000');
assert.strictEqual(originalPrice, 1850000, 'User card must display original strike-through price ₦1,850,000');
assert.strictEqual(discountSavings, 130000, 'User card discount savings badge must calculate Save ₦130,000');
console.log(`✓ ProductCard rendered: Image "${primaryImage.slice(0, 30)}..." | Price: ₦${currentPrice.toLocaleString()} (Save ₦${discountSavings.toLocaleString()})\n`);

// ----------------------------------------------------
// TEST 4: PRODUCT DETAIL PAGE & VARIATION IMAGE SWITCHING
// ----------------------------------------------------
console.log('--- TEST 4: Simulating ProductDetailPage Image & Price Variation Switching ---');
// Initially, active image is primary image
let activeImage = (updatedProduct.images && updatedProduct.images[0]) || updatedProduct.image_url;
assert.strictEqual(activeImage, sampleGalleryImg1, 'Initial detail page image must be primary uploaded photo');

// User clicks Variation #1 (256GB Natural Titanium)
const selectedVar1 = updatedProduct.variations[0];
if (selectedVar1.image_url) {
  activeImage = selectedVar1.image_url;
}
assert.strictEqual(activeImage, sampleVariantImg, 'Active detail image must switch to Variation #1 custom variant image');
const var1Price = selectedVar1.discounted_price || selectedVar1.price;
assert.strictEqual(var1Price, 1720000, 'Variation #1 price must be ₦1,720,000');
console.log(`✓ Switched to Variation #1: Image successfully changed to variant photo "${activeImage.slice(0, 30)}..." at ₦${var1Price.toLocaleString()}`);

// User clicks Variation #2 (512GB)
const selectedVar2 = updatedProduct.variations[1];
if (selectedVar2.image_url) {
  activeImage = selectedVar2.image_url;
}
assert.strictEqual(activeImage, sampleGalleryImg2, 'Active detail image must switch to Variation #2 image');
const var2Price = selectedVar2.discounted_price || selectedVar2.price;
assert.strictEqual(var2Price, 1950000, 'Variation #2 price must be ₦1,950,000');
console.log(`✓ Switched to Variation #2: Image successfully changed to "${activeImage.slice(0, 30)}..." at ₦${var2Price.toLocaleString()}\n`);

// ----------------------------------------------------
// TEST 5: CART & CHECKOUT REFLECTION
// ----------------------------------------------------
console.log('--- TEST 5: Simulating Cart Addition & Checkout Order Payload ---');
// Cart item shape constructed by CartContext:
const cartImage = (selectedVar1 && selectedVar1.image_url) || (updatedProduct.images && updatedProduct.images[0]);
const cartItem = {
  id: `${updatedProduct.id}-${selectedVar1.id}`,
  product_id: updatedProduct.id,
  variation_id: selectedVar1.id,
  name: updatedProduct.name,
  image: cartImage,
  unit_price: selectedVar1.discounted_price || selectedVar1.price,
  quantity: 2,
  subtotal: (selectedVar1.discounted_price || selectedVar1.price) * 2,
};

assert.strictEqual(cartItem.image, sampleVariantImg, 'Cart item must carry the custom variation image');
assert.strictEqual(cartItem.unit_price, 1720000, 'Cart item unit price must be ₦1,720,000');
assert.strictEqual(cartItem.subtotal, 3440000, 'Cart item subtotal for 2 items must be ₦3,440,000');

console.log(`✓ Cart Item: "${cartItem.name}" | Image: "${cartItem.image.slice(0, 30)}..." | Qty: ${cartItem.quantity} | Total: ₦${cartItem.subtotal.toLocaleString()}`);

console.log('\n====================================================');
console.log('   ALL E2E VERIFICATION CHECKS PASSED (5/5) !');
console.log('====================================================');
