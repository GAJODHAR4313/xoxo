import React, { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag, Menu, Zap, LogOut, Package, ShieldCheck, UserMinus } from 'lucide-react'; // Added UserMinus icon
import { useCart } from '../Context/cartContext';
import axios from 'axios'; // Axios import kiya account delete ke liye

const Navbar = ({ onOpenSignUp, onOpenAdminLogin, onOpenCart, onOpenWishlist }) => { 
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  
  const { scrollY } = useScroll();
  const location = useLocation();
  const { cartItems, wishlistItems } = useCart(); 

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.location.reload();
  };

  // --- NEW: DELETE ACCOUNT FUNCTION ---
  const handleDeleteAccount = async () => {
    if(window.confirm("PERMANENTLY DELETE YOUR ACCOUNT? THIS CANNOT BE UNDONE.")) {
      try {
        await axios.delete(`https://xoxo-backend-hoiu.onrender.com/api/user/delete/${user.id || user._id}`);
        alert("Account Terminated.");
        localStorage.removeItem('user');
        window.location.reload();
      } catch (err) {
        alert("Delete failed. Server check karo.");
      }
    }
  };

  const totalQty = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const wishCount = wishlistItems.length; 
  
  const totalPrice = cartItems.reduce((acc, item) => {
    const price = typeof item.price === 'string' 
      ? parseFloat(item.price.replace(/,/g, '')) 
      : item.price;
    return acc + (price * item.qty);
  }, 0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
  });

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Shoes', path: '/shoes' },
    { name: 'Watches', path: '/watches' },
  ];

  return (
    <header className={`w-full sticky top-0 z-50 transition-all duration-500 font-primary ${
      scrolled ? 'bg-white/80 backdrop-blur-2xl shadow-md' : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
        
        <div className="flex-1 hidden md:block">
          <motion.div animate={{ width: isSearchFocused ? '105%' : '100%' }} className="relative group max-w-[280px]">
            <input type="text" placeholder="Search..." onFocus={() => setIsSearchFocused(true)} onBlur={() => setIsSearchFocused(false)} className="w-full bg-black/5 py-2.5 px-10 rounded-full outline-none text-sm border border-transparent focus:bg-white focus:border-black/10 transition-all" />
            <Search className="absolute left-3.5 top-3 text-black/50 w-4 h-4" />
          </motion.div>
        </div>

        <div className="flex-none">
          <Link to="/">
            <motion.div animate={{ scale: scrolled ? 0.8 : 1 }} className="h-10 w-32 flex items-center justify-center">
               <img src="/Xoxo.png" alt="XOXO" className="h-full w-full object-contain" />
            </motion.div>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-end gap-6">
          {user ? (
            <div className="flex items-center gap-6">
              {user.role === 'admin' && (
                <Link to="/xoxo-admin" className="flex flex-col items-center gap-1 group">
                  <ShieldCheck className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-amber-600/60">Admin</span>
                </Link>
              )}
              <Link to="/orders" className="flex flex-col items-center gap-1 group">
                <Package className="w-5 h-5 text-black/70 group-hover:text-black transition-colors" />
                <span className="text-[8px] font-black uppercase tracking-widest text-black/40">Orders</span>
              </Link>
              
              {/* TERMINATE BUTTON: Red icon for account deletion */}
              <button onClick={handleDeleteAccount} className="flex flex-col items-center gap-1 group opacity-40 hover:opacity-100 transition-opacity">
                <UserMinus className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform" />
                <span className="text-[7px] font-black uppercase tracking-widest text-red-600/60">Terminate</span>
              </button>

              <LogOut className="w-5 h-5 text-black cursor-pointer hover:scale-110 transition-transform" onClick={handleLogout} />
            </div>
          ) : (
            <div className="flex items-center gap-6">
               <button onClick={onOpenAdminLogin} className="opacity-20 hover:opacity-100 transition-opacity">
                <ShieldCheck className="w-5 h-5 text-black" />
              </button>
              <User className="w-5 h-5 text-black/70 cursor-pointer hover:text-black transition-colors" onClick={onOpenSignUp} />
            </div>
          )}
          <div className="relative cursor-pointer group" onClick={onOpenWishlist}>
            <Heart className={`w-5 h-5 ${wishCount > 0 ? 'fill-black text-black' : 'text-black/70'}`} />
          </div>
          <button onClick={onOpenCart} className="relative flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full active:scale-95 transition-transform">
            <ShoppingBag className="w-4 h-4" />
            <span className="text-xs font-bold">${totalPrice.toLocaleString()}</span>
          </button>
        </div>
      </div>

      <motion.nav 
        animate={{ height: scrolled ? 0 : 45, opacity: scrolled ? 0 : 1 }} 
        className="overflow-hidden border-t border-black/5"
      >
        <div className="max-w-7xl mx-auto px-6 h-[45px] flex items-center justify-between">
          <div className="flex items-center gap-10">
            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black/80">
              <Menu className="w-4 h-4" /> Categories
            </button>
            
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path} 
                  className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                    location.pathname === link.path ? 'text-black' : 'text-black/40 hover:text-black'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-1.5 bg-black/5 rounded-full text-[9px] font-black uppercase italic tracking-widest">
            <Zap className="w-3.5 h-3.5 fill-black/20" /> Best Offers
          </div>
        </div>
      </motion.nav>
    </header>
  );
};

export default Navbar;