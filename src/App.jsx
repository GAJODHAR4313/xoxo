import React, { useState, useEffect } from 'react'; 
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'; 
import { AnimatePresence } from 'framer-motion';
// Yahan Context ko context (small c) kar diya hai
import { CartProvider } from './Context/cartContext'; 
import { ThemeProvider } from './Context/themeContext';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Shop from './components/Shop';
import Shoes from './components/Shoes';
import Watches from './components/Watches';
import GlobalArchive from './components/GlobalArchive';
import SignUpCard from './components/SignUpCard';
import SignInCard from './components/SignInCard';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer'; 
import Checkout from './components/Checkout';
import Profile from './components/Profile'; 
import Orders from './components/Orders';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [authModal, setAuthModal] = useState(null); 
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
            onOpenSignUp={() => setAuthModal('signup')} 
            onOpenAdminLogin={() => setAuthModal('admin-signin')} 
            onOpenCart={() => setIsCartOpen(true)} 
            onOpenWishlist={() => setIsWishlistOpen(true)} 
            user={user}
            onLogout={handleLogout}
          />

          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Hero onOpenArchive={() => setIsArchiveOpen(true)} />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/shoes" element={<Shoes />} />
              <Route path="/watches" element={<Watches />} />
              <Route path="/checkout" element={<Checkout />} /> 
              <Route path="/profile" element={<Profile />} /> 
              <Route path="/orders" element={<Orders />} /> 
              <Route path="/xoxo-admin" element={<AdminDashboard />} /> 
            </Routes>
          </AnimatePresence>

          <GlobalArchive isOpen={isArchiveOpen} onClose={() => setIsArchiveOpen(false)} />
          <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
          <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />

          <AnimatePresence>
            {authModal === 'signup' && (
              <SignUpCard 
                key="signup" 
                onClose={() => setAuthModal(null)} 
                onSwitch={() => setAuthModal('signin')} 
                onLoginSuccess={(user, token) => {
                  localStorage.setItem('user', JSON.stringify(user));
                  if (token) localStorage.setItem('token', token);
                  setUser(user);
                  setAuthModal(null);
                }}
              />
            )}

            {authModal === 'signin' && (
              <SignInCard 
                key="signin" 
                onClose={() => setAuthModal(null)} 
                onSwitch={() => setAuthModal('signup')} 
                onLoginSuccess={(user, token) => {
                  localStorage.setItem('user', JSON.stringify(user));
                  if (token) localStorage.setItem('token', token);
                  setUser(user);
                  setAuthModal(null);
                }}
              />
            )}

            {authModal === 'admin-signin' && (
              <SignInCard 
                key="admin-signin" 
                isAdminMode={true} 
                onClose={() => setAuthModal(null)} 
                onSwitch={() => setAuthModal('signup')} 
                onLoginSuccess={(user, token) => {
                  localStorage.setItem('user', JSON.stringify(user));
                  if (token) localStorage.setItem('token', token);
                  setUser(user);
                  setAuthModal(null);
                  navigate('/xoxo-admin');
                }}
              />
            )}
          </AnimatePresence>

          <footer className="py-20 border-t border-neutral-100 dark:border-zinc-900 text-center">
            <p className="text-[10px] font-black uppercase tracking-[1em] text-neutral-200 dark:text-zinc-800">XOXO ARCHIVE 2026</p>
          </footer>
        </div>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;