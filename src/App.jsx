import React, { useState, useEffect } from 'react'; 
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'; 
import { AnimatePresence } from 'framer-motion';
// Yahan Context ko context (small c) kar diya hai
import { CartProvider } from './Context/cartContext'; 
import { ThemeProvider } from './Context/themeContext';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import DynamicSection from './components/DynamicSection';
import GlobalArchive from './components/GlobalArchive';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer'; 
import Checkout from './components/Checkout';
import AdminDashboard from './components/AdminDashboard';
import AdminLoginPage from './components/AdminLoginPage';
import { Toaster } from 'react-hot-toast';

function App() {
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false); 
  const [isWishlistOpen, setIsWishlistOpen] = useState(false); 
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate(); 

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('localCart');
    localStorage.removeItem('localWish');
    setUser(null);
    navigate('/');
  };

  return (
    <ThemeProvider>
      <CartProvider>
        <div className={`min-h-screen bg-white dark:bg-xoxo-dark-bg text-black dark:text-xoxo-cream transition-colors duration-300 ${(isArchiveOpen || isCartOpen || isWishlistOpen) ? 'overflow-hidden h-screen' : ''}`}>
          
          <Navbar 
            onOpenCart={() => setIsCartOpen(true)} 
            onOpenWishlist={() => setIsWishlistOpen(true)} 
            user={user}
            onLogout={handleLogout}
          />

          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Hero onOpenArchive={() => setIsArchiveOpen(true)} />} />
              <Route path="/search" element={<DynamicSection />} />
              <Route path="/section/:sectionName" element={<DynamicSection />} />
              <Route path="/checkout" element={<Checkout />} /> 
              <Route path="/admin" element={<AdminLoginPage />} />
              <Route path="/xoxo-admin" element={<AdminDashboard />} /> 
            </Routes>
          </AnimatePresence>

          <GlobalArchive isOpen={isArchiveOpen} onClose={() => setIsArchiveOpen(false)} />
          <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
          <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />

          <Toaster 
            position="bottom-right" 
            toastOptions={{
              className: 'dark:bg-xoxo-dark-card dark:text-xoxo-cream dark:border dark:border-xoxo-dark-border',
              style: {
                borderRadius: '12px',
                background: '#fff',
                color: '#000',
              },
            }} 
          />

          <footer className="py-20 border-t border-neutral-100 dark:border-zinc-900 text-center">
            <p className="text-[10px] font-black uppercase tracking-[1em] text-neutral-200 dark:text-zinc-800">XOXO ARCHIVE 2026</p>
          </footer>
        </div>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;