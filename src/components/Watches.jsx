import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Eye, X, Heart } from 'lucide-react';
import { useCart } from '../Context/cartContext';
import API_BASE_URL from '../config';

const Watches = () => {
  const [products, setProducts] = useState([]);
  const [selectedWatch, setSelectedWatch] = useState(null);
  const [activeBrand, setActiveBrand] = useState("All");
  const { addToCart, toggleWishlist, wishlistItems } = useCart();
  const watchBrands = ["Rolex", "Omega", "Cartier", "Seiko", "Casio"];

  const fetchProducts = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products`);
      setProducts(res.data.filter(p => watchBrands.includes(p.category)));
    } catch (err) { console.error("Watches load error", err); }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleStockUpdate = (productId) => {
    setProducts(prev =>
      prev.map(p => p._id === productId ? { ...p, stock: Math.max(0, p.stock - 1) } : p)
    );
    setSelectedWatch(prev =>
      prev && prev._id === productId ? { ...prev, stock: Math.max(0, prev.stock - 1) } : prev
    );
  };

  const handleAddToCart = async (product) => {
    if (product.stock <= 0) return;
    const success = await addToCart(product, handleStockUpdate);
    if (success && selectedWatch?._id === product._id) {
      setSelectedWatch(null);
    }
  };

  const brandOptions = ["All", ...watchBrands];
  const filteredWatches = activeBrand === "All" ? products : products.filter(w => w.category === activeBrand);

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-12 pb-12 px-6 border-b border-neutral-100">
        <div className="max-w-7xl mx-auto text-center md:text-left">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] font-black tracking-[0.5em] uppercase text-neutral-300 mb-4 italic">Precision Timing</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-6xl md:text-[9vw] font-black tracking-tighter leading-[0.8] uppercase italic">Chrono <span className="text-neutral-200">Lab.</span></motion.h1>
        </div>
      </div>

      <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center overflow-x-auto no-scrollbar gap-10">
          {brandOptions.map((brand) => (
            <button key={brand} onClick={() => setActiveBrand(brand)} className={`text-[10px] font-black uppercase tracking-widest transition-all ${activeBrand === brand ? "text-black border-b-2 border-black pb-1 italic scale-110" : "text-neutral-300 hover:text-black"}`}>{brand}</button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
          <AnimatePresence mode="popLayout">
            {filteredWatches.map((watch) => {
              const isLiked = wishlistItems.some(w => w._id === watch._id);
              return (
                <motion.div layout key={watch._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="group flex flex-col relative">
                  {watch.stock <= 0 && (
                    <div className="absolute top-3 left-3 z-20 bg-red-600 text-white text-[8px] font-black px-2 py-1 uppercase tracking-widest rounded-full">Sold Out</div>
                  )}
                  {watch.stock > 0 && watch.stock < 5 && (
                    <div className="absolute top-3 right-10 z-20 bg-orange-500 text-white text-[8px] font-black px-2 py-1 uppercase tracking-widest rounded-full">Only {watch.stock}</div>
                  )}
                  <div className={`relative aspect-[1/1] ${watch.color || 'bg-stone-50'} rounded-2xl overflow-hidden mb-6 flex items-center justify-center ${watch.stock <= 0 ? 'grayscale opacity-60' : ''}`}>
                    <img src={watch.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <button onClick={() => toggleWishlist(watch)} className="absolute top-4 left-4 z-20 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-transform">
                      <Heart size={14} fill={isLiked ? "red" : "none"} color={isLiked ? "red" : "black"} />
                    </button>
                    {watch.stock > 0 && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-10 rounded-2xl">
                        <button onClick={() => setSelectedWatch(watch)} className="bg-white p-3 rounded-full hover:scale-110 transition-transform"><Eye size={18} /></button>
                        <button onClick={() => handleAddToCart(watch)} className="bg-white p-3 rounded-full hover:scale-110 transition-transform"><ShoppingCart size={18} /></button>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
                      <span className="text-[11px] font-black italic">${watch.price}</span>
                    </div>
                  </div>
                  <div className="px-1">
                    <h3 className="text-[13px] font-black uppercase tracking-tight italic leading-none mb-1 group-hover:underline">{watch.name}</h3>
                    <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">{watch.category} — 2026</p>
                    {watch.stock <= 0 && <p className="text-[8px] font-black text-red-500 uppercase tracking-widest mt-1">Out of Stock</p>}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {selectedWatch && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="relative w-full max-w-5xl bg-white rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[400px] max-h-[90vh] md:max-h-[none] overflow-y-auto md:overflow-y-visible">
              <button onClick={() => setSelectedWatch(null)} className="absolute top-4 right-4 md:top-8 md:right-8 z-10 p-2.5 md:p-3 bg-neutral-100 text-black rounded-full hover:bg-black hover:text-white transition-all"><X size={20} /></button>
              <div className={`w-full md:w-[45%] min-h-[250px] md:min-h-[300px] ${selectedWatch.color || 'bg-stone-50'} flex items-center justify-center`}>
                <img src={selectedWatch.image} alt="" className="w-full h-full max-h-[30vh] md:max-h-none object-cover" />
              </div>
              <div className="w-full md:w-[55%] p-6 sm:p-10 md:p-16 flex flex-col justify-center">
                <span className="text-[10px] font-black tracking-[0.5em] text-neutral-300 uppercase">Certified Chronometer</span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none mb-6 mt-2">{selectedWatch.name}</h2>
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-[0.1em] leading-relaxed mb-10">{selectedWatch.detail}</p>
                <div className="grid grid-cols-2 gap-8 mb-10 py-6 border-y border-neutral-100">
                   <div><span className="text-[9px] font-black text-neutral-300 uppercase block mb-1">Price (USD)</span><span className="text-2xl sm:text-3xl font-black italic tracking-tighter">${selectedWatch.price}</span></div>
                   <div><span className="text-[9px] font-black text-neutral-300 uppercase block mb-1">Availability</span><span className={`text-xs font-black uppercase italic ${selectedWatch.stock <= 0 ? 'text-red-500' : 'text-green-600'}`}>{selectedWatch.stock <= 0 ? 'Out of stock' : 'Ships in 24h'}</span></div>
                </div>
                <button
                  disabled={selectedWatch.stock <= 0}
                  onClick={() => handleAddToCart(selectedWatch)}
                  className={`w-full py-4 md:py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-opacity flex items-center justify-center gap-3 ${selectedWatch.stock <= 0 ? 'bg-zinc-100 text-zinc-300 cursor-not-allowed' : 'bg-black text-white hover:opacity-90'}`}>
                  <ShoppingCart size={18} /> {selectedWatch.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
                {selectedWatch.stock > 0 && selectedWatch.stock < 5 && (
                  <p className="text-[9px] font-black text-orange-500 uppercase mt-3 tracking-widest text-center">Only {selectedWatch.stock} left!</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default Watches;