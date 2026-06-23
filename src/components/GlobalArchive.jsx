import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ArrowRight, Heart } from 'lucide-react';
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
              {products.map((item, idx) => {
                const isLiked = wishlistItems.some(w => w._id === item._id);
                return (
                  <motion.div key={item._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="group relative">
                    {item.stock <= 0 && (
                      <div className="absolute top-3 left-3 z-20 bg-red-600 text-white text-[8px] font-black px-2 py-1 uppercase tracking-widest rounded-full">Sold Out</div>
                    )}
                    {item.stock > 0 && item.stock < 5 && (
                      <div className="absolute top-3 right-12 z-20 bg-orange-500 text-white text-[8px] font-black px-2 py-1 uppercase tracking-widest rounded-full">Only {item.stock}</div>
                    )}
                    <div className={`relative aspect-[3/4] ${item.color || 'bg-zinc-100'} rounded-2xl overflow-hidden mb-6 flex items-center justify-center transition-transform group-hover:scale-[0.98] ${item.stock <= 0 ? 'grayscale opacity-60' : ''}`}>
                      <img src={item.image} alt="" className="w-full h-full object-cover" />
                      <button onClick={(e) => { e.stopPropagation(); toggleWishlist(item); }} className="absolute top-4 left-4 z-20 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors">
                        <Heart size={16} fill={isLiked ? "red" : "none"} color={isLiked ? "red" : "black"} className={isLiked ? "scale-110" : ""} />
                      </button>
                      <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm z-20">
                        <span className="text-[11px] font-black italic">₹{item.price}</span>
                      </div>
                      {item.stock > 0 ? (
                        <button onClick={() => handleAddToCart(item)} className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all flex items-center justify-center">
                          <ShoppingBag className="opacity-0 group-hover:opacity-100 text-black transition-all" size={40} strokeWidth={1.5} />
                        </button>
                      ) : (
                        <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                          <span className="text-[10px] font-black uppercase tracking-widest text-red-600">Out of Stock</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[13px] font-black uppercase italic tracking-tight">{item.name}</h4>
                      <div className="flex justify-between items-center">
                        <p className="text-[9px] font-bold opacity-30 uppercase tracking-widest">{item.category}</p>
                        {item.stock <= 0 && <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Out of Stock</span>}
                        {item.stock > 0 && (
                          <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
                        )}
                      </div>
                    </div>
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