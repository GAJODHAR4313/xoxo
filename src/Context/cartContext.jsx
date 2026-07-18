import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import API_BASE_URL from '../config';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const cartSyncTimeout = useRef(null);
  const wishSyncTimeout = useRef(null);

  // Helper to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  // 1. Initial Load from LocalStorage & DB
  useEffect(() => {
    const savedCart = localStorage.getItem('localCart');
    const savedWish = localStorage.getItem('localWish');
    if(savedCart) setCartItems(JSON.parse(savedCart));
    if(savedWish) setWishlistItems(JSON.parse(savedWish));

    const fetchUserData = async () => {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (savedUser && token) {
        try {
          const user = JSON.parse(savedUser);
          const userId = user.id || user._id;
          const res = await fetch(`${API_BASE_URL}/api/user/${userId}`, {
            headers: getAuthHeaders()
          });
          if (res.ok) {
            const data = await res.json();
            // DB takes precedence if it has items
            if(data.user.cart?.length > 0) setCartItems(data.user.cart);
            if(data.user.wishlist?.length > 0) setWishlistItems(data.user.wishlist);
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
    localStorage.setItem('localCart', JSON.stringify(cartItems));

    const sync = async () => {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (savedUser && token) {
        const userId = JSON.parse(savedUser).id || JSON.parse(savedUser)._id;
        await fetch(`${API_BASE_URL}/api/user/${userId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify({ cart: cartItems }),
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
    localStorage.setItem('localWish', JSON.stringify(wishlistItems));

    const sync = async () => {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (savedUser && token) {
        const userId = JSON.parse(savedUser).id || JSON.parse(savedUser)._id;
        await fetch(`${API_BASE_URL}/api/user/${userId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify({ wishlist: wishlistItems }),
        });
      }
    };
    if (wishSyncTimeout.current) clearTimeout(wishSyncTimeout.current);
    wishSyncTimeout.current = setTimeout(sync, 1000);
    return () => clearTimeout(wishSyncTimeout.current);
  }, [wishlistItems, isLoaded]);

  // 4. Add to Cart — stock checks happen cleanly without premature DB locking
  const addToCart = async (product, onStockUpdate) => {
    const size = product.selectedSize;
    const hasSizeStocks = product.sizeStocks && Object.keys(product.sizeStocks).length > 0;

    if (hasSizeStocks && size) {
      const sizeStock = product.sizeStocks[size] || 0;
      if (sizeStock <= 0) {
        alert(`Size ${size} is out of stock!`);
        return false;
      }
      const existingItem = cartItems.find(i => i._id === product._id && i.selectedSize === size);
      if (existingItem && existingItem.qty >= sizeStock) {
        alert(`Limit reached: Only ${sizeStock} available in stock for size ${size}.`);
        return false;
      }
    } else {
      if (product.stock <= 0) {
        alert('This item is out of stock!');
        return false;
      }
      const existingItem = cartItems.find(i => i._id === product._id && (!i.selectedSize || i.selectedSize === size));
      if (existingItem && typeof product.stock === 'number' && existingItem.qty >= product.stock) {
        alert(`Limit reached: Only ${product.stock} available in stock.`);
        return false;
      }
    }

    setCartItems(prev => {
      const exists = prev.find(i => i._id === product._id && i.selectedSize === size);
      if (exists) {
        return prev.map(i => (i._id === product._id && i.selectedSize === size) ? { ...i, qty: i.qty + 1 } : i);
      }
      const price = typeof product.price === 'string'
        ? parseFloat(product.price.replace(/,/g, ''))
        : product.price;
      return [...prev, { ...product, price, qty: 1 }];
    });

    if (onStockUpdate) onStockUpdate(product._id);
    return true; // signal success
  };

  const removeFromCart = (id, size) => {
    setCartItems(prev => prev.filter(i => !(i._id === id && i.selectedSize === size)));
  };

  const updateQty = (id, size, delta) => {
    setCartItems(prev => prev.map(i => {
      if (i._id === id && i.selectedSize === size) {
        const newQty = i.qty + delta;
        if (newQty <= 0) return null; // Remove item if qty hits 0
        
        if (i.sizeStocks && typeof i.sizeStocks[size] === 'number') {
          if (newQty > i.sizeStocks[size]) {
            alert(`Limit reached: Only ${i.sizeStocks[size]} units available in size ${size}.`);
            return i;
          }
        } else if (typeof i.stock === 'number' && newQty > i.stock) {
          alert(`Limit reached: Only ${i.stock} units available.`);
          return i;
        }
        return { ...i, qty: newQty };
      }
      return i;
    }).filter(Boolean));
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