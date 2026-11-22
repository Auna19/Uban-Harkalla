import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const CartContext = createContext(null);
const CART_STORAGE_KEY = 'ubh_shopping_cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [cartNotification, setCartNotification] = useState(null);
  const notificationTimerRef = React.useRef(null);

  const dismissNotification = useCallback(() => {
    if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
    setCartNotification(null);
  }, []);

  // Persist to storage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [items]);

  /**
   * Add item to cart with selected variation
   */
  const addToCart = useCallback((product, variation, quantity = 1) => {
    const isBaseOrFirstVar = !variation || (product.variations && product.variations[0]?.id === variation.id);
    const basePriceNum = Number(product.base_price) || 0;

    const varPrice = (isBaseOrFirstVar && basePriceNum > 0)
      ? basePriceNum
      : (variation?.price ? Number(variation.price) : basePriceNum);

    const hasExplicitDiscount = product.discounted_price !== undefined &&
      product.discounted_price !== null &&
      product.discounted_price !== '' &&
      Number(product.discounted_price) > 0;

    let unitPrice = varPrice;
    if (isBaseOrFirstVar && hasExplicitDiscount) {
      const pDisc = Number(product.discounted_price);
      if (pDisc < varPrice) unitPrice = pDisc;
    } else if (variation?.discounted_price && Number(variation.discounted_price) > 0) {
      const vDisc = Number(variation.discounted_price);
      if (vDisc < varPrice) unitPrice = vDisc;
    } else if (hasExplicitDiscount) {
      const pDisc = Number(product.discounted_price);
      if (pDisc < varPrice) unitPrice = pDisc;
    }

    const availableStock = variation ? variation.stock_quantity : product.stock_quantity;
    const variationKey = variation ? variation.id : 'default';
    const itemId = `${product.id}-${variationKey}`;

    // Variation description string e.g. "Storage: 256GB | Color: Natural Titanium | Condition: Brand New"
    const variationDetails = variation && variation.attributes
      ? Object.entries(variation.attributes)
          .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
          .join(' • ')
      : '';

    const image = (variation && variation.image_url) || (product.images && product.images[0]) || product.image_url || '/Logo.jpg';

    // Trigger instant notification display for user
    setCartNotification({
      id: Date.now(),
      productName: product.name,
      productImage: image,
      variationDetails,
      unitPrice,
      quantity,
    });

    if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
    notificationTimerRef.current = setTimeout(() => {
      setCartNotification(null);
    }, 5000);

    setItems((prevItems) => {
      const existingIdx = prevItems.findIndex((i) => i.id === itemId);
      if (existingIdx !== -1) {
        const existing = prevItems[existingIdx];
        const newQty = existing.quantity + quantity;
        if (newQty > availableStock) {
          throw new Error(`Only ${availableStock} units available in stock for this selection.`);
        }
        const updated = [...prevItems];
        updated[existingIdx] = {
          ...existing,
          quantity: newQty,
          subtotal: newQty * unitPrice,
        };
        return updated;
      } else {
        if (quantity > availableStock) {
          throw new Error(`Only ${availableStock} units available in stock for this selection.`);
        }
        return [
          ...prevItems,
          {
            id: itemId,
            product_id: product.id,
            variation_id: variation ? variation.id : null,
            name: product.name,
            slug: product.slug,
            image,
            variation_details: variationDetails,
            unit_price: unitPrice,
            quantity,
            subtotal: quantity * unitPrice,
            stock_quantity: availableStock,
          },
        ];
      }
    });
  }, []);

  const updateQuantity = useCallback((itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          if (newQuantity > item.stock_quantity) {
            alert(`Maximum available stock is ${item.stock_quantity}.`);
            return item;
          }
          return {
            ...item,
            quantity: newQuantity,
            subtotal: newQuantity * item.unit_price,
          };
        }
        return item;
      })
    );
  }, []);

  const removeFromCart = useCallback((itemId) => {
    setItems((prevItems) => prevItems.filter((i) => i.id !== itemId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setDiscountAmount(0);
    setDiscountCode('');
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const applyPromoCode = useCallback((code) => {
    const clean = code?.trim().toUpperCase();
    if (clean === 'UBAN10') {
      // 10% discount promo
      setDiscountCode(clean);
      return { success: true, message: 'Promo code applied: 10% discount!' };
    } else if (clean === 'WELCOME5') {
      setDiscountCode(clean);
      return { success: true, message: 'Promo code applied: ₦5,000 welcome discount!' };
    } else {
      return { success: false, message: 'Invalid or expired promo code.' };
    }
  }, []);

  // Calculations
  const itemCount = useMemo(
    () => items.reduce((total, i) => total + i.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((total, i) => total + i.subtotal, 0),
    [items]
  );

  const deliveryFee = useMemo(() => {
    if (!selectedLocation) return 0;
    return Number(selectedLocation.fee) || 0;
  }, [selectedLocation]);

  const discount = useMemo(() => {
    if (discountCode === 'UBAN10') {
      return Math.round(subtotal * 0.1);
    }
    if (discountCode === 'WELCOME5') {
      return Math.min(subtotal, 5000);
    }
    return discountAmount;
  }, [discountCode, subtotal, discountAmount]);

  const totalAmount = useMemo(
    () => Math.max(0, subtotal + deliveryFee - discount),
    [subtotal, deliveryFee, discount]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        deliveryFee,
        discount,
        discountCode,
        totalAmount,
        selectedLocation,
        setSelectedLocation,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyPromoCode,
        cartNotification,
        dismissNotification,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
