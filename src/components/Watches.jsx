import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Eye, X, Clock, Heart } from 'lucide-react';
import { useCart } from '../Context/cartContext';

const Watches = () => {
  const [products, setProducts] = useState([]);
  const [selectedWatch, setSelectedWatch] = useState(null);
  const [activeBrand, setActiveBrand] = useState("All");
  const { addToCart, toggleWishlist, wishlistItems } = useCart();

  useEffect(() => {
    const fetchWatches = async () => {
      try {
        const res = await axios.get('https://xoxo-backend-hoiu.onrender.com/api/products');
        const watchBrands = ["Rolex", "Omega", "Cartier", "Seiko", "Casio"];
        setProducts(res.data.filter(p => watchBrands.includes(p.category)));
      } catch (err) { console.error("Watches error", err); }
    };
    fetchWatches();
  }, []);

  const brandOptions = ["All", "Rolex", "Omega", "Cartier", "Seiko", "Casio"];
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
                  <div className={`relative aspect-[1/1] ${watch.color || 'bg-stone-50'} rounded-2xl overflow-hidden mb-6 flex items-center justify-center`}>
                    <img src={watch.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <button onClick={() => toggleWishlist(watch)} className="absolute top-4 left-4 z-20 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-transform">
                      <Heart size={14} fill={isLiked ? "red" : "none"} color={isLiked ? "red" : "black"} />
                    </button>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-10 rounded-2xl">
                      <button onClick={() => setSelectedWatch(watch)} className="bg-white p-3 rounded-full hover:scale-110 transition-transform"><Eye size={18} /></button>
                      <button onClick={() => addToCart(watch)} className="bg-white p-3 rounded-full hover:scale-110 transition-transform"><ShoppingCart size={18} /></button>
                    </div>
                    <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
                      <span className="text-[11px] font-black italic">${watch.price}</span>
                    </div>
                  </div>
                  <div className="px-1">
                    <h3 className="text-[13px] font-black uppercase tracking-tight italic leading-none mb-1 group-hover:underline">{watch.name}</h3>
                    <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">{watch.category} — 2026</p>
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
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="relative w-full max-w-5xl bg-white rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[400px]">
              <button onClick={() => setSelectedWatch(null)} className="absolute top-8 right-8 z-10 p-3 bg-neutral-100 text-black rounded-full hover:bg-black hover:text-white transition-all"><X size={20} /></button>
              <div className={`w-full md:w-[45%] min-h-[300px] ${selectedWatch.color || 'bg-stone-50'} flex items-center justify-center`}>
                <img src={selectedWatch.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="w-full md:w-[55%] p-10 md:p-16 flex flex-col justify-center">
                <span className="text-[10px] font-black tracking-[0.5em] text-neutral-300 uppercase">Certified Chronometer</span>
                <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none mb-6 mt-2">{selectedWatch.name}</h2>
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-[0.1em] leading-relaxed mb-10">{selectedWatch.detail}</p>
                <div className="grid grid-cols-2 gap-8 mb-10 py-6 border-y border-neutral-100">
                   <div><span className="text-[9px] font-black text-neutral-300 uppercase block mb-1">Price (USD)</span><span className="text-3xl font-black italic tracking-tighter">${selectedWatch.price}</span></div>
                   <div><span className="text-[9px] font-black text-neutral-300 uppercase block mb-1">Availability</span><span className="text-xs font-black uppercase text-green-600 italic">Ships in 24h</span></div>
                </div>
                <button onClick={() => { addToCart(selectedWatch); setSelectedWatch(null); }} className="w-full bg-black text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:opacity-90 transition-opacity flex items-center justify-center gap-3"><ShoppingCart size={18} /> Add to Cart</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default Watches;