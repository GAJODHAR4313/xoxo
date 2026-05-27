import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Eye, X, Heart } from 'lucide-react';
import { useCart } from '../Context/CartContext';

const Shoes = () => {
  const [products, setProducts] = useState([]);
  const [selectedShoe, setSelectedShoe] = useState(null);
  const [activeBrand, setActiveBrand] = useState("All");
  const { addToCart, toggleWishlist, wishlistItems } = useCart();

  useEffect(() => {
    const fetchShoes = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/products');
        // Filter: Sirf wahi dikhao jo shoe brands hain
        const shoeBrands = ["Nike", "Adidas", "New Balance", "Asics"];
        setProducts(res.data.filter(p => shoeBrands.includes(p.category)));
      } catch (err) { console.error("Shoes load error", err); }
    };
    fetchShoes();
  }, []);

  const brandOptions = ["All", "Nike", "Adidas", "New Balance", "Asics"];
  const filteredShoes = activeBrand === "All" ? products : products.filter(s => s.category === activeBrand);

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-12 pb-12 px-6 border-b border-neutral-100">
        <div className="max-w-7xl mx-auto">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] font-bold tracking-[0.5em] uppercase text-neutral-400 mb-4">Footwear Archive</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-6xl md:text-[8vw] font-black tracking-tighter leading-[0.8] uppercase italic">Sole <span className="text-neutral-200">Search.</span></motion.h1>
        </div>
      </div>

      <div className="sticky top-20 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center overflow-x-auto no-scrollbar gap-8">
          {brandOptions.map((brand) => (
            <button key={brand} onClick={() => setActiveBrand(brand)} className={`text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeBrand === brand ? "text-black border-b-2 border-black pb-1" : "text-neutral-300 hover:text-black"}`}>{brand}</button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
          <AnimatePresence mode="popLayout">
            {filteredShoes.map((shoe) => {
              const isLiked = wishlistItems.some(w => w._id === shoe._id);
              return (
                <motion.div layout key={shoe._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="group flex flex-col relative">
                  <div className={`relative aspect-[3/4] ${shoe.color || 'bg-zinc-100'} rounded-lg overflow-hidden mb-5 flex items-center justify-center`}>
                    <img src={shoe.image} alt={shoe.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <button onClick={() => toggleWishlist(shoe)} className="absolute top-4 left-4 z-20 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-transform">
                      <Heart size={14} fill={isLiked ? "red" : "none"} color={isLiked ? "red" : "black"} />
                    </button>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-10">
                      <button onClick={() => setSelectedShoe(shoe)} className="bg-white p-3 rounded-full hover:scale-110 transition-transform"><Eye size={18} /></button>
                      <button onClick={() => addToCart(shoe)} className="bg-white p-3 rounded-full hover:scale-110 transition-transform"><ShoppingCart size={18} /></button>
                    </div>
                    <div className="absolute top-3 right-3 bg-white px-2 py-0.5 rounded-full shadow-sm">
                      <span className="text-[10px] font-black italic">${shoe.price}</span>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-[12px] font-black uppercase tracking-tight italic">{shoe.name}</h3>
                    <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">{shoe.category}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {selectedShoe && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
              <button onClick={() => setSelectedShoe(null)} className="absolute top-6 right-6 z-10 p-2 bg-white/80 rounded-full hover:scale-110 transition-transform shadow-sm"><X size={20} /></button>
              <div className={`w-full md:w-1/2 min-h-[300px] ${selectedShoe.color || 'bg-zinc-100'} flex items-center justify-center`}>
                <img src={selectedShoe.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="w-full md:w-1/2 p-10 md:p-14 flex flex-col justify-center">
                <span className="text-[10px] font-black tracking-[0.4em] text-neutral-300 uppercase">{selectedShoe.category} Footwear</span>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-6 mt-2">{selectedShoe.name}</h2>
                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest leading-relaxed mb-8">{selectedShoe.detail}</p>
                <div className="flex items-center justify-between pt-8 border-t border-neutral-50">
                   <span className="text-3xl font-black italic">${selectedShoe.price}</span>
                   <button onClick={() => { addToCart(selectedShoe); setSelectedShoe(null); }} className="bg-black text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-opacity flex items-center gap-3"><ShoppingCart size={16} /> Add to Cart</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default Shoes;