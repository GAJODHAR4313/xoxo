import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ArrowRight, Heart, Star } from 'lucide-react';
import { useCart } from '../Context/cartContext';
import API_BASE_URL from '../config';

const GlobalArchive = ({ isOpen, onClose }) => {
  const [products, setProducts] = useState([]);
  const { addToCart, toggleWishlist, wishlistItems } = useCart();

  useEffect(() => {
    if (isOpen) {
      axios.get(`${API_BASE_URL}/api/products`)
        .then(res => setProducts(res.data))
        .catch(err => console.error("Archive load error", err));
    }
  }, [isOpen]);

  const handleStockUpdate = (productId) => {
    setProducts(prev =>
      prev.map(p => p._id === productId ? { ...p, stock: Math.max(0, p.stock - 1) } : p)
    );
  };

  const handleAddToCart = async (product) => {
    if (product.stock <= 0) return;
    await addToCart(product, handleStockUpdate);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ x: '100%' }} 
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed inset-0 z-[200] bg-white overflow-y-auto no-scrollbar"
        >
          <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 px-6 md:px-20 py-8 border-b border-black/5 flex justify-between items-center">
            <div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">The Global Archive</h2>
              <p className="text-[9px] font-bold opacity-30 uppercase tracking-[0.4em]">All Categories • 2026 Drops</p>
            </div>
            <button onClick={onClose} className="group flex items-center gap-4 bg-black text-white px-6 py-3 rounded-full hover:bg-neutral-800 transition-all">
              <span className="text-[10px] font-black uppercase tracking-widest">Close</span>
              <X size={18} />
            </button>
          </div>

          <div className="max-w-7xl mx-auto px-6 md:px-20 py-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
              {products.map((item, idx) => {
                const isLiked = wishlistItems.some(w => w._id === item._id);
                return (
                  <motion.div key={item._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="group relative">
                    {item.stock <= 0 ? (
                      <div className="absolute top-4 right-4 z-20 bg-red-600 text-white text-[8px] font-black px-2.5 py-1 uppercase tracking-widest rounded-full">SOLD OUT</div>
                    ) : item.stock < 5 ? (
                      <div className="absolute top-4 right-4 z-20 bg-orange-500 text-white text-[8px] font-black px-2.5 py-1 uppercase tracking-widest rounded-full">Only {item.stock} left</div>
                    ) : null}
                    <div className={`aspect-[3/4] ${item.color || 'bg-zinc-100'} rounded-2xl overflow-hidden flex items-center justify-center relative ${item.stock <= 0 ? 'grayscale opacity-50' : ''}`}>
                      <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.name} />
                      
                      <button onClick={(e) => { e.stopPropagation(); toggleWishlist(item); }} className="absolute top-4 left-4 z-20 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-transform">
                        <Heart size={14} fill={isLiked ? "red" : "none"} color={isLiked ? "red" : "black"} />
                      </button>

                      {item.stock > 0 && (
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-all duration-500">
                          <button onClick={() => handleAddToCart(item)} className="bg-white p-4 rounded-full shadow-xl hover:scale-110 transition-all"><ShoppingBag size={20} /></button>
                        </div>
                      )}
                    </div>
                    <div className="mt-6 flex justify-between items-center font-black uppercase italic text-[11px] tracking-tighter px-1">
                      <span className={item.stock <= 0 ? "text-zinc-300" : ""}>{item.name}</span>
                      <div className="flex gap-2 items-center">
                          {item.rating > 0 && <span className="flex items-center gap-1 text-xs"><Star size={10} fill="gold" color="gold"/> {item.rating.toFixed(1)}</span>}
                          <span className="bg-zinc-100 px-2 py-1 rounded-md text-[10px] font-bold not-italic tracking-normal">₹{item.price}</span>
                      </div>
                    </div>
                    {item.stock > 0 && item.stock < 5 && <p className="text-[8px] font-black text-orange-500 uppercase mt-2 tracking-widest px-1">Limited: Only {item.stock} Left</p>}
                    {item.stock <= 0 && <p className="text-[8px] font-black text-red-500 uppercase mt-2 tracking-widest px-1">Out of Stock</p>}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default GlobalArchive;