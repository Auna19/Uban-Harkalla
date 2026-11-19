import assert from 'assert';

// Mock localStorage for node environment
const store = {};
global.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, val) => { store[key] = String(val); },
  removeItem: (key) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};
global.window = {
  dispatchEvent: () => {}
};
global.CustomEvent = class {};

console.log('--- 1. IMPORTING DATA SERVICE & SEED DATA ---');
const {
  getCategories,
  getBrands,
  getProducts,
  getProductBySlug,
  getDeliveryLocations,
  getOrders,
  createOrderAtomic,
  updateOrderStatus,
  getWebsiteContent,
  saveWebsiteContent,
  getTestimonials,
  saveTestimonial,
  getBusinessSettings,
  saveBusinessSettings,
  getCustomers,
  toggleCustomerStatus,
} = await import('../src/services/dataService.js');

console.log('--- 2. TESTING CATALOG & PRODUCTS ---');
const categories = await getCategories();
assert(categories.length >= 4, 'Should have at least 4 initial categories');
console.log(`✓ Categories loaded: ${categories.length} categories`);

const products = await getProducts();
assert(products.length >= 8, 'Should have at least 8 products');
console.log(`✓ Products loaded: ${products.length} products`);

const iphone15 = await getProductBySlug('apple-iphone-15-pro-max');
assert(iphone15 !== null, 'iPhone 15 Pro Max must exist');
assert(iphone15.variations && iphone15.variations.length >= 3, 'Must have variations');
console.log(`✓ Found "${iphone15.name}" with ${iphone15.variations.length} variations`);

console.log('--- 3. TESTING ATOMIC ORDER CREATION & STOCK DECREMENT ---');
const targetVar = iphone15.variations[0];
const initialStock = targetVar.stock_quantity;
console.log(`Initial stock for variation ${targetVar.sku}: ${initialStock}`);

const orderPayload = {
  user_id: 'test-user-123',
  customer_name: 'Test Customer Aliyu',
  customer_email: 'aliyu.test@example.com',
  customer_phone: '08012345678',
  subtotal: targetVar.discounted_price || targetVar.price,
  delivery_fee: 0, // Kano Free
  discount: 0,
  total_amount: targetVar.discounted_price || targetVar.price,
  payment_method: 'paystack',
  payment_status: 'verified',
  delivery_method: 'home_delivery',
  delivery_state: 'Kano',
  delivery_city: 'Kano Metropolis',
  delivery_address: 'Plot 10, State Road',
  delivery_notes: 'Ring bell',
  items: [
    {
      product_id: iphone15.id,
      variation_id: targetVar.id,
      product_name: iphone15.name,
      variation_details: 'Storage: 256GB | Color: Natural Titanium',
      unit_price: targetVar.discounted_price || targetVar.price,
      quantity: 2,
    }
  ]
};

const createdOrder = await createOrderAtomic(orderPayload);
assert(createdOrder.order_reference.startsWith('UBH-'), 'Order reference must start with UBH-');
assert.strictEqual(createdOrder.order_status, 'Confirmed', 'Order with verified payment should be Confirmed');
console.log(`✓ Order placed successfully with reference: ${createdOrder.order_reference}`);

// Verify stock was atomically decremented
const refreshedIphone = await getProductBySlug('apple-iphone-15-pro-max');
const refreshedVar = refreshedIphone.variations.find(v => v.id === targetVar.id);
assert.strictEqual(refreshedVar.stock_quantity, initialStock - 2, 'Stock must be decremented by 2');
console.log(`✓ Stock successfully decremented from ${initialStock} to ${refreshedVar.stock_quantity}`);

console.log('--- 4. TESTING ORDER STATUS PROGRESSION ---');
await updateOrderStatus(createdOrder.id, 'Processing', 'Item packaged by warehouse', 'Super Admin');
let orderCheck = (await getOrders()).find(o => o.id === createdOrder.id);
assert.strictEqual(orderCheck.order_status, 'Processing');
assert.strictEqual(orderCheck.status_history.length, 2, 'Should have 2 history entries');

await updateOrderStatus(createdOrder.id, 'Out for Delivery', 'Handed to courier', 'Super Admin');
orderCheck = (await getOrders()).find(o => o.id === createdOrder.id);
assert.strictEqual(orderCheck.order_status, 'Out for Delivery');

await updateOrderStatus(createdOrder.id, 'Delivered', 'Customer received and signed', 'Super Admin');
orderCheck = (await getOrders()).find(o => o.id === createdOrder.id);
assert.strictEqual(orderCheck.order_status, 'Delivered');
console.log(`✓ Order status lifecycle tested from Confirmed -> Processing -> Out for Delivery -> Delivered`);

console.log('--- 5. TESTING DELIVERY CHARGES ---');
const locations = await getDeliveryLocations();
const kano = locations.find(l => l.state === 'Kano');
const niger = locations.find(l => l.state === 'Niger');
const abuja = locations.find(l => l.state.includes('Abuja'));
const katsina = locations.find(l => l.state === 'Katsina');
const kaduna = locations.find(l => l.state === 'Kaduna');

assert.strictEqual(kano.fee, 0, 'Kano delivery must be Free (0)');
assert.strictEqual(niger.fee, 3000, 'Niger delivery must be 3,000');
assert.strictEqual(abuja.fee, 2500, 'Abuja delivery must be 2,500');
assert.strictEqual(katsina.fee, 1500, 'Katsina delivery must be 1,500');
assert.strictEqual(kaduna.fee, 2000, 'Kaduna delivery must be 2,000');
console.log('✓ All 5 initial delivery locations and fees verified accurately');

console.log('--- 6. TESTING WEBSITE CONTENT CMS & CEO INFO ---');
const content = await getWebsiteContent();
assert(content.hero.headline.includes('Trusted Destination'), 'Hero headline check');
assert(content.ceo.image === '/About CEO Image.jpg', 'CEO image must reference About CEO Image.jpg');
console.log('✓ CMS content and CEO image reference verified');

console.log('--- 7. TESTING TESTIMONIALS APPROVAL WORKFLOW ---');
const newTestimonial = await saveTestimonial({
  customer_name: 'Test Reviewer',
  customer_role: 'Verified Customer',
  content: 'Exceptional shopping experience!',
  rating: 5,
  is_approved: false
});
let approvedList = await getTestimonials(true);
assert(!approvedList.some(t => t.customer_name === 'Test Reviewer'), 'Unapproved review must not appear on public storefront');

// Approve review
await saveTestimonial({ ...newTestimonial[0], is_approved: true });
approvedList = await getTestimonials(true);
assert(approvedList.some(t => t.customer_name === 'Test Reviewer'), 'Approved review must now appear on public storefront');
console.log('✓ Testimonials approval workflow verified');

console.log('ALL BUSINESS LOGIC & DATA TESTS PASSED WITH 100% SUCCESS!');
