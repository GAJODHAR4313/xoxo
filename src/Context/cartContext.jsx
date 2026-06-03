import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import API_BASE_URL from '../config';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const cartSyncTimeout = useRef(null);
  const wishSyncTimeout = useRef(null);

  // 1. Initial Load from DB
  useEffect(() => {
    const fetchUserData = async () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          const userId = user.id || user._id;
          const res = await fetch(`${API_BASE_URL}/api/user/data/${userId}`);
          if (res.ok) {
            const data = await res.json();
            setCartItems(data.cart || []);
            setWishlistItems(data.wishlist || []);
          }
        } catch (err) { console.error("Load failed"); }
      }
      setIsLoaded(true);
    };
    fetchUserData();
  }, []);

  // 2. Sync Cart
  useEffect(() => {
    if (!isLoaded) return;
    const sync = async () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userId = JSON.parse(savedUser).id || JSON.parse(savedUser)._id;
        await fetch(`${API_BASE_URL}/api/cart/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, cartItems }),
        });
      }
    };
    if (cartSyncTimeout.current) clearTimeout(cartSyncTimeout.current);
    cartSyncTimeout.current = setTimeout(sync, 1000);
    return () => clearTimeout(cartSyncTimeout.current);
  }, [cartItems, isLoaded]);

  // 3. Sync Wishlist
  useEffect(() => {
    if (!isLoaded) return;
    const sync = async () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userId = JSON.parse(savedUser).id || JSON.parse(savedUser)._id;
        await fetch(`${API_BASE_URL}/api/wishlist/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, wishlistItems }),
        });
      }
    };
    if (wishSyncTimeout.current) clearTimeout(wishSyncTimeout.current);
    wishSyncTimeout.current = setTimeout(sync, 1000);
    return () => clearTimeout(wishSyncTimeout.current);
  }, [wishlistItems, isLoaded]);

  // 4. Add to Cart — also decrements stock on backend
  const addToCart = async (product, onStockUpdate) => {
    // Check if already in cart — only decrement stock on first add
    const alreadyInCart = cartItems.find(i => i._id === product._id);

    if (!alreadyInCart) {
      // Decrement stock on backend
      try {
        const res = await fetch(`${API_BASE_URL}/api/products/decrement/${product._id}`, {
          method: 'PUT',
        });
        if (!res.ok) {
          const data = await res.json();
          if (data.message === 'OUT_OF_STOCK') {
            alert('This item is out of stock!');
            return false; // signal failure
          }
        }
      } catch (err) {
        console.error('Stock decrement failed', err);
      }
    }

    setCartItems(prev => {
      const exists = prev.find(i => i._id === product._id);
      if (exists) return prev.map(i => i._id === product._id ? { ...i, qty: i.qty + 1 } : i);
      const price = typeof product.price === 'string'
        ? parseFloat(product.price.replace(/,/g, ''))
        : product.price;
      return [...prev, { ...product, price, qty: 1 }];
    });

    // Call callback so product list can refetch/update stock display
    if (onStockUpdate) onStockUpdate(product._id);
    return true; // signal success
  };

  const removeFromCart = (id) => setCartItems(prev => prev.filter(i => i._id !== id));

  const updateQty = (id, delta) => {
    setCartItems(prev => prev.map(i => i._id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  };

  const toggleWishlist = (product) => {
    setWishlistItems(prev => {
      const exists = prev.find(i => i._id === product._id);
      if (exists) return prev.filter(i => i._id !== product._id);
      return [...prev, product];
    });
  };

  return (
    <CartContext.Provider value={{ cartItems, setCartItems, wishlistItems, setWishlistItems, addToCart, removeFromCart, updateQty, toggleWishlist }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);