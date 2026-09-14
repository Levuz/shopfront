import {
  createContext, useContext, useEffect, useMemo, useState, useCallback,
} from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'shopfront_cart_v1';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        const max = product.stock ?? existing.stock ?? 99;
        return prev.map((i) =>
          i.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + quantity, max) }
            : i
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          title: product.title,
          price: Number(product.price),
          image_url: product.image_url || null,
          stock: product.stock ?? 99,
          quantity,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.id === id
            ? { ...i, quantity: Math.max(0, Math.min(quantity, i.stock)) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );
  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const shipping = subtotal > 0 && subtotal < 100 ? 9.99 : 0;
  const total = subtotal + shipping;

  const value = useMemo(
    () => ({
      items, addToCart, updateQuantity, removeFromCart, clearCart,
      subtotal, shipping, total, totalItems,
    }),
    [items, addToCart, updateQuantity, removeFromCart, clearCart,
     subtotal, shipping, total, totalItems]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
};