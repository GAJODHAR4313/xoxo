import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Eye, X, Heart } from 'lucide-react';
import { useCart } from '../Context/cartContext';
import API_BASE_URL from '../config';

const Shoes = () => {
  const [products, setProducts] = useState([]);
  const [selectedShoe, setSelectedShoe] = useState(null);
  const [activeBrand, setActiveBrand] = useState("All");
  const { addToCart, toggleWishlist, wishlistItems } = useCart();
  const shoeBrands = ["Nike", "Adidas", "New Balance", "Asics"];

  const fetchProducts = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products`);
      setProducts(res.data.filter(p => shoeBrands.includes(p.category)));
    } catch (err) { console.error("Shoes load error", err); }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleStockUpdate = (productId) => {
    setProducts(prev =>
      prev.map(p => p._id === productId ? { ...p, stock: Math.max(0, p.stock - 1) } : p)
    );
    setSelectedShoe(prev =>
      prev && prev._id === productId ? { ...prev, stock: Math.max(0, prev.stock - 1) } : prev
    );
  };

  const handleAddToCart = async (product) => {
    if (product.stock <= 0) return;
    const success = await addToCart(product, handleStockUpdate);
    if (success && selectedShoe?._id === product._id) {
      setSelectedShoe(null);
    }
  };

  const brandOptions = ["All", ...shoeBrands];
  const filteredShoes = activeBrand === "All" ? products : products.filter(s => s.category === activeBrand);

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-12 pb-12 px-6 border-b border-neutral-100">
        <div className="max-w-7xl mx-auto">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-bold tracking-[0.5em] uppercase text-neutral-400 mb-4">Footwear Archive</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-6xl md:text-[8vw] font-black tracking-tighter leading-[0.8] uppercase italic">
            Sole <span className="text-neutral-200">Search.</span>
          </motion.h1>
        </div>
      </div>

      <div className="sticky top-20 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center overflow-x-auto no-scrollbar gap-8">
          {brandOptions.map(brand => (
            <button key={brand} onClick={() => setActiveBrand(brand)}
              className={`text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeBrand === brand ? "text-black border-b-2 border-black pb-1" : "text-neutral-300 hover:text-black"}`}>
              {brand}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
          <AnimatePresence mode="popLayout">
            {filteredShoes.map(shoe => {
              const isLiked = wishlistItems.some(w => w._id === shoe._id);
              return (
                <motion.div layout key={shoe._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="group flex flex-col relative">
                  {shoe.stock <= 0 && (
                    <div className="absolute top-3 left-3 z-20 bg-red-600 text-white text-[8px] font-black px-2 py-1 uppercase tracking-widest rounded-full">Sold Out</div>
                  )}
                  {shoe.stock > 0 && shoe.stock < 5 && (
                    <div className="absolute top-3 right-10 z-20 bg-orange-500 text-white text-[8px] font-black px-2 py-1 uppercase tracking-widest rounded-full">Only {shoe.stock}</div>
                  )}
                  <div className={`relative aspect-[3/4] ${shoe.color || 'bg-zinc-100'} rounded-lg overflow-hidden mb-5 flex items-center justify-center ${shoe.stock <= 0 ? 'grayscale opacity-60' : ''}`}>
                    <img src={shoe.image} alt={shoe.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <button onClick={() => toggleWishlist(shoe)}
                      className="absolute top-4 left-4 z-20 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-transform">
                      <Heart size={14} fill={isLiked ? "red" : "none"} color={isLiked ? "red" : "black"} />
                    </button>
                    {shoe.stock > 0 && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-10">
                        <button onClick={() => setSelectedShoe(shoe)} className="bg-white p-3 rounded-full hover:scale-110 transition-transform"><Eye size={18} /></button>
                        <button onClick={() => handleAddToCart(shoe)} className="bg-white p-3 rounded-full hover:scale-110 transition-transform"><ShoppingCart size={18} /></button>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white px-2 py-0.5 rounded-full shadow-sm">
                      <span className="text-[10px] font-black italic">₹{shoe.price}</span>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-[12px] font-black uppercase tracking-tight italic">{shoe.name}</h3>
                    <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">{shoe.category}</p>
                    {shoe.stock <= 0 && <p className="text-[8px] font-black text-red-500 uppercase tracking-widest">Out of Stock</p>}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {selectedShoe && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-y-visible">
              <button onClick={() => setSelectedShoe(null)} className="absolute top-4 right-4 md:top-6 md:right-6 z-10 p-2 bg-white/80 rounded-full hover:scale-110 transition-transform shadow-sm">
                <X size={20} />
              </button>
              <div className={`w-full md:w-1/2 min-h-[250px] md:min-h-[300px] ${selectedShoe.color || 'bg-zinc-100'} flex items-center justify-center`}>
                <img src={selectedShoe.image} alt="" className="w-full h-full max-h-[30vh] md:max-h-none object-cover" />
              </div>
              <div className="w-full md:w-1/2 p-6 sm:p-10 md:p-14 flex flex-col justify-center">
                <span className="text-[10px] font-black tracking-[0.4em] text-neutral-300 uppercase">{selectedShoe.category} Footwear</span>
                <h2 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter leading-none mb-6 mt-2">{selectedShoe.name}</h2>
                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest leading-relaxed mb-8">{selectedShoe.detail}</p>
                <div className="flex items-center justify-between pt-8 border-t border-neutral-50">
                  <span className="text-3xl font-black italic">₹{selectedShoe.price}</span>
                  <button
                    disabled={selectedShoe.stock <= 0}
                    onClick={() => handleAddToCart(selectedShoe)}
                    className={`px-6 py-4 md:px-8 md:py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-opacity flex items-center gap-3 ${selectedShoe.stock <= 0 ? 'bg-zinc-100 text-zinc-300 cursor-not-allowed' : 'bg-black text-white hover:opacity-80'}`}>
                    <ShoppingCart size={16} /> {selectedShoe.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
                {selectedShoe.stock > 0 && selectedShoe.stock < 5 && (
                  <p className="text-[9px] font-black text-orange-500 uppercase mt-3 tracking-widest">Only {selectedShoe.stock} left!</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shoes;