import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag, Menu, Zap, LogOut, Package, ShieldCheck, UserMinus, X } from 'lucide-react'; // Added UserMinus and X icons
import { useCart } from '../Context/cartContext';
import axios from 'axios'; // Axios import kiya account delete ke liye
import API_BASE_URL from '../config';

const Navbar = ({ onOpenSignUp, onOpenAdminLogin, onOpenCart, onOpenWishlist }) => {
const [isSearchFocused, setIsSearchFocused] = useState(false);
const [scrolled, setScrolled] = useState(false);
const [user, setUser] = useState(null);
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Added for mobile responsiveness
const [searchQuery, setSearchQuery] = useState('');
const { scrollY } = useScroll();
const location = useLocation();
const navigate = useNavigate();
const { cartItems, wishlistItems } = useCart();

const handleSearch = (e) => {
  if (e.key === 'Enter' && searchQuery.trim()) {
    navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    setIsSearchFocused(false);
    setIsMobileMenuOpen(false);
  }
};

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
await axios.delete(`${API_BASE_URL}/api/user/delete/${user.id || user._id}`);
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
{/* Hamburger Menu Icon for Mobile - Balances Logo perfectly */}
<div className="flex-1 lg:hidden">
  <button 
    onClick={() => setIsMobileMenuOpen(true)} 
    className="text-black/70 hover:text-black p-2 hover:bg-black/5 rounded-full transition-colors focus:outline-none"
  >
    <Menu className="w-6 h-6" />
  </button>
</div>

<div className="flex-1 hidden lg:block">
<motion.div animate={{ width: isSearchFocused ? '105%' : '100%' }} className="relative group max-w-[280px]">
<input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearch} onFocus={() => setIsSearchFocused(true)} onBlur={() => setIsSearchFocused(false)} className="w-full bg-black/5 py-2.5 px-10 rounded-full outline-none text-sm border border-transparent focus:bg-white focus:border-black/10 transition-all" />
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

<div className="flex-1 flex items-center justify-end gap-3 md:gap-6">
{user ? (
<div className="hidden lg:flex items-center gap-6">
{user.role === 'admin' && (
<Link to="/xoxo-admin" className="flex flex-col items-center gap-1 group">
<ShieldCheck className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
<span className="text-[8px] font-black uppercase tracking-widest text-amber-600/60">Admin</span>
</Link>
)}
<Link to="/profile" className="flex flex-col items-center gap-1 group">
<Package className="w-5 h-5 text-black/70 group-hover:text-black transition-colors" />
<span className="text-[8px] font-black uppercase tracking-widest text-black/40">Profile</span>
</Link>
{/* TERMINATE BUTTON: Red icon for account deletion */}
<button onClick={handleDeleteAccount} className="flex flex-col items-center gap-1 group opacity-40 hover:opacity-100 transition-opacity">
<UserMinus className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform" />
<span className="text-[7px] font-black uppercase tracking-widest text-red-600/60">Terminate</span>
</button>

<LogOut className="w-5 h-5 text-black cursor-pointer hover:scale-110 transition-transform" onClick={handleLogout} />
</div>
) : (
<div className="hidden lg:flex items-center gap-6">
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
<div className="flex lg:hidden items-center gap-5 overflow-x-auto no-scrollbar">
  {navLinks.filter(l => l.name !== 'Home').map((link) => (
    <Link
      key={link.name}
      to={link.path}
      className={`text-[10px] font-black uppercase tracking-widest transition-colors whitespace-nowrap ${
        location.pathname === link.path ? 'text-black border-b border-black pb-0.5' : 'text-black/45 hover:text-black'
      }`}
    >
      {link.name}
    </Link>
  ))}
</div>
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

{/* Mobile Navigation Drawer Overlay & Content */}
<AnimatePresence>
  {isMobileMenuOpen && (
    <>
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsMobileMenuOpen(false)}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="fixed top-0 left-0 bottom-0 w-[300px] max-w-[85vw] bg-white z-[60] shadow-2xl flex flex-col p-6 overflow-y-auto"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-6 border-b border-black/5">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
            <img src="/Xoxo.png" alt="XOXO" className="h-8 object-contain" />
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="p-1 hover:bg-black/5 rounded-full transition-colors text-black/70 hover:text-black focus:outline-none"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Drawer Search */}
        <div className="py-6">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full bg-black/5 py-2.5 px-10 rounded-full outline-none text-sm border border-transparent focus:bg-white focus:border-black/10 transition-all"
            />
            <Search className="absolute left-3.5 top-3 text-black/50 w-4 h-4" />
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-6 py-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-black/30">Navigation</p>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-sm font-bold uppercase tracking-widest transition-colors ${
                location.pathname === link.path ? 'text-black' : 'text-black/50 hover:text-black'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div className="h-px bg-black/5 my-2" />

        {/* User Account Actions */}
        <div className="flex flex-col gap-6 py-6 mt-auto">
          {user ? (
            <>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-black/30">Logged In As</span>
                <span className="text-xs font-bold text-black/70 mt-1 truncate">{user.email}</span>
              </div>

              <div className="flex flex-col gap-4 mt-2">
                {user.role === 'admin' && (
                  <Link 
                    to="/xoxo-admin" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 py-2 text-xs font-bold uppercase tracking-widest text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    <ShieldCheck className="w-5 h-5 text-amber-500" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                
                <Link 
                  to="/profile" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-2 text-xs font-bold uppercase tracking-widest text-black/70 hover:text-black transition-colors"
                >
                  <User className="w-5 h-5 text-black/70" />
                  <span>My Profile</span>
                </Link>

                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 py-2 text-xs font-bold uppercase tracking-widest text-black/70 hover:text-black transition-colors text-left"
                >
                  <LogOut className="w-5 h-5 text-black/70" />
                  <span>Logout</span>
                </button>

                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleDeleteAccount();
                  }}
                  className="flex items-center gap-3 py-2 text-xs font-bold uppercase tracking-widest text-red-600 hover:text-red-700 transition-colors text-left border-t border-black/5 pt-4"
                >
                  <UserMinus className="w-5 h-5 text-red-600" />
                  <span>Terminate Account</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-[10px] font-black uppercase tracking-widest text-black/30">Account</p>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenSignUp();
                  }}
                  className="flex items-center gap-3 py-2.5 px-4 bg-black text-white rounded-full text-xs font-bold uppercase tracking-widest justify-center active:scale-95 transition-transform"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In / Sign Up</span>
                </button>

                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAdminLogin();
                  }}
                  className="flex items-center gap-3 py-2 text-xs font-bold uppercase tracking-widest text-black/50 hover:text-black transition-colors justify-center"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Portal</span>
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>
</header>
);
};

export default Navbar;